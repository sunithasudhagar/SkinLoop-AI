export interface IngredientDetail {
  name: string;
  category: 'active' | 'humectant' | 'emollient' | 'occlusive' | 'antioxidant' | 'uv_filter' | 'soothing' | 'preservative' | 'fragrance';
  description: string;
  functions: string[];
  safetyProfile: 'generally_safe' | 'caution_sensitizing' | 'active_irritation_risk';
  pHOptimal?: string;
  bestTime?: 'morning' | 'evening' | 'both';
  synonyms?: string[];
}

export interface IngredientConflict {
  type: 'direct_layering_conflict' | 'duplicate_active_overload' | 'personal_sensitivity_alert' | 'ph_destabilization';
  severity: 'high' | 'moderate' | 'low';
  ingredientsInvolved: string[];
  title: string;
  explanation: string;
  recommendation: string;
}

export interface IngredientAnalysisReport {
  analyzedIngredients: string[];
  recognizedIngredients: IngredientDetail[];
  unrecognizedIngredients: string[];
  conflicts: IngredientConflict[];
  sensitivityWarnings: string[];
  layeringOrder: {
    stepNumber: number;
    stepName: string;
    ingredients: string[];
    rationale: string;
  }[];
  overallSafetyVerdict: 'safe_to_combine' | 'caution_separate_am_pm' | 'high_risk_conflict';
  nonMedicalNotice: string;
}

