import {
  UserProfile,
  ShelfProduct,
  RoutineStep,
  SkinAnalysisRecord,
  JournalNote,
  BudgetRecord,
  YouCamApiConfig,
  CandidateShade,
  SavedLook,
  SkinExperiment,
  SavedPurchaseSimulation,
} from '../types';

const STORAGE_KEYS = {
  PROFILE: 'skinloop_user_profile',
  SHELF: 'skinloop_user_shelf',
  ROUTINE: 'skinloop_user_routine',
  ANALYSIS_HISTORY: 'skinloop_analysis_history',
  JOURNAL: 'skinloop_journal_notes',
  BUDGET: 'skinloop_budget_records',
  FAVORITES: 'skinloop_favorite_ids',
  YOUCAM_CONFIG: 'skinloop_youcam_config',
  CANDIDATE_SHADES: 'skinloop_candidate_shades',
  SAVED_LOOKS: 'skinloop_saved_looks',
  EXPERIMENTS: 'skinloop_skin_experiments',
  SAVED_SIMULATIONS: 'skinloop_saved_purchase_simulations',
  SIMULATION_HISTORY: 'skinloop_simulation_history',
  IS_DEMO_ACCOUNT: 'skinloop_is_demo_account',
};

// Clean fresh profile for new users (onboarding starts automatically)
export const NEW_USER_PROFILE: UserProfile = {
  name: '',
  skinType: 'Combination',
  skinGoals: [],
  makeupStyles: [],
  budgetTier: 'mid',
  monthlyBudget: 3000, // INR (₹)
  sensitivities: [],
  preferredBrands: [],
  desiredCoverage: 'medium',
  desiredFinish: 'natural',
  undertone: 'Unsure',
  shadePreference: 'Unsure',
  fragrancePreference: 'no-preference',
  preferredOccasion: 'everyday',
  consentPhotoStorage: false,
  consentAiAnalysis: false,
  onboardingCompleted: false, // New users see onboarding!
};

export const DEFAULT_PROFILE: UserProfile = NEW_USER_PROFILE;

// Preconfigured sample demo profile for hackathon judges and evaluation
export const DEMO_SAMPLE_PROFILE: UserProfile = {
  name: 'Alex Rivera (Demo Account)',
  skinType: 'Combination',
  skinGoals: ['Hydration & Barrier', 'Sun Defense & Protection', 'Even Tone & Brightening'],
  makeupStyles: ['Clean Minimalist', 'Warm Everyday'],
  budgetTier: 'mid',
  monthlyBudget: 3500, // INR (₹)
  sensitivities: ['Fragrance'],
  preferredBrands: ['Kay Beauty', 'Minimalist', 'Plum', 'Maybelline', 'DermaLoop Lab'],
  desiredCoverage: 'medium',
  desiredFinish: 'natural',
  undertone: 'Warm',
  shadePreference: 'Medium',
  fragrancePreference: 'fragrance-free',
  preferredOccasion: 'everyday',
  consentPhotoStorage: true,
  consentAiAnalysis: true,
  onboardingCompleted: true,
};

export const INITIAL_SHELF: ShelfProduct[] = [
  {
    id: 'shelf-1',
    name: 'Gentle Amino Acid Cloud Cleanser',
    brand: 'DermaLoop Lab',
    category: 'cleanser',
    openedDate: '2026-09-15',
    expiryDate: '2027-09-15',
    verifiedIngredients: ['Sodium Cocoyl Glycinate', 'Glycerin', 'Panthenol (Pro-Vitamin B5)', 'Oat Kernel Extract'],
    purchasePrice: 499,
    remainingPercent: 65,
    notes: 'Non-stripping morning and night staple.',
  },
  {
    id: 'shelf-2',
    name: 'Multi-Molecular Hyaluronic B5 Booster',
    brand: 'DermaLoop Lab',
    category: 'serum',
    openedDate: '2026-10-01',
    expiryDate: '2027-10-01',
    verifiedIngredients: ['High, Mid & Low Molecular HA', 'Panthenol', 'Sodium PCA'],
    purchasePrice: 699,
    remainingPercent: 80,
    notes: 'Apply on damp skin for plumping.',
  },
  {
    id: 'shelf-3',
    name: 'Ceramide Barrier Cushion Cream',
    brand: 'Botanique Pure',
    category: 'moisturizer',
    openedDate: '2026-08-20',
    expiryDate: '2027-08-20',
    verifiedIngredients: ['Ceramide NP', 'Ceramide AP', 'Cholesterol', 'Fatty Acids (3:1:1 ratio)'],
    purchasePrice: 799,
    remainingPercent: 40,
    notes: 'Rich restorative moisturizer for evening or dry days.',
  },
];

