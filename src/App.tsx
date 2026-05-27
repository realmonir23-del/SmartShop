import React, { useState } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { translations } from './translations';

// Import Views
import { DashboardView } from './components/DashboardView';
import { ProductsView } from './components/ProductsView';
import { POSView } from './components/POSView';
import { CustomersView } from './components/CustomersView';
import { StaffView } from './components/StaffView';
import { AccountingView } from './components/AccountingView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';

// Icons
import { 
  TrendingUp, 
  ShoppingBag, 
  Calculator, 
  Users, 
  UserCheck, 
  DollarSign, 
  BarChart3, 
  Settings, 
  Sun, 
  Moon, 
  Globe, 
  Menu, 
  X, 
  Building2 
} from 'lucide-react';

const HishabProAppContent: React.FC = () => {
  const { 
    lang, 
    setLang, 
    theme, 
    toggleTheme, 
    currentUser, 
    setCurrentUser, 
    activeBranch, 
    settings, 
    staff,
    firebaseUser,
    isFirebaseLoading,
    isFirebaseConnected,
    loginWithGoogle,
    logoutFirebase
  } = useShop();

  const t = translations[lang];
  
  // Navigation State
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isUserSwitcherOpen, setIsUserSwitcherOpen] = useState<boolean>(false);

  // Switch tabs helper
  const renderActiveView = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView setCurrentTab={setCurrentTab} />;
      case 'products':
        return <ProductsView />;
      case 'pos':
        return <POSView />;
      case 'customers':
        return <CustomersView />;
      case 'employees':
        return <StaffView />;
      case 'accounting':
        return <AccountingView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView setCurrentTab={setCurrentTab} />;
    }
  };

  // Nav Links List
  const navItems = [
    { id: 'dashboard', label: t.dashboard, icon: TrendingUp },
    { id: 'products', label: t.products, icon: ShoppingBag },
    { id: 'pos', label: t.pos, icon: Calculator },
    { id: 'customers', label: t.customers, icon: Users },
    { id: 'employees', label: t.employees, icon: UserCheck },
    { id: 'accounting', label: t.cashFlow, icon: DollarSign },
    { id: 'reports', label: t.reports, icon: BarChart3 },
    { id: 'settings', label: t.settings, icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-slate-100 flex flex-col md:flex-row antialiased transition-colors duration-200">
      
      {/* 1. Sidebar (Desktop Layout Only) */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-150 dark:border-slate-800 shrink-0 select-none z-10">
        
        {/* Sidebar Header branding */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 rounded-2xl text-white shadow-md">
            <span>📊</span>
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-slate-950 dark:text-white">
              {t.appName}
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.appSub}</p>
          </div>
        </div>

        {/* Navigation lists */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                id={`nav-${item.id}`}
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Firebase Cloud Sync Control panel */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-855/10">
          <div className="rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm select-none">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Cloud Sync (Firebase)
              </span>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                isFirebaseConnected 
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {isFirebaseConnected ? '● Online' : '○ Offline'}
              </span>
            </div>

            {isFirebaseConnected && firebaseUser ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center font-black text-[9px] text-emerald-700 select-none">
                    ☁️
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-extrabold truncate text-slate-700 dark:text-slate-350">
                      {firebaseUser.email}
                    </p>
                    <p className="text-[8px] text-slate-400">
                      Synced in real-time
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  id="firebase-signout"
                  onClick={logoutFirebase}
                  className="w-full py-1.5 px-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-transparent rounded-xl text-[10px] font-black cursor-pointer transition-colors text-center"
                >
                  Disconnect Synchronization
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                  Connect using Google to automatically save inventory and transactions on the cloud in real-time.
                </p>
                <button
                  type="button"
                  id="firebase-signin"
                  onClick={loginWithGoogle}
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/10"
                >
                  <span>🔑</span> Sign In with Google
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Active Cashier Identity Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/20 relative">
          <div 
            onClick={() => setIsUserSwitcherOpen(!isUserSwitcherOpen)}
            className="flex items-center justify-between cursor-pointer group p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-705 transition-all"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-355 font-bold text-xs flex items-center justify-center shrink-0">
                {currentUser ? currentUser.name.substring(0,2).toUpperCase() : '??'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black truncate text-slate-900 dark:text-white leading-tight">
                  {currentUser ? currentUser.name : 'Unknown Cashier'}
                </p>
                <p className="text-[9px] text-slate-400 font-extrabold uppercase mt-0.5 tracking-wider">
                  {currentUser ? (currentUser.role === 'Admin' ? t.admin : currentUser.role === 'Manager' ? t.manager : t.salesperson) : 'Cashier'}
                </p>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 font-mono group-hover:translate-x-0.5 transition-transform">⚙️</span>
          </div>

          {/* Simulated Local Switcher dropdown */}
          {isUserSwitcherOpen && (
            <div className="absolute bottom-16 left-4 right-4 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl p-2 shadow-2xl z-50 animate-fade-in text-xs">
              <span className="block px-2 py-1 text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                Simulate Cashier Role / লগইন পরিবর্তন
              </span>
              <div className="space-y-1 font-sans">
                {staff.map(member => (
                  <button
                    id={`switch-user-${member.id}`}
                    key={member.id}
                    onClick={() => {
                      setCurrentUser(member);
                      setIsUserSwitcherOpen(false);
                      alert(`LoggedIn role altered to: ${member.name}`);
                    }}
                    className={`w-full text-left p-2 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-805 block ${
                      currentUser?.id === member.id ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    👤 {member.name} ({member.role})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* 2. Mobile Nav Header Bar (Top layout on phone screens) */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-150 dark:border-slate-850 z-20">
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <div>
            <h1 className="text-sm font-black text-slate-950 dark:text-white leading-none">
              {t.appName}
            </h1>
            <p className="text-[9px] text-slate-400 font-bold tracking-widest mt-0.5">
              {lang === 'en' ? settings.shopNameEn : settings.shopNameBn}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Fast language swap button on top */}
          <button
            type="button"
            id="mobile-lang-swap"
            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
            className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 rounded-xl"
            title="Switch Language / ভাষা পরিবর্তন"
          >
            <Globe className="w-4 h-4 text-emerald-650" />
          </button>
          
          <button
            type="button"
            id="mobile-menu-hamburger"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-350 rounded-xl"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile expandable Drawer menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-11 p-4 flex flex-col gap-2 shadow-lg animate-slide-down">
          
          {/* Mobile Firebase Sync controller */}
          <div className="rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 p-3 mb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-400">
                Cloud Sync (Firebase)
              </span>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                isFirebaseConnected 
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {isFirebaseConnected ? 'Online' : 'Offline'}
              </span>
            </div>

            {isFirebaseConnected && firebaseUser ? (
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-extrabold truncate text-slate-700 dark:text-slate-350">
                    {firebaseUser.email}
                  </p>
                </div>
                <button
                  type="button"
                  id="mobile-firebase-signout"
                  onClick={logoutFirebase}
                  className="py-1 px-2.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 rounded-lg text-[9px] font-black cursor-pointer"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                type="button"
                id="mobile-firebase-signin"
                onClick={loginWithGoogle}
                className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black cursor-pointer flex items-center justify-center gap-2"
              >
                🔑 Sign In with Google
              </button>
            )}
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                id={`mob-nav-${item.id}`}
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Main Dashboard Workspace Layout Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Workspace global quick toolbar */}
        <div className="hidden md:flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-150 dark:border-slate-850 shrink-0">
          
          {/* Active outlet context label */}
          <div className="flex items-center gap-2 text-xs">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-slate-500">Active Register Outlet:</span>
            <span className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-355 px-2.5 py-1 rounded-full font-black text-[11px]">
              {activeBranch || settings.activeBranch}
            </span>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Top global instant language switcher block */}
            <div className="flex bg-slate-50 dark:bg-slate-805 p-1 rounded-xl border border-slate-100 dark:border-slate-750">
              <button
                id="top-lang-en"
                type="button"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg transition-all ${
                  lang === 'en' 
                    ? 'bg-white dark:bg-slate-750 text-emerald-700 dark:text-emerald-350 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                EN
              </button>
              <button
                id="top-lang-bn"
                type="button"
                onClick={() => setLang('bn')}
                className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg transition-all ${
                  lang === 'bn' 
                    ? 'bg-white dark:bg-slate-750 text-emerald-700 dark:text-emerald-350 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                বাংলা
              </button>
            </div>

            {/* Instant dark brightness toggler */}
            <button
              id="top-theme-toggle"
              type="button"
              onClick={toggleTheme}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
              title="Toggle Theme Display Mode"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Simulated Live status badge */}
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-slate-800/40 px-2.5 py-1 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-650 animate-ping" />
              <span>LIVE</span>
            </div>

          </div>
        </div>

        {/* View render node container workspace */}
        <div className="p-4 md:p-6 lg:p-8 flex-1">
          {renderActiveView()}
        </div>

        {/* Outer credit lines */}
        <footer className="px-6 py-4 text-center border-t border-slate-100 dark:border-slate-850 text-[10px] text-slate-400 dark:text-slate-600 font-medium tracking-wide">
          SmartShop Enterprise SaaS © 2026. Tailored with love for small Bangladeshi retail merchants.
        </footer>

      </main>

    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <HishabProAppContent />
    </ShopProvider>
  );
}
