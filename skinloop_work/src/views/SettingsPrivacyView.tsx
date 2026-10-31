import React, { useState } from 'react';
import { UserProfile, YouCamApiConfig } from '../types';
import {
  Shield,
  Trash2,
  Check,
  AlertTriangle,
  Download,
  Sparkles,
  User,
} from 'lucide-react';

interface SettingsPrivacyViewProps {
  profile: UserProfile;
  youCamConfig?: YouCamApiConfig;
  onUpdateProfile: (profile: UserProfile) => void;
  onUpdateYouCamConfig?: (config: YouCamApiConfig) => void;
  onWipeAllData: () => void;
  onOpenOnboarding: () => void;
  isDemoAccount?: boolean;
  onLoadDemoAccount?: () => void;
  onResetToNewUser?: () => void;
}

export const SettingsPrivacyView: React.FC<SettingsPrivacyViewProps> = ({
  profile,
  onUpdateProfile,
  onWipeAllData,
  onOpenOnboarding,
  isDemoAccount,
  onLoadDemoAccount,
  onResetToNewUser,
}) => {
  const [profileState, setProfileState] = useState<UserProfile>(profile);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Destructive wipe confirmation modal
  const [isWipeConfirmOpen, setIsWipeConfirmOpen] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profileState);
    setSaveStatus('Profile preferences saved successfully.');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleExportBackup = () => {
    try {
      const keys = [
        'skinloop_user_profile',
        'skinloop_user_shelf',
        'skinloop_user_routine',
        'skinloop_analysis_history',
        'skinloop_journal_notes',
        'skinloop_budget_records',
        'skinloop_candidate_shades',
        'skinloop_saved_looks',
      ];
      const backup: Record<string, any> = {};
      keys.forEach((k) => {
        const item = localStorage.getItem(k);
        if (item) {
          try {
            backup[k] = JSON.parse(item);
          } catch {
            backup[k] = item;
          }
        }
      });
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `skinloop_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setSaveStatus('Full data archive exported successfully as JSON.');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (e: any) {
      console.error('Backup error:', e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Title */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full">
          <Shield className="w-3.5 h-3.5 text-rose-700" />
          <span>User Control & Privacy</span>
          <span>·</span>
          <span>On-Device Security</span>
        </div>
        <h1 className="text-2xl font-serif font-bold text-stone-900">
          Settings & Privacy
        </h1>
        <p className="text-stone-600 text-sm max-w-xl leading-relaxed">
          Manage your skin preferences, personalized recommendations, offline data backups, and privacy consent.
        </p>
      </div>

      {saveStatus && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-700" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* 1. User Profile & Preferences Section */}
      <section className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 space-y-5 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="space-y-0.5">
            <h2 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
              <User className="w-4 h-4 text-rose-800" />
              Personal Skin & Style Preferences
            </h2>
            <p className="text-xs text-stone-500">
              Calibrate recommendations in the store, foundation finder, and routine builder.
            </p>
          </div>
          <button
            onClick={onOpenOnboarding}
            className="text-xs font-semibold text-rose-800 hover:text-rose-950 flex items-center gap-1 hover:underline"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Retake Survey</span>
          </button>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-600 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                value={profileState.name}
                onChange={(e) => setProfileState({ ...profileState, name: e.target.value })}
                className="w-full p-2.5 border border-stone-200 rounded-lg bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>
            <div>
              <label className="block text-stone-600 font-semibold mb-1">Skin Type</label>
              <select
                value={profileState.skinType}
                onChange={(e) =>
                  setProfileState({ ...profileState, skinType: e.target.value as any })
                }
                className="w-full p-2.5 border border-stone-200 rounded-lg bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
              >
                <option value="Normal">Normal</option>
                <option value="Dry">Dry</option>
                <option value="Oily">Oily</option>
                <option value="Combination">Combination</option>
                <option value="Sensitive">Sensitive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-stone-600 font-semibold mb-1">
                Monthly Budget (₹ INR)
              </label>
              <input
                type="number"
                min="500"
                max="25000"
                step="250"
                value={profileState.monthlyBudget}
                onChange={(e) =>
                  setProfileState({
                    ...profileState,
                    monthlyBudget: parseInt(e.target.value, 10) || 3500,
                  })
                }
                className="w-full p-2.5 border border-stone-200 rounded-lg bg-white text-stone-900 font-mono focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>
            <div>
              <label className="block text-stone-600 font-semibold mb-1">
                Foundation Undertone
              </label>
              <select
                value={profileState.undertone || 'Warm'}
                onChange={(e) =>
                  setProfileState({
                    ...profileState,
                    undertone: e.target.value as any,
                  })
                }
                className="w-full p-2.5 border border-stone-200 rounded-lg bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
              >
                <option value="Warm">Warm (Golden / Peachy)</option>
                <option value="Cool">Cool (Rosy / Pinkish)</option>
                <option value="Neutral">Neutral (Balanced)</option>
                <option value="Olive">Olive (Greenish / Earthy)</option>
                <option value="Unsure">Unsure / Need Guidance</option>
              </select>
            </div>
            <div>
              <label className="block text-stone-600 font-semibold mb-1">Finish Preference</label>
              <select
                value={profileState.desiredFinish}
                onChange={(e) =>
                  setProfileState({
                    ...profileState,
                    desiredFinish: e.target.value as any,
                  })
                }
                className="w-full p-2.5 border border-stone-200 rounded-lg bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
              >
                <option value="natural">Natural Satin</option>
                <option value="dewy">Dewy Glow</option>
                <option value="matte">Soft Matte</option>
                <option value="satin">Velvet Satin</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-stone-600 font-semibold mb-1">
                Coverage Preference
              </label>
              <select
                value={profileState.desiredCoverage}
                onChange={(e) =>
                  setProfileState({
                    ...profileState,
                    desiredCoverage: e.target.value as any,
                  })
                }
                className="w-full p-2.5 border border-stone-200 rounded-lg bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
              >
                <option value="sheer">Sheer / Skin Tint</option>
                <option value="medium">Medium Flexible</option>
                <option value="full">Full Coverage</option>
              </select>
            </div>
            <div>
              <label className="block text-stone-600 font-semibold mb-1">
                Fragrance Preference
              </label>
              <select
                value={profileState.fragrancePreference || 'fragrance-free'}
                onChange={(e) =>
                  setProfileState({
                    ...profileState,
                    fragrancePreference: e.target.value as any,
                  })
                }
                className="w-full p-2.5 border border-stone-200 rounded-lg bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
              >
                <option value="fragrance-free">Fragrance-Free Only</option>
                <option value="subtle">Subtle Fragrance OK</option>
                <option value="no-preference">No Preference</option>
              </select>
            </div>
            <div>
              <label className="block text-stone-600 font-semibold mb-1">
                Preferred Occasion
              </label>
              <select
                value={profileState.preferredOccasion || 'everyday'}
                onChange={(e) =>
                  setProfileState({
                    ...profileState,
                    preferredOccasion: e.target.value as any,
                  })
                }
                className="w-full p-2.5 border border-stone-200 rounded-lg bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
              >
                <option value="everyday">Everyday Casual</option>
                <option value="college">College / Campus</option>
                <option value="office">Workplace / Office</option>
                <option value="party">Evening / Party</option>
                <option value="wedding">Festive / Wedding</option>
              </select>
            </div>
          </div>

          {/* Privacy Toggles */}
          <div className="pt-2 border-t border-stone-100 space-y-2">
            <span className="font-semibold text-stone-800 block">Privacy & Photo Storage</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={profileState.consentAiAnalysis}
                onChange={(e) =>
                  setProfileState({ ...profileState, consentAiAnalysis: e.target.checked })
                }
                className="rounded text-stone-900"
              />
              <span className="text-stone-700">Allow AI facial skin analysis processing</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={profileState.consentPhotoStorage}
                onChange={(e) =>
                  setProfileState({ ...profileState, consentPhotoStorage: e.target.checked })
                }
                className="rounded text-stone-900"
              />
              <span className="text-stone-700">Keep face reference photos locally on this device for progress tracking</span>
            </label>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors shadow-xs"
            >
              Update Preferences
            </button>
          </div>
        </form>
      </section>

      {/* 2. Data Portability & Backup */}
      <section className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
              <Download className="w-4 h-4 text-stone-700" />
              Data Portability & Offline Backup
            </h2>
            <p className="text-xs text-stone-600 max-w-lg leading-relaxed">
              Export your entire SkinLoop profile, verified shelf inventory, routine history, and skin logs as an offline JSON backup.
            </p>
          </div>

          <button
            onClick={handleExportBackup}
            className="px-4 py-2 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-lg shadow-xs transition-colors shrink-0 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON Archive</span>
          </button>
        </div>
      </section>

      {/* Hackathon Evaluation & Demo Account State */}
      <section className="bg-amber-50/50 rounded-2xl border border-amber-200/90 p-6 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <h2 className="font-serif font-bold text-base text-amber-950">
                Hackathon Evaluation & Demo Account
              </h2>
              {isDemoAccount && (
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
                  Demo Mode Active
                </span>
              )}
            </div>
            <p className="text-xs text-amber-900/80 max-w-lg leading-relaxed">
              Quickly switch between a populated sample profile (Alex Rivera with preloaded shelf, routine, and historical notes) and a brand-new first-time user profile to test the initial onboarding questionnaire and clean-slate behavior.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onLoadDemoAccount && (
              <button
                type="button"
                onClick={onLoadDemoAccount}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-amber-900 hover:bg-amber-950 rounded-lg shadow-2xs transition-colors"
              >
                Load Demo Account
              </button>
            )}
            {onResetToNewUser && (
              <button
                type="button"
                onClick={onResetToNewUser}
                className="px-3.5 py-2 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 rounded-lg shadow-2xs transition-colors"
              >
                Reset to New User
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 3. Destructive Data Wipe Section */}
      <section className="bg-white rounded-2xl border border-rose-200/80 p-6 space-y-4 shadow-2xs">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="font-serif font-bold text-base text-rose-950 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-700" />
              Erase All Local Data & Photos
            </h2>
            <p className="text-xs text-stone-600 max-w-lg leading-relaxed">
              Permanently delete all stored skin analysis records, My Shelf products, journal observations, and personalized preferences from this browser.
            </p>
          </div>

          <button
            onClick={() => setIsWipeConfirmOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-xs transition-colors shrink-0"
          >
            Wipe All Records
          </button>
        </div>
      </section>

      {/* Wipe Confirmation Dialog */}
      {isWipeConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-serif font-bold text-stone-900">
                  Permanently Erase All Data?
                </h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  This action is irreversible. All skin analysis logs, uploaded photos, routines, and shelf items will be erased immediately.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsWipeConfirmOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onWipeAllData();
                  setIsWipeConfirmOpen(false);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-xs"
              >
                Yes, Erase Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
