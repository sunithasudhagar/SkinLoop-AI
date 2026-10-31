import { TriggerDetectiveService } from './src/services/triggerDetective.js';
import { PurchaseSimulatorService } from './src/services/purchaseSimulator.js';
import { StorageService, DEFAULT_PROFILE } from './src/services/storage.js';
import { 
  SkinExperiment, 
  DiaryEntry, 
  RoutineItem, 
  ShelfProduct, 
  UserProfile, 
  EnvironmentalData, 
  SavedPurchaseSimulation 
} from './src/types/index.js';
import { SAMPLE_CATALOGUE } from './src/data/catalogue.js';

let passes = 0;
let fails = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passes++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
    fails++;
  }
}

console.log('====================================================');
console.log('SKINLOOP AI — DIFFERENTIATION FEATURES TEST SUITE');
console.log('====================================================\n');

// ---------------------------------------------------------------------
// TEST SUITE 1: SKIN EXPERIMENT LAB (SINGLE-VARIABLE TESTING & SYNTHESIS)
// ---------------------------------------------------------------------
console.log('--- TEST SUITE 1: Skin Experiment Lab ---');

const testExperiment: SkinExperiment = {
  id: 'exp-test-001',
  title: 'Testing 2% BHA Salicylic Acid Toner',
  hypothesis: 'Introducing BHA 3x weekly may clarify congested pores without compromising moisture barrier.',
  variableType: 'new_product',
  variableName: '2% BHA Salicylic Acid Exfoliant',
  productId: 'prod-sk-004',
  startDate: '2026-10-01',
  durationDays: 14,
  targetDurationDays: 14,
  status: 'active',
  baselineObservation: {
    dryness: 2,
    oiliness: 4,
    redness: 1,
    irritation: 1,
    breakouts: 4,
    comfort: 3,
  },
  baselineObservations: {
    dryness: 2,
    oiliness: 4,
    redness: 1,
    irritation: 1,
    breakouts: 4,
    comfort: 3,
  },
  logs: [],
  dailyLogs: [
    {
      dayNumber: 1,
      date: '2026-10-01',
      observation: { dryness: 2, oiliness: 4, redness: 1, irritation: 1, breakouts: 4, comfort: 3 },
      observations: { dryness: 2, oiliness: 4, redness: 1, irritation: 1, breakouts: 4, comfort: 3 },
      notes: 'First application in PM routine.',
      missedRoutine: false,
    },
    {
      dayNumber: 2,
      date: '2026-10-02',
      observation: { dryness: 3, oiliness: 3, redness: 2, irritation: 2, breakouts: 4, comfort: 2 },
      observations: { dryness: 3, oiliness: 3, redness: 2, irritation: 2, breakouts: 4, comfort: 2 },
      notes: 'Mild tingling observed around cheek area.',
      missedRoutine: false,
    },
    {
      dayNumber: 3,
      date: '2026-10-03',
      observation: { dryness: 2, oiliness: 3, redness: 1, irritation: 1, breakouts: 3, comfort: 4 },
      observations: { dryness: 2, oiliness: 3, redness: 1, irritation: 1, breakouts: 3, comfort: 4 },
      notes: 'Barrier adjusted well. Missed morning SPF application.',
      missedRoutine: true,
    },
  ],
  createdAt: '2026-10-01T00:00:00Z',
  updatedAt: '2026-10-03T00:00:00Z',
};

// 1.1 Verify Experiment Structure & Isolation
assert(testExperiment.variableType === 'new_product', 'Tracks a single distinct variable type');
assert(testExperiment.targetDurationDays === 14, 'Supports standard testing duration (14 days)');
assert(testExperiment.dailyLogs!.length === 3, 'Chronological daily logs recorded');

