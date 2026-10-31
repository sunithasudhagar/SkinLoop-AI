import { CompanionTools } from './src/services/companionTools';
import { SAMPLE_CATALOGUE } from './src/data/catalogue';
import { UserProfile, ShelfProduct, RoutineStep } from './src/types';

function runTests() {
  console.log('--- STARTING COMPANION ENGINE AUDIT TESTS ---');
  let passCount = 0;
  let failCount = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passCount++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failCount++;
    }
  }

  // 1. Search catalogue tool
  const sunscreens = CompanionTools.searchCatalogue({ category: 'sunscreen' });
  assert(sunscreens.length > 0, 'searchCatalogue finds sunscreen products');
  assert(sunscreens.every((p) => p.category === 'sunscreen'), 'All results match sunscreen category');

  const budgetFoundations = CompanionTools.searchCatalogue({ category: 'foundation', maxBudgetInr: 1000 });
  assert(
    budgetFoundations.every((p) => p.price <= 1000),
    'searchCatalogue strictly enforces maxBudgetInr'
  );

  const fragranceFreeItems = CompanionTools.searchCatalogue({ fragranceFree: true });
  assert(
    fragranceFreeItems.every((p) => p.fragranceFree === true),
    'searchCatalogue correctly filters fragrance-free products'
  );

  // 2. Product comparison tool
  const comp = CompanionTools.compareProducts(['prod-spf-1', 'prod-spf-2']);
  assert(comp !== null, 'compareProducts returns comparison for valid pair');
  assert(
    comp!.priceDifferenceInr === Math.abs(comp!.products[0].price - comp!.products[1].price),
    'compareProducts accurately calculates priceDifferenceInr'
  );
  assert(Array.isArray(comp!.sharedIngredients), 'compareProducts returns shared ingredients');

  // 3. Shelf duplicate check tool
  const mockShelf: ShelfProduct[] = [
    {
      id: 'shelf-cleanser',
      name: 'Hydrating Cleanser',
      brand: 'DermaLoop',
      category: 'cleanser',
      remainingPercent: 75,
      verifiedIngredients: ['Glycerin'],
    },
  ];

  const dupCheck1 = CompanionTools.checkShelfDuplicates('cleanser', 'New Foaming Wash', mockShelf);
  assert(dupCheck1.hasDuplicate === true, 'Duplicate check identifies owned active cleanser');
  assert(dupCheck1.recommendation === 'skip_purchase', 'Duplicate check advises skip_purchase when >20% remains');

  const dupCheck2 = CompanionTools.checkShelfDuplicates('foundation', 'Soft Glow Foundation', mockShelf);
  assert(dupCheck2.hasDuplicate === false, 'Duplicate check returns false when no matching category on shelf');
  assert(dupCheck2.recommendation === 'safe_to_add', 'Duplicate check recommends safe_to_add for missing category');

  // 4. Kit Total calculation
  const kitTotal = CompanionTools.calculateKitTotal(['prod-spf-1', 'prod-lip-1']);
  const expectedTotal =
    (SAMPLE_CATALOGUE.find((p) => p.id === 'prod-spf-1')?.price || 0) +
    (SAMPLE_CATALOGUE.find((p) => p.id === 'prod-lip-1')?.price || 0);
  assert(kitTotal.totalPriceInr === expectedTotal, 'calculateKitTotal accurately calculates sum in INR');

  // 5. Suggest budget look tool
  const officeLook = CompanionTools.suggestBudgetLook('office', 2500, mockShelf);
  assert(officeLook.products.length > 0, 'suggestBudgetLook returns products for office preset');
  assert(typeof officeLook.netNewSpend === 'number', 'suggestBudgetLook calculates netNewSpend');
  assert(typeof officeLook.totalKitPrice === 'number', 'suggestBudgetLook calculates totalKitPrice in INR');

  // 6. Deterministic Response Generation
  const mockProfile: UserProfile = {
    name: 'Priya Sharma',
    skinType: 'Combination',
    skinGoals: ['Hydration & Barrier', 'Sun Defense & Protection'],
    makeupStyles: ['Clean Minimalist'],
    budgetTier: 'mid',
    monthlyBudget: 3500,
    sensitivities: ['Fragrance'],
    preferredBrands: ['Kay Beauty'],
    desiredCoverage: 'medium',
    desiredFinish: 'natural',
    undertone: 'Warm',
    shadePreference: 'Medium',
    fragrancePreference: 'fragrance-free',
    preferredOccasion: 'office',
    consentPhotoStorage: true,
    consentAiAnalysis: true,
    onboardingCompleted: true,
  };

  const mockRoutine: RoutineStep[] = [
    {
      id: 'rt-1',
      routineType: 'morning',
      stepOrder: 1,
      stepName: 'Gentle Cleanser',
      purpose: 'Cleanse',
      completedToday: true,
    },
  ];

  // Test 6a: Routine Inquiry
  const routineResp = CompanionTools.generateDeterministicResponse('What order should I apply my morning skincare routine?', {
    profile: mockProfile,
    shelf: mockShelf,
    routine: mockRoutine,
  });
  assert(routineResp.mode === 'deterministic', 'Routine response declares deterministic mode');
  assert(routineResp.text.includes('Broad-Spectrum SPF'), 'Routine response emphasizes daytime broad-spectrum SPF');
  assert(routineResp.proposals.length > 0, 'Routine response generates actionable state proposal (SPF addition)');
  assert(routineResp.proposals[0].status === 'pending', 'Proposal status is initially pending');

  // Test 6b: Foundation Inquiry
  const fndResp = CompanionTools.generateDeterministicResponse('Which foundation matches my undertone?', {
    profile: mockProfile,
    shelf: mockShelf,
    routine: mockRoutine,
  });
  assert(fndResp.text.includes('Warm'), 'Foundation response references Warm undertone');
  assert(
    fndResp.text.includes('dictate foundation shades') &&
    fndResp.text.toLowerCase().includes('skin health'),
    'Foundation response cautions that skin health scores != shade match'
  );
  assert(
    fndResp.proposals.some((p) => p.type === 'save_shade_candidate'),
    'Foundation response includes save_shade_candidate proposal'
  );

  // Test 6c: Sunscreen Inquiry
  const spfResp = CompanionTools.generateDeterministicResponse('Recommend a good daily sunscreen', {
    profile: mockProfile,
    shelf: mockShelf,
    routine: mockRoutine,
  });
  assert(
    spfResp.text.includes('Sunscreen protection is never determined by skin tone'),
    'Sunscreen response guarantees SPF is never conditioned on skin tone'
  );
  assert(spfResp.recommendedProducts.length > 0, 'Sunscreen response returns catalogue-backed products');
  assert(
    spfResp.recommendedProducts.every((p) => p.category === 'sunscreen'),
    'All returned products are sunscreens'
  );

  // Test 6d: Office Look Budget Inquiry
  const lookResp = CompanionTools.generateDeterministicResponse('Suggest a budget look for office', {
    profile: mockProfile,
    shelf: mockShelf,
    routine: mockRoutine,
  });
  assert(lookResp.text.includes('OFFICE'), 'Look response identifies office occasion');
  assert(
    lookResp.proposals.some((p) => p.type === 'save_look'),
    'Look response proposes saving look to Makeup Studio'
  );

  // Test 6e: Shelf Inventory Audit
  const shelfResp = CompanionTools.generateDeterministicResponse('Check my shelf inventory and duplicates', {
    profile: mockProfile,
    shelf: mockShelf,
    routine: mockRoutine,
  });
  assert(shelfResp.text.includes('Hydrating Cleanser'), 'Shelf audit lists owned shelf item');

  // Test 7: Verify All 5 User Persona Inquiries from User Prompt
  console.log('\n--- 7. Verification of 5 Key User Persona Concierge Queries ---');

  // Query 1: Can I use vitamin C with my current routine?
  const q1Resp = CompanionTools.generateDeterministicResponse('Can I use vitamin C with my current routine?', {
    profile: mockProfile,
    shelf: mockShelf,
    routine: mockRoutine,
  });
  assert(q1Resp.text.includes('L-Ascorbic Acid') && q1Resp.text.includes('Morning routine'), 'Q1: Answers Vitamin C integration and timing');

  // Query 2: Why might my skin feel dry after changing products?
  const q2Resp = CompanionTools.generateDeterministicResponse('Why might my skin feel dry after changing products?', {
    profile: mockProfile,
    shelf: mockShelf,
    routine: mockRoutine,
  });
  assert(q2Resp.text.includes('Transepidermal Water Loss') && q2Resp.text.includes('Ceramide'), 'Q2: Explains physiological dry skin causes (TEWL & lipids)');

  // Query 3: Which products should I use in the morning?
  const q3Resp = CompanionTools.generateDeterministicResponse('Which products should I use in the morning?', {
    profile: mockProfile,
    shelf: mockShelf,
    routine: mockRoutine,
  });
  assert(q3Resp.text.includes('Morning Product Application Sequence') && q3Resp.text.includes('SPF 50+'), 'Q3: Outlines structured morning sequence ending in SPF');

  // Query 4: Am I using conflicting ingredients?
  const q4Resp = CompanionTools.generateDeterministicResponse('Am I using conflicting ingredients?', {
    profile: mockProfile,
    shelf: mockShelf,
    routine: mockRoutine,
  });
  assert(q4Resp.text.includes('Retinol + AHA/BHA') && q4Resp.text.includes('Harmonious Synergy'), 'Q4: Evaluates chemical ingredient conflicts & harmonies');

  // Query 5: Can I avoid buying anything new and use products I already own?
  const q5Resp = CompanionTools.generateDeterministicResponse('Can I avoid buying anything new and use products I already own?', {
    profile: mockProfile,
    shelf: mockShelf,
    routine: mockRoutine,
  });
  assert(q5Resp.text.includes('Zero-Waste Skincare') && q5Resp.text.includes('My Shelf'), 'Q5: Prioritizes existing shelf inventory over new purchases');

  console.log(`\nAUDIT COMPLETE: ${passCount} passed, ${failCount} failed.`);
  if (failCount > 0) {
    process.exit(1);
  }
}

runTests();
