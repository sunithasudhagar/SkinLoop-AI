import React from 'react';
import { Sparkles, ScanFace, Menu, FileText } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  activeView: string;
  onNavigate: (view: string) => void;
  onOpenMobileMenu: () => void;
  hasAnalysis: boolean;
  onOpenReport?: () => void;
  isDemoAccount?: boolean;
  onLoadDemo?: () => void;
  onResetUser?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onNavigate,
  onOpenMobileMenu,
  hasAnalysis,
  onOpenReport,
  isDemoAccount,
  onLoadDemo,
  onResetUser,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark (single text element wordmark) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-stone-600 hover:text-stone-900 focus:outline-none"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-amber-50 flex items-center justify-center font-serif text-lg font-bold tracking-tighter shadow-xs group-hover:bg-rose-950 transition-colors">
              SL
            </div>
            <span className="text-xl font-bold tracking-tight text-stone-900 font-serif whitespace-nowrap shrink-0">
              SkinLoop AI
            </span>
          </button>
        </div>

        {/* Zone 2: clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors hover:text-stone-900 ${
              activeView === 'dashboard' ? 'text-stone-950 font-semibold border-b-2 border-stone-900' : ''
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onNavigate('analysis')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors hover:text-stone-900 ${
              activeView === 'analysis' ? 'text-stone-950 font-semibold border-b-2 border-stone-900' : ''
            }`}
          >
            Skin Analysis
          </button>
          <button
            onClick={() => onNavigate('ingredients')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors hover:text-stone-900 ${
              activeView === 'ingredients' ? 'text-stone-950 font-semibold border-b-2 border-stone-900' : ''
            }`}
          >
            Ingredient Checker
          </button>
          <button
            onClick={() => onNavigate('weather')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors hover:text-stone-900 ${
              activeView === 'weather' ? 'text-stone-950 font-semibold border-b-2 border-stone-900' : ''
            }`}
          >
            Weather & UV
          </button>
          <button
            onClick={() => onNavigate('sunscreen-guide')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors hover:text-stone-900 ${
              activeView === 'sunscreen-guide' ? 'text-stone-950 font-semibold border-b-2 border-stone-900' : ''
            }`}
          >
            AR Sunscreen Guide
          </button>
          <button
            onClick={() => onNavigate('experiments')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors hover:text-stone-900 ${
              activeView === 'experiments' ? 'text-stone-950 font-semibold border-b-2 border-stone-900' : ''
            }`}
          >
            Experiment Lab
          </button>
          <button
            onClick={() => onNavigate('triggers')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors hover:text-stone-900 ${
              activeView === 'triggers' ? 'text-stone-950 font-semibold border-b-2 border-stone-900' : ''
            }`}
          >
            Triggers
          </button>
          <button
            onClick={() => onNavigate('simulator')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors hover:text-stone-900 ${
              activeView === 'simulator' ? 'text-stone-950 font-semibold border-b-2 border-stone-900' : ''
            }`}
          >
            Purchase Simulator
          </button>
          <button
            onClick={() => onNavigate('routine')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors hover:text-stone-900 ${
              activeView === 'routine' ? 'text-stone-950 font-semibold border-b-2 border-stone-900' : ''
            }`}
          >
            My Routine
          </button>
        </nav>

        {/* Zone 3: Demo Indicator + PWA Install + PDF Export + Primary Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          {isDemoAccount ? (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Demo Account</span>
              {onResetUser && (
                <button
                  type="button"
                  onClick={onResetUser}
                  className="ml-1 text-[11px] underline text-amber-800 hover:text-amber-950 font-normal cursor-pointer"
                  title="Reset to fresh new user"
                >
                  Reset
                </button>
              )}
            </div>
          ) : (
            onLoadDemo && (
              <button
                type="button"
                onClick={onLoadDemo}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-lg transition-colors cursor-pointer"
                title="Load sample demo account data for hackathon evaluation"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>Load Demo</span>
              </button>
            )
          )}
          <PWAInstallButton />
          {onOpenReport && (
            <button
              onClick={onOpenReport}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors border border-stone-200"
              title="Generate printable PDF skin report"
            >
              <FileText className="w-3.5 h-3.5 text-stone-600" />
              <span>PDF Report</span>
            </button>
          )}
          <button
            onClick={() => onNavigate('analysis')}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-wide text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors shadow-xs whitespace-nowrap shrink-0"
          >
            <ScanFace className="w-3.5 h-3.5" />
            <span>{hasAnalysis ? 'New Skin Scan' : 'Analyze Skin'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

