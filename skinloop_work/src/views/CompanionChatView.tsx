import React, { useState, useRef, useEffect } from 'react';
import {
  UserProfile,
  BeautyChatMessage,
  RoutineStep,
  ShelfProduct,
  SkinAnalysisRecord,
  Product,
  ActionProposal,
  CandidateShade,
  SavedLook,
} from '../types';
import { StorageService } from '../services/storage';
import {
  Sparkles,
  Send,
  Bot,
  User,
  ShieldCheck,
  RefreshCw,
  Plus,
  Heart,
  CheckCircle2,
  XCircle,
  Tag,
  ShoppingBag,
  ExternalLink,
  Info,
  DollarSign,
  AlertTriangle,
  Layers,
  ArrowRight,
  Palette,
  Check,
} from 'lucide-react';

interface CompanionChatViewProps {
  profile: UserProfile;
  routine: RoutineStep[];
  shelf: ShelfProduct[];
  latestAnalysis?: SkinAnalysisRecord;
  onNavigate: (view: string) => void;
  onAddToShelf?: (product: ShelfProduct) => void;
  onToggleFavorite?: (productId: string) => void;
  onSaveRoutine?: (newRoutine: RoutineStep[]) => void;
}

const DEFAULT_SUGGESTED_CHIPS = [
  'Evaluate my morning routine order',
  'Check my active skin experiment progress',
  'What foundation matches my undertone?',
  'Suggest a budget look for office',
  'Recommend daily SPF 50+ sunscreen',
  'Check my shelf duplicates',
  'How much can I save with My Shelf?',
];

function buildInitialWelcomeMessage(profile: UserProfile, shelfCount: number): BeautyChatMessage {
  return {
    id: 'msg-init-welcome',
    sender: 'assistant',
    text: `Hello ${profile.name || 'there'}! I am your **SkinLoop AI Beauty Companion**.\n\nI am dynamically synced with your **${profile.skinType}** profile, **${profile.undertone || 'Warm'}** undertone preference, declared monthly budget (**₹${profile.monthlyBudget.toLocaleString('en-IN')}**), and the **${shelfCount}** products currently logged in **My Shelf**.\n\nI can help you review ingredient interactions, generate occasion makeup looks, detect shelf duplicates before you buy, or guide your foundation shade selection. What would you like to explore today?`,
    timestamp: new Date().toISOString(),
    suggestedFollowUps: DEFAULT_SUGGESTED_CHIPS.slice(0, 4),
    mode: 'deterministic',
  };
}