export const INITIAL_ROUTINE: RoutineStep[] = [
  // Morning Routine
  {
    id: 'rt-am-1',
    routineType: 'morning',
    stepOrder: 1,
    stepName: 'Gentle Cleanser',
    purpose: 'Remove overnight perspiration and sebum while preserving lipid barrier.',
    shelfProductId: 'shelf-1',
    completedToday: true,
    reminderTime: '07:30',
  },
  {
    id: 'rt-am-2',
    routineType: 'morning',
    stepOrder: 2,
    stepName: 'Hydrating Serum (Hyaluronic B5)',
    purpose: 'Infuse deep humectant moisture to plump fine lines and prep skin for daytime.',
    shelfProductId: 'shelf-2',
    completedToday: true,
    reminderTime: '07:35',
  },
  {
    id: 'rt-am-3',
    routineType: 'morning',
    stepOrder: 3,
    stepName: 'Lightweight Moisturizer',
    purpose: 'Lock in humectants without heavy occlusives before sun protection.',
    shelfProductId: 'shelf-3',
    completedToday: false,
    reminderTime: '07:38',
  },
  {
    id: 'rt-am-4',
    routineType: 'morning',
    stepOrder: 4,
    stepName: 'Broad-Spectrum SPF 50+',
    purpose: 'Critical defense against UV photoaging, hyperpigmentation, and environmental oxidative stress.',
    catalogueProductId: 'prod-spf-1',
    completedToday: false,
    reminderTime: '07:42',
  },

  // Evening Routine
  {
    id: 'rt-pm-1',
    routineType: 'evening',
    stepOrder: 1,
    stepName: 'Double Cleanse (Micellar / Cleanser)',
    purpose: 'Thoroughly dissolve stubborn SPF, environmental particulate matter, and makeup.',
    shelfProductId: 'shelf-1',
    completedToday: false,
    reminderTime: '21:30',
  },
  {
    id: 'rt-pm-2',
    routineType: 'evening',
    stepOrder: 2,
    stepName: 'Soothing Barrier Serum',
    purpose: 'Accelerate skin cell regeneration and replenish moisture depleted during the day.',
    shelfProductId: 'shelf-2',
    completedToday: false,
    reminderTime: '21:35',
  },
  {
    id: 'rt-pm-3',
    routineType: 'evening',
    stepOrder: 3,
    stepName: 'Ceramide Night Cushion Cream',
    purpose: 'Form a nourishing seal that prevents overnight transepidermal water loss.',
    shelfProductId: 'shelf-3',
    completedToday: false,
    reminderTime: '21:40',
  },
];

// Default analysis history is empty for real user accounts
export const INITIAL_ANALYSIS_HISTORY: SkinAnalysisRecord[] = [];

