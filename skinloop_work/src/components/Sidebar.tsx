import React from 'react';
import {
  LayoutDashboard,
  ScanFace,
  Sparkles,
  Palette,
  Sun,
  Archive,
  CalendarCheck,
  MessageSquareHeart,
  TrendingUp,
  BookmarkCheck,
  Settings,
  X,
  ShieldCheck,
  ShieldAlert,
  Wind,
  FileText,
  FlaskConical,
  ShoppingCart,
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  shelfCount: number;
  routinePendingCount: number;
  youCamStatus: 'live' | 'test_simulation';
  onOpenReport?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
  shelfCount,
  routinePendingCount,
  youCamStatus,
  onOpenReport,
}) => {
  const navItems = [
    {
      group: 'Flagship Innovation',
      items: [
        { id: 'experiments', label: 'Skin Experiment Lab', icon: FlaskConical, badge: 'Flagship' },
        { id: 'triggers', label: 'Skin Trigger Detective', icon: Sparkles },
        { id: 'simulator', label: 'Purchase Simulator', icon: ShoppingCart },
      ],
    },
    {
      group: 'Core Beauty Intelligence',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'analysis', label: 'AI Skin Analysis', icon: ScanFace },
        { id: 'ingredients', label: 'Ingredient Checker', icon: ShieldAlert },
        { id: 'weather', label: 'Weather, UV & AQI', icon: Wind },
        { id: 'sunscreen-guide', label: 'AR Sunscreen Guide', icon: Sun },
        { id: 'foundation', label: 'Foundation & Concealer', icon: Sparkles },
        { id: 'makeup', label: 'Makeup Studio', icon: Palette },
        { id: 'sunscreen', label: 'Skincare & SPF Store', icon: Sun },
      ],
    },
    {
      group: 'Care & Collection',
      items: [
        {
          id: 'shelf',
          label: 'My Shelf',
          icon: Archive,
          badge: shelfCount > 0 ? `${shelfCount}` : undefined,
        },
        {
          id: 'routine',
          label: 'Personal Routine',
          icon: CalendarCheck,
          badge: routinePendingCount > 0 ? `${routinePendingCount} left` : undefined,
          badgeAlert: routinePendingCount > 0,
        },
        { id: 'companion', label: 'AI Beauty Companion', icon: MessageSquareHeart },
        { id: 'journal', label: 'Progress Journal', icon: TrendingUp },
        { id: 'budget', label: 'Favorites & Budget', icon: BookmarkCheck },
      ],
    },
    {
      group: 'System & Reports',
      items: [
        { id: 'settings', label: 'Settings & Privacy', icon: Settings },
      ],
    },
  ];

  const handleSelect = (viewId: string) => {
    onNavigate(viewId);
    onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full py-5 px-3">
      {/* Brand Sub-header in mobile */}
      <div className="flex items-center justify-between px-3 mb-5 lg:hidden">
        <span className="font-serif font-bold text-lg text-stone-900">SkinLoop AI</span>
        <button
          onClick={onCloseMobile}
          className="p-1.5 text-stone-500 hover:text-stone-800 rounded-md"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav groups */}
      <div className="flex-1 space-y-6 overflow-y-auto pr-1">
        {navItems.map((group) => (
          <div key={group.group}>
            <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-600">
              {group.group}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap text-left ${
                      isActive
                        ? 'bg-stone-900 text-stone-50 font-semibold shadow-xs'
                        : 'text-stone-600 hover:bg-stone-200/50 hover:text-stone-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-rose-200' : 'text-stone-600'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badgeAlert
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* PDF Dossier & YouCam Integration Status Badge in Sidebar Footer */}
      <div className="mt-auto pt-4 border-t border-stone-200/70 px-2 space-y-2">
        {onOpenReport && (
          <button
            onClick={onOpenReport}
            className="w-full p-2.5 rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition-colors text-left flex items-center justify-between text-xs font-semibold shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-rose-300" />
              <span>Export PDF Report</span>
            </div>
            <span className="text-[10px] text-stone-300 font-normal">Printable</span>
          </button>
        )}
        <button
          onClick={() => handleSelect('settings')}
          className="w-full p-2.5 rounded-lg bg-stone-100/80 hover:bg-stone-200/60 transition-colors text-left flex items-start gap-2.5 border border-stone-200/50"
        >
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-stone-700" />
          <div className="min-w-0 text-[11px]">
            <div className="font-semibold text-stone-800">
              Privacy & Settings
            </div>
            <div className="text-stone-600 truncate text-[10px]">
              Preferences & on-device data
            </div>
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-stone-200/80 bg-[#FAF8F5] min-h-[calc(100vh-61px)]">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-full bg-[#FAF8F5] shadow-xl z-10 flex flex-col">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