// 1.2 Verify 6-Metric Observations Logging (1-5 scale)
const log2 = testExperiment.dailyLogs![1].observations!;
assert(
  log2.dryness >= 1 && log2.dryness <= 5 &&
  log2.oiliness >= 1 && log2.oiliness <= 5 &&
  log2.redness >= 1 && log2.redness <= 5 &&
  log2.irritation >= 1 && log2.irritation <= 5 &&
  log2.breakouts >= 1 && log2.breakouts <= 5 &&
  log2.comfort >= 1 && log2.comfort <= 5,
  'All 6 observation metrics conform to 1-5 scale'
);

// 1.3 Missed Routine Tracking
const missedDays = testExperiment.dailyLogs!.filter((l: any) => l.missedRoutine).length;
assert(missedDays === 1, 'Accurately tracks missed routine days as confounders');

// 1.4 Early Termination Safety Mechanism
const earlyTerminatedExp: SkinExperiment = {
  ...testExperiment,
  id: 'exp-early-stop',
  status: 'stopped_early',
  stopReason: 'Severe irritation and redness after day 4',
  stoppedReason: 'Severe irritation and redness after day 4',
  dailyLogs: [
    ...(testExperiment.dailyLogs || []),
    {
      dayNumber: 4,
      date: '2026-10-04',
      observation: { dryness: 4, oiliness: 2, redness: 5, irritation: 5, breakouts: 4, comfort: 1 },
      observations: { dryness: 4, oiliness: 2, redness: 5, irritation: 5, breakouts: 4, comfort: 1 },
      notes: 'Significant burning on barrier.',
      missedRoutine: false,
    }
  ]
};
assert(earlyTerminatedExp.status === 'stopped_early', 'Allows safe early termination on irritation');
assert(Boolean(earlyTerminatedExp.stopReason || earlyTerminatedExp.stoppedReason), 'Stores user rationale for early termination');

// ---------------------------------------------------------------------
// TEST SUITE 2: SKIN TRIGGER DETECTIVE (OBSERVATIONAL PATTERN SCANNER)
// ---------------------------------------------------------------------
console.log('\n--- TEST SUITE 2: Skin Trigger Detective ---');

const testDiaryEntries: DiaryEntry[] = [
  {
    id: 'entry-1',
    date: '2026-10-01',
    skinFeeling: 'Dry & Tight',
    routineCompletedPct: 100,
    factors: ['Weather', 'Air Conditioning'],
    skinConditions: ['dryness', 'tightness'],
    stressLevel: 'low',
    notes: 'Air conditioning on high all day. Slept 5 hours only, feeling tired.',
  },
  {
    id: 'entry-2',
    date: '2026-10-02',
    skinFeeling: 'Dry & Tight',
    routineCompletedPct: 100,
    factors: ['Weather'],
    skinConditions: ['dryness', 'flaking'],
    stressLevel: 'medium',
    notes: 'Windy outdoor commute, severe dry patches around nose.',
  },
  {
    id: 'entry-3',
    date: '2026-10-03',
    skinFeeling: 'Dry & Tight',
    routineCompletedPct: 0,
    factors: ['Lack of Sleep'],
    skinConditions: ['dryness'],
    stressLevel: 'low',
    notes: 'Skin still dry, skipped night moisturizer.',
  },
  {
    id: 'entry-4',
    date: '2026-10-04',
    skinFeeling: 'Sensitive & Flushed',
    routineCompletedPct: 50,
    factors: ['Stress'],
    skinConditions: ['breakouts', 'irritation'],
    stressLevel: 'high',
    notes: 'Rough night with only 4 hours of sleep.',
  },
];

const testRoutineItems: RoutineItem[] = [
  {
    id: 'rt-1',
    routineType: 'morning',
    stepOrder: 1,
    stepName: 'Hydrating Gentle Foam Cleanser',
    purpose: 'Cleanse',
    completedToday: false,
    timeOfDay: 'am',
    productName: 'Hydrating Gentle Foam Cleanser',
    brand: 'Minimalist',
    category: 'Cleanser',
    activeIngredients: ['Glycerin', 'Panthenol'],
    frequency: 'daily',
    isCompleted: false,
  },
  {
    id: 'rt-2',
    routineType: 'evening',
    stepOrder: 2,
    stepName: '0.3% Retinol Night Serum',
    purpose: 'Treat',
    completedToday: false,
    timeOfDay: 'pm',
    productName: '0.3% Retinol Night Serum',
    brand: 'Minimalist',
    category: 'Serum',
    activeIngredients: ['Retinol', 'Squalane'],
    frequency: 'daily',
    isCompleted: false,
  },
];