// Curated sample scans available strictly for demonstration and evaluation preview
export const SAMPLE_DEMO_SCANS: SkinAnalysisRecord[] = [
  {
    id: 'analysis-sample-1',
    timestamp: '2026-10-15T09:12:00.000Z',
    source: 'simulation_test',
    metrics: {
      hydration: 68,
      textureSmoothness: 72,
      rednessScore: 80,
      spotsClarity: 76,
      oilBalance: 58,
      radiance: 74,
      firmness: 82,
    },
    skinTone: {
      hex: '#E4BF9F',
      pantoneApprox: 'Warm Peach 3Y04',
      undertone: 'Warm',
      fitzpatrickType: 'Type III',
      shadeFamily: 'Medium',
      confidenceNote: 'Consistent ambient warm daylight balance.',
    },
    nonMedicalSummary: 'Sample demo record: Skin shows strong barrier resilience with balanced oil levels. Slight dryness noted across the cheek area.',
    observations: [
      'Cheek zone shows moderate dehydration tendency in dry indoor air.',
      'T-zone oil levels are in a healthy, balanced range.',
      'Calm undertone with minimal visible redness.',
    ],
    suggestedFocusAreas: ['Enhance daytime humectant hydration', 'Maintain daily SPF 50+ discipline'],
  },
  {
    id: 'analysis-sample-2',
    timestamp: '2026-10-24T08:30:00.000Z',
    source: 'simulation_test',
    metrics: {
      hydration: 76,
      textureSmoothness: 78,
      rednessScore: 84,
      spotsClarity: 81,
      oilBalance: 52,
      radiance: 83,
      firmness: 85,
    },
    skinTone: {
      hex: '#E4BF9F',
      pantoneApprox: 'Warm Peach 3Y04',
      undertone: 'Warm',
      fitzpatrickType: 'Type III',
      shadeFamily: 'Medium',
      confidenceNote: 'Captured in calibrated neutral lighting.',
    },
    nonMedicalSummary: 'Sample demo record: Hydration and skin radiance have increased following consistent hyaluronic booster and barrier cream use.',
    observations: [
      'Hydration metric improved by +8 points following consistent AM/PM serum application.',
      'Surface texture feels noticeably smoother around forehead and cheeks.',
      'Skin tone clarity remains uniform and calm.',
    ],
    suggestedFocusAreas: ['Continue gentle daily barrier protection', 'Explore tinted antioxidant SPF for day wear'],
  },
];

// Default journal is empty for real user accounts
export const INITIAL_JOURNAL: JournalNote[] = [];

// Curated sample journal entries for demonstration preview
export const SAMPLE_DEMO_JOURNAL: JournalNote[] = [
  {
    id: 'jn-sample-1',
    date: '2026-10-25',
    analysisId: 'analysis-sample-2',
    routineCompletedPct: 100,
    skinFeeling: 'Balanced & Comfortable',
    notes: 'Sample demo observation: Skin felt very hydrated throughout the afternoon. The lightweight moisturizer did not feel greasy under SPF.',
  },
  {
    id: 'jn-sample-2',
    date: '2026-10-26',
    routineCompletedPct: 85,
    skinFeeling: 'Balanced & Comfortable',
    notes: 'Sample demo observation: Applied the velvet satin lip shade for office meeting. Lasted through lunch without cracking.',
  },
];

export const INITIAL_YOUCAM_CONFIG: YouCamApiConfig = {
  endpoint: 'https://yce-api-01.makeupar.com',
  isLiveConfigured: false,
  mode: 'test_simulation',
  testStatus: 'unconfigured',
};

