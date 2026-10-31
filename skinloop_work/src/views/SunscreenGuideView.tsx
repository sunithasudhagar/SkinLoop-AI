import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, SkinAnalysisRecord } from '../types';
import {
  Sun,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Info,
  Sparkles,
  Droplets,
  RotateCcw,
  Check,
  Eye,
  Layers,
} from 'lucide-react';

interface SunscreenGuideViewProps {
  profile: UserProfile;
  latestAnalysis?: SkinAnalysisRecord;
  onNavigate: (view: string) => void;
}

interface FaceZone {
  id: string;
  name: string;
  anatomicalDescription: string;
  vulnarabilityReason: string;
  covered: boolean;
  color: string;
}

export const SunscreenGuideView: React.FC<SunscreenGuideViewProps> = ({
  profile,
  latestAnalysis,
  onNavigate,
}) => {
  const [zones, setZones] = useState<FaceZone[]>([
    {
      id: 'forehead',
      name: 'Forehead & Hairline',
      anatomicalDescription: 'Upper frontal bone extending to hairline margin',
      vulnarabilityReason: 'Direct downward solar radiation angles; frequently skipped near the hairline to avoid greasy roots.',
      covered: true,
      color: '#E27282',
    },
    {
      id: 'nose',
      name: 'Nose & Nasal Bridge',
      anatomicalDescription: 'Nasal dorsum, tip, and lateral alae',
      vulnarabilityReason: 'Most prominent facial projection receiving the highest cumulative UV dose and prone to actinic keratosis.',
      covered: true,
      color: '#E27282',
    },
    {
      id: 'right_cheek',
      name: 'Right Cheek & Malar Eminence',
      anatomicalDescription: 'Malar bone and right zygomatic arch',
      vulnarabilityReason: 'Common site for melasma and hyperpigmentation; sunscreen rubs off against phones and pillowcases.',
      covered: true,
      color: '#E27282',
    },
    {
      id: 'left_cheek',
      name: 'Left Cheek & Malar Eminence',
      anatomicalDescription: 'Malar bone and left zygomatic arch',
      vulnarabilityReason: 'Drivers experience increased unilateral UVA exposure through car window glass.',
      covered: true,
      color: '#E27282',
    },
    {
      id: 'undereye',
      name: 'Periorbital & Eyelids',
      anatomicalDescription: 'Infraorbital hollow and upper orbital eyelid rim',
      vulnarabilityReason: 'Skin is 4x thinner with fewer sebaceous glands. 10% of skin cancers occur on eyelids.',
      covered: false,
      color: '#D97786',
    },
    {
      id: 'temples',
      name: 'Temples & Lateral Brow',
      anatomicalDescription: 'Temporal fossa lateral to ocular orbits',
      vulnarabilityReason: 'Sweat and sunglasses friction strip sunscreen film rapidly in warm weather.',
      covered: false,
      color: '#D97786',
    },
    {
      id: 'chin_lip',
      name: 'Upper Lip & Chin',
      anatomicalDescription: 'Philtrum, perioral cutaneous lip, and mentalis',
      vulnarabilityReason: 'Frequent movement, perspiration, and drinking rapidly degrade sunscreen emulsion film.',
      covered: true,
      color: '#E27282',
    },
    {
      id: 'ears_neck',
      name: 'Ears & Neck Decolletage',
      anatomicalDescription: 'Auricular helix, lobule, lateral neck, and clavicle',
      vulnarabilityReason: 'Top critical area for missed melanoma. Ears receive lateral sun while walking or driving.',
      covered: false,
      color: '#D97786',
    },
  ]);

  const [activeZoneId, setActiveZoneId] = useState<string>('undereye');
  const [selectedActivity, setSelectedActivity] = useState<'office' | 'outdoor' | 'sports'>('office');

  // Reapplication Timer
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(120 * 60); // 2 hours in seconds
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Live Mirror Webcam
  const [isMirrorActive, setIsMirrorActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else if (timerSecondsLeft === 0) {
      setIsTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSecondsLeft]);

  // Clean up camera
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const toggleMirror = async () => {
    if (isMirrorActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setIsMirrorActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsMirrorActive(true);
      } catch (err) {
        alert('Could not start mirror camera. Check browser permissions.');
      }
    }
  };

  const toggleZoneCovered = (id: string) => {
    setZones((prev) =>
      prev.map((z) => (z.id === id ? { ...z, covered: !z.covered } : z))
    );
  };

  const activeZone = zones.find((z) => z.id === activeZoneId) || zones[0];
  const coveredCount = zones.filter((z) => z.covered).length;
  const coveragePercent = Math.round((coveredCount / zones.length) * 100);

  const formatTimer = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Title */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full">
          <Sun className="w-3.5 h-3.5 text-rose-600" />
          <span>Evidence-Based Photoprotection</span>
          <span>·</span>
          <span>Coverage Zone Anatomy & Dosage</span>
        </div>
        <h1 className="text-2xl font-serif font-bold text-stone-900">
          Sunscreen Application & Coverage Guide
        </h1>
        <p className="text-stone-600 text-sm max-w-2xl leading-relaxed">
          Ensure uniform photoprotective film formation across all 8 vulnerable facial zones. Learn the verified 2-finger dosage rule and track reapplication intervals.
        </p>
      </div>

      {/* Clinical Photoprotection Guidance */}
      <div className="p-4 rounded-xl bg-stone-100/80 border border-stone-200/80 text-xs text-stone-800 space-y-1.5 leading-relaxed">
        <div className="flex items-center gap-2 font-bold text-stone-900">
          <Shield className="w-4 h-4 text-rose-800 shrink-0" />
          <span>Dermatological Coverage Protocol:</span>
        </div>
        <p className="text-[11px] text-stone-600 leading-relaxed">
          Broad-spectrum sunscreen provides complete photoprotection only when applied evenly across all facial zones. Use this interactive facial coverage checklist and the verified 2-finger dosage standard to ensure high-risk areas like the nose bridge, ears, and periorbital margins receive uniform SPF coverage.
        </p>
      </div>

      {/* 2-Finger Dosage & Activity Calculator Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-stone-100">
          <div className="space-y-0.5">
            <h2 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-stone-700" />
              <span>The 2-Finger Dosage Rule (1/4 Teaspoon / 1.25 ml)</span>
            </h2>
            <p className="text-xs text-stone-500">
              Laboratory SPF ratings (SPF 50+) are measured at 2.0 mg per square centimeter of skin.
            </p>
          </div>
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-lg text-xs">
            {(['office', 'outdoor', 'sports'] as const).map((act) => (
              <button
                key={act}
                onClick={() => setSelectedActivity(act)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors capitalize ${
                  selectedActivity === act
                    ? 'bg-white text-stone-900 font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {act === 'office' ? 'Indoor / Office' : act === 'outdoor' ? 'Commute / Outdoor' : 'Sweat / Sports'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/60 space-y-1">
            <span className="font-bold text-stone-900">Required Quantity</span>
            <p className="text-stone-600 text-[11px] leading-relaxed">
              Dispense two continuous lines of sunscreen along the entire length of your index and middle fingers. This provides the exact ~1.25 ml necessary for adequate UV protection.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/60 space-y-1">
            <span className="font-bold text-stone-900">Application Technique</span>
            <p className="text-stone-600 text-[11px] leading-relaxed">
              Dot evenly across all zones first, then smooth outward in one directional plane. Do not aggressively rub in circles, which shears the protective polymeric film.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/60 space-y-1">
            <span className="font-bold text-stone-900">Film Setting Window</span>
            <p className="text-stone-600 text-[11px] leading-relaxed">
              Allow 10 to 15 minutes for the sunscreen emulsion to set before applying makeup or foundation. Applying foundation immediately can cause pilling and patchy coverage.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Face Map & Zone Checklist (7 cols + 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Face Map / Mirror (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                  Interactive Facial Coverage Map
                </span>
                <p className="text-[11px] text-stone-500">
                  Click any zone on the face to inspect vulnerability notes
                </p>
              </div>
              <button
                onClick={toggleMirror}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5 text-stone-600" />
                <span>{isMirrorActive ? 'Switch to Diagram' : 'Open Mirror Cam'}</span>
              </button>
            </div>

            {/* Visual Face Canvas or Camera Feed */}
            <div className="relative aspect-square w-full max-w-md mx-auto rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 flex items-center justify-center">
              {isMirrorActive ? (
                <div className="relative w-full h-full">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                  {/* Guided Face Overlay Oval */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-56 h-72 border-2 border-dashed border-rose-400/80 rounded-[50%]" />
                  </div>
                  <div className="absolute bottom-3 inset-x-0 text-center">
                    <span className="px-3 py-1 bg-black/60 text-white rounded-full text-[10px] font-mono">
                      Check ears, under-eyes, and neck coverage in mirror
                    </span>
                  </div>
                </div>
              ) : (
                <svg
                  viewBox="0 0 400 450"
                  className="w-full h-full select-none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="400" height="450" fill="#F4EFEB" />

                  {/* Neck / Decolletage Zone */}
                  <path
                    d="M 140 330 L 140 430 L 260 430 L 260 330 Z"
                    fill={zones.find((z) => z.id === 'ears_neck')?.covered ? '#EAD6CD' : '#FCE7DF'}
                    stroke={activeZoneId === 'ears_neck' ? '#9E4738' : '#D1C2BB'}
                    strokeWidth={activeZoneId === 'ears_neck' ? '3' : '1.5'}
                    className="cursor-pointer hover:opacity-90 transition-all"
                    onClick={() => setActiveZoneId('ears_neck')}
                  />

                  {/* Ears */}
                  <ellipse
                    cx="90"
                    cy="210"
                    rx="15"
                    ry="35"
                    fill={zones.find((z) => z.id === 'ears_neck')?.covered ? '#E4BF9F' : '#FBDDD1'}
                    stroke={activeZoneId === 'ears_neck' ? '#9E4738' : '#D1C2BB'}
                    strokeWidth="1.5"
                    className="cursor-pointer"
                    onClick={() => setActiveZoneId('ears_neck')}
                  />
                  <ellipse
                    cx="310"
                    cy="210"
                    rx="15"
                    ry="35"
                    fill={zones.find((z) => z.id === 'ears_neck')?.covered ? '#E4BF9F' : '#FBDDD1'}
                    stroke={activeZoneId === 'ears_neck' ? '#9E4738' : '#D1C2BB'}
                    strokeWidth="1.5"
                    className="cursor-pointer"
                    onClick={() => setActiveZoneId('ears_neck')}
                  />

                  {/* Head base */}
                  <ellipse cx="200" cy="210" rx="110" ry="135" fill="#E4BF9F" />

                  {/* Forehead Zone */}
                  <path
                    d="M 115 155 Q 200 95 285 155 Q 200 135 115 155 Z"
                    fill={zones.find((z) => z.id === 'forehead')?.covered ? '#DFB390' : '#FCE2D4'}
                    stroke={activeZoneId === 'forehead' ? '#9E4738' : 'none'}
                    strokeWidth="3"
                    className="cursor-pointer hover:opacity-90"
                    onClick={() => setActiveZoneId('forehead')}
                  />

                  {/* Temples Zone */}
                  <circle
                    cx="120"
                    cy="165"
                    r="18"
                    fill={zones.find((z) => z.id === 'temples')?.covered ? '#DCAE8B' : '#FCE2D4'}
                    stroke={activeZoneId === 'temples' ? '#9E4738' : 'none'}
                    strokeWidth="2.5"
                    className="cursor-pointer"
                    onClick={() => setActiveZoneId('temples')}
                  />
                  <circle
                    cx="280"
                    cy="165"
                    r="18"
                    fill={zones.find((z) => z.id === 'temples')?.covered ? '#DCAE8B' : '#FCE2D4'}
                    stroke={activeZoneId === 'temples' ? '#9E4738' : 'none'}
                    strokeWidth="2.5"
                    className="cursor-pointer"
                    onClick={() => setActiveZoneId('temples')}
                  />

                  {/* Under Eye & Eyelids Zone */}
                  <ellipse
                    cx="155"
                    cy="195"
                    rx="26"
                    ry="16"
                    fill={zones.find((z) => z.id === 'undereye')?.covered ? '#DCAE8B' : '#FBE0D2'}
                    stroke={activeZoneId === 'undereye' ? '#9E4738' : 'none'}
                    strokeWidth="2.5"
                    className="cursor-pointer"
                    onClick={() => setActiveZoneId('undereye')}
                  />
                  <ellipse
                    cx="245"
                    cy="195"
                    rx="26"
                    ry="16"
                    fill={zones.find((z) => z.id === 'undereye')?.covered ? '#DCAE8B' : '#FBE0D2'}
                    stroke={activeZoneId === 'undereye' ? '#9E4738' : 'none'}
                    strokeWidth="2.5"
                    className="cursor-pointer"
                    onClick={() => setActiveZoneId('undereye')}
                  />

                  {/* Eyes (Pupils) */}
                  <ellipse cx="155" cy="190" rx="7" ry="4" fill="#3D3531" />
                  <ellipse cx="245" cy="190" rx="7" ry="4" fill="#3D3531" />

                  {/* Cheeks */}
                  <ellipse
                    cx="145"
                    cy="245"
                    rx="32"
                    ry="24"
                    fill={zones.find((z) => z.id === 'left_cheek')?.covered ? '#E0B594' : '#FBE0D2'}
                    stroke={activeZoneId === 'left_cheek' ? '#9E4738' : 'none'}
                    strokeWidth="2.5"
                    className="cursor-pointer"
                    onClick={() => setActiveZoneId('left_cheek')}
                  />
                  <ellipse
                    cx="255"
                    cy="245"
                    rx="32"
                    ry="24"
                    fill={zones.find((z) => z.id === 'right_cheek')?.covered ? '#E0B594' : '#FBE0D2'}
                    stroke={activeZoneId === 'right_cheek' ? '#9E4738' : 'none'}
                    strokeWidth="2.5"
                    className="cursor-pointer"
                    onClick={() => setActiveZoneId('right_cheek')}
                  />

                  {/* Nose Zone */}
                  <path
                    d="M 195 190 L 190 250 L 210 250 L 205 190 Z"
                    fill={zones.find((z) => z.id === 'nose')?.covered ? '#D39E79' : '#FCE2D4'}
                    stroke={activeZoneId === 'nose' ? '#9E4738' : 'none'}
                    strokeWidth="2.5"
                    className="cursor-pointer"
                    onClick={() => setActiveZoneId('nose')}
                  />

                  {/* Upper Lip & Chin Zone */}
                  <ellipse
                    cx="200"
                    cy="285"
                    rx="25"
                    ry="12"
                    fill={zones.find((z) => z.id === 'chin_lip')?.covered ? '#D8A37E' : '#FBE0D2'}
                    stroke={activeZoneId === 'chin_lip' ? '#9E4738' : 'none'}
                    strokeWidth="2.5"
                    className="cursor-pointer"
                    onClick={() => setActiveZoneId('chin_lip')}
                  />
                  <ellipse
                    cx="200"
                    cy="320"
                    rx="28"
                    ry="14"
                    fill={zones.find((z) => z.id === 'chin_lip')?.covered ? '#D8A37E' : '#FBE0D2'}
                    stroke={activeZoneId === 'chin_lip' ? '#9E4738' : 'none'}
                    strokeWidth="2.5"
                    className="cursor-pointer"
                    onClick={() => setActiveZoneId('chin_lip')}
                  />
                </svg>
              )}

              {/* Coverage Gauge Badge */}
              <div className="absolute top-3 left-3 px-3 py-1 bg-white/95 rounded-lg border border-stone-200 shadow-xs flex items-center gap-2 text-xs">
                <span className="font-bold text-stone-900">{coveragePercent}% Covered</span>
                <span className="text-[10px] text-stone-500 font-mono">({coveredCount}/8 zones)</span>
              </div>
            </div>

            {/* Active Selected Zone Detail Panel */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                    Selected Zone:
                  </span>
                  <h4 className="text-sm font-bold text-stone-900">{activeZone.name}</h4>
                </div>
                <button
                  onClick={() => toggleZoneCovered(activeZone.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    activeZone.covered
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-stone-900 text-white hover:bg-stone-800'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{activeZone.covered ? 'Covered' : 'Mark as Applied'}</span>
                </button>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                <strong>Why it's vulnerable: </strong>
                {activeZone.vulnarabilityReason}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: 8-Zone Checklist & Reapplication Timer (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Zone Checklist */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="text-sm font-serif font-bold text-stone-900">
                Application Checklist (8 Key Zones)
              </h3>
              <span className="text-xs font-mono font-bold text-stone-900">
                {coveredCount} of 8
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  onClick={() => setActiveZoneId(zone.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    activeZoneId === zone.id
                      ? 'border-stone-900 bg-stone-50/90 shadow-2xs'
                      : 'border-stone-200/80 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleZoneCovered(zone.id);
                      }}
                      className="text-stone-400 hover:text-stone-700 shrink-0"
                    >
                      {zone.covered ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-stone-300 hover:border-stone-500" />
                      )}
                    </button>
                    <span className={`font-semibold truncate ${zone.covered ? 'text-stone-900' : 'text-stone-600'}`}>
                      {zone.name}
                    </span>
                  </div>

                  {!zone.covered && (
                    <span className="text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-medium shrink-0">
                      Unchecked
                    </span>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() =>
                setZones((prev) => prev.map((z) => ({ ...z, covered: true })))
              }
              className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-colors"
            >
              Mark All Zones Complete
            </button>
          </div>

          {/* Reapplication Countdown Timer Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-stone-700" />
                <h3 className="text-sm font-serif font-bold text-stone-900">
                  Sunscreen Reapplication Timer
                </h3>
              </div>
              <span className="text-[10px] text-stone-500">2-Hour Standard</span>
            </div>

            <div className="text-center py-2 space-y-1">
              <div className="text-3xl font-mono font-bold text-stone-900 tabular-nums">
                {formatTimer(timerSecondsLeft)}
              </div>
              <p className="text-[11px] text-stone-500">
                {isTimerRunning
                  ? 'Timer active: Next photoprotection reapplication countdown.'
                  : timerSecondsLeft === 0
                  ? 'Time to reapply! UV film degradation threshold reached.'
                  : 'Start timer when morning sunscreen application is complete.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold text-white transition-colors shadow-xs ${
                  isTimerRunning
                    ? 'bg-amber-800 hover:bg-amber-900'
                    : 'bg-stone-900 hover:bg-stone-800'
                }`}
              >
                {isTimerRunning ? 'Pause Timer' : 'Start 2-Hour Timer'}
              </button>
              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSecondsLeft(120 * 60);
                }}
                className="p-2 border border-stone-200 text-stone-600 hover:text-stone-900 rounded-xl transition-colors"
                title="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