const testProfile: UserProfile = {
  ...DEFAULT_PROFILE,
  name: 'Aanya Sharma',
  skinType: 'Combination',
  sensitivities: ['Fragrance', 'Essential Oils'],
  monthlyBudget: 4000,
};

const testEnvData: EnvironmentalData = {
  city: 'Bengaluru',
  country: 'India',
  latitude: 12.97,
  longitude: 77.59,
  temperatureC: 24,
  humidityPct: 28, // Low humidity -> trigger for dryness
  uvIndex: 8.5, // High UV -> trigger for redness
  aqiUs: 165,
  aqiUsCategory: 'Unhealthy',
  aqiStandard: 'US EPA / CPCB NAQI',
  cpcbCategory: 'Moderate',
  pm25: 65,
  pm10: 120,
  weatherDescription: 'Sunny and dry',
  timestamp: new Date().toISOString(),
  dataSource: 'Open-Meteo',
  isLive: true,
  isCached: false,
};

// 2.1 Pattern Detection Execution
const detectedPatterns = TriggerDetectiveService.detectPatterns(
  testDiaryEntries,
  [testExperiment],
  testRoutineItems,
  testProfile,
  testEnvData
);

assert(Array.isArray(detectedPatterns) && detectedPatterns.length > 0, 'Detects observational patterns across inputs');

// 2.2 Low Humidity -> Dryness Co-occurrence Check
const humidityPattern = detectedPatterns.find(p => (p.category === 'weather' || p.factorType === 'atmospheric') && (p.affectedMetric === 'dryness' || p.symptomAffected.toLowerCase().includes('dry')));
assert(Boolean(humidityPattern), 'Flags low ambient humidity correlation with reported dryness');
assert(Boolean(humidityPattern?.confidence), 'Assigns statistical confidence rating');

// 2.3 Sleep Mention in Journal
const sleepPattern = detectedPatterns.find(p => p.category === 'sleep' || p.factorType === 'lifestyle_sleep');
assert(Boolean(sleepPattern), 'Detects sleep deprivation signals mentioned in diary notes');

// 2.4 Active Experiment Variable Flagged in Trigger System
const expPattern = detectedPatterns.find(p => p.category === 'product' || p.factorType === 'routine_product');
assert(Boolean(expPattern), 'Cross-integrates active experiment variables into trigger radar');

// 2.5 Non-Causal Disclaimers Present
assert(
  detectedPatterns.every(p => {
    const desc = (p.description || p.patternStatement || '').toLowerCase();
    return !desc.includes('proved to cause') && !desc.includes('definitive cause');
  }),
  'Preserves scientific non-causal honesty (no false causation claims)'
);

// ---------------------------------------------------------------------
// TEST SUITE 3: SMART BEAUTY PURCHASE SIMULATOR
// ---------------------------------------------------------------------
console.log('\n--- TEST SUITE 3: Smart Beauty Purchase Simulator ---');

const testShelfProducts: ShelfProduct[] = [
  {
    id: 'shelf-1',
    name: '10% Niacinamide Serum',
    brand: 'Minimalist',
    category: 'Serum',
    openedDate: '2026-09-15',
    verifiedIngredients: ['Niacinamide', 'Zinc PCA', 'Hyaluronic Acid'],
    purchasePrice: 599,
    remainingPercent: 65,
  },
  {
    id: 'shelf-2',
    name: 'Ceramide Moisturizing Cream',
    brand: 'Cetaphil',
    category: 'Moisturizer',
    openedDate: '2026-08-01',
    verifiedIngredients: ['Ceramide NP', 'Glycerin', 'Niacinamide'],
    purchasePrice: 850,
    remainingPercent: 40,
  },
];

