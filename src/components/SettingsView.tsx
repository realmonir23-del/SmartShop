import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { translations } from '../translations';
import { 
  Settings, 
  Globe, 
  Moon, 
  Sun, 
  Database, 
  MapPin, 
  Building2, 
  Plus, 
  Check, 
  Save, 
  Smartphone 
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { 
    lang, 
    setLang, 
    theme, 
    toggleTheme, 
    settings, 
    updateSettings, 
    backupData, 
    restoreData,
    startOver
  } = useShop();
  const t = translations[lang];

  const [isConfirmingStartOver, setIsConfirmingStartOver] = useState(false);

  // Forms editable states
  const [shopNameEn, setShopNameEn] = useState(settings.shopNameEn);
  const [shopNameBn, setShopNameBn] = useState(settings.shopNameBn);
  const [addressEn, setAddressEn] = useState(settings.addressEn);
  const [addressBn, setAddressBn] = useState(settings.addressBn);
  const [phone, setPhone] = useState(settings.phone);
  const [vatRate, setVatRate] = useState(settings.vatRate.toString());
  const [newBranch, setNewBranch] = useState('');

  const [activeBranch, setActiveBranchState] = useState(settings.activeBranch);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      shopNameEn,
      shopNameBn,
      addressEn,
      addressBn,
      phone,
      vatRate: Number(vatRate) || 0,
      currency: "৳",
      branches: settings.branches,
      activeBranch
    });
    alert(t.saveSuccess + " / সেটিংস সংরক্ষিত হয়েছে!");
  };

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranch.trim()) return;
    if (settings.branches.includes(newBranch.trim())) return;

    updateSettings({
      ...settings,
      branches: [...settings.branches, newBranch.trim()]
    });
    setNewBranch('');
    alert(lang === 'en' ? 'New Outlet Branch added!' : 'নতুন আউটলেট শাখা সফলভাবে যুক্ত করা হয়েছে!');
  };

  const handleBackupNow = () => {
    backupData();
    alert(t.backupSuccess);
  };

  const handleRestoreNow = () => {
    const raw = localStorage.getItem('hp_master_backup');
    if (!raw) {
      alert(lang === 'en' ? 'No backup file found in local store!' : 'কোনো ব্যাকআপ ফাইল খুঁজে পাওয়া যায়নি!');
      return;
    }
    restoreData();
    // Force soft refresh of input states
    const curSettings = JSON.parse(raw).settings;
    if (curSettings) {
      setShopNameEn(curSettings.shopNameEn);
      setShopNameBn(curSettings.shopNameBn);
      setAddressEn(curSettings.addressEn);
      setAddressBn(curSettings.addressBn);
      setPhone(curSettings.phone);
      setVatRate(curSettings.vatRate.toString());
      setActiveBranchState(curSettings.activeBranch);
    }
    alert(t.restoreSuccess);
  };

  const handleStartOver = async () => {
    if (!isConfirmingStartOver) {
      setIsConfirmingStartOver(true);
      return;
    }
    await startOver();
    setIsConfirmingStartOver(false);
    
    // Wipe form fields to match INITIAL_SETTINGS
    setShopNameEn("My Retail Shop");
    setShopNameBn("আমার রিটেল শপ");
    setAddressEn("Dhaka, Bangladesh");
    setAddressBn("ঢাকা, বাংলাদেশ");
    setPhone("01700000000");
    setVatRate("0");
    setActiveBranchState("Main Outlet Branch");
    
    alert(lang === 'en' ? "Application reset complete! Restarting clean." : "অ্যাপ্লিকেশন সম্পূর্ণ রিসেট সম্পন্ন হয়েছে!");
  };

  return (
    <div className="space-y-6" id="settings-view">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="p-3 bg-emerald-50 dark:bg-emerald-950/45 text-emerald-600 rounded-2xl">
            <Settings className="w-6 h-6 animate-spin-slow" />
          </span>
          <div>
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
              {t.systemSettings}
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Configure localization, dark visual modes, ledger synchronization and outlets
            </p>
          </div>
        </div>
      </div>

      {/* Grid: 3 Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. Localization & Theme Settings (Left) */}
        <div className="space-y-6">
          
          {/* L10N (EN/BN Selector) & Display Theme */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-5">
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-405 mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                Language Selector / ভাষা পরিবর্তন
              </h4>
              <p className="text-xs text-slate-400 mb-3">
                Toggle all menus, calculations, receipt formats and operations seamlessly
              </p>
              
              <div className="grid grid-cols-2 gap-3" id="lang-switcher">
                <button
                  type="button"
                  id="lang-en-btn"
                  onClick={() => setLang('en')}
                  className={`flex items-center justify-center gap-2 py-3 border rounded-2xl text-xs font-bold transition-all ${
                    lang === 'en'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-705 text-slate-700 dark:text-slate-350 hover:bg-slate-100'
                  }`}
                >
                  <Check className={`w-4 h-4 ${lang === 'en' ? 'opacity-100' : 'opacity-0'}`} />
                  {t.enLang}
                </button>
                <button
                  type="button"
                  id="lang-bn-btn"
                  onClick={() => setLang('bn')}
                  className={`flex items-center justify-center gap-2 py-3 border rounded-2xl text-xs font-bold transition-all ${
                    lang === 'bn'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-705 text-slate-700 dark:text-slate-350 hover:bg-slate-100'
                  }`}
                >
                  <Check className={`w-4 h-4 ${lang === 'bn' ? 'opacity-100' : 'opacity-0'}`} />
                  {t.bnLang}
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-405 mb-3 flex items-center gap-2">
                {theme === 'dark' ? <Moon className="w-4 h-4 text-purple-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                {t.themeMode}
              </h4>
              <button
                type="button"
                id="theme-toggle-btn"
                onClick={toggleTheme}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-805 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-150 dark:border-slate-750 rounded-2xl text-xs font-bold transition-all"
              >
                <div className="text-left">
                  <span className="text-slate-800 dark:text-slate-200 block">
                    {theme === 'dark' ? t.darkMode : t.lightMode}
                  </span>
                  <span className="text-[10px] text-slate-450 normal-case font-medium">
                    {theme === 'dark' ? 'Optimal for late evening checkout fatigue' : 'Bright interface for daytime storefront cashiers'}
                  </span>
                </div>
                {theme === 'dark' ? (
                  <span className="p-2 bg-purple-950/45 text-purple-400 rounded-xl">
                    <Moon className="w-4 h-4" />
                  </span>
                ) : (
                  <span className="p-2 bg-amber-50 text-amber-500 rounded-xl">
                    <Sun className="w-4 h-4" />
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Backup Restores Options */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-405 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              {t.backupRestore}
            </h4>
            <p className="text-xs text-slate-400">
              Preserve all registers, customers profiles, attendance details, and inventory history locally and fetch them upon reboot.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                id="do-backup-btn"
                onClick={handleBackupNow}
                className="py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-803 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all"
              >
                <span>💾</span>
                {t.backupNow}
              </button>
              <button
                type="button"
                id="do-restore-btn"
                onClick={handleRestoreNow}
                className="py-3 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all"
              >
                <span>⚡</span>
                {t.restoreNow}
              </button>
            </div>
          </div>

          {/* Danger Zone Start Over */}
          <div className="bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-955/20 rounded-3xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-rose-500 flex items-center gap-2">
              <span>🚨</span>
              {lang === 'en' ? 'Danger Zone / System Control' : 'ডেঞ্জার জোন / নিয়ন্ত্রণ প্যানেল'}
            </h4>
            <p className="text-xs text-slate-400">
              {lang === 'en' 
                ? 'Wipe out all created products, sales transactions, expense lists, and custom profiles to start completely fresh.'
                : 'সব তৈরি করা প্রোডাক্ট, কাস্টমার, বিক্রয়ের তথ্য এবং খরচের খাতা মুছে সম্পূর্ণ নতুন একটি ডেটাবেজ দিয়ে শুরু করুন।'}
            </p>

            <div className="space-y-2">
              <button
                type="button"
                id="startover-reset-btn"
                onClick={handleStartOver}
                className={`w-full py-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  isConfirmingStartOver 
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm ring-2 ring-rose-600/50' 
                    : 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-455 border border-rose-200 dark:border-rose-905/40'
                }`}
              >
                <span>♻️</span>
                {isConfirmingStartOver 
                  ? (lang === 'en' ? '⚠️ CLICK AGAIN TO WIPE ALL DATA!' : '⚠️ সব মুছে দিতে পুনরায় ক্লিক করুন!')
                  : (lang === 'en' ? 'Start Over / Reset Application' : 'সব রিসেট করুন / নতুন করে শুরু করুন')}
              </button>
              {isConfirmingStartOver && (
                <button
                  type="button"
                  id="cancel-reset-btn"
                  className="w-full text-center text-[10px] text-slate-400 font-medium underline block cursor-pointer py-1"
                  onClick={() => setIsConfirmingStartOver(false)}
                >
                  {lang === 'en' ? 'Cancel' : 'বাতিল করুন'}
                </button>
              )}
            </div>
          </div>

        </div>

        {/* 2. Shop Configuration Form Settings (Right) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-405 mb-4 flex items-center gap-2">
            <span>🏪</span>
            Store Configuration Profile Details
          </h4>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 font-bold mb-1">Shop Name En (ইংরেজি) *</label>
                <input
                  id="set-shop-en"
                  type="text"
                  required
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-emerald-500 font-bold"
                  value={shopNameEn}
                  onChange={(e) => setShopNameEn(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1">Shop Name Bn (বাংলা) *</label>
                <input
                  id="set-shop-bn"
                  type="text"
                  required
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-emerald-500 font-bold"
                  value={shopNameBn}
                  onChange={(e) => setShopNameBn(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 font-bold mb-1">{t.phone} *</label>
                <input
                  id="set-phone"
                  type="text"
                  required
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-emerald-500 font-semibold"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1">VAT/Tax Percentage (%)</label>
                <input
                  id="set-vat"
                  type="number"
                  min="0"
                  max="50"
                  required
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-emerald-500 font-bold"
                  value={vatRate}
                  onChange={(e) => setVatRate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-500 font-bold mb-1">Store Address English *</label>
              <textarea
                id="set-address-en"
                required
                rows={2}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-emerald-500 text-xs font-semibold"
                value={addressEn}
                onChange={(e) => setAddressEn(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-slate-500 font-bold mb-1">Store Address Bangla *</label>
              <textarea
                id="set-address-bn"
                required
                rows={2}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-emerald-500 text-xs font-semibold"
                value={addressBn}
                onChange={(e) => setAddressBn(e.target.value)}
              />
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                id="save-shop-profile"
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Save className="w-4 h-4" />
                Confirm Store Profile
              </button>
            </div>
          </form>

        </div>

      </div>

      {/* 3. Outlet Branches Directory Selection */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
        <h4 className="text-xs font-black uppercase tracking-widest text-slate-405 mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-600" />
          {t.multiBranch}
        </h4>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* List Outlet and click to switch active (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {t.currBranch}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {settings.branches.map(branch => {
                const isActive = activeBranch === branch;
                return (
                  <button
                    type="button"
                    key={branch}
                    id={`active-branch-${branch.replace(/\s+/g, '-')}`}
                    onClick={() => setActiveBranchState(branch)}
                    className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between h-24 ${
                      isActive
                        ? 'bg-emerald-500/10 border-emerald-550 text-emerald-800 dark:text-emerald-305'
                        : 'bg-slate-50 dark:bg-slate-805 hover:bg-slate-100 border-slate-150 dark:border-slate-750 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-extrabold block">{branch}</span>
                      <span className="text-[9px] text-slate-400 font-medium normal-case block mt-0.5">
                        {isActive ? 'Active POS Cashier Terminal' : 'Secondary Store Depot Office'}
                      </span>
                    </div>

                    {isActive && (
                      <span className="absolute top-3 right-3 p-1 bg-emerald-600 text-white rounded-full">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form to append new branches (5 cols) */}
          <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-805 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-205 mb-1.5 block">
                {t.addBranch}
              </span>
              <p className="text-[11px] text-slate-405 leading-relaxed mb-4">
                Configure separate outlets or regional distribution warehouses under SmartShop to track regional cash registries.
              </p>
            </div>

            <form onSubmit={handleAddBranch} className="space-y-3 text-xs font-sans">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <MapPin className="h-4 h-4 text-emerald-600" />
                </span>
                <input
                  id="new-branch-name"
                  type="text"
                  required
                  placeholder="e.g. Uttara Sec 4 Depot"
                  className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  value={newBranch}
                  onChange={(e) => setNewBranch(e.target.value)}
                />
              </div>

              <button
                id="add-branch-submit"
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Outlet
              </button>
            </form>
          </div>

        </div>
      </div>

    </div>
  );
};