// Storage helper functions
export const StorageService = {
  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Error saving profile to localStorage', e);
    }
  },

  getShelf(): ShelfProduct[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SHELF);
      return data ? JSON.parse(data) : []; // Empty by default for new users
    } catch {
      return [];
    }
  },

  saveShelf(shelf: ShelfProduct[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SHELF, JSON.stringify(shelf));
    } catch (e) {
      console.error('Error saving shelf', e);
    }
  },

  addToShelf(item: ShelfProduct): void {
    const list = this.getShelf();
    const updated = [item, ...list.filter((s) => s.id !== item.id)];
    this.saveShelf(updated);
  },

  removeFromShelf(id: string): void {
    const list = this.getShelf().filter((s) => s.id !== id);
    this.saveShelf(list);
  },

  getRoutine(): RoutineStep[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ROUTINE);
      return data ? JSON.parse(data) : []; // Empty by default for new users
    } catch {
      return [];
    }
  },

  saveRoutine(routine: RoutineStep[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ROUTINE, JSON.stringify(routine));
    } catch (e) {
      console.error('Error saving routine', e);
    }
  },

  // Returns ONLY genuine YouCam live records for authentic skin progress tracking
  getAnalysisHistory(): SkinAnalysisRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ANALYSIS_HISTORY);
      const list: SkinAnalysisRecord[] = data ? JSON.parse(data) : [];
      return list.filter((r) => r.source === 'youcam_live');
    } catch {
      return [];
    }
  },

  // Returns simulation records stored in a dedicated sandbox partition
  getSimulationHistory(): SkinAnalysisRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SIMULATION_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addAnalysisRecord(record: SkinAnalysisRecord): void {
    if (record.source === 'simulation_test') {
      const simList = this.getSimulationHistory();
      const updated = [record, ...simList];
      try {
        localStorage.setItem(STORAGE_KEYS.SIMULATION_HISTORY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error adding simulation record', e);
      }
      return;
    }

    const list = this.getAnalysisHistory();
    const updated = [record, ...list];
    try {
      localStorage.setItem(STORAGE_KEYS.ANALYSIS_HISTORY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error adding analysis record', e);
    }
  },

  deleteAnalysisRecord(id: string): void {
    const list = this.getAnalysisHistory().filter((r) => r.id !== id);
    const simList = this.getSimulationHistory().filter((r) => r.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.ANALYSIS_HISTORY, JSON.stringify(list));
      localStorage.setItem(STORAGE_KEYS.SIMULATION_HISTORY, JSON.stringify(simList));
    } catch (e) {
      console.error('Error deleting analysis record', e);
    }
  },

  isDemoAccount(): boolean {
    try {
      return (
        localStorage.getItem(STORAGE_KEYS.IS_DEMO_ACCOUNT) === 'true' ||
        localStorage.getItem(STORAGE_KEYS.PROFILE)?.includes('Demo Account') === true
      );
    } catch {
      return false;
    }
  },

  loadDemoAccount(): {
    profile: UserProfile;
    shelf: ShelfProduct[];
    routine: RoutineStep[];
    history: SkinAnalysisRecord[];
    journal: JournalNote[];
  } {
    this.saveProfile(DEMO_SAMPLE_PROFILE);
    this.saveShelf(INITIAL_SHELF);
    this.saveRoutine(INITIAL_ROUTINE);
    try {
      localStorage.setItem(
        STORAGE_KEYS.SIMULATION_HISTORY,
        JSON.stringify(SAMPLE_DEMO_SCANS)
      );
      localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(SAMPLE_DEMO_JOURNAL));
      localStorage.setItem(STORAGE_KEYS.IS_DEMO_ACCOUNT, 'true');
    } catch (e) {
      console.error('Error setting demo account flag:', e);
    }
    return {
      profile: DEMO_SAMPLE_PROFILE,
      shelf: INITIAL_SHELF,
      routine: INITIAL_ROUTINE,
      history: [],
      journal: SAMPLE_DEMO_JOURNAL,
    };
  },

  resetToNewUser(): void {
    this.wipeAllData();
    this.saveProfile(NEW_USER_PROFILE);
    this.saveShelf([]);
    this.saveRoutine([]);
  },

  getJournal(): JournalNote[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.JOURNAL);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addJournalNote(note: JournalNote): void {
    const list = this.getJournal();
    const updated = [note, ...list];
    try {
      localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving journal', e);
    }
  },

  deleteJournalNote(id: string): void {
    const list = this.getJournal().filter((n) => n.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(list));
    } catch (e) {
      console.error('Error deleting journal note', e);
    }
  },

  getFavorites(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : ['prod-spf-1', 'prod-fnd-1', 'prod-lip-1'];
    } catch {
      return ['prod-spf-1', 'prod-fnd-1', 'prod-lip-1'];
    }
  },

  toggleFavorite(productId: string): boolean {
    const favs = this.getFavorites();
    let isFav: boolean;
    let next: string[];
    if (favs.includes(productId)) {
      next = favs.filter((id) => id !== productId);
      isFav = false;
    } else {
      next = [...favs, productId];
      isFav = true;
    }
    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(next));
    } catch (e) {
      console.error('Error updating favorites', e);
    }
    return isFav;
  },

  getYouCamConfig(): YouCamApiConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.YOUCAM_CONFIG);
      return data ? JSON.parse(data) : INITIAL_YOUCAM_CONFIG;
    } catch {
      return INITIAL_YOUCAM_CONFIG;
    }
  },

  saveYouCamConfig(config: YouCamApiConfig): void {
    try {
      // Strictly sanitize: ensure no secret keys could ever be written to client localStorage
      const safeConfig: YouCamApiConfig = {
        endpoint: config.endpoint || 'https://yce-api-01.makeupar.com',
        isLiveConfigured: Boolean(config.isLiveConfigured),
        mode: config.mode || 'test_simulation',
        keySource: config.isLiveConfigured ? 'YOUCAM_API_KEY' : 'none',
        testStatus: config.testStatus,
        statusDetails: config.statusDetails,
        endpoints: config.endpoints,
      };
      localStorage.setItem(STORAGE_KEYS.YOUCAM_CONFIG, JSON.stringify(safeConfig));
    } catch (e) {
      console.error('Error saving YouCam config', e);
    }
  },

  loadSampleDemoData(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ANALYSIS_HISTORY, JSON.stringify(SAMPLE_DEMO_SCANS));
      localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(SAMPLE_DEMO_JOURNAL));
      localStorage.setItem('skinloop_is_demo_mode', 'true');
    } catch (e) {
      console.error('Error loading sample demo data', e);
    }
  },

  clearSampleDemoData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.ANALYSIS_HISTORY);
      localStorage.removeItem(STORAGE_KEYS.JOURNAL);
      localStorage.removeItem('skinloop_is_demo_mode');
    } catch (e) {
      console.error('Error clearing sample demo data', e);
    }
  },

  isDemoModeActive(): boolean {
    try {
      return localStorage.getItem('skinloop_is_demo_mode') === 'true';
    } catch {
      return false;
    }
  },

  getCandidateShades(): CandidateShade[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CANDIDATE_SHADES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addCandidateShade(shade: CandidateShade): void {
    const list = this.getCandidateShades();
    const updated = [shade, ...list.filter((s) => s.id !== shade.id)];
    try {
      localStorage.setItem(STORAGE_KEYS.CANDIDATE_SHADES, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving candidate shade', e);
    }
  },

  deleteCandidateShade(id: string): void {
    const list = this.getCandidateShades().filter((s) => s.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.CANDIDATE_SHADES, JSON.stringify(list));
    } catch (e) {
      console.error('Error deleting candidate shade', e);
    }
  },

  getSavedLooks(): SavedLook[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVED_LOOKS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveLook(look: SavedLook): void {
    const list = this.getSavedLooks();
    const updated = [look, ...list.filter((l) => l.id !== look.id)];
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_LOOKS, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving look', e);
    }
  },

  deleteSavedLook(id: string): void {
    const list = this.getSavedLooks().filter((l) => l.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_LOOKS, JSON.stringify(list));
    } catch (e) {
      console.error('Error deleting saved look', e);
    }
  },

  getExperiments(): SkinExperiment[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXPERIMENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveExperiment(experiment: SkinExperiment): void {
    const list = this.getExperiments();
    const updated = [experiment, ...list.filter((e) => e.id !== experiment.id)];
    try {
      localStorage.setItem(STORAGE_KEYS.EXPERIMENTS, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving experiment', e);
    }
  },

  deleteExperiment(id: string): void {
    const list = this.getExperiments().filter((e) => e.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.EXPERIMENTS, JSON.stringify(list));
    } catch (e) {
      console.error('Error deleting experiment', e);
    }
  },

  getSavedSimulations(): SavedPurchaseSimulation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVED_SIMULATIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveSimulation(simulation: SavedPurchaseSimulation): void {
    const list = this.getSavedSimulations();
    const updated = [simulation, ...list.filter((s) => s.id !== simulation.id)];
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_SIMULATIONS, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving simulation', e);
    }
  },

  deleteSimulation(id: string): void {
    const list = this.getSavedSimulations().filter((s) => s.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_SIMULATIONS, JSON.stringify(list));
    } catch (e) {
      console.error('Error deleting simulation', e);
    }
  },

  wipeAllData(): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  },
};