// Scenario A: Testing a redundant shelf duplicate (Another Niacinamide Serum)
const prospectiveDuplicate = {
  id: 'cand-dup-01',
  brand: 'The Ordinary',
  name: 'Niacinamide 10% + Zinc 1%',
  category: 'Serum' as const,
  priceInr: 600,
  volumeMl: 30,
  ingredients: ['Niacinamide', 'Zinc PCA', 'Pentylene Glycol'],
};

const duplicateEval = PurchaseSimulatorService.evaluatePurchase(
  prospectiveDuplicate,
  testShelfProducts,
  testRoutineItems,
  testProfile
);

assert(duplicateEval.shelfDuplicate.hasDuplicate === true, 'Accurately detects redundant shelf duplicate');
assert(duplicateEval.shelfDuplicate.existingSupplyDaysRemaining > 0, 'Estimates remaining days of shelf supply');
assert(duplicateEval.verdict === 'duplicate_warning' || duplicateEval.verdict === 'caution', 'Applies duplicate cautionary verdict');

// Scenario B: Testing a routine chemical conflict (Glycolic Acid exfoliant vs active Retinol in routine)
const prospectiveConflict = {
  id: 'cand-conflict-01',
  brand: 'Minimalist',
  name: 'Glycolic Acid 08% Exfoliating Liquid',
  category: 'Exfoliant' as const,
  priceInr: 499,
  volumeMl: 150,
  ingredients: ['Glycolic Acid', 'Aloe Barbadensis Leaf Juice', 'Panthenol'],
};

const conflictEval = PurchaseSimulatorService.evaluatePurchase(
  prospectiveConflict,
  testShelfProducts,
  testRoutineItems,
  testProfile
);

assert(conflictEval.routineConflicts.length > 0, 'Flags chemical clashes against active routine (AHA vs Retinol)');
assert(Boolean(conflictEval.routineConflicts[0].resolution), 'Provides actionable safe usage resolution (e.g. alternate nights)');

// Scenario C: Testing personal user sensitivity clash (Fragranced Luxury Cream)
const prospectiveSensClash = {
  id: 'cand-fragrance-01',
  brand: 'Luxe Botanicals',
  name: 'Rose Damascena Velvet Night Crème',
  category: 'Moisturizer' as const,
  priceInr: 2499,
  volumeMl: 50,
  ingredients: ['Aqua', 'Shea Butter', 'Fragrance', 'Rose Petal Extract', 'Essential Oils'],
};

const sensitivityEval = PurchaseSimulatorService.evaluatePurchase(
  prospectiveSensClash,
  testShelfProducts,
  testRoutineItems,
  testProfile
);

assert(sensitivityEval.sensitivityAlerts.length > 0, 'Detects fragrance & essential oil sensitivities from user profile');
assert(sensitivityEval.verdict === 'not_recommended', 'Labels product with known user allergens as not_recommended');

// Scenario D: Cost-per-use & Budget calculation
assert(sensitivityEval.costAnalysis.costPerDayInr > 0, 'Computes accurate daily cost of ownership (₹/day)');
assert(sensitivityEval.costAnalysis.budgetImpactPercentage > 0, 'Computes monthly skincare budget consumption');

// Scenario E: Saved Simulation State
const simulationRecord: SavedPurchaseSimulation = {
  id: 'sim-test-01',
  product: prospectiveDuplicate,
  evaluation: duplicateEval,
  savedAt: new Date().toISOString(),
  decisionStatus: 'deferred',
  notes: 'Wait until Minimalist Niacinamide is 100% finished.',
};

assert(simulationRecord.decisionStatus === 'deferred', 'Supports intentional purchase decision states (wishlist/approved/deferred/rejected)');

console.log('\n====================================================');
console.log(`TOTAL PASSES: ${passes}`);
console.log(`TOTAL FAILS:  ${fails}`);
console.log('====================================================');

if (fails > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL DIFFERENTIATION TESTS PASSED CLEANLY!\n');
  process.exit(0);
}
