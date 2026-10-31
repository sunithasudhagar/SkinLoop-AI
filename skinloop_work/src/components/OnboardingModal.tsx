import React, { useState } from 'react';
import { UserProfile, SkinGoal, MakeupStyle, BudgetTier } from '../types';
import { Sparkles, Shield, X, ArrowRight, Check, Heart, HelpCircle } from 'lucide-react';

interface OnboardingModalProps {
  initialProfile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
  onLoadDemo?: () => void;
}

const SKIN_GOAL_OPTIONS: SkinGoal[] = [
  'Hydration & Barrier',
  'Anti-Aging & Firmness',
  'Blemish & Pore Care',
  'Even Tone & Brightening',
  'Sun Defense & Protection',
  'Calm Redness & Sensitivity',
  'Texture Smoothing',
];

const MAKEUP_STYLE_OPTIONS: MakeupStyle[] = [
  'Clean Minimalist',
  'Warm Everyday',
  'Polished Office',
  'Evening Glamour',
  'Festive & Celebration',
  'Soft Romantic',
];

const COMMON_SENSITIVITIES = [
  'Fragrance',
  'Essential Oils',
  'Denatured Alcohol',
  'Chemical UV Filters',
  'Silicones',
  'Parabens',
  'Niacinamide (High %)',
];

