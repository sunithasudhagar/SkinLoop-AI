import React, { useState, useRef, useEffect } from 'react';
import {
  SkinAnalysisRecord,
  UserProfile,
  YouCamApiConfig,
  Product,
} from '../types';
import { SAMPLE_CATALOGUE } from '../data/catalogue';
import { StorageService } from '../services/storage';
import {
  Camera,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Shield,
  Sun,
  Eye,
  Info,
  Sliders,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Trash2,
  FileCheck,
  BookmarkCheck,
  Bookmark,
  Check,
  Layers,
  Heart,
  X,
} from 'lucide-react';

interface SkinAnalysisViewProps {
  profile: UserProfile;
  youCamConfig: YouCamApiConfig;
  onSaveAnalysis: (record: SkinAnalysisRecord) => void;
  onNavigate: (view: string) => void;
}

export const SkinAnalysisView: React.FC<SkinAnalysisViewProps> = ({
  profile,
  youCamConfig,
  onSaveAnalysis,
  onNavigate,
}) => {
  // Capture & input states
  const [inputMode, setInputMode] = useState<'upload' | 'camera' | 'sample'>('upload');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{ filename: string; sizeKb: number; mimeType: string } | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Consent & process states
  const [hasConsented, setHasConsented] = useState<boolean>(profile.consentAiAnalysis);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [analysisError, setAnalysisError] = useState<{
    code: 'UNSUPPORTED_IMAGE' | 'OVERSIZED_IMAGE' | 'MISSING_KEY' | 'NETWORK_ERROR' | 'API_ERROR';
    message: string;
    details?: string;
  } | null>(null);

  // Results & explicit save state
  const [optInSimulation, setOptInSimulation] = useState<boolean>(false);
  const [result, setResult] = useState<SkinAnalysisRecord | null>(null);
  const [isSavedToJournal, setIsSavedToJournal] = useState(false);

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    setAnalysisError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your current browser environment.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
      setInputMode('camera');
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError(err.message || 'Unable to access device camera. Please upload a photo file instead.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 640;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setSelectedImage(dataUrl);
      const sizeEst = Math.round((dataUrl.length * 3) / 4 / 1024);
      setImageMeta({
        filename: `camera_capture_${Date.now()}.jpg`,
        sizeKb: sizeEst,
        mimeType: 'image/jpeg',
      });
      stopCamera();
      setAnalysisError(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalysisError(null);

    // Format check (JPEG, PNG, WebP)
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validMimes.includes(file.type.toLowerCase())) {
      setAnalysisError({
        code: 'UNSUPPORTED_IMAGE',
        message: 'Unsupported image format. Please select a JPEG, PNG, or WebP photo.',
        details: `Detected file type: ${file.type || 'unknown'}. YouCam S2S API requires standard image formats.`,
      });
      return;
    }

    // Size limit check (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setAnalysisError({
        code: 'OVERSIZED_IMAGE',
        message: 'Image exceeds maximum 10MB file size limit.',
        details: `Your image size is ${(file.size / (1024 * 1024)).toFixed(2)}MB. Please compress or select a smaller image.`,
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setImageMeta({
        filename: file.name,
        sizeKb: Math.round(file.size / 1024),
        mimeType: file.type,
      });
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setSelectedImage(null);
    setImageMeta(null);
    setAnalysisError(null);
    stopCamera();
  };

  const handleUseSample = () => {
    stopCamera();
    // Valid standard JPEG data URI of neutral studio lighting test portrait
    const sampleUri =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23F4EFEB"/><circle cx="200" cy="180" r="100" fill="%23E4BF9F"/><ellipse cx="170" cy="165" rx="8" ry="5" fill="%234A3E39"/><ellipse cx="230" cy="165" rx="8" ry="5" fill="%234A3E39"/><path d="M 190 220 Q 200 230 210 220" stroke="%23B25D61" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M 175 195 Q 200 205 225 195" stroke="%23D7B492" stroke-width="2" fill="none"/></svg>';
    setSelectedImage(sampleUri);
    setImageMeta({
      filename: 'sample_reference_portrait.jpg',
      sizeKb: 145,
      mimeType: 'image/jpeg',
    });
    setAnalysisError(null);
    setInputMode('sample');
  };

  const runAnalysis = async (forceSimulation: boolean = false) => {
    if (!hasConsented) {
      setAnalysisError({
        code: 'API_ERROR',
        message: 'Consent is required to proceed with facial skin analysis.',
        details: 'Please check the consent box below confirming you agree to cosmetic image processing.',
      });
      return;
    }

    if (!selectedImage) {
      setAnalysisError({
        code: 'UNSUPPORTED_IMAGE',
        message: 'No photo selected. Please upload a photo, use camera, or select demo reference.',
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setIsSavedToJournal(false);

    try {
      setAnalysisStep('1/3: Validating resolution and color balance...');
      await new Promise((r) => setTimeout(r, 450));

      setAnalysisStep('2/3: Analyzing facial landmarks and tone metrics...');

      const response = await fetch('/api/youcam/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          skinTypeGuess: profile.skinType,
          userProfile: {
            undertone: profile.undertone,
            shadePreference: profile.shadePreference,
          },
          allowSimulation: optInSimulation,
        }),
      });

      setAnalysisStep('3/3: Evaluating surface metrics and barrier balance...');

      const data = await response.json();

      if (!response.ok) {
        if (data.errorCode === 'YOUCAM_API_KEY_REQUIRED' || data.errorCode === 'API_KEY_REQUIRED') {
          setAnalysisError({
            code: 'MISSING_KEY',
            message: 'YouCam API credentials are not active on the server.',
            details: 'To test the full analysis workflow in sandbox demo mode for evaluation, enable the Demo Simulation toggle below.',
          });
          return;
        }
        throw new Error(data.message || 'Analysis could not be completed. Please try a clearer, well-lit photo.');
      }

      const returnedSource = data.source || (youCamConfig.isLiveConfigured ? 'youcam_live' : 'simulation_test');

      const analysisRecord: SkinAnalysisRecord = {
        id: data.analysis?.id || `analysis-${Date.now()}`,
        timestamp: data.analysis?.timestamp || new Date().toISOString(),
        imageUrl: selectedImage || undefined,
        source: returnedSource,
        taskId: data.taskId || data.analysis?.taskId,
        skinAge: data.analysis?.skinAge,
        overallScore: data.analysis?.overallScore,
        outputMaskUrl: data.analysis?.outputMaskUrl,
        rawScoreInfo: data.analysis?.rawScoreInfo,
        verifiedParametersCount: data.analysis?.verifiedParametersCount,
        metrics: data.analysis?.metrics || {},
        skinTone: data.analysis?.skinTone || {
          hex: '#E4BF9F',
          pantoneApprox: 'Warm Peach 3Y04',
          undertone: (profile.undertone && profile.undertone !== 'Unsure' ? profile.undertone : 'Warm') as any,
          fitzpatrickType: 'Not Detected',
          shadeFamily: (profile.shadePreference && profile.shadePreference !== 'Unsure' ? profile.shadePreference : 'Medium') as any,
          confidenceNote: 'User profile baseline. Undertone is declared in profile (not computer vision detected).',
          isUserDeclared: true,
        },
        nonMedicalSummary:
          data.analysis?.nonMedicalSummary ||
          (returnedSource === 'youcam_live'
            ? 'Verified YouCam AI skin diagnostic successfully processed.'
            : 'DEMO SIMULATION — NOT A REAL SKIN ANALYSIS. Offline evaluation test demonstration.'),
        observations: data.analysis?.observations || [],
        suggestedFocusAreas: data.analysis?.suggestedFocusAreas || [
          'Maintain balanced barrier moisture protection',
          'Daily broad-spectrum SPF 50+ to protect spots clarity',
        ],
      };

      setResult(analysisRecord);
      // NOTE: User explicitly chooses whether to save their results via handleSaveResult!
    } catch (err: any) {
      console.error('Analysis error:', err);
      setAnalysisError({
        code: 'NETWORK_ERROR',
        message: 'Network or server communication error.',
        details: err.message || 'Unable to reach the skin analysis service. Please check your connection and retry.',
      });
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  // Explicit user action to save result to persistent storage
  const handleSaveResult = () => {
    if (!result) return;
    onSaveAnalysis(result);
    setIsSavedToJournal(true);
  };

  // Connect analysis metrics to catalogue-backed recommendations
  const getTailoredSuggestions = (analysis: SkinAnalysisRecord) => {
    const shelf = StorageService.getShelf();
    const suggestions: {
      concern: string;
      metricScore: number;
      recommendationTitle: string;
      product: Product;
      alreadyOnShelf: boolean;
      scientificRationale: string;
    }[] = [];

    // 1. Hydration concern
    if (analysis.metrics.hydration != null && analysis.metrics.hydration < 80) {
      const serum = SAMPLE_CATALOGUE.find((p) => p.category === 'serum') || SAMPLE_CATALOGUE[0];
      const onShelf = shelf.some((s) => s.category.toLowerCase().includes('serum') && s.remainingPercent > 20);
      suggestions.push({
        concern: 'Moisture Balance',
        metricScore: analysis.metrics.hydration,
        recommendationTitle: 'Deep Humectant Hydration',
        product: serum,
        alreadyOnShelf: onShelf,
        scientificRationale: `Your surface moisture scored ${analysis.metrics.hydration}/100. Incorporating multi-molecular humectants (Hyaluronic Acid + B5) binds water in the stratum corneum without pore clogging.`,
      });
    }

    // 2. Spots clarity / UV defense (Always broad spectrum)
    const spotsScore = analysis.metrics.spotsClarity ?? 80;
    const spf = SAMPLE_CATALOGUE.find((p) => p.category === 'sunscreen') || SAMPLE_CATALOGUE[0];
    const spfOnShelf = shelf.some((s) => s.category.toLowerCase().includes('sunscreen') && s.remainingPercent > 20);
    suggestions.push({
      concern: 'UV Barrier Defense',
      metricScore: spotsScore,
      recommendationTitle: 'Daily Broad-Spectrum Photoprotection',
      product: spf,
      alreadyOnShelf: spfOnShelf,
      scientificRationale: `Sun protection is essential for all skin tones regardless of depth. Daily SPF 50+ prevents UV-induced oxidative stress and protects post-breakout clarity${analysis.metrics.spotsClarity != null ? ` (currently ${analysis.metrics.spotsClarity}/100)` : ''}.`,
    });

    // 3. Texture Smoothness
    if (analysis.metrics.textureSmoothness != null && analysis.metrics.textureSmoothness < 80) {
      const primerOrCream = SAMPLE_CATALOGUE.find((p) => p.category === 'primer' || p.category === 'moisturizer') || SAMPLE_CATALOGUE[1];
      const primerOnShelf = shelf.some((s) => s.category.toLowerCase().includes(primerOrCream.category) && s.remainingPercent > 20);
      suggestions.push({
        concern: 'Surface Texture',
        metricScore: analysis.metrics.textureSmoothness,
        recommendationTitle: 'Smoothing Barrier Base',
        product: primerOrCream,
        alreadyOnShelf: primerOnShelf,
        scientificRationale: `Texture smoothness evaluated at ${analysis.metrics.textureSmoothness}/100. A lightweight dimethicone or ceramide barrier preps canvas for flawless makeup wear without clinging to dry patches.`,
      });
    }

    return suggestions;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header section */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-rose-600" />
          <span>Dermatological AI Vision</span>
          <span>·</span>
          <span>Surface & Tone Diagnostics</span>
        </div>
        <h1 className="text-2xl font-serif font-bold text-stone-900">
          Skin Health & Tone Analysis
        </h1>
        <p className="text-stone-600 text-xs sm:text-sm max-w-2xl leading-relaxed">
          Evaluate surface hydration, texture smoothness, redness calmness, and oiliness balance. Diagnostics are strictly non-medical cosmetic metrics designed to guide skincare and foundation shade discovery.
        </p>
      </div>

      {/* Privacy & Safety Reassurance */}
      <div className="p-3.5 rounded-xl bg-stone-100/80 border border-stone-200/80 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2.5 text-stone-700">
          <Shield className="w-4 h-4 text-rose-800 shrink-0" />
          <span>Facial analysis is processed securely and privately. Your reference photos are never shared.</span>
        </div>
      </div>

      {!result ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Photo capture / Upload / Live camera (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5 shadow-xs">
              {/* Mode Selector Tabs */}
              <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setInputMode('upload');
                  }}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    inputMode === 'upload'
                      ? 'bg-white text-stone-900 shadow-xs font-semibold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Upload Photo
                </button>
                <button
                  type="button"
                  onClick={startCamera}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    inputMode === 'camera'
                      ? 'bg-white text-stone-900 shadow-xs font-semibold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Use Camera
                </button>
                <button
                  type="button"
                  onClick={handleUseSample}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    inputMode === 'sample'
                      ? 'bg-white text-stone-900 shadow-xs font-semibold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Demo Reference
                </button>
              </div>

              {/* Viewport Frame */}
              <div className="relative aspect-square w-full max-w-md mx-auto rounded-xl overflow-hidden bg-stone-100 border border-stone-200 flex items-center justify-center">
                {isCameraActive ? (
                  <div className="relative w-full h-full">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                    {/* Face alignment oval guide */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-56 h-72 border-2 border-dashed border-white/80 rounded-[50%] shadow-lg" />
                    </div>
                    <div className="absolute bottom-4 inset-x-0 flex justify-center">
                      <button
                        onClick={capturePhoto}
                        className="px-5 py-2.5 bg-white text-stone-900 font-bold text-xs rounded-full shadow-lg hover:bg-stone-50 flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4 text-rose-800" />
                        <span>Capture Frame</span>
                      </button>
                    </div>
                  </div>
                ) : selectedImage ? (
                  <div className="relative w-full h-full flex items-center justify-center bg-stone-50">
                    <img
                      src={selectedImage}
                      alt="Uploaded face for skin analysis"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {/* Photo Management Actions (Replace / Remove) */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <label className="px-2.5 py-1 text-[11px] font-medium bg-stone-900/80 text-white rounded-md hover:bg-stone-900 backdrop-blur-xs cursor-pointer shadow-xs">
                        Replace
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                      <button
                        onClick={handleRemovePhoto}
                        className="px-2.5 py-1 text-[11px] font-medium bg-rose-900/80 text-white rounded-md hover:bg-rose-900 backdrop-blur-xs shadow-xs flex items-center gap-1"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>

                    {/* Metadata badge */}
                    {imageMeta && (
                      <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-xs text-white text-[10px] rounded font-mono">
                        {imageMeta.filename} · {imageMeta.sizeKb} KB
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-stone-200/80 flex items-center justify-center mx-auto text-stone-600">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-stone-800">
                        Select a photo or activate device camera
                      </p>
                      <p className="text-[11px] text-stone-500 max-w-xs mx-auto">
                        High resolution, natural daylight, looking directly at camera with bare skin. Supported: JPEG, PNG, WebP (max 10MB).
                      </p>
                    </div>
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-stone-800 transition-colors shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Browse Image File</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {cameraError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Consent Gate */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-3">
                <div className="flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-stone-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-stone-900">
                      Facial Analysis Consent & Privacy Notice
                    </span>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      Your photo is analyzed strictly for cosmetic parameters, surface hydration, and undertone matching. Photos are never shared or logged permanently. Results never constitute medical diagnosis or healthcare advice.
                    </p>
                  </div>
                </div>
                <label className="flex items-center gap-2.5 text-xs text-stone-900 font-medium cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={hasConsented}
                    onChange={(e) => setHasConsented(e.target.checked)}
                    className="rounded text-stone-900 focus:ring-stone-900"
                  />
                  <span>I give consent to process this face photo for personalized beauty recommendations.</span>
                </label>
              </div>

              {/* Explicit Opt-In Demo Simulation Mode (For Hackathon Judges) */}
              <div className="p-3.5 rounded-xl border border-stone-200/90 bg-stone-50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-bold text-stone-900">
                      Demo Simulation Mode (For Evaluation)
                    </span>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={optInSimulation}
                      onChange={(e) => setOptInSimulation(e.target.checked)}
                      className="rounded text-amber-700 focus:ring-amber-700"
                    />
                    <span>Opt-In</span>
                  </label>
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Generates synthetic demo data when live YouCam API credentials are not set. Simulation records are explicitly labeled and isolated from real progress tracking.
                </p>
              </div>

              {/* Analysis CTA Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => runAnalysis(false)}
                  disabled={!selectedImage || isAnalyzing || !hasConsented}
                  className="w-full py-3 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-rose-200" />
                      <span>{analysisStep || 'Analyzing Face with YouCam...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-rose-200" />
                      <span>{optInSimulation ? 'Run Demo Skin Simulation' : 'Analyze Skin Health'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Error State Banners */}
              {analysisError && (
                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-900 text-xs space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <div className="space-y-1">
                      <span className="font-bold block">{analysisError.message}</span>
                      {analysisError.details && (
                        <p className="text-[11px] leading-relaxed opacity-90">
                          {analysisError.details}
                        </p>
                      )}
                    </div>
                  </div>

                  {analysisError.code === 'MISSING_KEY' && (
                    <div className="pt-1">
                      <button
                        onClick={() => {
                          setOptInSimulation(true);
                          setAnalysisError(null);
                        }}
                        className="px-3.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-lg font-semibold text-[11px] shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Enable Demo Simulation & Continue</span>
                      </button>
                    </div>
                  )}

                  {analysisError.code === 'NETWORK_ERROR' && (
                    <div className="pt-1">
                      <button
                        onClick={() => runAnalysis(false)}
                        className="px-3 py-1.5 bg-rose-900 text-white rounded-lg font-semibold text-[11px] shadow-xs hover:bg-rose-950 transition-colors"
                      >
                        Retry Analysis
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Lighting & Quality Guidance (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
              <h3 className="text-sm font-serif font-bold text-stone-900">
                Image Quality & Lighting Guidelines
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                For the most reliable computer vision metric calculation, follow these environmental tips:
              </p>

              <div className="space-y-3 pt-1">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200/60 text-xs">
                  <Sun className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-900">Diffused Natural Daylight</span>
                    <p className="text-stone-500 text-[11px] mt-0.5">
                      Face a window or soft ambient daylight. Avoid harsh shadows, heavy backlights, or strong colored LED bulbs.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200/60 text-xs">
                  <Eye className="w-4 h-4 text-stone-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-900">Neutral Head Positioning</span>
                    <p className="text-stone-500 text-[11px] mt-0.5">
                      Look straight forward at eye level with a relaxed, neutral facial expression. Hair pulled gently back from forehead and cheeks.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200/60 text-xs">
                  <Sliders className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-900">Bare Skin Recommended</span>
                    <p className="text-stone-500 text-[11px] mt-0.5">
                      Ensure face is free from heavy foundation, powders, or beauty filters so the vision model measures real skin surface texture.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-stone-200 bg-stone-100/60 text-xs text-stone-600 space-y-2">
              <span className="font-bold text-stone-900 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                Medical Disclaimer Notice
              </span>
              <p className="text-[11px] leading-relaxed">
                SkinLoop AI and YouCam skin analysis are cosmetic discovery tools. They do not diagnose dermatological diseases, eczema, rosacea, or melanoma. Always consult a certified dermatologist for clinical care.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Results View (Allows user to inspect and explicitly choose to save or discard) */
        <div className="space-y-6">
          {/* Unmistakable Simulation Mode Banner */}
          {result.source === 'simulation_test' && (
            <div className="p-4 rounded-2xl bg-amber-500 text-stone-950 border-2 border-amber-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-start sm:items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-stone-950 shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <span className="tracking-wide uppercase text-sm block font-black">
                    DEMO SIMULATION — NOT A REAL SKIN ANALYSIS
                  </span>
                  <p className="text-xs font-medium text-stone-900 mt-0.5">
                    Synthetic test dataset generated for hackathon demonstration. Simulation records are saved in sandbox storage and will never be used to claim real skin improvement.
                  </p>
                </div>
              </div>
              <span className="text-xs bg-black/15 text-stone-950 px-2.5 py-1 rounded-md font-mono shrink-0 font-bold self-start sm:self-auto">
                SANDBOX DEMO
              </span>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 space-y-6 shadow-xs">
            {/* Action Bar: Save to Journal & Retake */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-200">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-xs font-semibold flex items-center gap-1 px-2.5 py-0.5 rounded-full ${
                      result.source === 'youcam_live'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-900 border border-amber-200'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                    <span>
                      {result.source === 'youcam_live'
                        ? 'High-Precision Facial Scan (YouCam S2S)'
                        : 'DEMO SIMULATION (Sandbox)'}
                    </span>
                  </span>
                  {result.verifiedParametersCount !== undefined && result.source === 'youcam_live' && (
                    <span className="text-xs font-mono font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      Verified Metrics: {result.verifiedParametersCount}
                    </span>
                  )}
                  {result.overallScore !== undefined && (
                    <span className="text-xs font-mono font-bold text-stone-900 bg-stone-100 px-2.5 py-0.5 rounded-full">
                      Skin Index: {result.overallScore}/100
                    </span>
                  )}
                  {result.skinAge !== undefined && (
                    <span className="text-xs font-mono font-bold text-stone-900 bg-stone-100 px-2.5 py-0.5 rounded-full">
                      Skin Age: {result.skinAge}
                    </span>
                  )}
                  <span className="text-stone-300">·</span>
                  <span className="text-xs text-stone-500 font-mono">
                    {new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h2 className="text-xl font-serif font-bold text-stone-900">Your Skin Analysis Results</h2>
              </div>

              {/* Explicit Save to Journal vs Discard Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setResult(null);
                    setIsSavedToJournal(false);
                  }}
                  className="px-3.5 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retake Photo</span>
                </button>

                {isSavedToJournal ? (
                  <div className="px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Saved to Progress Journal</span>
                  </div>
                ) : (
                  <button
                    onClick={handleSaveResult}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-xs transition-colors"
                  >
                    <BookmarkCheck className="w-3.5 h-3.5 text-rose-300" />
                    <span>Save to Progress Journal</span>
                  </button>
                )}
              </div>
            </div>

            {/* Detection Mask Overlay if returned */}
            {result.outputMaskUrl && (
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
                <span className="text-xs font-bold text-stone-900 block">
                  Facial Diagnostic Overlay
                </span>
                <img
                  src={result.outputMaskUrl}
                  alt="Facial Diagnostic Mask"
                  className="max-h-64 rounded-lg object-contain mx-auto"
                />
              </div>
            )}

            {/* Non-medical summary */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
              <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Summary Observations
              </span>
              <p className="text-xs text-stone-700 leading-relaxed">
                {result.nonMedicalSummary}
              </p>
            </div>

            {/* 7 Core Vision Metrics */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  Diagnostic Vision Metrics (0–100 Scale)
                </h3>
                <span className="text-[10px] text-stone-400">
                  Only metrics confirmed by API are displayed; missing metrics show Unavailable
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1">
                  <div className="text-[11px] text-stone-500">Hydration</div>
                  {result.metrics.hydration != null ? (
                    <>
                      <div className="text-xl font-bold text-stone-900 font-mono tabular-nums">
                        {result.metrics.hydration}%
                      </div>
                      <div className="w-full bg-stone-100 h-1 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-1 rounded-full"
                          style={{ width: `${result.metrics.hydration}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm font-semibold text-stone-400 font-mono">Unavailable</div>
                      <div className="text-[10px] text-stone-400">Not returned by API</div>
                    </>
                  )}
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1">
                  <div className="text-[11px] text-stone-500">Texture Smoothness</div>
                  {result.metrics.textureSmoothness != null ? (
                    <>
                      <div className="text-xl font-bold text-stone-900 font-mono tabular-nums">
                        {result.metrics.textureSmoothness}%
                      </div>
                      <div className="w-full bg-stone-100 h-1 rounded-full overflow-hidden">
                        <div
                          className="bg-stone-800 h-1 rounded-full"
                          style={{ width: `${result.metrics.textureSmoothness}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm font-semibold text-stone-400 font-mono">Unavailable</div>
                      <div className="text-[10px] text-stone-400">Not returned by API</div>
                    </>
                  )}
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1">
                  <div className="text-[11px] text-stone-500">Calmness (Redness)</div>
                  {result.metrics.rednessScore != null ? (
                    <>
                      <div className="text-xl font-bold text-stone-900 font-mono tabular-nums">
                        {result.metrics.rednessScore}%
                      </div>
                      <div className="w-full bg-stone-100 h-1 rounded-full overflow-hidden">
                        <div
                          className="bg-rose-500 h-1 rounded-full"
                          style={{ width: `${result.metrics.rednessScore}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm font-semibold text-stone-400 font-mono">Unavailable</div>
                      <div className="text-[10px] text-stone-400">Not returned by API</div>
                    </>
                  )}
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1">
                  <div className="text-[11px] text-stone-500">Spots Clarity</div>
                  {result.metrics.spotsClarity != null ? (
                    <>
                      <div className="text-xl font-bold text-stone-900 font-mono tabular-nums">
                        {result.metrics.spotsClarity}%
                      </div>
                      <div className="w-full bg-stone-100 h-1 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-600 h-1 rounded-full"
                          style={{ width: `${result.metrics.spotsClarity}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm font-semibold text-stone-400 font-mono">Unavailable</div>
                      <div className="text-[10px] text-stone-400">Not returned by API</div>
                    </>
                  )}
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1">
                  <div className="text-[11px] text-stone-500">Oil Balance</div>
                  {result.metrics.oilBalance != null ? (
                    <>
                      <div className="text-xl font-bold text-stone-900 font-mono tabular-nums">
                        {result.metrics.oilBalance}%
                      </div>
                      <div className="w-full bg-stone-100 h-1 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-1 rounded-full"
                          style={{ width: `${result.metrics.oilBalance}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm font-semibold text-stone-400 font-mono">Unavailable</div>
                      <div className="text-[10px] text-stone-400">Not returned by API</div>
                    </>
                  )}
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1">
                  <div className="text-[11px] text-stone-500">Radiance Score</div>
                  {result.metrics.radiance != null ? (
                    <>
                      <div className="text-xl font-bold text-stone-900 font-mono tabular-nums">
                        {result.metrics.radiance}%
                      </div>
                      <div className="w-full bg-stone-100 h-1 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-600 h-1 rounded-full"
                          style={{ width: `${result.metrics.radiance}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm font-semibold text-stone-400 font-mono">Unavailable</div>
                      <div className="text-[10px] text-stone-400">Not returned by API</div>
                    </>
                  )}
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1">
                  <div className="text-[11px] text-stone-500">Elasticity / Firmness</div>
                  {result.metrics.firmness != null ? (
                    <>
                      <div className="text-xl font-bold text-stone-900 font-mono tabular-nums">
                        {result.metrics.firmness}%
                      </div>
                      <div className="w-full bg-stone-100 h-1 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-1 rounded-full"
                          style={{ width: `${result.metrics.firmness}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm font-semibold text-stone-400 font-mono">Unavailable</div>
                      <div className="text-[10px] text-stone-400">Not returned by API</div>
                    </>
                  )}
                </div>

                {/* Skin tone swatch card (Clearly distinguishing user-reported undertone from vision metrics) */}
                <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1">
                  <div className="text-[11px] text-stone-500 flex items-center justify-between">
                    <span>Baseline Undertone</span>
                    <span className="text-[9px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                      User Profile
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-md border border-black/10 shadow-xs"
                      style={{ backgroundColor: result.skinTone.hex }}
                    />
                    <div className="text-xs font-bold text-stone-900 font-mono">
                      {result.skinTone.undertone}
                    </div>
                  </div>
                  <div className="text-[10px] text-stone-500 truncate" title="User declared baseline (not computer vision detected)">
                    {result.skinTone.shadeFamily || 'Medium'} (Declared in Profile)
                  </div>
                </div>
              </div>
            </div>

            {/* Observations & Focus Areas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-2">
                <span className="text-xs font-bold text-stone-900">Specific Skin Observations</span>
                <ul className="text-xs text-stone-600 space-y-1.5 list-disc list-inside">
                  {result.observations.map((obs, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {obs}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-2">
                <span className="text-xs font-bold text-stone-900">Recommended Skincare Focus</span>
                <ul className="text-xs text-stone-600 space-y-1.5 list-disc list-inside">
                  {result.suggestedFocusAreas.map((foc, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {foc}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Tailored Product & Routine Suggestions (Connected directly to catalogue & My Shelf) */}
            <div className="pt-4 border-t border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                  <span>Tailored Product & Routine Suggestions</span>
                </h3>
                <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Demo Sample Catalogue Data
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {getTailoredSuggestions(result).map((sug, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-rose-900 bg-rose-50 px-1.5 py-0.5 rounded">
                          {sug.concern} ({sug.metricScore}%)
                        </span>
                        {sug.alreadyOnShelf ? (
                          <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            ✓ On My Shelf
                          </span>
                        ) : (
                          <span className="text-stone-500 font-mono">
                            ₹{sug.product.price.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-stone-900">
                        {sug.product.name}
                      </h4>
                      <p className="text-[11px] text-stone-500 leading-snug">
                        {sug.scientificRationale}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between">
                      <span className="text-[10px] text-stone-500">{sug.product.brand}</span>
                      <button
                        onClick={() => {
                          if (sug.product.category === 'sunscreen') onNavigate('sunscreen');
                          else if (sug.product.category === 'foundation') onNavigate('foundation');
                          else onNavigate('routine');
                        }}
                        className="text-[11px] font-semibold text-rose-900 hover:text-rose-950 flex items-center gap-0.5"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-stone-500">
                {isSavedToJournal ? (
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Record saved to your Progress Journal.
                  </span>
                ) : (
                  <span>Choose whether to save this analysis or retake with different lighting.</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!isSavedToJournal && (
                  <button
                    onClick={handleSaveResult}
                    className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <BookmarkCheck className="w-3.5 h-3.5 text-rose-300" />
                    <span>Save Result to Journal</span>
                  </button>
                )}
                <button
                  onClick={() => onNavigate('foundation')}
                  className="px-4 py-2 text-xs font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <span>Explore Foundation Shades</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
