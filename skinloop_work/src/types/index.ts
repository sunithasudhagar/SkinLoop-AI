export type SkinGoal =
  | 'Hydration & Barrier'
  | 'Anti-Aging & Firmness'
  | 'Blemish & Pore Care'
  | 'Even Tone & Brightening'
  | 'Sun Defense & Protection'
  | 'Calm Redness & Sensitivity'
  | 'Texture Smoothing';

export type MakeupStyle =
  | 'Clean Minimalist'
  | 'Warm Everyday'
  | 'Polished Office'
  | 'Evening Glamour'
  | 'Festive & Celebration'
  | 'Soft Romantic';

export type BudgetTier = 'budget' | 'mid' | 'luxury';

export interface UserProfile {
  name: string;
  skinType: 'Normal' | 'Dry' | 'Oily' | 'Combination' | 'Sensitive';
  skinGoals: SkinGoal[];
  makeupStyles: MakeupStyle[];
  budgetTier: BudgetTier;
  monthlyBudget: number; // Stored in INR (₹)
  sensitivities: string[];
  preferredBrands: string[];
  desiredCoverage: 'sheer' | 'medium' | 'full';
  desiredFinish: 'matte' | 'natural' | 'dewy' | 'satin';
  undertone: 'Warm' | 'Cool' | 'Neutral' | 'Olive' | 'Unsure';
  shadePreference?: 'Fair' | 'Light' | 'Medium' | 'Tan' | 'Deep' | 'Rich' | 'Unsure';
  fragrancePreference: 'fragrance-free' | 'subtle' | 'no-preference';
  preferredOccasion: 'everyday' | 'college' | 'office' | 'party' | 'wedding';
  consentPhotoStorage: boolean;
  consentAiAnalysis: boolean;
  onboardingCompleted: boolean;
}

export interface SkinMetrics {
  hydration?: number | null; // 0-100 or null if unavailable
  textureSmoothness?: number | null; // 0-100 or null if unavailable
  rednessScore?: number | null; // 0-100 (higher = calmer/less red) or null if unavailable
  spotsClarity?: number | null; // 0-100 (higher = clearer) or null if unavailable
  oilBalance?: number | null; // 0-100 (50 = optimal) or null if unavailable
  radiance?: number | null; // 0-100 or null if unavailable
  firmness?: number | null; // 0-100 or null if unavailable
}

export interface SkinToneAnalysis {
  hex: string;
  pantoneApprox?: string;
  undertone: 'Warm' | 'Cool' | 'Neutral' | 'Olive' | 'Unsure';
  fitzpatrickType?: 'Type I' | 'Type II' | 'Type III' | 'Type IV' | 'Type V' | 'Type VI' | 'Not Detected';
  shadeFamily?: 'Fair' | 'Light' | 'Medium' | 'Tan' | 'Deep' | 'Rich' | 'Not Detected';
  confidenceNote: string;
  isUserDeclared?: boolean;
}

export interface SkinAnalysisRecord {
  id: string;
  timestamp: string;
  imageUrl?: string;
  source: 'youcam_live' | 'simulation_test';
  metrics: SkinMetrics;
  skinTone: SkinToneAnalysis;
  nonMedicalSummary: string;
  observations: string[];
  suggestedFocusAreas: string[];
  skinAge?: number;
  overallScore?: number;
  outputMaskUrl?: string;
  rawScoreInfo?: any;
  taskId?: string;
  verifiedParametersCount?: number;
}

export interface ShadeOption {
  id: string;
  shadeName: string;
  hex: string;
  undertone: 'Warm' | 'Cool' | 'Neutral' | 'Olive';
  matchScorePercent: number;
  matchDescription: string;
  shadeFamily?: 'Fair' | 'Light' | 'Medium' | 'Tan' | 'Deep' | 'Rich';
}

export interface CandidateShade {
  id: string;
  brand: string;
  productName: string;
  shadeName: string;
  hex: string;
  undertone: 'Warm' | 'Cool' | 'Neutral' | 'Olive' | 'Unsure';
  shadeFamily: string;
  description: string;
  matchScorePercent?: number;
  tentativeNote: string;
  savedAt: string;
}