const BRAND_OPTIONS = [
  'Kay Beauty',
  'Maybelline',
  'Lakmé',
  'Nykaa',
  'Minimalist',
  'Plum',
  'Sugar Cosmetics',
  'Dot & Key',
  'Cetaphil',
  'Colorbar',
  'PAC Cosmetics',
  'Swiss Beauty',
  'DermaLoop Lab',
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  initialProfile,
  isOpen,
  onClose,
  onSave,
  onLoadDemo,
}) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>(initialProfile);

  if (!isOpen) return null;

  const toggleGoal = (goal: SkinGoal) => {
    setProfile((prev) => {
      const exists = prev.skinGoals.includes(goal);
      return {
        ...prev,
        skinGoals: exists ? prev.skinGoals.filter((g) => g !== goal) : [...prev.skinGoals, goal],
      };
    });
  };

  const toggleSensitivity = (item: string) => {
    setProfile((prev) => {
      const exists = prev.sensitivities.includes(item);
      return {
        ...prev,
        sensitivities: exists ? prev.sensitivities.filter((s) => s !== item) : [...prev.sensitivities, item],
      };
    });
  };

  const toggleBrand = (brand: string) => {
    setProfile((prev) => {
      const exists = prev.preferredBrands.includes(brand);
      return {
        ...prev,
        preferredBrands: exists ? prev.preferredBrands.filter((b) => b !== brand) : [...prev.preferredBrands, brand],
      };
    });
  };

  const handleComplete = () => {
    const finalProfile: UserProfile = {
      ...profile,
      onboardingCompleted: true,
    };
    onSave(finalProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-200/80 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center text-xs font-semibold">
              {step}/3
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-stone-900">Personalize Your SkinLoop Profile</h2>
              <p className="text-xs text-stone-500">Understand your skin. Find your look. Shop smarter in ₹ INR.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
            aria-label="Skip / Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Hackathon Judge / Evaluator Demo Account Banner */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
              <div>
                <span className="font-semibold text-amber-950">Hackathon Judge or Evaluator?</span>
                <p className="text-[11px] text-amber-800 leading-tight">
                  Skip manual onboarding and immediately test with curated sample data (Alex Rivera, verified shelf, routine, and history).
                </p>
              </div>
            </div>
            {onLoadDemo && (
              <button
                type="button"
                onClick={() => {
                  onLoadDemo();
                  onClose();
                }}
                className="px-3 py-1.5 bg-amber-900 hover:bg-amber-950 text-white font-medium text-xs rounded-lg transition-colors shadow-2xs whitespace-nowrap shrink-0 self-start sm:self-auto"
              >
                Load Demo Account
              </button>
            )}
          </div>
          {/* STEP 1: Skin Type, Goals & Sensitivities */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                  1. Self-Reported Skin Type
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {(['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setProfile((p) => ({ ...p, skinType: type }))}
                      className={`px-3 py-2 text-xs font-medium rounded-lg border text-center transition-all ${
                        profile.skinType === type
                          ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                  2. Core Skin Concerns & Goals (Optional)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SKIN_GOAL_OPTIONS.map((goal) => {
                    const isSelected = profile.skinGoals.includes(goal);
                    return (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => toggleGoal(goal)}
                        className={`flex items-center justify-between px-3.5 py-2 text-xs font-medium rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'border-rose-400 bg-rose-50/70 text-rose-950 font-semibold'
                            : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                        }`}
                      >
                        <span>{goal}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-rose-700 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fragrance & Sensitive Formulas */}
              <div className="pt-2 border-t border-stone-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-stone-600">
                    Fragrance Preference
                  </label>
                  <div className="flex items-center gap-1.5 text-xs">
                    {(['fragrance-free', 'subtle', 'no-preference'] as const).map((frag) => (
                      <button
                        key={frag}
                        type="button"
                        onClick={() => setProfile((p) => ({ ...p, fragrancePreference: frag }))}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium border capitalize ${
                          profile.fragrancePreference === frag
                            ? 'bg-stone-900 text-white border-stone-900'
                            : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                        }`}
                      >
                        {frag.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                    Sensitivities or Ingredients to Avoid
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_SENSITIVITIES.map((sens) => {
                      const isSelected = profile.sensitivities.includes(sens);
                      return (
                        <button
                          key={sens}
                          type="button"
                          onClick={() => toggleSensitivity(sens)}
                          className={`px-3 py-1.5 text-xs rounded-md border transition-all ${
                            isSelected
                              ? 'border-amber-400 bg-amber-50 text-amber-900 font-semibold'
                              : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                          }`}
                        >
                          {sens}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Foundation Undertone, Shade & Makeup Style */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-stone-600">
                    Foundation Undertone (If Known)
                  </label>
                  <span className="text-[11px] text-stone-400">Can be tentative</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {(['Warm', 'Cool', 'Neutral', 'Olive', 'Unsure'] as const).map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      onClick={() => setProfile((p) => ({ ...p, undertone: tone }))}
                      className={`px-2.5 py-2 text-xs font-medium rounded-lg border text-center transition-all ${
                        profile.undertone === tone
                          ? 'border-stone-900 bg-stone-900 text-white font-semibold shadow-xs'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                  Approximate Shade Depth
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {(['Fair', 'Light', 'Medium', 'Tan', 'Deep', 'Rich', 'Unsure'] as const).map((sh) => (
                    <button
                      key={sh}
                      type="button"
                      onClick={() => setProfile((p) => ({ ...p, shadePreference: sh }))}
                      className={`px-2 py-1.5 text-[11px] font-medium rounded-md border text-center ${
                        profile.shadePreference === sh
                          ? 'border-stone-900 bg-stone-900 text-white font-semibold'
                          : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      {sh}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                    Desired Makeup Finish
                  </label>
                  <select
                    value={profile.desiredFinish}
                    onChange={(e) => setProfile((p) => ({ ...p, desiredFinish: e.target.value as any }))}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  >
                    <option value="natural">Natural Satin</option>
                    <option value="dewy">Dewy / Glass Skin</option>
                    <option value="matte">Soft Matte / Oil Control</option>
                    <option value="satin">Luminous Satin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                    Coverage Preference
                  </label>
                  <select
                    value={profile.desiredCoverage}
                    onChange={(e) => setProfile((p) => ({ ...p, desiredCoverage: e.target.value as any }))}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  >
                    <option value="sheer">Sheer / Skin Tint</option>
                    <option value="medium">Medium Flexible</option>
                    <option value="full">Full Coverage</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                  Primary Makeup Occasion
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {(['everyday', 'college', 'office', 'party', 'wedding'] as const).map((occ) => (
                    <button
                      key={occ}
                      type="button"
                      onClick={() => setProfile((p) => ({ ...p, preferredOccasion: occ }))}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border capitalize text-center ${
                        profile.preferredOccasion === occ
                          ? 'border-stone-900 bg-stone-900 text-white font-semibold'
                          : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Brands, Budget in INR & Privacy Notice */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                  Preferred Beauty Brands (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {BRAND_OPTIONS.map((brand) => {
                    const isSelected = profile.preferredBrands.includes(brand);
                    return (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => toggleBrand(brand)}
                        className={`px-3 py-1.5 text-xs rounded-md border transition-all ${
                          isSelected
                            ? 'border-rose-400 bg-rose-50 text-rose-950 font-semibold'
                            : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                        }`}
                      >
                        {brand}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-stone-600">
                    Monthly Beauty Budget (in INR ₹)
                  </label>
                  <span className="text-xs font-bold font-mono text-stone-900">
                    ₹{profile.monthlyBudget.toLocaleString('en-IN')}/month
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="500"
                    max="15000"
                    step="250"
                    value={profile.monthlyBudget}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, monthlyBudget: parseInt(e.target.value, 10) }))
                    }
                    className="w-full accent-stone-900"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-stone-400 mt-1 font-mono">
                  <span>₹500 (Budget)</span>
                  <span>₹3,500 (Mid-tier)</span>
                  <span>₹15,000+ (Luxury)</span>
                </div>
              </div>

              {/* Data & Face Photo Explanation */}
              <div className="p-4 rounded-xl bg-stone-100/80 border border-stone-200/80 space-y-2.5">
                <div className="flex items-center gap-2 text-stone-900 text-xs font-semibold">
                  <Shield className="w-4 h-4 text-stone-700" />
                  <span>Transparent Data Usage Notice</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  SkinLoop AI uses your selections to tailor ingredient checks, routine recommendations, and shade matches. Skin analysis connects securely via server-side YouCam S2S v2.0 or sandbox simulation. No photos are stored without your explicit consent.
                </p>
                <div className="pt-1 flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-xs text-stone-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.consentAiAnalysis}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, consentAiAnalysis: e.target.checked }))
                      }
                      className="rounded text-stone-900 focus:ring-stone-900"
                    />
                    <span>I consent to personalized beauty and skincare recommendations.</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-stone-200/80 flex items-center justify-between bg-stone-50/50">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
            >
              Back
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="px-4 py-2 text-xs font-medium text-stone-500 hover:text-stone-800 transition-colors"
            >
              Skip All for Now
            </button>
          )}

          <div className="flex items-center gap-2">
            {step < 3 ? (
              <>
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-3 py-2 text-xs font-medium text-stone-500 hover:text-stone-800"
                >
                  Skip Step
                </button>
                <button
                  onClick={() => setStep(step + 1)}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors shadow-xs"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <button
                onClick={handleComplete}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-rose-900 rounded-lg hover:bg-rose-950 transition-colors shadow-xs"
              >
                <span>Save Profile & Start</span>
                <Sparkles className="w-3.5 h-3.5 text-rose-200" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