export const INGREDIENT_DICTIONARY: Record<string, IngredientDetail> = {
  'retinol': {
    name: 'Retinol',
    category: 'active',
    description: 'Vitamin A derivative that accelerates cellular turnover, boosts collagen synthesis, and smooths fine lines and acne marks.',
    functions: ['Anti-aging', 'Cellular turnover', 'Acne care', 'Texture smoothing'],
    safetyProfile: 'active_irritation_risk',
    bestTime: 'evening',
    synonyms: ['retinoid', 'tretinoin', 'retinyl palmitate', 'hydroxypinacolone retinoate', 'adapalene'],
  },
  'salicylic acid': {
    name: 'Salicylic Acid (BHA)',
    category: 'active',
    description: 'Lipid-soluble beta hydroxy acid that penetrates into deep sebaceous pores to dissolve hardened sebum plugs and dead cells.',
    functions: ['Pore decongestion', 'Acne control', 'Anti-inflammatory', 'Blackhead reduction'],
    safetyProfile: 'active_irritation_risk',
    pHOptimal: '3.0 - 4.0',
    bestTime: 'evening',
    synonyms: ['bha', 'salicylate', 'betaine salicylate', 'willow bark extract'],
  },
  'glycolic acid': {
    name: 'Glycolic Acid (AHA)',
    category: 'active',
    description: 'Smallest molecule alpha hydroxy acid that loosens intercellular desmosome bonds on the stratum corneum to reveal brighter skin.',
    functions: ['Chemical exfoliation', 'Hyperpigmentation fading', 'Collagen synthesis'],
    safetyProfile: 'active_irritation_risk',
    pHOptimal: '3.5 - 4.0',
    bestTime: 'evening',
    synonyms: ['aha', 'alpha hydroxy acid'],
  },
  'lactic acid': {
    name: 'Lactic Acid (AHA)',
    category: 'active',
    description: 'Gentler, larger-molecule AHA that mildly exfoliates while acting as a natural moisturizing factor (NMF) humectant.',
    functions: ['Gentle exfoliation', 'Humectant hydration', 'Tone evening'],
    safetyProfile: 'caution_sensitizing',
    pHOptimal: '3.5 - 4.2',
    bestTime: 'evening',
  },
  'l-ascorbic acid': {
    name: 'L-Ascorbic Acid (Vitamin C)',
    category: 'antioxidant',
    description: 'Gold-standard active vitamin C antioxidant that neutralizes UV-induced reactive oxygen species and inhibits tyrosinase for brightening.',
    functions: ['Antioxidant defense', 'Collagen booster', 'Hyperpigmentation fading'],
    safetyProfile: 'caution_sensitizing',
    pHOptimal: '2.5 - 3.5',
    bestTime: 'morning',
    synonyms: ['vitamin c', 'ascorbic acid', 'sodium ascorbyl phosphate', '3-o-ethyl ascorbic acid'],
  },
  'benzoyl peroxide': {
    name: 'Benzoyl Peroxide',
    category: 'active',
    description: 'Powerful antibacterial agent that releases reactive oxygen species to destroy anaerobic Cutibacterium acnes bacteria.',
    functions: ['Acne bacteria eradication', 'Keratolytic action'],
    safetyProfile: 'active_irritation_risk',
    bestTime: 'evening',
    synonyms: ['bpo'],
  },
  'niacinamide': {
    name: 'Niacinamide (Vitamin B3)',
    category: 'active',
    description: 'Versatile water-soluble vitamin that strengthens ceramide synthesis, regulates sebum production, and calms redness.',
    functions: ['Barrier strengthening', 'Sebum regulation', 'Redness reduction', 'Pore refining'],
    safetyProfile: 'generally_safe',
    pHOptimal: '5.0 - 7.0',
    bestTime: 'both',
    synonyms: ['nicotinamide', 'vitamin b3'],
  },
  'hyaluronic acid': {
    name: 'Hyaluronic Acid',
    category: 'humectant',
    description: 'Powerful humectant capable of holding up to 1,000 times its molecular weight in water, plumping the upper epidermal layers.',
    functions: ['Deep hydration', 'Skin plumping', 'Fine line smoothing'],
    safetyProfile: 'generally_safe',
    bestTime: 'both',
    synonyms: ['sodium hyaluronate', 'hydrolyzed hyaluronic acid', 'ha'],
  },
  'ceramide np': {
    name: 'Ceramide NP',
    category: 'occlusive',
    description: 'Essential lipid constituent of the intercellular lamellar bilayer that prevents transepidermal water loss and repairs damaged barriers.',
    functions: ['Barrier restoration', 'Moisture sealing', 'Sensitivity defense'],
    safetyProfile: 'generally_safe',
    bestTime: 'both',
    synonyms: ['ceramides', 'ceramide ap', 'ceramide eop'],
  },
  'centella asiatica': {
    name: 'Centella Asiatica (Cica)',
    category: 'soothing',
    description: 'Traditional soothing botanical containing madecassoside and asiatic acid that accelerates micro-wound healing and calms irritation.',
    functions: ['Anti-inflammatory', 'Barrier soothing', 'Collagen stimulation'],
    safetyProfile: 'generally_safe',
    bestTime: 'both',
    synonyms: ['cica', 'madecassoside', 'asiaticoside'],
  },
  'panthenol': {
    name: 'Panthenol (Pro-Vitamin B5)',
    category: 'humectant',
    description: 'Penetrating humectant that converts to pantothenic acid in skin cells, restoring hydration and soothing redness.',
    functions: ['Barrier repair', 'Anti-itching', 'Hydration retention'],
    safetyProfile: 'generally_safe',
    bestTime: 'both',
    synonyms: ['pro-vitamin b5', 'd-panthenol'],
  },
  'zinc oxide': {
    name: 'Zinc Oxide',
    category: 'uv_filter',
    description: 'Inert mineral physical sunscreen filter offering photostable broad-spectrum protection against UVA and UVB rays.',
    functions: ['Physical UV defense', 'Skin soothing', 'Astringent calming'],
    safetyProfile: 'generally_safe',
    bestTime: 'morning',
    synonyms: ['mineral spf'],
  },
  'fragrance': {
    name: 'Fragrance / Parfum',
    category: 'fragrance',
    description: 'Complex mixture of aromatic compounds and essential oil isolates, recognized as one of the leading triggers for contact dermatitis.',
    functions: ['Aromatic scent'],
    safetyProfile: 'caution_sensitizing',
    bestTime: 'both',
    synonyms: ['parfum', 'essential oils', 'linalool', 'limonene', 'geraniol', 'citronellol'],
  },
  'denatured alcohol': {
    name: 'Alcohol Denat',
    category: 'emollient',
    description: 'Low-molecular weight volatile alcohol used to create weightless quick-drying textures; can compromise fragile skin barriers in high doses.',
    functions: ['Solvent', 'Fast absorption', 'Astringent'],
    safetyProfile: 'caution_sensitizing',
    bestTime: 'both',
    synonyms: ['sd alcohol', 'ethanol', 'alcohol'],
  },
};

