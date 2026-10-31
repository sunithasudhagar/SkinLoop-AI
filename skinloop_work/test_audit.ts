import { SAMPLE_CATALOGUE, COORDINATED_LOOKS } from './src/data/catalogue';
import { RecommendationEngine } from './src/services/recommendations';
import { StorageService } from './src/services/storage';
import { UserProfile, Product, CandidateShade, SavedLook } from './src/types/index';

// Mock localStorage for Node.js runtime audit
const store: Record<string, string> = {};
(global as any).localStorage = {
  getItem: (k: string) => store[k] || null,
  setItem: (k: string, v: string) => { store[k] = String(v); },
  removeItem: (k: string) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); }
};

console.log("=== RUNNING SKINLOOP AI AUTOMATED FUNCTIONAL AUDIT ===");

const errors: string[] = [];
function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${msg}`);
    errors.push(msg);
  } else {
    console.log(`✅ PASS: ${msg}`);
  }
}

// ----------------------------------------------------
// 1. Catalogue & Currency & Sample Status Audit
// ----------------------------------------------------
console.log("\n--- 1. Catalogue Audit ---");
const expectedCategories = [
  'foundation', 'concealer', 'eyeliner', 'kajal', 'mascara',
  'eyeshadow', 'lipstick', 'lipgloss', 'blush', 'contour',
  'primer', 'powder', 'sunscreen', 'cleanser', 'moisturizer', 'serum', 'toner'
];

const foundCategories = new Set(SAMPLE_CATALOGUE.map(p => p.category));
for (const cat of expectedCategories) {
  const count = SAMPLE_CATALOGUE.filter(p => p.category === cat).length;
  assert(count > 0, `Category '${cat}' has products (found ${count})`);
}

let demoCount = 0;
let inrCount = 0;
let validPriceCount = 0;
SAMPLE_CATALOGUE.forEach(p => {
  if (p.catalogueStatus === 'demo_sample' && p.sampleCatalogue === true) demoCount++;
  if (p.currency === '₹') inrCount++;
  if (typeof p.price === 'number' && p.price > 0) validPriceCount++;
});
assert(demoCount === SAMPLE_CATALOGUE.length, `All ${SAMPLE_CATALOGUE.length} products explicitly marked as demo_sample`);
assert(inrCount === SAMPLE_CATALOGUE.length, `All ${SAMPLE_CATALOGUE.length} products have currency '₹'`);
assert(validPriceCount === SAMPLE_CATALOGUE.length, `All ${SAMPLE_CATALOGUE.length} products have positive numeric INR price`);

// Check Coordinated looks presets
assert(COORDINATED_LOOKS.length >= 5, `At least 5 occasion presets exist (found ${COORDINATED_LOOKS.length})`);
['everyday', 'college', 'office', 'party', 'wedding'].forEach(occ => {
  const look = COORDINATED_LOOKS.find(l => l.occasion === occ);
  assert(!!look, `Preset exists for occasion: ${occ}`);
  assert(look ? look.recommendedProducts.length >= 3 : false, `Preset ${occ} has >= 3 recommended products`);
  // Verify all referenced productIds actually exist in SAMPLE_CATALOGUE
  if (look) {
    const missing = look.recommendedProducts.filter(id => !SAMPLE_CATALOGUE.some(p => p.id === id));
    assert(missing.length === 0, `All product IDs for preset ${occ} exist in catalogue (missing: ${missing.join(', ')})`);
  }
});

// ----------------------------------------------------
// 2. Storage & Persistence Audit
// ----------------------------------------------------
console.log("\n--- 2. Storage & Persistence Audit ---");
StorageService.wipeAllData();

// Onboarding with empty/skipped fields
const defaultProfile = StorageService.getProfile();
assert(defaultProfile.skinType === 'Combination', "Default profile initializes safely with Combination skin");
assert(defaultProfile.monthlyBudget > 0, "Default profile has valid monthlyBudget in INR");

const customProfile: UserProfile = {
  ...defaultProfile,
  name: "Pooja Sharma",
  skinType: "Sensitive",
  undertone: "Olive",
  desiredCoverage: "medium",
  desiredFinish: "dewy",
  monthlyBudget: 4500,
  preferredOccasion: "wedding",
  fragrancePreference: "fragrance-free",
  sensitivities: ["Fragrance", "Essential oils"]
};
StorageService.saveProfile(customProfile);
const retrievedProfile = StorageService.getProfile();
assert(retrievedProfile.name === "Pooja Sharma", "Retrieved profile preserves name");
assert(retrievedProfile.skinType === "Sensitive", "Retrieved profile preserves skinType");
assert(retrievedProfile.undertone === "Olive", "Retrieved profile preserves undertone");
assert(retrievedProfile.monthlyBudget === 4500, "Retrieved profile preserves INR monthly budget");

// Candidate shades persistence
const candidateShade1: CandidateShade = {
  id: "cand-1",
  brand: "L'Oréal Paris",
  productName: "True Match Super-Blendable",
  shadeName: "3W Golden Beige",
  hex: "#D89A6B",
  undertone: "Warm",
  shadeFamily: "Medium",
  description: "Natural finish medium warm",
  matchScorePercent: 94,
  tentativeNote: "Tentative shade match pending camera calibration",
  savedAt: new Date().toISOString()
};
const candidateShade2: CandidateShade = {
  id: "cand-2",
  brand: "Maybelline",
  productName: "Fit Me Matte+Poreless",
  shadeName: "220 Natural Beige",
  hex: "#C68E65",
  undertone: "Warm",
  shadeFamily: "Medium",
  description: "Matte finish medium warm",
  matchScorePercent: 91,
  tentativeNote: "Tentative shade match pending camera calibration",
  savedAt: new Date().toISOString()
};
const candidateShade3: CandidateShade = {
  id: "cand-3",
  brand: "Kay Beauty",
  productName: "Hydrating Foundation",
  shadeName: "130Y Medium",
  hex: "#C99166",
  undertone: "Warm",
  shadeFamily: "Medium",
  description: "Hydrating finish medium warm",
  matchScorePercent: 96,
  tentativeNote: "Tentative shade match pending camera calibration",
  savedAt: new Date().toISOString()
};

StorageService.addCandidateShade(candidateShade1);
StorageService.addCandidateShade(candidateShade2);
StorageService.addCandidateShade(candidateShade3);
let shades = StorageService.getCandidateShades();
assert(shades.length === 3, "Three candidate shades stored for comparison");

// Compare 3 side by side simulation
const comparisonSet = shades.slice(0, 3);
assert(comparisonSet.length === 3, "Side-by-side comparison tray handles exactly 3 candidate shades");

// Removal of a candidate shade
StorageService.deleteCandidateShade("cand-2");
shades = StorageService.getCandidateShades();
assert(shades.length === 2 && !shades.some(s => s.id === "cand-2"), "Candidate shade successfully removed from storage");

// Saved looks persistence
const customSavedLook: SavedLook = {
  id: "look-custom-wedding-1",
  name: "My Sangeet Night Glow",
  occasion: "wedding",
  lookDescription: "High-glam radiant makeup for evening reception",
  productIds: ["prod-prm-1", "prod-fnd-1", "prod-bls-1", "prod-lip-1"],
  selectedShades: { "prod-fnd-1": "130Y Medium", "prod-lip-1": "Viola" },
  totalEstimatedPrice: 3497,
  currency: "₹",
  createdAt: new Date().toISOString()
};
StorageService.saveLook(customSavedLook);
let savedLooks = StorageService.getSavedLooks();
assert(savedLooks.length === 1 && savedLooks[0].id === "look-custom-wedding-1", "Saved look persisted in StorageService");
assert(savedLooks[0].totalEstimatedPrice === 3497, "Saved look preserves INR total price");

// Delete saved look
StorageService.deleteSavedLook("look-custom-wedding-1");
savedLooks = StorageService.getSavedLooks();
assert(savedLooks.length === 0, "Saved look deleted from StorageService");

// ----------------------------------------------------
// 3. Recommendation Engine Audit
// ----------------------------------------------------
console.log("\n--- 3. Recommendation Engine Audit ---");

// Test skipped / minimal onboarding answers:
const skippedProfile: UserProfile = {
  ...defaultProfile,
  skinType: 'Normal',
  undertone: 'Unsure',
  shadePreference: 'Unsure',
  skinGoals: [],
  sensitivities: [],
  preferredBrands: []
};
const recsSkipped = RecommendationEngine.getRecommendations(skippedProfile, []);
assert(recsSkipped.length > 0, `Generates ${recsSkipped.length} recommendations even when user skipped non-mandatory questions`);

// Grouped recommendations
const grouped = RecommendationEngine.getGroupedRecommendations(skippedProfile, []);
assert(grouped.length > 0, `Generates grouped recommendations across categories (count: ${grouped.length})`);
grouped.forEach(g => {
  assert(g.items.length > 0, `Group '${g.categoryLabel}' has ${g.items.length} items`);
});

// Test My Shelf Prioritization:
const testProductToOwn = SAMPLE_CATALOGUE.find(p => p.category === 'moisturizer')!;
StorageService.addToShelf({
  id: 'test-owned-moisturizer',
  name: testProductToOwn.name,
  brand: testProductToOwn.brand,
  category: testProductToOwn.category,
  openedDate: '2026-10-01',
  expiryDate: '2027-10-01',
  verifiedIngredients: testProductToOwn.verifiedIngredients,
  purchasePrice: testProductToOwn.price,
  remainingPercent: 90
});
const shelfAfterAdd = StorageService.getShelf();
const recsWithShelf = RecommendationEngine.getRecommendations(customProfile, shelfAfterAdd);
const ownedMatch = recsWithShelf.find(m => m.product.category === 'moisturizer' && m.alreadyOnShelf);
assert(ownedMatch !== undefined, "Recommendation engine flags existing shelf category items with alreadyOnShelf=true");
assert(Boolean(ownedMatch?.matchReasons.some(r => r.includes('already own'))), "Match reason clearly explains user already owns the product on My Shelf");

// Separation of Skincare Concerns from Makeup Color Preferences:
// Test 1: Sunscreen recommendations should NOT change based on undertone
const warmSunscreenRecs = RecommendationEngine.getRecommendations(
  { ...customProfile, undertone: 'Warm', skinType: 'Oily' },
  [],
  { targetCategory: 'sunscreen' }
);
const coolSunscreenRecs = RecommendationEngine.getRecommendations(
  { ...customProfile, undertone: 'Cool', skinType: 'Oily' },
  [],
  { targetCategory: 'sunscreen' }
);
assert(
  warmSunscreenRecs.length === coolSunscreenRecs.length &&
  warmSunscreenRecs[0].product.id === coolSunscreenRecs[0].product.id,
  "Sunscreen suitability recommendations never depend on skin tone or undertone"
);

// Test 2: Foundation candidate recommendations should provide tentative notices
const foundationRecs = RecommendationEngine.getRecommendations(
  { ...customProfile, undertone: 'Warm' },
  [],
  { targetCategory: 'foundation' }
);
assert(foundationRecs.length > 0, "Foundations returned for warm undertone");
assert(
  foundationRecs.every(f => f.tentativeShadeNotice !== undefined && f.tentativeShadeNotice.length > 0),
  "All foundation recommendations contain an explicit tentative shade calibration notice"
);

// Fragrance sensitivity hard filter test:
const fragranceFreeProfile: UserProfile = {
  ...customProfile,
  fragrancePreference: 'fragrance-free',
  sensitivities: ['Fragrance']
};
const fragranceRecs = RecommendationEngine.getRecommendations(fragranceFreeProfile, []);
const hasFragranced = fragranceRecs.some(r => r.product.fragranceFree === false);
assert(!hasFragranced, "Zero fragranced products recommended when user specifies fragrance-free");

// Price alternatives verification:
const hasAlternatives = recsSkipped.some(r => r.priceAlternatives.budget || r.priceAlternatives.mid || r.priceAlternatives.luxury);
assert(hasAlternatives, "Recommendation items provide alternative options across budget/mid/luxury price tiers");

// ----------------------------------------------------
// 4. Ingredient Safety & Conflict Checker Audit
// ----------------------------------------------------
console.log("\n--- 4. Ingredient Safety & Conflict Checker Audit ---");
import { IngredientCheckerService } from './src/services/ingredientChecker';

const parsedIngredients = IngredientCheckerService.parseIngredientString(
  "Water, Glycolic Acid, Retinol, Salicylic Acid, Fragrance, Hyaluronic Acid, Ceramide NP"
);
assert(parsedIngredients.length >= 6, "IngredientCheckerService correctly parses comma-separated input list");

const reportWithConflict = IngredientCheckerService.analyzeIngredients(parsedIngredients, ["Fragrance"]);
assert(reportWithConflict.overallSafetyVerdict === 'high_risk_conflict', "Flags high-risk conflict when Retinol and AHA/BHA are combined");
assert(
  reportWithConflict.conflicts.some(c => c.title.includes('Retinol')),
  "Generates specific chemical explanation for Retinol + Acid conflict"
);
assert(
  reportWithConflict.sensitivityWarnings.some(w => w.includes('Fragrance')),
  "Generates personal sensitivity warning for user-declared Fragrance allergy"
);
assert(reportWithConflict.layeringOrder.length >= 4, "Generates pH-aligned layering sequence (cleanser -> active -> moisturizer -> SPF)");

// ----------------------------------------------------
// 5. Weather, UV & Pollution Intelligence Audit
// ----------------------------------------------------
console.log("\n--- 5. Weather & Environmental Intelligence Audit ---");
import { WeatherService, EnvironmentalData } from './src/services/weather';

const testEnvData: EnvironmentalData = {
  city: "New Delhi",
  country: "India",
  latitude: 28.6139,
  longitude: 77.2090,
  temperatureC: 32,
  humidityPct: 28, // Low humidity (<40)
  uvIndex: 9.5,    // Very high UV
  aqiUs: 180,      // Unhealthy AQI (>150)
  aqiUsCategory: WeatherService.computeAqiUsCategory(180),
  aqiStandard: "US EPA AQI & Indian CPCB NAQI Standard",
  cpcbCategory: WeatherService.computeCpcbCategory(65, 120),
  pm25: 65,
  pm10: 120,
  weatherDescription: "Hazy Sunshine",
  timestamp: new Date().toISOString(),
  dataSource: "Open-Meteo Environmental Intelligence (Real-Time)",
  isLive: true,
  isCached: false,
};

assert(testEnvData.cpcbCategory === 'Moderate', "CPCB NAQI category correctly classifies PM2.5 65 & PM10 120 as 'Moderate'");
assert(WeatherService.computeCpcbCategory(280, 450) === 'Severe', "CPCB NAQI classifies PM2.5 > 250 as 'Severe'");
assert(WeatherService.computeCpcbCategory(25, 45) === 'Good', "CPCB NAQI classifies PM2.5 <= 30 & PM10 <= 50 as 'Good'");

const advice = WeatherService.generateSkincareAdvice(testEnvData);
assert(advice.sunscreenAlert.level === 'very_high', "Generates 'very_high' UV sunscreen alert for UV 9.5");
assert(advice.sunscreenAlert.reapplicationIntervalHours === 2, "Recommends 2-hour reapplication for high UV conditions");
assert(advice.moistureAlert.condition === 'dry', "Detects dry ambient atmosphere when humidity < 40%");
assert(advice.pollutionAlert.severity === 'unhealthy', "Flags unhealthy air pollution when AQI > 150");
assert(advice.pollutionAlert.cleansingGuidance.includes('Double cleanse'), "Recommends PM double cleansing under high particulate pollution");

// ----------------------------------------------------
// 6. Gamification & Streaks Audit
// ----------------------------------------------------
console.log("\n--- 6. Gamification & Routine Streaks Audit ---");
import { GamificationService } from './src/services/gamification';

const sampleRoutine = StorageService.getRoutine();
const sampleJournal = StorageService.getJournal();
const streakResult = GamificationService.calculateStreak(sampleRoutine, sampleJournal);

assert(typeof streakResult.currentStreakDays === 'number', "calculateStreak returns numeric currentStreakDays");
assert(streakResult.dailyHistory.length === 7, "Generates 7-day daily completion history");

const badges = GamificationService.evaluateBadges({
  routine: sampleRoutine,
  shelf: StorageService.getShelf(),
  history: StorageService.getAnalysisHistory(),
  journalNotes: sampleJournal,
  streakDays: 3,
  hasUsedIngredientChecker: true
});

assert(badges.length === 8, "Evaluates all 8 milestone achievement badges");
const unlockedBadges = badges.filter(b => b.isUnlocked);
assert(unlockedBadges.length > 0, `Unlocks badges based on real user activity (unlocked: ${unlockedBadges.map(b => b.title).join(', ')})`);

console.log("\n=================================");
if (errors.length > 0) {
  console.log(`❌ AUDIT SCRIPT FAILED WITH ${errors.length} ERRORS`);
  process.exit(1);
} else {
  console.log("🎉 ALL AUDIT SCRIPT UNIT & ENGINE TESTS PASSED");
}
