import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  ShelfProduct,
  RoutineStep,
  SkinAnalysisRecord,
  JournalNote,
  YouCamApiConfig,
} from './types';
import { StorageService, DEFAULT_PROFILE } from './services/storage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { OnboardingModal } from './components/OnboardingModal';
import { DashboardView } from './views/DashboardView';
import { SkinAnalysisView } from './views/SkinAnalysisView';
import { FoundationFinderView } from './views/FoundationFinderView';
import { MakeupStudioView } from './views/MakeupStudioView';
import { SunscreenStoreView } from './views/SunscreenStoreView';
import { MyShelfView } from './views/MyShelfView';
import { RoutineBuilderView } from './views/RoutineBuilderView';
import { CompanionChatView } from './views/CompanionChatView';
import { ProgressJournalView } from './views/ProgressJournalView';
import { BudgetFavoritesView } from './views/BudgetFavoritesView';
import { SettingsPrivacyView } from './views/SettingsPrivacyView';
import { IngredientCheckerView } from './views/IngredientCheckerView';
import { WeatherIntelView } from './views/WeatherIntelView';
import { SunscreenGuideView } from './views/SunscreenGuideView';
import { SkinReportModal } from './components/SkinReportModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { SkinExperimentLabView } from './views/SkinExperimentLabView';
import { SkinTriggerDetectiveView } from './views/SkinTriggerDetectiveView';
import { PurchaseSimulatorView } from './views/PurchaseSimulatorView';
import { SkinExperiment, SavedPurchaseSimulation } from './types';
import { WeatherService } from './services/weather';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(() => StorageService.getProfile());
  const [shelf, setShelf] = useState<ShelfProduct[]>(() => StorageService.getShelf());
  const [routine, setRoutine] = useState<RoutineStep[]>(() => StorageService.getRoutine());
  const [analysisHistory, setAnalysisHistory] = useState<SkinAnalysisRecord[]>(() =>
    StorageService.getAnalysisHistory()
  );
  const [journalNotes, setJournalNotes] = useState<JournalNote[]>(() =>
    StorageService.getJournal()
  );
  const [favorites, setFavorites] = useState<string[]>(() => StorageService.getFavorites());
  const [youCamConfig, setYouCamConfig] = useState<YouCamApiConfig>(() =>
    StorageService.getYouCamConfig()
  );
  const [experiments, setExperiments] = useState<SkinExperiment[]>(() =>
    StorageService.getExperiments()
  );
  const [savedSimulations, setSavedSimulations] = useState<SavedPurchaseSimulation[]>(() =>
    StorageService.getSavedSimulations()
  );

  const [activeView, setActiveView] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(
    !profile.onboardingCompleted
  );
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // Check server YouCam status on mount
  useEffect(() => {
    fetch('/api/youcam/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.isConfigured) {
          setYouCamConfig((prev) => ({
            ...prev,
            isLiveConfigured: true,
            mode: 'live',
          }));
        }
      })
      .catch((err) => console.log('Notice: server youcam check:', err));
  }, []);

  // Handlers
  const handleToggleRoutineStep = (stepId: string) => {
    const updated = routine.map((step) =>
      step.id === stepId ? { ...step, completedToday: !step.completedToday } : step
    );
    setRoutine(updated);
    StorageService.saveRoutine(updated);
  };

  const handleSaveAnalysis = (record: SkinAnalysisRecord) => {
    StorageService.addAnalysisRecord(record);
    setAnalysisHistory((prev) => [record, ...prev]);
  };

  const handleDeleteAnalysis = (id: string) => {
    StorageService.deleteAnalysisRecord(id);
    setAnalysisHistory((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSaveRoutine = (newRoutine: RoutineStep[]) => {
    setRoutine(newRoutine);
    StorageService.saveRoutine(newRoutine);
  };

  const handleAddToShelf = (product: ShelfProduct) => {
    const updated = [product, ...shelf];
    setShelf(updated);
    StorageService.saveShelf(updated);
  };

  const handleUpdateShelf = (product: ShelfProduct) => {
    const updated = shelf.map((p) => (p.id === product.id ? product : p));
    setShelf(updated);
    StorageService.saveShelf(updated);
  };

  const handleDeleteShelf = (id: string) => {
    const updated = shelf.filter((p) => p.id !== id);
    setShelf(updated);
    StorageService.saveShelf(updated);
  };

  const handleToggleFavorite = (id: string) => {
    StorageService.toggleFavorite(id);
    setFavorites(StorageService.getFavorites());
  };

  const handleAddJournalNote = (note: JournalNote) => {
    StorageService.addJournalNote(note);
    setJournalNotes((prev) => [note, ...prev]);
  };

  const handleDeleteJournalNote = (id: string) => {
    StorageService.deleteJournalNote(id);
    setJournalNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleUpdateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    StorageService.saveProfile(newProfile);
  };

  const handleUpdateMonthlyBudget = (budget: number) => {
    const updated = { ...profile, monthlyBudget: budget };
    setProfile(updated);
    StorageService.saveProfile(updated);
  };

  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => StorageService.isDemoModeActive());
  const [isDemoAccount, setIsDemoAccount] = useState<boolean>(() => StorageService.isDemoAccount());

  const handleUpdateYouCamConfig = (config: YouCamApiConfig) => {
    setYouCamConfig(config);
    StorageService.saveYouCamConfig(config);
  };

  const handleLoadDemoAccount = () => {
    const demo = StorageService.loadDemoAccount();
    setProfile(demo.profile);
    setShelf(demo.shelf);
    setRoutine(demo.routine);
    setJournalNotes(demo.journal);
    setIsDemoAccount(true);
    setIsOnboardingOpen(false);
  };

  const handleResetToNewUser = () => {
    StorageService.resetToNewUser();
    setProfile(StorageService.getProfile());
    setShelf([]);
    setRoutine([]);
    setAnalysisHistory([]);
    setJournalNotes([]);
    setExperiments([]);
    setSavedSimulations([]);
    setIsDemoAccount(false);
    setIsOnboardingOpen(true);
  };

  const handleLoadSampleDemoData = () => {
    StorageService.loadSampleDemoData();
    setAnalysisHistory(StorageService.getAnalysisHistory());
    setJournalNotes(StorageService.getJournal());
    setIsDemoMode(true);
  };

  const handleClearSampleDemoData = () => {
    StorageService.clearSampleDemoData();
    setAnalysisHistory([]);
    setJournalNotes([]);
    setIsDemoMode(false);
  };

  const handleSaveExperiment = (exp: SkinExperiment) => {
    StorageService.saveExperiment(exp);
    setExperiments(StorageService.getExperiments());
  };

  const handleDeleteExperiment = (id: string) => {
    StorageService.deleteExperiment(id);
    setExperiments(StorageService.getExperiments());
  };

  const handleSaveSimulation = (sim: SavedPurchaseSimulation) => {
    StorageService.saveSimulation(sim);
    setSavedSimulations(StorageService.getSavedSimulations());
  };

  const handleDeleteSimulation = (id: string) => {
    StorageService.deleteSimulation(id);
    setSavedSimulations(StorageService.getSavedSimulations());
  };

  const handleWipeAllData = () => {
    StorageService.wipeAllData();
    setProfile(DEFAULT_PROFILE);
    setShelf([]);
    setRoutine([]);
    setAnalysisHistory([]);
    setJournalNotes([]);
    setFavorites([]);
    setExperiments([]);
    setSavedSimulations([]);
    setIsDemoMode(false);
    setActiveView('dashboard');
  };

  const routinePendingCount = routine.filter((s) => !s.completedToday).length;
  const latestAnalysis = analysisHistory[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900 selection:bg-rose-100 selection:text-rose-900">
      {/* 3-Zone Top Bar Header */}
      <Header
        activeView={activeView}
        onNavigate={setActiveView}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        hasAnalysis={Boolean(latestAnalysis)}
        onOpenReport={() => setIsReportModalOpen(true)}
        isDemoAccount={isDemoAccount}
        onLoadDemo={handleLoadDemoAccount}
        onResetUser={handleResetToNewUser}
      />

      {/* Main Layout Area: Sidebar + Active View */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          activeView={activeView}
          onNavigate={setActiveView}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          shelfCount={shelf.length}
          routinePendingCount={routinePendingCount}
          youCamStatus={youCamConfig.isLiveConfigured ? 'live' : 'test_simulation'}
          onOpenReport={() => setIsReportModalOpen(true)}
        />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 min-w-0">
          {activeView === 'dashboard' && (
            <DashboardView
              profile={profile}
              routine={routine}
              onToggleRoutineStep={handleToggleRoutineStep}
              latestAnalysis={latestAnalysis}
              shelf={shelf}
              favorites={[]}
              onNavigate={setActiveView}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
            />
          )}

          {activeView === 'analysis' && (
            <SkinAnalysisView
              profile={profile}
              youCamConfig={youCamConfig}
              onSaveAnalysis={handleSaveAnalysis}
              onNavigate={setActiveView}
            />
          )}

          {activeView === 'experiments' && (
            <SkinExperimentLabView
              profile={profile}
              shelf={shelf}
              routine={routine}
              experiments={experiments}
              onSaveExperiment={handleSaveExperiment}
              onDeleteExperiment={handleDeleteExperiment}
              onNavigate={setActiveView}
            />
          )}

          {activeView === 'triggers' && (
            <SkinTriggerDetectiveView
              diaryEntries={journalNotes as any}
              experiments={experiments}
              routineItems={routine as any}
              userProfile={profile}
              envData={WeatherService.getCachedData()}
              onNavigateToExperiments={() => setActiveView('experiments')}
              onNavigateToRoutine={() => setActiveView('routine')}
            />
          )}

          {activeView === 'simulator' && (
            <PurchaseSimulatorView
              userProfile={profile}
              shelfProducts={shelf}
              routineItems={routine as any}
              savedSimulations={savedSimulations}
              onSaveSimulation={handleSaveSimulation}
              onDeleteSimulation={handleDeleteSimulation}
              onNavigateToShelf={() => setActiveView('shelf')}
              onNavigateToRoutine={() => setActiveView('routine')}
            />
          )}

          {activeView === 'ingredients' && (
            <IngredientCheckerView
              profile={profile}
              shelf={shelf}
              onNavigate={setActiveView}
            />
          )}

          {activeView === 'weather' && (
            <WeatherIntelView
              profile={profile}
              shelf={shelf}
              onNavigate={setActiveView}
            />
          )}

          {activeView === 'sunscreen-guide' && (
            <SunscreenGuideView
              profile={profile}
              latestAnalysis={latestAnalysis}
              onNavigate={setActiveView}
            />
          )}

          {activeView === 'foundation' && (
            <FoundationFinderView
              profile={profile}
              latestAnalysis={latestAnalysis}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onNavigate={setActiveView}
            />
          )}

          {activeView === 'makeup' && (
            <MakeupStudioView
              profile={profile}
              favorites={favorites}
              youCamConfig={youCamConfig}
              onToggleFavorite={handleToggleFavorite}
              onNavigate={setActiveView}
            />
          )}

          {activeView === 'sunscreen' && (
            <SunscreenStoreView
              profile={profile}
              latestAnalysis={latestAnalysis}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onAddToShelf={handleAddToShelf}
              onNavigate={setActiveView}
            />
          )}

          {activeView === 'shelf' && (
            <MyShelfView
              shelf={shelf}
              onAddProduct={handleAddToShelf}
              onUpdateProduct={handleUpdateShelf}
              onDeleteProduct={handleDeleteShelf}
              onNavigate={setActiveView}
            />
          )}

          {activeView === 'routine' && (
            <RoutineBuilderView
              routine={routine}
              shelf={shelf}
              onToggleStep={handleToggleRoutineStep}
              onSaveRoutine={handleSaveRoutine}
              onNavigate={setActiveView}
            />
          )}

          {activeView === 'companion' && (
            <CompanionChatView
              profile={profile}
              routine={routine}
              shelf={shelf}
              latestAnalysis={latestAnalysis}
              onNavigate={setActiveView}
              onAddToShelf={handleAddToShelf}
              onToggleFavorite={handleToggleFavorite}
              onSaveRoutine={handleSaveRoutine}
            />
          )}

          {activeView === 'journal' && (
            <ProgressJournalView
              history={analysisHistory}
              journalNotes={journalNotes}
              onAddNote={handleAddJournalNote}
              onDeleteAnalysis={handleDeleteAnalysis}
              onDeleteNote={handleDeleteJournalNote}
              onNavigate={setActiveView}
              isDemoMode={isDemoMode}
              onLoadSampleData={handleLoadSampleDemoData}
              onClearSampleData={handleClearSampleDemoData}
            />
          )}

          {activeView === 'budget' && (
            <BudgetFavoritesView
              profile={profile}
              shelf={shelf}
              favoriteIds={favorites}
              onToggleFavorite={handleToggleFavorite}
              onUpdateMonthlyBudget={handleUpdateMonthlyBudget}
              onNavigate={setActiveView}
            />
          )}

          {activeView === 'settings' && (
            <SettingsPrivacyView
              profile={profile}
              youCamConfig={youCamConfig}
              onUpdateProfile={handleUpdateProfile}
              onUpdateYouCamConfig={handleUpdateYouCamConfig}
              onWipeAllData={handleWipeAllData}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
              isDemoAccount={isDemoAccount}
              onLoadDemoAccount={handleLoadDemoAccount}
              onResetToNewUser={handleResetToNewUser}
            />
          )}
        </main>
      </div>

      {/* Onboarding Questionnaire Modal */}
      <OnboardingModal
        initialProfile={profile}
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onSave={handleUpdateProfile}
        onLoadDemo={handleLoadDemoAccount}
      />

      {/* Professional Skin Dossier Report Modal */}
      <SkinReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        profile={profile}
        history={analysisHistory}
        routine={routine}
        shelf={shelf}
        journalNotes={journalNotes}
      />

      {/* Offline Status Badge Indicator */}
      <OfflineIndicator />
    </div>
  );
}