export class IngredientCheckerService {
  /**
   * Search dictionary of skincare actives and ingredients
   */
  public static searchDictionary(query: string): IngredientDetail[] {
    const q = query.toLowerCase().trim();
    if (!q) return Object.values(INGREDIENT_DICTIONARY);
    return Object.values(INGREDIENT_DICTIONARY).filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.functions.some((f) => f.toLowerCase().includes(q)) ||
        item.synonyms?.some((s) => s.toLowerCase().includes(q))
    );
  }

  /**
   * Parse a raw ingredient string or pasted list
   */
  public static parseIngredientString(rawInput: string): string[] {
    return rawInput
      .replace(/[\n\r]/g, ',')
      .split(',')
      .map((item) => item.replace(/[*•\-–]/g, '').trim())
      .filter((item) => item.length > 1);
  }

  /**
   * Full Conflict and Compatibility Analysis
   */
  public static analyzeIngredients(
    ingredients: string[],
    userSensitivities: string[] = []
  ): IngredientAnalysisReport {
    const normalized = ingredients.map((i) => i.toLowerCase().trim());
    const recognized: IngredientDetail[] = [];
    const unrecognized: string[] = [];

    normalized.forEach((raw) => {
      let matched: IngredientDetail | undefined;
      for (const [key, detail] of Object.entries(INGREDIENT_DICTIONARY)) {
        if (raw === key || raw.includes(key) || detail.synonyms?.some((s) => raw.includes(s))) {
          matched = detail;
          break;
        }
      }
      if (matched && !recognized.some((r) => r.name === matched!.name)) {
        recognized.push(matched);
      } else if (!matched) {
        unrecognized.push(raw);
      }
    });

    const conflicts: IngredientConflict[] = [];
    const sensitivityWarnings: string[] = [];

    const names = recognized.map((r) => r.name.toLowerCase());
    const hasRetinol = names.some((n) => n.includes('retinol'));
    const hasSalicylic = names.some((n) => n.includes('salicylic') || n.includes('bha'));
    const hasGlycolic = names.some((n) => n.includes('glycolic') || n.includes('lactic') || n.includes('aha'));
    const hasVitC = names.some((n) => n.includes('ascorbic') || n.includes('vitamin c'));
    const hasBpo = names.some((n) => n.includes('benzoyl'));
    const hasFragrance = names.some((n) => n.includes('fragrance') || n.includes('parfum'));
    const hasAlcohol = names.some((n) => n.includes('alcohol denat') || n.includes('sd alcohol'));

    // 1. Retinol + AHA/BHA Conflict
    if (hasRetinol && (hasSalicylic || hasGlycolic)) {
      const acidType = hasSalicylic && hasGlycolic ? 'AHA & BHA Acids' : hasSalicylic ? 'Salicylic Acid (BHA)' : 'Glycolic/Lactic Acid (AHA)';
      conflicts.push({
        type: 'direct_layering_conflict',
        severity: 'high',
        ingredientsInvolved: ['Retinol', acidType],
        title: `Direct Layering Conflict: Retinol + ${acidType}`,
        explanation: 'Both Retinoids and Exfoliating Acids accelerate stratum corneum cell detachment. Applying them in the same routine drastically increases transepidermal water loss, stinging, and micro-tears in the epidermal moisture barrier.',
        recommendation: 'Separate by day: Use Exfoliating Acids (AHA/BHA) on Monday/Thursday evenings, and Retinol on Tuesday/Friday evenings ("Skin Cycling"). Never layer them directly on the same night.',
      });
    }

    // 2. Retinol + Benzoyl Peroxide Conflict
    if (hasRetinol && hasBpo) {
      conflicts.push({
        type: 'direct_layering_conflict',
        severity: 'high',
        ingredientsInvolved: ['Retinol', 'Benzoyl Peroxide'],
        title: 'Chemical Degradation: Retinol + Benzoyl Peroxide',
        explanation: 'Benzoyl Peroxide is an oxidizing agent that can chemically deactivate and oxidize pure Retinol when layered together, rendering the retinol ineffective while amplifying extreme dryness and flaking.',
        recommendation: 'Use Benzoyl Peroxide in the morning (followed by broad-spectrum SPF 50+) and apply Retinol in the evening, or alternate days.',
      });
    }

    // 3. Pure Vitamin C (L-Ascorbic) + AHA/BHA Conflict
    if (hasVitC && (hasSalicylic || hasGlycolic)) {
      conflicts.push({
        type: 'ph_destabilization',
        severity: 'moderate',
        ingredientsInvolved: ['L-Ascorbic Acid (Vitamin C)', 'AHA/BHA Exfoliating Acids'],
        title: 'Acid Stacking & Irritation Risk: Vitamin C + Chemical Acids',
        explanation: 'Pure L-Ascorbic Acid requires a very low pH (2.5 - 3.5) to penetrate. Layering it immediately with other direct exfoliating acids exposes facial skin to excessive combined acidity, frequently triggering erythema, flushing, and burning sensations.',
        recommendation: 'Apply Vitamin C exclusively in the morning under daily sunscreen to boost antioxidant photo-defense. Save chemical exfoliating acids (AHA/BHA) for evening routines 2-3 times per week.',
      });
    }

    // 4. Vitamin C + Retinol Direct Layering
    if (hasVitC && hasRetinol) {
      conflicts.push({
        type: 'ph_destabilization',
        severity: 'moderate',
        ingredientsInvolved: ['L-Ascorbic Acid (Vitamin C)', 'Retinol'],
        title: 'Opposing Optimal pH: Vitamin C + Retinol',
        explanation: 'L-Ascorbic Acid functions best in a highly acidic environment (pH 3.0), whereas Retinol converts most efficiently at neutral tissue pH (5.5 - 6.5). Layering them simultaneously can compromise conversion efficacy and irritate sensitive skin.',
        recommendation: 'Follow the classic dermatological split: Vitamin C in the morning (antioxidant defense against daytime pollution and UV) and Retinol in the evening (nocturnal repair and cellular turnover).',
      });
    }

    // 5. Duplicate Active Warning (Exfoliants overload)
    if (hasSalicylic && hasGlycolic) {
      conflicts.push({
        type: 'duplicate_active_overload',
        severity: 'moderate',
        ingredientsInvolved: ['Salicylic Acid (BHA)', 'Glycolic/Lactic Acid (AHA)'],
        title: 'Dual Exfoliant Stacking Alert',
        explanation: 'Combining multiple leave-on peeling acids simultaneously can over-exfoliate the skin barrier, leading to compromised lipid cohesion and rebound sebum production.',
        recommendation: 'Use a single balanced formula with gentle sub-percentages or alternate AHA and BHA on different nights.',
      });
    }

    // 6. User Personal Sensitivities Checking
    const userSensLower = userSensitivities.map((s) => s.toLowerCase());
    if (userSensLower.includes('fragrance') && hasFragrance) {
      sensitivityWarnings.push('Fragrance Alert: This product contains added fragrance / parfum, which directly violates your declared fragrance sensitivity preference.');
    }
    if (userSensLower.includes('denatured alcohol') && hasAlcohol) {
      sensitivityWarnings.push('Alcohol Alert: Contains volatile denatured alcohol, which may strip moisture and trigger flushing on alcohol-sensitive skin.');
    }
    if (userSensLower.includes('niacinamide') && names.some((n) => n.includes('niacinamide'))) {
      sensitivityWarnings.push('Niacinamide Alert: Contains Niacinamide, matching your registered sensitivity to high-percentage vitamin B3.');
    }

    // 7. Layering order sequence calculation
    const layeringOrder: IngredientAnalysisReport['layeringOrder'] = [];
    let stepNum = 1;

    // Cleanser
    layeringOrder.push({
      stepNumber: stepNum++,
      stepName: 'Gentle Cleansing',
      ingredients: ['Water / Surfactant base'],
      rationale: 'Cleanse with lukewarm water to remove sebum and dirt without stripping the natural stratum corneum lipid barrier.',
    });

    // Low pH Actives / Direct Acids
    const directAcids = recognized.filter((r) => r.name.includes('Glycolic') || r.name.includes('Salicylic') || r.name.includes('Lactic'));
    if (directAcids.length > 0) {
      layeringOrder.push({
        stepNumber: stepNum++,
        stepName: 'Exfoliating Treatment (Low pH)',
        ingredients: directAcids.map((a) => a.name),
        rationale: 'Apply to completely dry skin right after cleansing. Allow 5 minutes to absorb before applying higher pH hydrators.',
      });
    }

    // Antioxidant (Vitamin C)
    if (hasVitC) {
      layeringOrder.push({
        stepNumber: stepNum++,
        stepName: 'Antioxidant Protection (AM)',
        ingredients: ['L-Ascorbic Acid (Vitamin C)'],
        rationale: 'Absorbs quickly into skin to neutralize free radicals from UV light and environmental pollutants.',
      });
    }

    // Water-based Humectants
    const humectants = recognized.filter((r) => r.category === 'humectant' || r.name.includes('Hyaluronic') || r.name.includes('Panthenol') || r.name.includes('Niacinamide'));
    if (humectants.length > 0) {
      layeringOrder.push({
        stepNumber: stepNum++,
        stepName: 'Hydrating Boosters & Serums',
        ingredients: humectants.map((h) => h.name),
        rationale: 'Pat onto skin while slightly damp. Humectants pull water molecules into the epidermis.',
      });
    }

    // Retinol (PM)
    if (hasRetinol) {
      layeringOrder.push({
        stepNumber: stepNum++,
        stepName: 'Retinoid Treatment (PM Only)',
        ingredients: ['Retinol'],
        rationale: 'Apply pea-sized amount to dry skin in the evening. If sensitive, buffer between light moisturizer layers.',
      });
    }

    // Moisturizers & Ceramides
    const barrier = recognized.filter((r) => r.category === 'occlusive' || r.category === 'soothing' || r.name.includes('Ceramide') || r.name.includes('Centella'));
    layeringOrder.push({
      stepNumber: stepNum++,
      stepName: 'Barrier Moisture Seal',
      ingredients: barrier.length > 0 ? barrier.map((b) => b.name) : ['Ceramide / Fatty Acid Cream'],
      rationale: 'Seals in humectant water with biocompatible lipids (Ceramides, Fatty acids, Cholesterol) to stop transepidermal water loss.',
    });

    // Sunscreen
    layeringOrder.push({
      stepNumber: stepNum++,
      stepName: 'Broad-Spectrum SPF 50+ (Morning Final Step)',
      ingredients: ['Broad-Spectrum UV Filters'],
      rationale: 'Non-negotiable final daytime step. Never mix sunscreen directly with moisturizers or oils, as that disrupts the protective UV polymer film.',
    });

    // Overall verdict
    let verdict: IngredientAnalysisReport['overallSafetyVerdict'] = 'safe_to_combine';
    if (conflicts.some((c) => c.severity === 'high')) {
      verdict = 'high_risk_conflict';
    } else if (conflicts.length > 0 || sensitivityWarnings.length > 0) {
      verdict = 'caution_separate_am_pm';
    }

    return {
      analyzedIngredients: ingredients,
      recognizedIngredients: recognized,
      unrecognizedIngredients: unrecognized,
      conflicts,
      sensitivityWarnings,
      layeringOrder,
      overallSafetyVerdict: verdict,
      nonMedicalNotice: 'Clinical Disclaimer: SkinLoop AI provides cosmetic ingredient compatibility analysis based on established cosmetic science literature. This tool does not provide medical diagnoses or replace consultations with a board-certified dermatologist.',
    };
  }
}
