import {
  Product,
  ShelfProduct,
  UserProfile,
  RoutineStep,
  PurchaseEvaluationResult,
} from '../types';
import { SAMPLE_CATALOGUE } from '../data/catalogue';
import { IngredientCheckerService } from './ingredientChecker';
import { DEFAULT_PROFILE } from './storage';

export class PurchaseSimulatorService {
  /**
   * Evaluates a candidate product against the user's real shelf inventory, active routine, profile, and budget.
   * Supports both individual positional arguments and single parameter object.
   */
  public static evaluatePurchase(
    productOrParams: any,
    maybeShelf?: ShelfProduct[],
    maybeRoutine?: any[],
    maybeProfile?: UserProfile,
    maybeCurrentMonthlySpend?: number
  ): PurchaseEvaluationResult {
    let productName = '';
    let brand = '';
    let category = '';
    let priceInr = 0;
    let volumeOrUses = 0;
    let rawIngredients: string[] = [];
    let shelf: ShelfProduct[] = [];
    let routine: any[] = [];
    let profile: UserProfile = DEFAULT_PROFILE;
    let currentSpent = 0;

    if (productOrParams && (productOrParams.shelf || productOrParams.productName)) {
      productName = productOrParams.productName || productOrParams.name || 'Skincare Item';
      brand = productOrParams.brand || 'Brand';
      category = productOrParams.category || 'Serum';
      priceInr = productOrParams.priceInr || productOrParams.price || 1;
      volumeOrUses = productOrParams.volumeOrUses || productOrParams.volumeMl || 30;
      rawIngredients = productOrParams.ingredientsList || productOrParams.ingredients || [];
      shelf = productOrParams.shelf || [];
      routine = productOrParams.routine || [];
      profile = productOrParams.profile || DEFAULT_PROFILE;
      currentSpent = productOrParams.currentMonthlySpend || 0;
    } else {
      productName = productOrParams?.name || productOrParams?.productName || 'Skincare Item';
      brand = productOrParams?.brand || 'Brand';
      category = productOrParams?.category || 'Serum';
      priceInr = productOrParams?.priceInr || productOrParams?.price || 1;
      volumeOrUses = productOrParams?.volumeMl || productOrParams?.volumeOrUses || 30;
      rawIngredients = productOrParams?.ingredients || productOrParams?.ingredientsList || [];
      shelf = maybeShelf || [];
      routine = maybeRoutine || [];
      profile = maybeProfile || DEFAULT_PROFILE;
      currentSpent = maybeCurrentMonthlySpend || 0;
    }

    const lowerCat = (category || 'serum').toLowerCase().trim();

    // 1. Estimated Uses & Cost Per Use
    let estimatedUses = volumeOrUses;
    if (!estimatedUses || estimatedUses <= 0) {
      if (lowerCat.includes('cleanser')) estimatedUses = 120;
      else if (lowerCat.includes('serum')) estimatedUses = 90;
      else if (lowerCat.includes('moisturizer') || lowerCat.includes('cream')) estimatedUses = 90;
      else if (lowerCat.includes('sunscreen') || lowerCat.includes('spf')) estimatedUses = 50;
      else if (lowerCat.includes('lipstick') || lowerCat.includes('lip')) estimatedUses = 180;
      else if (lowerCat.includes('foundation')) estimatedUses = 100;
      else if (lowerCat.includes('mascara') || lowerCat.includes('eyeliner')) estimatedUses = 90;
      else estimatedUses = 90;
    }

    const estimatedCostPerUseInr = Number((priceInr / estimatedUses).toFixed(2));

    // 2. Duplicate Check on My Shelf
    const duplicateShelfItem = shelf.find((item) => {
      const itemCat = item.category.toLowerCase().trim();
      return (
        itemCat === lowerCat ||
        (lowerCat.includes('sunscreen') && itemCat.includes('sunscreen')) ||
        (lowerCat.includes('cleanser') && itemCat.includes('cleanser')) ||
        (lowerCat.includes('serum') && itemCat.includes('serum')) ||
        (lowerCat.includes('moisturizer') && itemCat.includes('moisturizer')) ||
        (lowerCat.includes('exfoliant') && itemCat.includes('exfoliant'))
      );
    });

    const hasDuplicateOnShelf = Boolean(duplicateShelfItem);
    const daysSupplyRemaining = duplicateShelfItem
      ? Math.round((duplicateShelfItem.remainingPercent / 100) * (estimatedUses || 90))
      : 0;

    // 3. User Sensitivities & Skin Type Compatibility
    const triggeredSensitivities: string[] = [];
    const userSensitivities = profile.sensitivities || [];

    for (const sens of userSensitivities) {
      const lowerSens = sens.toLowerCase();
      const hasClash = rawIngredients.some((ing) => ing.toLowerCase().includes(lowerSens));
      if (hasClash) {
        triggeredSensitivities.push(sens);
      }
    }

    // Check fragrance preference
    if (
      profile.fragrancePreference === 'fragrance-free' &&
      rawIngredients.some((i) => i.toLowerCase().includes('fragrance') || i.toLowerCase().includes('parfum'))
    ) {
      if (!triggeredSensitivities.includes('Fragrance')) {
        triggeredSensitivities.push('Fragrance (User prefers fragrance-free)');
      }
    }

    const compatibilityNotes: string[] = [];
    let isCompatibleWithSkinType = true;

    if (profile.skinType === 'Oily' && (lowerCat.includes('oil') || rawIngredients.some((i) => i.toLowerCase().includes('mineral oil')))) {
      isCompatibleWithSkinType = false;
      compatibilityNotes.push('Heavy occlusive lipid base may cause congestion on Oily skin.');
    } else if (profile.skinType === 'Sensitive' && rawIngredients.some((i) => i.toLowerCase().includes('denatured alcohol'))) {
      isCompatibleWithSkinType = false;
      compatibilityNotes.push('Drying denatured alcohol base may disrupt sensitive acid mantle.');
    } else {
      compatibilityNotes.push(`Formula profile aligns with ${profile.skinType} skin characteristics.`);
    }

    // 4. Chemical Conflict Check Against Active Routine
    const ingredientConflicts: Array<{
      clashingIngredient: string;
      activeRoutineProduct: string;
      chemicalRisk: string;
    }> = [];

    // Collect all active ingredients across current routine steps
    for (const step of routine) {
      const shelfItem = shelf.find((s) => s.id === step.shelfProductId);
      const stepIngredients = shelfItem?.verifiedIngredients || step.activeIngredients || [];

      // Combine step ingredients with candidate product ingredients
      const combined = [...rawIngredients, ...stepIngredients];
      if (combined.length > 0) {
        const report = IngredientCheckerService.analyzeIngredients(combined);
        for (const conflict of report.conflicts) {
          const involved = conflict.ingredientsInvolved || (conflict as any).ingredients || [];
          // Check if candidate ingredients are part of this conflict
          const involvesCandidate = rawIngredients.some((ing) => {
            const ingWords = ing.toLowerCase().split(/[\s/()]+/).filter((w) => w.length >= 4);
            return involved.some((ci) => {
              const ciLower = ci.toLowerCase();
              return ingWords.some((w) => ciLower.includes(w)) || ciLower.includes(ing.toLowerCase());
            });
          });

          if (involvesCandidate) {
            ingredientConflicts.push({
              clashingIngredient: involved.join(' + '),
              activeRoutineProduct: step.stepName || step.productName || 'Active routine step',
              chemicalRisk: conflict.explanation || conflict.title,
            });
          }
        }
      }
    }

    // 5. Budget Impact Analysis
    const monthlyBudget = profile.monthlyBudget || 3500;
    const budgetPostPurchase = monthlyBudget - (currentSpent + priceInr);

    let budgetImpactLevel: 'low' | 'moderate' | 'exceeds_budget' = 'low';
    const percentOfBudget = (priceInr / monthlyBudget) * 100;
    if (priceInr > monthlyBudget || budgetPostPurchase < 0) {
      budgetImpactLevel = 'exceeds_budget';
    } else if (percentOfBudget > 25) {
      budgetImpactLevel = 'moderate';
    }

    // 6. Catalogue Alternatives
    const catalogueAlternatives = SAMPLE_CATALOGUE.filter((p) => {
      const pCat = p.category.toLowerCase();
      const matchCat = pCat === lowerCat || (lowerCat.includes('sunscreen') && pCat === 'sunscreen');
      const isNotSame = p.name.toLowerCase() !== productName.toLowerCase();
      const isCheaperOrCleaner = p.price <= priceInr || (profile.fragrancePreference === 'fragrance-free' && p.fragranceFree);
      return matchCat && isNotSame && isCheaperOrCleaner;
    }).slice(0, 3);

    // 7. Smart Verdict Formulation
    let verdict: PurchaseEvaluationResult['verdict'] = 'recommended';
    let verdictTitle = 'Safe & Value-Aligned Addition';
    let verdictReasoning = 'Product complements your current routine without duplicate overlap or active chemical clash.';
    let shouldPurchaseNow = true;

    if (triggeredSensitivities.length > 0 || ingredientConflicts.length > 0) {
      verdict = 'not_recommended';
      verdictTitle = 'Caution: Potential Ingredient Conflict or Sensitivity';
      verdictReasoning = `Identified ${ingredientConflicts.length} active chemical conflict${ingredientConflicts.length > 1 ? 's' : ''} or sensitivities with your current skincare steps.`;
      shouldPurchaseNow = false;
    } else if (hasDuplicateOnShelf && duplicateShelfItem && duplicateShelfItem.remainingPercent > 20) {
      verdict = 'duplicate_warning';
      verdictTitle = 'Recommendation: Use Owned Shelf Bottle First';
      verdictReasoning = `You already own ${duplicateShelfItem.name} (${duplicateShelfItem.brand}) with ~${duplicateShelfItem.remainingPercent}% remaining (approx. ${daysSupplyRemaining} days of supply).`;
      shouldPurchaseNow = false;
    } else if (budgetImpactLevel === 'exceeds_budget') {
      verdict = 'caution';
      verdictTitle = 'Budget Limit Alert';
      verdictReasoning = `At ₹${priceInr.toLocaleString('en-IN')}, this item exceeds your monthly budget limit of ₹${monthlyBudget.toLocaleString('en-IN')}. Consider catalogue alternatives.`;
      shouldPurchaseNow = false;
    } else if (!hasDuplicateOnShelf && lowerCat.includes('sunscreen')) {
      verdict = 'recommended';
      verdictTitle = 'High Priority Routine Gap';
      verdictReasoning = 'You currently lack an active daytime broad-spectrum photoprotection staple on My Shelf. Essential addition.';
      shouldPurchaseNow = true;
    }

    const duplicateDetails = duplicateShelfItem
      ? `You already own ${duplicateShelfItem.name} (${duplicateShelfItem.brand}) with ~${duplicateShelfItem.remainingPercent}% remaining.`
      : undefined;

    const routineConflicts = ingredientConflicts.map((c) => ({
      prospectiveIngredient: c.clashingIngredient.split(' + ')[0] || c.clashingIngredient,
      routineIngredient: c.clashingIngredient.split(' + ')[1] || c.activeRoutineProduct,
      severity: 'high' as const,
      reason: c.chemicalRisk,
      resolution: 'Alternate usage between morning and evening, or separate by 48 hours.',
    }));

    const costAnalysis = {
      retailPriceInr: priceInr,
      costPerDayInr: estimatedCostPerUseInr,
      estimatedDaysOfUse: estimatedUses,
      budgetImpactPercentage: Math.round(percentOfBudget),
    };

    const alternatives = catalogueAlternatives.map((a) => ({
      name: a.name,
      brand: a.brand,
      priceInr: a.price,
      reason: `Catalogue option (${a.category}) that matches ${profile.skinType} skin profile.`,
    }));

    const fitScore = verdict === 'recommended' ? 95 : verdict === 'caution' ? 70 : verdict === 'duplicate_warning' ? 50 : 25;

    return {
      productName,
      brand,
      category,
      priceInr,
      volumeOrUses: estimatedUses,
      estimatedCostPerUseInr,
      hasDuplicateOnShelf,
      duplicateShelfItem,
      daysSupplyRemaining,
      shelfDuplicate: {
        hasDuplicate: hasDuplicateOnShelf,
        duplicateDetails,
        existingSupplyDaysRemaining: daysSupplyRemaining,
      },
      isCompatibleWithSkinType,
      compatibilityNotes,
      hasSensitivityWarning: triggeredSensitivities.length > 0,
      triggeredSensitivities,
      sensitivityAlerts: triggeredSensitivities,
      ingredientConflicts,
      routineConflicts,
      monthlyBudget,
      currentMonthlySpent: currentSpent,
      budgetPostPurchase,
      budgetImpactLevel,
      costAnalysis,
      catalogueAlternatives,
      alternatives,
      verdict,
      verdictTitle,
      verdictReasoning,
      summary: verdictReasoning,
      fitScore,
      shouldPurchaseNow,
    };
  }
}
