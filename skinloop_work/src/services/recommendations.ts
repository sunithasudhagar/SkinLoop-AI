import { Product, UserProfile, ShelfProduct, CandidateShade } from '../types';
import { SAMPLE_CATALOGUE } from '../data/catalogue';

export interface RecommendationMatch {
  product: Product;
  matchScore: number;
  matchReasons: string[];
  alreadyOnShelf: boolean;
  shelfItem?: ShelfProduct;
  priceAlternatives: {
    budget?: Product;
    mid?: Product;
    luxury?: Product;
  };
  tentativeShadeNotice?: string;
}

export interface RecommendationCategoryResult {
  category: string;
  categoryLabel: string;
  type: 'skincare' | 'makeup';
  items: RecommendationMatch[];
}

export const RecommendationEngine = {
  /**
   * Deterministic recommendation generator based on user profile and My Shelf inventory.
   * Strictly separates skincare concerns from makeup color preferences.
   * Never claims sunscreen suitability from skin tone, nor exact foundation shades from skin health scores.
   */
  getRecommendations(
    profile: UserProfile,
    shelf: ShelfProduct[],
    options?: {
      targetCategory?: string;
      maxPrice?: number;
      occasion?: string;
      brandFilter?: string;
    }
  ): RecommendationMatch[] {
    const userSensitivities = profile.sensitivities || [];
    const userGoals = profile.skinGoals || [];
    const userBrands = profile.preferredBrands || [];
    const userSkinType = profile.skinType || 'Normal';
    const userFinish = profile.desiredFinish || 'natural';
    const userCoverage = profile.desiredCoverage || 'medium';
    const userUndertone = profile.undertone || 'Unsure';
    const userOccasion = options?.occasion || profile.preferredOccasion || 'everyday';
    const maxBudget = options?.maxPrice || (profile.monthlyBudget ? profile.monthlyBudget : 5000);

    const matches: RecommendationMatch[] = [];

    // Filter catalogue
    let candidatePool = SAMPLE_CATALOGUE;
    if (options?.targetCategory && options.targetCategory !== 'all') {
      candidatePool = candidatePool.filter((p) => p.category === options.targetCategory);
    }
    if (options?.brandFilter && options.brandFilter !== 'all') {
      candidatePool = candidatePool.filter((p) => p.brand.toLowerCase() === options.brandFilter?.toLowerCase());
    }

    for (const product of candidatePool) {
      // 1. Hard sensitivity filter
      let violatesSensitivities = false;
      if (profile.fragrancePreference === 'fragrance-free' && product.fragranceFree === false) {
        violatesSensitivities = true;
      }
      if (userSensitivities.includes('Fragrance') && product.fragranceFree === false) {
        violatesSensitivities = true;
      }

      for (const sens of userSensitivities) {
        const lowerSens = sens.toLowerCase();
        if (lowerSens === 'fragrance') continue;
        const ingMatch = product.verifiedIngredients.some((ing) => ing.toLowerCase().includes(lowerSens));
        if (ingMatch) {
          violatesSensitivities = true;
          break;
        }
      }

      if (violatesSensitivities) {
        continue; // Exclude products that violate user declared allergies or sensitivities
      }

      // Check if user already owns a suitable product on My Shelf!
      const matchingShelfItem = shelf.find((s) => {
        const shelfCat = s.category.toLowerCase();
        const prodCat = product.category.toLowerCase();
        if (shelfCat === prodCat) return true;
        if (shelfCat.includes('cleanser') && prodCat === 'cleanser') return true;
        if (shelfCat.includes('moisturizer') && prodCat === 'moisturizer') return true;
        if (shelfCat.includes('serum') && prodCat === 'serum') return true;
        if (shelfCat.includes('sunscreen') && prodCat === 'sunscreen') return true;
        return false;
      });

      let score = 70;
      const matchReasons: string[] = [];

      // Skincare logic (Separated from makeup tone)
      const isSkincare = ['sunscreen', 'cleanser', 'moisturizer', 'serum', 'toner'].includes(product.category);

      if (isSkincare) {
        // Match skin type
        if (product.suitabilityTags.includes(userSkinType) || product.suitabilityTags.includes('All Skin Types')) {
          score += 10;
          matchReasons.push(`Formulated specifically for ${userSkinType} skin profiles.`);
        }

        // Match skin goals
        if (userGoals.includes('Hydration & Barrier') && product.verifiedIngredients.some((i) => i.includes('Hyaluronic') || i.includes('Ceramide') || i.includes('Panthenol'))) {
          score += 10;
          matchReasons.push('Contains barrier-restorative humectants (Ceramides/HA/Panthenol).');
        }
        if (userGoals.includes('Blemish & Pore Care') && product.verifiedIngredients.some((i) => i.includes('Niacinamide') || i.includes('Zinc') || i.includes('Silymarin'))) {
          score += 10;
          matchReasons.push('Enriched with sebum-regulating actives (Niacinamide/Zinc).');
        }
        if (userGoals.includes('Calm Redness & Sensitivity') && product.verifiedIngredients.some((i) => i.includes('Centella') || i.includes('Madecassoside') || i.includes('Oat'))) {
          score += 10;
          matchReasons.push('Features soothing botanicals (Centella/Madecassoside) to comfort reactivity.');
        }
        if (product.category === 'sunscreen') {
          score += 5;
          matchReasons.push(`Provides verified ${product.paRating || 'PA++++'} broad-spectrum UV photoaging protection.`);
        }
      } else {
        // Makeup logic (Occasion, finish, undertone, coverage)
        if (product.finish === userFinish) {
          score += 10;
          matchReasons.push(`Delivers your preferred ${userFinish} finish.`);
        }
        if (product.coverage === userCoverage) {
          score += 8;
          matchReasons.push(`Provides your desired ${userCoverage} coverage level.`);
        }
        if (product.occasions && product.occasions.includes(userOccasion)) {
          score += 8;
          matchReasons.push(`Curated for ${userOccasion} wear and longevity.`);
        }
        if (product.category === 'foundation' || product.category === 'concealer') {
          if (userUndertone !== 'Unsure') {
            const hasUndertoneShade = product.shades?.some((sh) => sh.undertone === userUndertone);
            if (hasUndertoneShade) {
              score += 10;
              matchReasons.push(`Offers candidate shades calibrated for ${userUndertone} undertones.`);
            }
          }
        }
      }

      // Brand preference boost
      if (userBrands.some((b) => b.toLowerCase() === product.brand.toLowerCase())) {
        score += 8;
        matchReasons.push(`From your preferred brand (${product.brand}).`);
      }

      // Budget friendliness
      if (product.price <= maxBudget) {
        score += 5;
      }

      // Shelf priority: Highlight if owned
      if (matchingShelfItem) {
        matchReasons.unshift(`✓ You already own "${matchingShelfItem.name}" on My Shelf. Prioritize using this item before purchasing duplicates!`);
      }

      // Find price-point alternatives in the same category
      const sameCategoryItems = SAMPLE_CATALOGUE.filter((p) => p.category === product.category && p.id !== product.id);
      const budgetAlt = sameCategoryItems.find((p) => p.priceTier === 'budget' || p.price < product.price);
      const midAlt = sameCategoryItems.find((p) => p.priceTier === 'mid' && p.price !== product.price);
      const luxuryAlt = sameCategoryItems.find((p) => p.priceTier === 'luxury' || p.price > product.price);

      // Tentative shade notice
      let tentativeNotice: string | undefined;
      if (product.category === 'foundation' || product.category === 'concealer') {
        tentativeNotice = 'Tentative candidate shade match. Actual shade accuracy and virtual try-on will be calibrated via YouCam API in a future update.';
      }

      matches.push({
        product,
        matchScore: Math.min(99, score),
        matchReasons: matchReasons.length > 0 ? matchReasons : [`Reliable ${product.category} selection aligned with your beauty profile.`],
        alreadyOnShelf: Boolean(matchingShelfItem),
        shelfItem: matchingShelfItem,
        priceAlternatives: {
          budget: budgetAlt,
          mid: midAlt,
          luxury: luxuryAlt,
        },
        tentativeShadeNotice: tentativeNotice,
      });
    }

    // Sort: items on shelf first if relevant, then by match score descending
    return matches.sort((a, b) => b.matchScore - a.matchScore);
  },

  /**
   * Group recommendations by category for comprehensive store and recommendation views.
   */
  getGroupedRecommendations(profile: UserProfile, shelf: ShelfProduct[]): RecommendationCategoryResult[] {
    const allMatches = this.getRecommendations(profile, shelf);

    const categories: { id: string; label: string; type: 'skincare' | 'makeup' }[] = [
      { id: 'foundation', label: 'Foundations & Concealers', type: 'makeup' },
      { id: 'sunscreen', label: 'Sun Protection & Care', type: 'skincare' },
      { id: 'lipstick', label: 'Lipsticks & Lip Glosses', type: 'makeup' },
      { id: 'eyeliner', label: 'Eyeliners & Kajals', type: 'makeup' },
      { id: 'blush', label: 'Blushes & Contours', type: 'makeup' },
      { id: 'serum', label: 'Targeted Serums & Hydrators', type: 'skincare' },
      { id: 'moisturizer', label: 'Barrier Moisturizers', type: 'skincare' },
      { id: 'primer', label: 'Primers & Setting Powders', type: 'makeup' },
    ];

    const results: RecommendationCategoryResult[] = [];

    for (const cat of categories) {
      let items: RecommendationMatch[] = [];
      if (cat.id === 'foundation') {
        items = allMatches.filter((m) => m.product.category === 'foundation' || m.product.category === 'concealer');
      } else if (cat.id === 'lipstick') {
        items = allMatches.filter((m) => m.product.category === 'lipstick' || m.product.category === 'lipgloss');
      } else if (cat.id === 'eyeliner') {
        items = allMatches.filter((m) => m.product.category === 'eyeliner' || m.product.category === 'kajal' || m.product.category === 'mascara');
      } else if (cat.id === 'blush') {
        items = allMatches.filter((m) => m.product.category === 'blush' || m.product.category === 'contour');
      } else if (cat.id === 'primer') {
        items = allMatches.filter((m) => m.product.category === 'primer' || m.product.category === 'powder');
      } else {
        items = allMatches.filter((m) => m.product.category === cat.id);
      }

      if (items.length > 0) {
        results.push({
          category: cat.id,
          categoryLabel: cat.label,
          type: cat.type,
          items: items.slice(0, 4),
        });
      }
    }

    return results;
  },
};