export interface SavedLook {
  id: string;
  name: string;
  occasion: 'everyday' | 'college' | 'office' | 'party' | 'wedding';
  lookDescription: string;
  productIds: string[];
  selectedShades?: Record<string, string>; // productId -> shadeName or hex
  totalEstimatedPrice: number;
  currency: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category:
    | 'sunscreen'
    | 'cleanser'
    | 'moisturizer'
    | 'serum'
    | 'toner'
    | 'foundation'
    | 'concealer'
    | 'lipstick'
    | 'lipgloss'
    | 'blush'
    | 'eyeliner'
    | 'kajal'
    | 'mascara'
    | 'eyeshadow'
    | 'contour'
    | 'powder'
    | 'primer';
  subcategory?: string;
  price: number; // in INR (₹)
  currency: string; // '₹'
  catalogueStatus: 'demo_sample';
  sampleCatalogue: boolean;
  priceTier?: 'budget' | 'mid' | 'luxury';
  fragranceFree?: boolean;
  spf?: number;
  broadSpectrum?: boolean;
  paRating?: string;
  finish?: 'matte' | 'natural' | 'dewy' | 'satin';
  coverage?: 'sheer' | 'medium' | 'full';
  texture?: string;
  shades?: ShadeOption[];
  colorHex?: string;
  suitabilityTags: string[];
  verifiedIngredients: string[];
  whyItFitsReason?: string;
  isTintedSunscreen?: boolean;
  occasions?: string[];
  image?: string;
}

export interface ShelfProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  openedDate?: string;
  expiryDate?: string;
  verifiedIngredients: string[];
  purchasePrice?: number;
  remainingPercent: number; // 0-100
  notes?: string;
}

export interface RoutineStep {
  id: string;
  routineType: 'morning' | 'evening';
  stepOrder: number;
  stepName: string;
  purpose: string;
  shelfProductId?: string; // If mapped to user's owned product
  catalogueProductId?: string; // If mapped to a catalogue item
  completedToday: boolean;
  reminderTime?: string;
}

export type ProposalActionType =
  | 'add_to_shelf'
  | 'save_favorite'
  | 'save_look'
  | 'save_shade_candidate'
  | 'modify_routine';

export interface ActionProposal {
  id: string;
  type: ProposalActionType;
  title: string;
  description: string;
  previewData: {
    productId?: string;
    productName?: string;
    brand?: string;
    category?: string;
    price?: number;
    shade?: string;
    hex?: string;
    undertone?: string;
    routineStep?: {
      routineType: 'morning' | 'evening';
      stepName: string;
      purpose: string;
    };
    look?: {
      name: string;
      occasion: 'everyday' | 'college' | 'office' | 'party' | 'wedding';
      productIds: string[];
      totalEstimatedPrice: number;
    };
  };
  status: 'pending' | 'applied' | 'dismissed';
}

export interface BeautyChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedFollowUps?: string[];
  recommendedProducts?: Product[];
  proposals?: ActionProposal[];
  mode?: 'gemini' | 'deterministic';
  disclaimer?: string;
}

export interface JournalNote {
  id: string;
  date: string;
  analysisId?: string;
  photoUrl?: string;
  routineCompletedPct: number;
  skinFeeling: 'Dry & Tight' | 'Balanced & Comfortable' | 'Oily & Shiny' | 'Sensitive & Flushed';
  notes: string;
}

export interface BudgetRecord {
  id: string;
  date: string;
  productName: string;
  brand: string;
  category: string;
  amount: number;
  isOwnedShelfItem: boolean;
}

export interface YouCamApiConfig {
  endpoint: string;
  isLiveConfigured: boolean;
  mode: 'live' | 'test_simulation';
  keySource?: 'YOUCAM_API_KEY' | 'none';
  lastTestedAt?: string;
  testStatus?: 'connected' | 'unconfigured' | 'error';
  statusDetails?: string;
  endpoints?: {
    fileUpload: string;
    skinAnalysis: string;
    lookVto: string;
    lookVtoTemplates: string;
  };
}

// ==========================================
// FEATURE 1: SKIN EXPERIMENT LAB TYPES
// ==========================================
export interface ExperimentDailyObservation {
  dryness: number; // 1 (none) to 5 (severe)
  oiliness: number; // 1 (none) to 5 (severe)
  redness: number; // 1 (none) to 5 (severe)
  irritation: number; // 1 (none) to 5 (severe)
  breakouts: number; // 1 (none) to 5 (severe)
  comfort: number; // 1 (very uncomfortable) to 5 (optimal comfort)
}

export interface ExperimentDailyLog {
  id?: string;
  dayNumber: number;
  date: string; // YYYY-MM-DD
  observation: ExperimentDailyObservation;
  observations?: ExperimentDailyObservation;
  missedRoutineDay?: boolean;
  missedRoutine?: boolean;
  productChangeNotes?: string;
  notes: string;
  photoUrl?: string;
  recordedAt?: string;
}

export interface SkinExperiment {
  id: string;
  title: string;
  targetType?: 'shelf_product' | 'routine_step' | 'new_variable' | string;
  targetName?: string;
  targetCategory?: string;
  variableTested?: string;
  variableName?: string;
  variableType?: string;
  productId?: string;
  hypothesis: string;
  durationDays: 14 | 21 | 28 | number;
  targetDurationDays?: number;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  status: 'active' | 'completed' | 'stopped_early';
  stoppedReason?: string;
  stopReason?: string;
  baselineObservation: ExperimentDailyObservation;
  baselineObservations?: ExperimentDailyObservation;
  baselineNotes?: string;
  baselinePhotoUrl?: string;
  logs: ExperimentDailyLog[];
  dailyLogs?: ExperimentDailyLog[];
  aiSynthesis?: any;
  createdAt: string;
  updatedAt?: string;
}

