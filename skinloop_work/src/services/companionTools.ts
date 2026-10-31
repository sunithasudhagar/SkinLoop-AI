import {
  Product,
  UserProfile,
  ShelfProduct,
  RoutineStep,
  SkinAnalysisRecord,
  ActionProposal,
  SavedLook,
  CandidateShade,
} from '../types';
import { SAMPLE_CATALOGUE } from '../data/catalogue';

export interface CatalogueSearchFilters {
  category?: string;
  brand?: string;
  maxBudgetInr?: number;
  skinType?: string;
  fragranceFree?: boolean;
  finish?: string;
  coverage?: string;
  query?: string;
  occasion?: string;
}

export interface ProductComparisonResult {
  products: Product[];
  priceDifferenceInr: number;
  cheapestProduct: Product;
  mostExpensiveProduct: Product;
  sharedIngredients: string[];
  uniqueIngredients: Record<string, string[]>;
  fragranceSummary: Record<string, boolean>;
  recommendationVerdict: string;
}

export interface BudgetLookSuggestion {
  lookName: string;
  occasion: string;
  products: Product[];
  ownedProductsUsed: ShelfProduct[];
  totalKitPrice: number;
  netNewSpend: number;
  savingsFromShelf: number;
  isWithinBudget: boolean;
  budgetDeficit: number;
  alternatives: { original: Product; lowerCostAlternative: Product; savingsInr: number }[];
}

export interface ShelfDuplicateCheck {
  hasDuplicate: boolean;
  duplicateCount: number;
  matchedShelfItems: ShelfProduct[];
  recommendation: 'skip_purchase' | 'consider_alternative' | 'safe_to_add';
  explanation: string;
}

export interface CompanionContext {
  profile: UserProfile;
  shelf: ShelfProduct[];
  routine: RoutineStep[];
  latestAnalysis?: SkinAnalysisRecord;
  savedLooks?: SavedLook[];
  shadeCandidates?: CandidateShade[];
  experiments?: any[];
  triggers?: any[];
}