export const CompanionChatView: React.FC<CompanionChatViewProps> = ({
  profile,
  routine,
  shelf,
  latestAnalysis,
  onNavigate,
  onAddToShelf,
  onToggleFavorite,
  onSaveRoutine,
}) => {
  const [messages, setMessages] = useState<BeautyChatMessage[]>(() => [
    buildInitialWelcomeMessage(profile, shelf.length),
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<{
    isConfigured: boolean;
    model: string;
    mode: 'gemini' | 'deterministic';
    message: string;
  }>({
    isConfigured: false,
    model: 'gemini-2.5-flash',
    mode: 'deterministic',
    message: 'Checking server AI status...',
  });

  const [appliedProposals, setAppliedProposals] = useState<Record<string, 'applied' | 'dismissed'>>({});
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Check API configuration on mount
  useEffect(() => {
    fetch('/api/companion/status')
      .then((res) => res.json())
      .then((data) => {
        setApiStatus(data);
      })
      .catch((err) => {
        console.warn('Could not query companion status:', err);
      });
  }, []);

  // Handle New Chat reset
  const handleNewChat = () => {
    setMessages([buildInitialWelcomeMessage(profile, shelf.length)]);
    setInputText('');
    setErrorBanner(null);
  };

  // Handle Send Message
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    setErrorBanner(null);
    const userMessage: BeautyChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/companion/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          conversationHistory: messages.map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
          userContext: {
            profile,
            shelf,
            routine,
            latestAnalysis,
            savedLooks: StorageService.getSavedLooks(),
            shadeCandidates: StorageService.getCandidateShades(),
            experiments: StorageService.getExperiments(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: BeautyChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: data.text || "I'm here to support your skincare routine and product choices!",
        timestamp: new Date().toISOString(),
        suggestedFollowUps: data.suggestedFollowUps,
        recommendedProducts: data.recommendedProducts || [],
        proposals: data.proposals || [],
        mode: data.mode || (apiStatus.isConfigured ? 'gemini' : 'deterministic'),
        disclaimer: data.disclaimer,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Companion request error:', err);
      setErrorBanner('Network error reaching the advisory service. You can retry your query.');
      const fallbackMessage: BeautyChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text:
          "I experienced a temporary connection hiccup reaching the advisory server. In the meantime, remember the fundamental rule: Gentle Cleanse → Hydrating Serum → Barrier Cream → Daily SPF 50+. Would you like to try again or inspect your shelf?",
        timestamp: new Date().toISOString(),
        mode: 'deterministic',
        suggestedFollowUps: ['Retry inquiry', 'Check my shelf duplicates', 'Suggest a budget look'],
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Direct Action: Add Product to Shelf
  const handleDirectAddToShelf = (product: Product) => {
    const shelfItem: ShelfProduct = {
      id: `shelf-${Date.now()}`,
      name: product.name,
      brand: product.brand,
      category: product.category,
      openedDate: new Date().toISOString().split('T')[0],
      verifiedIngredients: product.verifiedIngredients || [],
      purchasePrice: product.price,
      remainingPercent: 100,
      notes: `Added from AI Companion recommendation (${product.catalogueStatus})`,
    };

    if (onAddToShelf) {
      onAddToShelf(shelfItem);
    } else {
      StorageService.addToShelf(shelfItem);
    }
    alert(`Added "${product.name}" to My Shelf!`);
  };

  // Proposal Confirmation: User explicitly approves and applies a state change
  const handleApproveProposal = (proposal: ActionProposal) => {
    const { type, previewData } = proposal;

    if (type === 'add_to_shelf' && previewData.productName) {
      const shelfItem: ShelfProduct = {
        id: `shelf-${Date.now()}`,
        name: previewData.productName,
        brand: previewData.brand || 'Demo Brand',
        category: previewData.category || 'skincare',
        openedDate: new Date().toISOString().split('T')[0],
        verifiedIngredients: [],
        purchasePrice: previewData.price || 0,
        remainingPercent: 100,
        notes: `Added via AI Companion proposal (${proposal.title})`,
      };
      if (onAddToShelf) {
        onAddToShelf(shelfItem);
      } else {
        StorageService.addToShelf(shelfItem);
      }
    } else if (type === 'save_favorite' && previewData.productId) {
      if (onToggleFavorite) {
        onToggleFavorite(previewData.productId);
      } else {
        StorageService.toggleFavorite(previewData.productId);
      }
    } else if (type === 'save_shade_candidate' && previewData.shade) {
      const candidate: CandidateShade = {
        id: `cand-${Date.now()}`,
        brand: previewData.brand || 'Beauty Brand',
        productName: previewData.productName || 'Foundation',
        shadeName: previewData.shade,
        hex: previewData.hex || '#E4BF9F',
        undertone: (previewData.undertone as any) || 'Warm',
        shadeFamily: 'Medium',
        description: `Candidate shade saved from AI Companion`,
        tentativeNote: 'Tentative match based on declared undertone. Verify in daylight before purchasing.',
        savedAt: new Date().toISOString(),
      };
      StorageService.addCandidateShade(candidate);
    } else if (type === 'save_look' && previewData.look) {
      const lookData = previewData.look;
      const newLook: SavedLook = {
        id: `look-${Date.now()}`,
        name: lookData.name,
        occasion: lookData.occasion,
        lookDescription: `Curated by AI Companion for ${lookData.occasion}`,
        productIds: lookData.productIds,
        totalEstimatedPrice: lookData.totalEstimatedPrice,
        currency: '₹',
        createdAt: new Date().toISOString(),
      };
      StorageService.saveLook(newLook);
    } else if (type === 'modify_routine' && previewData.routineStep) {
      const step = previewData.routineStep;
      const newStep: RoutineStep = {
        id: `rt-${Date.now()}`,
        routineType: step.routineType,
        stepOrder: routine.filter((r) => r.routineType === step.routineType).length + 1,
        stepName: step.stepName,
        purpose: step.purpose,
        completedToday: false,
      };
      const updated = [...routine, newStep];
      if (onSaveRoutine) {
        onSaveRoutine(updated);
      } else {
        StorageService.saveRoutine(updated);
      }
    }

    setAppliedProposals((prev) => ({ ...prev, [proposal.id]: 'applied' }));
  };

  const handleDismissProposal = (proposalId: string) => {
    setAppliedProposals((prev) => ({ ...prev, [proposalId]: 'dismissed' }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-16">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full mb-1">
            <Sparkles className="w-3 h-3 text-rose-600" />
            <span>AI Beauty Advisor</span>
            <span>·</span>
            <span>Grounded in My Shelf & Catalogue</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            SkinLoop AI Beauty Companion
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm mt-1 leading-relaxed">
            Understand ingredients, build occasion looks within your ₹{profile.monthlyBudget.toLocaleString('en-IN')} budget, and prevent duplicate purchases using products you already own.
          </p>
        </div>

        <button
          onClick={handleNewChat}
          className="self-start sm:self-center px-3.5 py-2 text-xs font-medium rounded-xl border border-stone-200 text-stone-700 bg-stone-50 hover:bg-stone-100 transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Mode Transparency Badge */}
      <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs flex flex-wrap items-center justify-between gap-2 text-stone-600">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              apiStatus.isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span className="font-semibold text-stone-900">
            {apiStatus.isConfigured ? 'Live Gemini AI' : 'Deterministic Beauty Engine'}
          </span>
          <span>·</span>
          <span>
            {apiStatus.isConfigured
              ? 'Model: gemini-2.5-flash'
              : 'Backed by typed catalogue rules and your profile'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-stone-500">
          <span>Shelf: <strong>{shelf.length}</strong> items</span>
          <span>·</span>
          <span>Budget: <strong>₹{profile.monthlyBudget.toLocaleString('en-IN')}</strong></span>
        </div>
      </div>

      {/* Error Banner if any */}
      {errorBanner && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorBanner}</span>
          </div>
          <button
            onClick={() => handleSendMessage()}
            className="text-xs font-semibold underline hover:text-rose-950"
          >
            Retry
          </button>
        </div>
      )}

      {/* Chat Window Container */}
      <div className="bg-white rounded-2xl border border-stone-200 flex flex-col h-[600px] shadow-sm overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isUser
                      ? 'bg-stone-900 text-white'
                      : 'bg-rose-100 text-rose-900 font-serif font-bold text-xs shadow-xs'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble Content */}
                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                    isUser
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-[#FAF8F5] border border-stone-200/80 text-stone-800'
                  }`}
                >
                  {/* Text Body */}
                  <div className="whitespace-pre-line space-y-2">
                    {msg.text.split('\n\n').map((paragraph, pIdx) => {
                      if (paragraph.startsWith('### ')) {
                        return (
                          <h4 key={pIdx} className="font-serif font-bold text-sm text-stone-900 pt-1">
                            {paragraph.replace('### ', '')}
                          </h4>
                        );
                      }
                      return <p key={pIdx}>{paragraph}</p>;
                    })}
                  </div>

                  {/* Mode / Engine Disclaimer if provided */}
                  {msg.disclaimer && (
                    <div className="p-2 bg-amber-50/70 border border-amber-200/60 rounded-lg text-[11px] text-amber-900 flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{msg.disclaimer}</span>
                    </div>
                  )}

                  {/* Recommended Products Cards */}
                  {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-stone-200/70">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                          Recommended Products ({msg.recommendedProducts.length})
                        </span>
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          Demo Sample Catalogue Data
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {msg.recommendedProducts.map((prod) => (
                          <div
                            key={prod.id}
                            className="bg-white border border-stone-200 rounded-xl p-3 flex flex-col justify-between shadow-2xs hover:border-stone-300 transition-colors"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[10px] text-stone-500">
                                <span className="font-medium text-stone-700">{prod.brand}</span>
                                <span className="capitalize">{prod.category}</span>
                              </div>
                              <h5 className="font-semibold text-stone-900 text-xs line-clamp-1">
                                {prod.name}
                              </h5>
                              <div className="text-sm font-bold text-stone-900">
                                ₹{prod.price.toLocaleString('en-IN')}
                              </div>
                              {prod.finish && (
                                <div className="text-[10px] text-stone-600">
                                  Finish: <strong className="capitalize">{prod.finish}</strong>
                                  {prod.coverage ? ` · ${prod.coverage} coverage` : ''}
                                </div>
                              )}
                              {prod.fragranceFree !== undefined && (
                                <div className="text-[10px] text-emerald-700">
                                  {prod.fragranceFree ? '✓ 100% Fragrance-Free' : 'Contains mild fragrance'}
                                </div>
                              )}
                            </div>

                            <div className="pt-2.5 mt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                              <button
                                onClick={() => handleDirectAddToShelf(prod)}
                                className="px-2.5 py-1 text-[11px] font-medium bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add to Shelf</span>
                              </button>
                              <button
                                onClick={() => {
                                  if (prod.category === 'sunscreen') onNavigate('sunscreen');
                                  else if (prod.category === 'foundation') onNavigate('foundation');
                                  else onNavigate('makeup');
                                }}
                                className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-0.5"
                              >
                                <span>View</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Proposals (Requires user confirmation before modifying persistent storage) */}
                  {msg.proposals && msg.proposals.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-stone-200/70">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-900 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-rose-600" />
                        <span>Action Proposal (Requires Confirmation)</span>
                      </span>

                      {msg.proposals.map((proposal) => {
                        const status = appliedProposals[proposal.id] || proposal.status;

                        if (status === 'applied') {
                          return (
                            <div
                              key={proposal.id}
                              className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <div>
                                <strong className="font-semibold">Applied: </strong>
                                <span>{proposal.title} has been successfully confirmed and saved to storage.</span>
                              </div>
                            </div>
                          );
                        }

                        if (status === 'dismissed') {
                          return (
                            <div
                              key={proposal.id}
                              className="p-2.5 bg-stone-100/60 border border-stone-200 rounded-xl text-[11px] text-stone-500 flex items-center justify-between"
                            >
                              <span>Proposal dismissed ({proposal.title})</span>
                              <button
                                onClick={() => handleApproveProposal(proposal)}
                                className="text-rose-700 font-semibold underline hover:text-rose-900 ml-2"
                              >
                                Re-open
                              </button>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={proposal.id}
                            className="bg-white border-2 border-rose-200/80 rounded-xl p-3 space-y-2 shadow-xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h5 className="font-semibold text-stone-900 text-xs">
                                  {proposal.title}
                                </h5>
                                <p className="text-[11px] text-stone-600 mt-0.5">
                                  {proposal.description}
                                </p>
                              </div>
                              <span className="text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 shrink-0">
                                Proposal
                              </span>
                            </div>

                            {/* Preview details */}
                            <div className="p-2 bg-stone-50 rounded-lg text-[11px] text-stone-700 space-y-1">
                              {proposal.previewData.productName && (
                                <div>
                                  Product: <strong>{proposal.previewData.productName}</strong> (
                                  {proposal.previewData.brand}
                                  {proposal.previewData.price
                                    ? ` · ₹${proposal.previewData.price.toLocaleString('en-IN')}`
                                    : ''}
                                  )
                                </div>
                              )}
                              {proposal.previewData.shade && (
                                <div className="flex items-center gap-1.5">
                                  <span>Candidate Shade:</span>
                                  <span
                                    className="w-3 h-3 rounded-full border border-stone-300"
                                    style={{ backgroundColor: proposal.previewData.hex || '#E4BF9F' }}
                                  />
                                  <strong>{proposal.previewData.shade}</strong>
                                  <span>({proposal.previewData.undertone || 'Warm'} undertone)</span>
                                </div>
                              )}
                              {proposal.previewData.look && (
                                <div>
                                  Look: <strong>{proposal.previewData.look.name}</strong> (
                                  {proposal.previewData.look.productIds.length} items, Total: ₹
                                  {proposal.previewData.look.totalEstimatedPrice.toLocaleString('en-IN')})
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-1">
                              <button
                                onClick={() => handleDismissProposal(proposal.id)}
                                className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 font-medium rounded-lg hover:bg-stone-100 transition-colors"
                              >
                                Dismiss
                              </button>
                              <button
                                onClick={() => handleApproveProposal(proposal)}
                                className="px-3 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve & Apply</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Suggested Follow-up Inquiries */}
                  {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="pt-2 border-t border-stone-200/80 space-y-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 block">
                        Quick Inquiries:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedFollowUps.map((prompt) => (
                          <button
                            key={prompt}
                            onClick={() => handleSendMessage(prompt)}
                            className="px-2.5 py-1 text-[11px] rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 hover:border-stone-300 transition-colors text-left shadow-2xs"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div
                    className={`text-[10px] pt-1 ${
                      isUser ? 'text-stone-300 text-right' : 'text-stone-400'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-900 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 text-xs text-stone-600 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-stone-700" />
                <span>Consulting your profile, shelf, and catalogue records...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompt Chips Bar (Above Input) */}
        <div className="px-4 py-2 border-t border-stone-100 bg-stone-50/70 overflow-x-auto flex items-center gap-2 scrollbar-none">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 shrink-0">
            Suggested:
          </span>
          {DEFAULT_SUGGESTED_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => handleSendMessage(chip)}
              className="px-2.5 py-1 text-[11px] rounded-full bg-white border border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors shrink-0 whitespace-nowrap shadow-2xs"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-stone-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about your routine order, shelf duplicates, foundation match, or budget looks..."
              className="flex-1 px-4 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-900"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
              aria-label="Send message"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-stone-400 pt-2 px-1">
            <span>Non-medical guidance · Prioritizes owned products · Real sample catalogue prices in ₹</span>
            <span>{apiStatus.isConfigured ? 'Gemini 2.5 Flash' : 'Deterministic Engine'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