export type { EnvironmentalData } from '../services/weather';
export type DiaryEntry = JournalNote & {
  factors?: string[];
  skinConditions?: string[];
  stressLevel?: string;
};
export type RoutineItem = RoutineStep & {
  timeOfDay?: string;
  productName?: string;
  brand?: string;
  category?: string;
  activeIngredients?: string[];
  frequency?: string;
  isCompleted?: boolean;
};
export type ProductCategory = 'Cleanser' | 'Toner' | 'Serum' | 'Moisturizer' | 'Sunscreen' | 'Exfoliant' | 'Mask' | 'Treatment' | 'foundation' | 'skincare' | 'makeup' | string;

// ==========================================
// FEATURE 2: SKIN TRIGGER DETECTIVE TYPES
// ==========================================
export interface TriggerEvidenceItem {
  id?: string;
  date: string;
  source: 'journal' | 'experiment';
  observedSymptom?: string;
  triggerFactor?: string;
  skinMetricValue?: string;
  notes?: string;
  environmentalMetric?: string;
  routineState?: string;
  noteSnippet?: string;
}

export interface SkinTriggerPattern {
  id: string;
  title: string;
  factorType: string;
  category: 'weather' | 'routine' | 'product' | 'sleep' | 'lifestyle' | string;
  symptomAffected: string;
  affectedMetric: string;
  patternStatement: string;
  description: string;
  confidence: string;
  sampleSizeRecords?: number;
  observationCount?: number;
  coOccurrenceRate?: number;
  datesObserved?: string[];
  lastDetected?: string;
  evidence: TriggerEvidenceItem[];
  confoundingFactors?: string[];
  recommendedAdjustment?: string;
  recommendation?: string;
  scientificDisclaimer?: string;
}

// ==========================================
// FEATURE 3: SMART PURCHASE SIMULATOR TYPES
// ==========================================
export interface PurchaseEvaluationResult {
  productName: string;
  brand: string;
  category: string;
  priceInr: number;
  volumeOrUses?: number;
  estimatedCostPerUseInr?: number;

  // Inventory & Duplicate Check
  hasDuplicateOnShelf: boolean;
  duplicateShelfItem?: ShelfProduct;
  daysSupplyRemaining?: number;
  shelfDuplicate: {
    hasDuplicate: boolean;
    duplicateDetails?: string;
    existingSupplyDaysRemaining: number;
  };

  // Compatibility & Conflict Check
  isCompatibleWithSkinType: boolean;
  compatibilityNotes: string[];
  hasSensitivityWarning: boolean;
  triggeredSensitivities: string[];
  sensitivityAlerts: string[];
  ingredientConflicts: Array<{
    clashingIngredient: string;
    activeRoutineProduct: string;
    chemicalRisk: string;
  }>;
  routineConflicts: Array<{
    prospectiveIngredient: string;
    routineIngredient: string;
    severity: 'high' | 'moderate' | 'low';
    reason: string;
    resolution: string;
  }>;

  // Budget & Financial Impact
  monthlyBudget: number;
  currentMonthlySpent: number;
  budgetPostPurchase: number;
  budgetImpactLevel: 'low' | 'moderate' | 'exceeds_budget';
  costAnalysis: {
    retailPriceInr: number;
    costPerDayInr: number;
    estimatedDaysOfUse: number;
    budgetImpactPercentage: number;
  };

  // Alternatives
  catalogueAlternatives: Product[];
  alternatives: Array<{
    name: string;
    brand: string;
    priceInr: number;
    reason: string;
  }>;

  // Smart Verdict
  verdict: 'recommended' | 'caution' | 'duplicate_warning' | 'not_recommended' | 'proceed' | 'defer_owned_product' | 'avoid_conflict' | 'consider_alternative' | string;
  verdictTitle?: string;
  verdictReasoning?: string;
  summary: string;
  fitScore: number;
  shouldPurchaseNow: boolean;
}

export interface SavedPurchaseSimulation {
  id: string;
  simulatedAt?: string;
  savedAt: string;
  product: {
    id: string;
    brand: string;
    name: string;
    category: ProductCategory | string;
    priceInr: number;
    volumeMl: number;
    ingredients: string[];
  };
  evaluation: PurchaseEvaluationResult;
  decisionStatus: 'wishlist' | 'approved' | 'deferred' | 'rejected' | string;
  userDecision?: 'wishlist' | 'approved_to_buy' | 'deferred' | 'rejected' | string;
  notes?: string;
  userNotes?: string;
}