export const CompanionTools = {
  /**
   * 1. Search products by category, brand, budget, and suitability
   */
  searchCatalogue(filters: CatalogueSearchFilters): Product[] {
    let results = [...SAMPLE_CATALOGUE];

    if (filters.category && filters.category !== 'all') {
      const catLower = filters.category.toLowerCase().trim();
      results = results.filter((p) => p.category.toLowerCase() === catLower);
    }

    if (filters.brand && filters.brand !== 'all') {
      const brandLower = filters.brand.toLowerCase().trim();
      results = results.filter((p) => p.brand.toLowerCase() === brandLower);
    }

    if (filters.maxBudgetInr !== undefined && filters.maxBudgetInr > 0) {
      results = results.filter((p) => p.price <= filters.maxBudgetInr!);
    }

    if (filters.fragranceFree) {
      results = results.filter((p) => p.fragranceFree === true);
    }

    if (filters.finish) {
      results = results.filter((p) => p.finish === filters.finish);
    }

    if (filters.coverage) {
      results = results.filter((p) => p.coverage === filters.coverage);
    }

    if (filters.skinType) {
      results = results.filter((p) =>
        p.suitabilityTags.some((tag) => tag.toLowerCase().includes(filters.skinType!.toLowerCase()))
      );
    }

    if (filters.occasion) {
      results = results.filter((p) =>
        p.occasions?.some((occ) => occ.toLowerCase().includes(filters.occasion!.toLowerCase()))
      );
    }

    if (filters.query && filters.query.trim().length > 0) {
      const q = filters.query.toLowerCase().trim();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.verifiedIngredients.some((i) => i.toLowerCase().includes(q)) ||
          (p.whyItFitsReason && p.whyItFitsReason.toLowerCase().includes(q))
      );
    }

    return results;
  },

  /**
   * 2. Compare 2 to 4 catalogue products
   */
  compareProducts(productIds: string[]): ProductComparisonResult | null {
    const products = productIds
      .map((id) => SAMPLE_CATALOGUE.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p));

    if (products.length < 2) return null;

    const sortedByPrice = [...products].sort((a, b) => a.price - b.price);
    const cheapestProduct = sortedByPrice[0];
    const mostExpensiveProduct = sortedByPrice[sortedByPrice.length - 1];
    const priceDifferenceInr = mostExpensiveProduct.price - cheapestProduct.price;

    // Ingredients overlap
    const ingredientSets = products.map((p) => new Set(p.verifiedIngredients.map((i) => i.toLowerCase())));
    const sharedIngredients = products[0].verifiedIngredients.filter((ing) =>
      ingredientSets.every((set) => set.has(ing.toLowerCase()))
    );

    const uniqueIngredients: Record<string, string[]> = {};
    const fragranceSummary: Record<string, boolean> = {};

    products.forEach((p) => {
      fragranceSummary[p.name] = Boolean(p.fragranceFree);
      const otherSets = ingredientSets.filter((_, idx) => products[idx].id !== p.id);
      uniqueIngredients[p.name] = p.verifiedIngredients.filter((ing) =>
        otherSets.every((set) => !set.has(ing.toLowerCase()))
      );
    });

    let verdict = `Comparing ${products.length} options: ${cheapestProduct.name} (₹${cheapestProduct.price}) offers the lowest price point, saving ₹${priceDifferenceInr} compared to ${mostExpensiveProduct.name} (₹${mostExpensiveProduct.price}).`;
    if (sharedIngredients.length > 0) {
      verdict += ` Both share key actives: ${sharedIngredients.slice(0, 3).join(', ')}.`;
    }

    return {
      products,
      priceDifferenceInr,
      cheapestProduct,
      mostExpensiveProduct,
      sharedIngredients,
      uniqueIngredients,
      fragranceSummary,
      recommendationVerdict: verdict,
    };
  },

  /**
   * 3. Inspect owned products and identify potential duplicates
   */
  checkShelfDuplicates(
    category: string,
    candidateProductName: string,
    shelfProducts: ShelfProduct[]
  ): ShelfDuplicateCheck {
    const catLower = category.toLowerCase().trim();
    const matched = shelfProducts.filter((sp) => {
      const spCat = sp.category.toLowerCase().trim();
      return spCat === catLower || (catLower.includes('sunscreen') && spCat.includes('sunscreen'));
    });

    if (matched.length === 0) {
      return {
        hasDuplicate: false,
        duplicateCount: 0,
        matchedShelfItems: [],
        recommendation: 'safe_to_add',
        explanation: `You do not currently own any ${category} products on My Shelf. Adding "${candidateProductName}" will fill a clear gap in your regimen.`,
      };
    }

    const stillUsable = matched.filter((sp) => sp.remainingPercent > 20);
    if (stillUsable.length > 0) {
      const names = stillUsable.map((p) => `"${p.name}" (${p.remainingPercent}% remaining)`).join(', ');
      return {
        hasDuplicate: true,
        duplicateCount: stillUsable.length,
        matchedShelfItems: stillUsable,
        recommendation: 'skip_purchase',
        explanation: `Shelf Alert: You already own ${stillUsable.length} active ${category} (${names}). Prioritizing your existing product will save your beauty budget before buying "${candidateProductName}".`,
      };
    }

    return {
      hasDuplicate: true,
      duplicateCount: matched.length,
      matchedShelfItems: matched,
      recommendation: 'consider_alternative',
      explanation: `You own ${matched.map((p) => p.name).join(', ')}, but they are almost depleted (<20%). It is a reasonable time to restock with "${candidateProductName}".`,
    };
  },

  /**
   * 4. Suggest lower-priced alternatives
   */
  suggestAlternatives(productId: string, maxPrice?: number): Product[] {
    const target = SAMPLE_CATALOGUE.find((p) => p.id === productId);
    if (!target) return [];

    const ceiling = maxPrice ?? target.price;
    return SAMPLE_CATALOGUE.filter(
      (p) => p.category === target.category && p.id !== target.id && p.price < ceiling
    ).sort((a, b) => a.price - b.price);
  },

  /**
   * 5. Calculate Kit Total Price
   */
  calculateKitTotal(productIds: string[]): {
    products: Product[];
    totalPriceInr: number;
    breakdown: { name: string; brand: string; price: number; category: string }[];
  } {
    const products = productIds
      .map((id) => SAMPLE_CATALOGUE.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p));

    const totalPriceInr = products.reduce((acc, p) => acc + p.price, 0);
    const breakdown = products.map((p) => ({
      name: p.name,
      brand: p.brand,
      price: p.price,
      category: p.category,
    }));

    return { products, totalPriceInr, breakdown };
  },

  /**
   * 6. Generate a makeup look from occasion presets with budget calculation & shelf awareness
   */
  suggestBudgetLook(
    occasion: 'everyday' | 'college' | 'office' | 'party' | 'wedding',
    maxBudgetInr: number,
    shelfProducts: ShelfProduct[] = []
  ): BudgetLookSuggestion {
    // Curated occasion item sets from SAMPLE_CATALOGUE
    const occasionMap: Record<string, { lookName: string; productIds: string[] }> = {
      everyday: {
        lookName: 'Effortless Fresh Day Look',
        productIds: ['prod-spf-1', 'prod-fnd-1', 'prod-lip-1', 'prod-bls-1'],
      },
      college: {
        lookName: 'Campus Glow & Go Kit',
        productIds: ['prod-spf-3', 'prod-kaj-1', 'prod-lip-3', 'prod-bls-1'],
      },
      office: {
        lookName: 'Polished Corporate Minimalist',
        productIds: ['prod-prm-1', 'prod-fnd-2', 'prod-eye-1', 'prod-lip-2', 'prod-pwd-1'],
      },
      party: {
        lookName: 'Golden Hour Sunset Glam',
        productIds: ['prod-fnd-1', 'prod-con-1', 'prod-esh-1', 'prod-mas-1', 'prod-lip-1', 'prod-cnt-1'],
      },
      wedding: {
        lookName: 'Royal Festive Radiance',
        productIds: ['prod-prm-1', 'prod-fnd-3', 'prod-esh-1', 'prod-kaj-1', 'prod-lip-2', 'prod-bls-1', 'prod-pwd-1'],
      },
    };

    const config = occasionMap[occasion] || occasionMap.everyday;
    const products = config.productIds
      .map((id) => SAMPLE_CATALOGUE.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p));

    const totalKitPrice = products.reduce((sum, p) => sum + p.price, 0);

    // Check what is already on the shelf
    const ownedProductsUsed: ShelfProduct[] = [];
    products.forEach((p) => {
      const match = shelfProducts.find(
        (sp) => sp.category.toLowerCase() === p.category.toLowerCase() && sp.remainingPercent > 20
      );
      if (match && !ownedProductsUsed.some((o) => o.id === match.id)) {
        ownedProductsUsed.push(match);
      }
    });

    // Calculate savings from shelf items
    const savingsFromShelf = ownedProductsUsed.reduce((sum, sp) => {
      const catProd = products.find((p) => p.category.toLowerCase() === sp.category.toLowerCase());
      return sum + (catProd ? catProd.price : 0);
    }, 0);

    const netNewSpend = Math.max(0, totalKitPrice - savingsFromShelf);
    const isWithinBudget = netNewSpend <= maxBudgetInr;
    const budgetDeficit = isWithinBudget ? 0 : netNewSpend - maxBudgetInr;

    // If over budget, identify lower-cost alternatives
    const alternatives: BudgetLookSuggestion['alternatives'] = [];
    if (!isWithinBudget) {
      products.forEach((p) => {
        const alts = this.suggestAlternatives(p.id);
        if (alts.length > 0) {
          const cheapest = alts[0];
          alternatives.push({
            original: p,
            lowerCostAlternative: cheapest,
            savingsInr: p.price - cheapest.price,
          });
        }
      });
    }

    return {
      lookName: config.lookName,
      occasion,
      products,
      ownedProductsUsed,
      totalKitPrice,
      netNewSpend,
      savingsFromShelf,
      isWithinBudget,
      budgetDeficit,
      alternatives,
    };
  },

  /**
   * 7. Generate a complete deterministic response when AI API is not configured or fails
   */
  generateDeterministicResponse(
    userQuery: string,
    context: CompanionContext
  ): {
    text: string;
    recommendedProducts: Product[];
    proposals: ActionProposal[];
    suggestedFollowUps: string[];
    mode: 'deterministic';
    disclaimer: string;
  } {
    const q = userQuery.toLowerCase();
    const { profile, shelf, routine } = context;

    const recommendedProducts: Product[] = [];
    const proposals: ActionProposal[] = [];
    let text = '';
    let followUps: string[] = [
      'Check my shelf duplicates',
      'Suggest a budget look for office',
      'What foundation matches my undertone?',
      'Recommend daily sun protection',
    ];

    // Scenario A1: Vitamin C inquiry with current routine
    if (q.includes('vitamin c') || q.includes('ascorbic')) {
      const morningSteps = routine.filter((r) => r.routineType === 'morning');
      const eveningSteps = routine.filter((r) => r.routineType === 'evening');
      const hasRetinol = eveningSteps.some((s) => s.stepName.toLowerCase().includes('retinol')) ||
                         shelf.some((s) => s.name.toLowerCase().includes('retinol'));
      const hasExfoliants = morningSteps.concat(eveningSteps).some((s) => s.stepName.toLowerCase().includes('aha') || s.stepName.toLowerCase().includes('salicylic') || s.stepName.toLowerCase().includes('glycolic'));

      text = `### Integrating Vitamin C (L-Ascorbic Acid) With Your Regimen\n\n` +
        `Yes, you can integrate Vitamin C into your routine, but the **timing and layering sequence** are critical for maximum antioxidant efficacy and barrier safety:\n\n` +
        `• **Best Application Time:** **Morning routine**. Topical Vitamin C acts as a potent photoprotective scavenger that neutralizes UV-induced reactive oxygen species (ROS) and pollution free radicals before they damage DNA.\n` +
        `• **Layering Sequence:** Apply immediately after gentle cleansing onto dry or slightly damp skin. Wait 2-3 minutes for the low-pH active to absorb, then follow with your hydrating serum, moisturizer, and **Broad-Spectrum SPF 50+**.\n\n` +
        (hasRetinol
          ? `⚠️ **Interaction Notice:** You have Retinol in your regimen. Avoid applying Vitamin C and Retinol in the same step. Keep Vitamin C in the morning and Retinol in the evening to prevent pH clashes and surface erythema.\n\n`
          : '') +
        (hasExfoliants
          ? `⚠️ **Exfoliant Stacking Caution:** Do not layer pure L-Ascorbic Acid in the same application as AHA/BHA peeling acids (Glycolic/Salicylic) to prevent stinging and acid overloading.\n\n`
          : '') +
        `💡 **Shelf Check:** Your current My Shelf has **${shelf.length}** products. You can layer Vitamin C right under your existing moisturizers without buying redundant steps.`;

      const vitCProduct = SAMPLE_CATALOGUE.find((p) => p.name.includes('Luminous') || p.category === 'serum');
      if (vitCProduct) recommendedProducts.push(vitCProduct);

      followUps = [
        'Which products should I use in the morning?',
        'Am I using conflicting ingredients?',
        'Can I avoid buying anything new and use products I already own?',
      ];
    }
    // Scenario A2: Why skin feels dry after changing products
    else if (q.includes('dry') && (q.includes('feel') || q.includes('chang') || q.includes('switch') || q.includes('product') || q.includes('new'))) {
      text = `### Why Skin May Feel Dry or Tight After Changing Products\n\n` +
        `When introducing or switching skincare products, skin tightness and dehydration typically stem from three physiological barrier factors:\n\n` +
        `1. **Transepidermal Water Loss (TEWL):** If a new serum or toner contains humectants (like Hyaluronic Acid) without an occlusive barrier cream on top, dry indoor ambient air can draw moisture *out* of your stratum corneum.\n` +
        `2. **Surfactant Stripping:** Switching to a foaming cleanser with a higher alkaline pH can dissolve intercellular skin lipids (ceramides, cholesterol), destabilizing the natural acid mantle (pH 4.7–5.5).\n` +
        `3. **Active Retinization or Exfoliant Purging:** If your new product introduces AHA, BHA, or Retinoids, the acceleration in cellular turnover temporarily outpaces lipid barrier synthesis.\n\n` +
        `🛠️ **Recovery Protocol:**\n` +
        `• Always apply hydrating serums onto damp skin.\n` +
        `• Seal immediately with a ceramide-rich barrier cream (e.g. Ceramide NP, Squalane).\n` +
        `• Check your My Shelf products below to buffer delicate areas before re-testing.`;

      const barrierCream = SAMPLE_CATALOGUE.find((p) => p.name.includes('Ceramide')) || SAMPLE_CATALOGUE[0];
      if (barrierCream) recommendedProducts.push(barrierCream);

      followUps = [
        'Check my shelf duplicates for moisturizer',
        'Am I using conflicting ingredients?',
        'Which products should I use in the morning?',
      ];
    }
    // Scenario A3: Morning Products Sequence
    else if (q.includes('morning') && (q.includes('which') || q.includes('what') || q.includes('product') || q.includes('use') || q.includes('order'))) {
      const amSteps = routine.filter((r) => r.routineType === 'morning');
      text = `### Morning Product Application Sequence (Protection & Defense)\n\n` +
        `Your morning routine should focus entirely on **barrier hydration, antioxidant shielding, and UV photoprotection**:\n\n` +
        `1. **Gentle Water-Soluble Cleanser:** Remove overnight sebum without stripping natural protective ceramides.\n` +
        `2. **Water-Based Antioxidant or Humectant Serum:** Apply Hyaluronic Acid B5 or Vitamin C onto clean skin for daytime free-radical defense.\n` +
        `3. **Lightweight Barrier Moisturizer:** Lock in hydration with a fast-absorbing natural or soft-matte finish.\n` +
        `4. **Broad-Spectrum SPF 50+ PA++++:** The non-negotiable daytime shield against UVA/UVB photo-aging. Apply two full finger-lengths.\n\n` +
        `✨ **Current Configured AM Steps in Your Profile:**\n` +
        amSteps.map((s) => `• Step ${s.stepOrder}: **${s.stepName}** — ${s.purpose}`).join('\n') +
        `\n\n💡 **Shelf Priority:** You can fulfill these steps with the **${shelf.length}** products currently logged in My Shelf.`;

      const amSpf = SAMPLE_CATALOGUE.find((p) => p.category === 'sunscreen');
      if (amSpf) {
        recommendedProducts.push(amSpf);
        proposals.push({
          id: `prop-${Date.now()}-am-spf`,
          type: 'add_to_shelf',
          title: `Add ${amSpf.name} to My Shelf`,
          description: `Add this broad-spectrum sunscreen (${amSpf.brand}, ₹${amSpf.price}) to your digital shelf inventory for your morning routine.`,
          previewData: {
            productId: amSpf.id,
            productName: amSpf.name,
            brand: amSpf.brand,
            category: amSpf.category,
            price: amSpf.price,
          },
          status: 'pending',
        });
      }

      followUps = [
        'Can I use vitamin C with my current routine?',
        'Can I avoid buying anything new and use products I already own?',
        'Check my shelf duplicates',
      ];
    }
    // Scenario A4: Conflicting ingredients check
    else if (q.includes('conflict') || q.includes('interact') || q.includes('safe to mix') || q.includes('mix')) {
      text = `### Skincare Ingredient Conflict & Compatibility Analysis\n\n` +
        `Here is an evidence-based check of the active ingredients across your routine and shelf inventory:\n\n` +
        `• **Retinol + AHA/BHA (Glycolic/Salicylic Acid):** ⚠️ *High Conflict Risk*. Stacking peeling acids directly with retinoids strips the stratum corneum barrier. Alternate them on separate evenings.\n` +
        `• **Retinol + Benzoyl Peroxide:** ⚠️ *Oxidation Risk*. Benzoyl peroxide oxidizes and deactivates pure retinol while exacerbating peeling.\n` +
        `• **Vitamin C + AHA/BHA:** ⚠️ *Acidity Stacking*. Combining low-pH chemical acids simultaneously can trigger facial flushing and stinging.\n` +
        `• **Hyaluronic Acid + Ceramides + Niacinamide:** ✅ *Harmonious Synergy*. These barrier-identical compounds reinforce hydration without interference.\n\n` +
        `🔎 **Run Detailed Check:** Use the dedicated **Ingredient Safety & Conflict Checker** tool in the sidebar to paste full ingredient labels or upload photo packaging!`;

      followUps = [
        'Can I use vitamin C with my current routine?',
        'Why might my skin feel dry after changing products?',
        'Check my shelf duplicates',
      ];
    }
    // Scenario A5: Avoid buying new / use owned shelf products
    else if ((q.includes('avoid') || q.includes('save') || q.includes('own') || q.includes('already')) && (q.includes('buy') || q.includes('purchase') || q.includes('shelf') || q.includes('new'))) {
      const shelfValue = shelf.reduce((acc, curr) => acc + (curr.purchasePrice || 0), 0);
      text = `### Maximizing Products You Already Own (Zero-Waste Skincare)\n\n` +
        `You do **not** need to buy new products! Your **My Shelf** inventory currently contains **${shelf.length} items** with an estimated replacement value of **₹${shelfValue.toLocaleString('en-IN')}**:\n\n` +
        shelf.map((s) => `• **${s.name}** (${s.brand}, ${s.category}) — ${s.remainingPercent}% remaining`).join('\n') +
        `\n\n💡 **Shelf-First Regimen Strategy:**\n` +
        `1. Use your **${shelf[0]?.name || 'Gentle Cleanser'}** as the non-stripping base for both AM and PM.\n` +
        `2. Your **${shelf[1]?.name || 'Hydrating Serum'}** provides deep humectant hydration for both day and night.\n` +
        `3. Seal your barrier with **${shelf[2]?.name || 'Barrier Cream'}** before bedtime.\n` +
        `4. Only purchase a restock once an existing bottle falls below 15% fill.`;

      followUps = [
        'Evaluate my morning routine order',
        'Can I use vitamin C with my current routine?',
        'Check my shelf duplicates',
      ];
    }
    // Scenario A: General Routine & Skincare order
    else if (q.includes('routine') || q.includes('step') || q.includes('order') || q.includes('skincare')) {
      const morningSteps = routine.filter((r) => r.routineType === 'morning');
      const hasSpf = morningSteps.some(
        (s) => s.stepName.toLowerCase().includes('spf') || s.stepName.toLowerCase().includes('sunscreen')
      );

      text = `### Personalized Skincare Routine Flow\n\n` +
        `Based on your **${profile.skinType}** skin profile and registered concerns, here is your dermatologically grounded routine sequence:\n\n` +
        `**Morning (Protection & Barrier):**\n` +
        `1. Gentle Cleanser (Preserve acid mantle, do not strip lipids)\n` +
        `2. Hydrating Serum (Hyaluronic B5 or Centella — apply to slightly damp skin)\n` +
        `3. Barrier Cream (Lock in water)\n` +
        `4. **Broad-Spectrum SPF 50+** (Non-negotiable UV defense; prevents photo-aging and dark spots)\n\n` +
        `**Evening (Recovery & Repair):**\n` +
        `1. Double Cleanse (Thoroughly remove mineral SPF and grime)\n` +
        `2. Restorative Serum / Actives\n` +
        `3. Barrier Replenishment Moisturizer\n\n`;

      if (shelf.length > 0) {
        text += `✨ **My Shelf Integration:** You already have **${shelf.length}** products on your shelf. None of these need to be purchased again!`;
      }

      // Recommend SPF if missing or recommend top SPF
      const spfProduct = SAMPLE_CATALOGUE.find((p) => p.category === 'sunscreen');
      if (spfProduct) {
        recommendedProducts.push(spfProduct);
        proposals.push({
          id: `prop-${Date.now()}-1`,
          type: 'add_to_shelf',
          title: `Add ${spfProduct.name} to My Shelf`,
          description: `Add this sample catalogue sunscreen (${spfProduct.brand}, ₹${spfProduct.price}) to your digital shelf inventory.`,
          previewData: {
            productId: spfProduct.id,
            productName: spfProduct.name,
            brand: spfProduct.brand,
            category: spfProduct.category,
            price: spfProduct.price,
          },
          status: 'pending',
        });
      }

      followUps = [
        'Recommend an invisible SPF 50+',
        'How to layer vitamin C with sunscreen?',
        'Check shelf duplicates for moisturizer',
      ];
    }
    // Scenario B: Foundation & Shade Matching
    else if (q.includes('foundation') || q.includes('shade') || q.includes('tone') || q.includes('undertone')) {
      const undertone = profile.undertone || 'Warm';
      const fndList = SAMPLE_CATALOGUE.filter((p) => p.category === 'foundation');
      const matchedFnd = fndList[0] || SAMPLE_CATALOGUE[0];

      text = `### Foundation & Shade Guidance\n\n` +
        `*Important Science Note:* Skin health and clarity scores do **not** dictate foundation shades. Foundation match depends strictly on **undertone** (${undertone}), depth, and ambient neck blending.\n\n` +
        `For your **${undertone}** undertone preference with a **${profile.desiredFinish}** finish:\n` +
        `• **Recommended Product:** ${matchedFnd.name} by ${matchedFnd.brand} (₹${matchedFnd.price})\n` +
        `• **Coverage:** ${matchedFnd.coverage || 'medium'}-coverage, ${matchedFnd.finish || 'natural'} finish\n` +
        `• **Shade Selection:** Tentative match based on declared undertone. Camera lighting may introduce slight variance; always test along your jawline in natural daylight.\n\n` +
        `*Catalogue notice:* Product details and prices are demo sample data for prototype evaluation.`;

      recommendedProducts.push(matchedFnd);

      const targetShade = matchedFnd.shades?.find((s) => s.undertone === undertone) || matchedFnd.shades?.[0];
      if (targetShade) {
        proposals.push({
          id: `prop-${Date.now()}-fnd`,
          type: 'save_shade_candidate',
          title: `Save ${matchedFnd.brand} ${targetShade.shadeName} as Shade Candidate`,
          description: `Save shade candidate (${targetShade.shadeName}, ${targetShade.undertone} undertone) for side-by-side comparison in Foundation Finder.`,
          previewData: {
            productId: matchedFnd.id,
            productName: matchedFnd.name,
            brand: matchedFnd.brand,
            shade: targetShade.shadeName,
            hex: targetShade.hex,
            undertone: targetShade.undertone,
          },
          status: 'pending',
        });
      }

      followUps = [
        'Compare matte vs dewy foundations',
        'How do I test foundation on my jawline?',
        'Suggest budget look with this foundation',
      ];
    }
    // Scenario C: Budget / Look Generation / Occasion
    else if (q.includes('look') || q.includes('budget') || q.includes('office') || q.includes('college') || q.includes('party') || q.includes('wedding')) {
      let occasion: 'everyday' | 'college' | 'office' | 'party' | 'wedding' = 'everyday';
      if (q.includes('office')) occasion = 'office';
      else if (q.includes('college')) occasion = 'college';
      else if (q.includes('party')) occasion = 'party';
      else if (q.includes('wedding')) occasion = 'wedding';

      const budgetSug = this.suggestBudgetLook(occasion, profile.monthlyBudget, shelf);
      text = `### ${budgetSug.lookName} (Occasion: ${occasion.toUpperCase()})\n\n` +
        `Here is a tailored makeup look built around your **${profile.desiredFinish}** finish preference:\n\n` +
        `• **Total Kit Value:** ₹${budgetSug.totalKitPrice.toLocaleString('en-IN')}\n` +
        `• **Savings from My Shelf:** ₹${budgetSug.savingsFromShelf.toLocaleString('en-IN')} (${budgetSug.ownedProductsUsed.length} items already owned!)\n` +
        `• **Net New Spend:** ₹${budgetSug.netNewSpend.toLocaleString('en-IN')} (Your budget: ₹${profile.monthlyBudget.toLocaleString('en-IN')})\n\n`;

      if (budgetSug.isWithinBudget) {
        text += `✅ **Budget Status:** This look fits completely within your ₹${profile.monthlyBudget.toLocaleString('en-IN')} monthly budget!\n\n`;
      } else {
        text += `⚠️ **Budget Notice:** This look exceeds your monthly limit by ₹${budgetSug.budgetDeficit.toLocaleString('en-IN')}. Consider swapping high-ticket items with the alternatives below.\n\n`;
      }

      text += `*Sample products featured:* ${budgetSug.products.map((p) => `${p.name} (₹${p.price})`).join(', ')}.`;

      recommendedProducts.push(...budgetSug.products.slice(0, 3));

      proposals.push({
        id: `prop-${Date.now()}-look`,
        type: 'save_look',
        title: `Save "${budgetSug.lookName}" to My Looks`,
        description: `Save this curated look configuration (₹${budgetSug.totalKitPrice} total) to your Makeup Studio saved collection.`,
        previewData: {
          look: {
            name: budgetSug.lookName,
            occasion: budgetSug.occasion as any,
            productIds: budgetSug.products.map((p) => p.id),
            totalEstimatedPrice: budgetSug.totalKitPrice,
          },
        },
        status: 'pending',
      });

      followUps = [
        'How can I lower the price of this look?',
        'Check shelf duplicates for this kit',
        'Suggest an everyday college look',
      ];
    }
    // Scenario D: Sunscreen / SPF
    else if (q.includes('sunscreen') || q.includes('spf') || q.includes('sun protection')) {
      const sunscreens = SAMPLE_CATALOGUE.filter((p) => p.category === 'sunscreen');
      const topSpf = sunscreens[0] || SAMPLE_CATALOGUE[0];

      text = `### Sun Protection Recommendation\n\n` +
        `*Dermatological Principle:* Daily broad-spectrum SPF 50+ is essential for all skin tones. **Sunscreen protection is never determined by skin tone or complexion depth**; UV radiation induces cellular oxidative stress and photo-damage regardless of melanin content.\n\n` +
        `**Top Recommendation:** **${topSpf.name}** by ${topSpf.brand} (₹${topSpf.price})\n` +
        `• **Formulation:** SPF ${topSpf.spf ?? 50}+ ${topSpf.paRating ?? 'PA++++'}, broad-spectrum\n` +
        `• **Finish:** Lightweight ${topSpf.finish || 'natural'} finish without heavy residue\n` +
        `• **Sensitivity check:** ${topSpf.fragranceFree ? '100% Fragrance-Free (matches sensitivity profile)' : 'Mild natural aroma'}\n\n` +
        `*Application rule:* Apply two finger lengths 15 minutes before UV exposure, and reapply every 2-3 hours during prolonged sun exposure.`;

      recommendedProducts.push(topSpf);
      if (sunscreens[1]) recommendedProducts.push(sunscreens[1]);

      proposals.push({
        id: `prop-${Date.now()}-spf`,
        type: 'save_favorite',
        title: `Save ${topSpf.name} as Favorite`,
        description: `Add this SPF 50+ sunscreen to your saved favorites list.`,
        previewData: {
          productId: topSpf.id,
          productName: topSpf.name,
          brand: topSpf.brand,
          category: 'sunscreen',
          price: topSpf.price,
        },
        status: 'pending',
      });

      followUps = [
        'Compare mineral vs chemical sunscreens',
        'Will this sunscreen pill under foundation?',
        'Check my shelf duplicates for sunscreen',
      ];
    }
    // Scenario E: Shelf / Duplicate Check / Inventory
    else if (q.includes('shelf') || q.includes('duplicate') || q.includes('own') || q.includes('inventory')) {
      const ownedSummary = shelf.map((s) => `• **${s.name}** (${s.brand}) — ${s.category}, ${s.remainingPercent}% remaining`).join('\n');
      text = `### My Shelf Inventory Audit\n\n` +
        `You currently have **${shelf.length}** products logged in your active shelf:\n\n` +
        (ownedSummary || 'No products registered on your shelf yet.') +
        `\n\n💡 **Smart Shopping Advice:** Before purchasing new skincare or makeup, ensure your current products are at least 80% used up to prevent product expiration and waste.`;

      followUps = [
        'Recommend products to complete my shelf',
        'Check expiration warnings',
        'Suggest budget look with my owned products',
      ];
    }
    // Scenario F: Compare products
    else if (q.includes('compare') || q.includes('difference')) {
      const samplePair = SAMPLE_CATALOGUE.slice(0, 2);
      const comparison = this.compareProducts(samplePair.map((p) => p.id));
      if (comparison) {
        text = `### Product Comparison\n\n` +
          `${comparison.recommendationVerdict}\n\n` +
          `• **${comparison.products[0].name}** (₹${comparison.products[0].price}) — ${comparison.products[0].brand}\n` +
          `• **${comparison.products[1].name}** (₹${comparison.products[1].price}) — ${comparison.products[1].brand}\n\n` +
          `*Ingredients summary:* Key ingredients include ${comparison.products[0].verifiedIngredients.slice(0, 3).join(', ')}.`;
        recommendedProducts.push(...comparison.products);
      } else {
        text = `Select any two products from the catalogue or mention them here to view a side-by-side comparison of ingredients, prices, and skin suitability.`;
      }
    }
    // Default fallback
    else {
      text = `### SkinLoop AI Beauty Companion\n\n` +
        `Hello ${profile.name || 'there'}! I am synced with your **${profile.skinType}** skin profile, declared budget (₹${profile.monthlyBudget.toLocaleString('en-IN')}/mo), and **${shelf.length}** products on My Shelf.\n\n` +
        `Here are ways I can help you shop smarter and maintain your skin:\n` +
        `1. **Routine Check:** Review your AM/PM routine order and verify active ingredients.\n` +
        `2. **Foundation Matching:** Explain undertone harmony without false camera claims.\n` +
        `3. **Budget Looks:** Build complete makeup kits for office, college, parties, or weddings that prioritize items you already own.\n` +
        `4. **Duplicate Prevention:** Check whether you already have an equivalent product before you buy.\n\n` +
        `What would you like to explore today?`;

      const topProducts = SAMPLE_CATALOGUE.slice(0, 2);
      recommendedProducts.push(...topProducts);
    }

    return {
      text,
      recommendedProducts,
      proposals,
      suggestedFollowUps: followUps,
      mode: 'deterministic',
      disclaimer:
        'Deterministic Beauty Engine: Gemini AI is currently operating in offline/deterministic mode. Recommendations and proposals are backed by your profile, shelf, and sample catalogue data.',
    };
  },
};
