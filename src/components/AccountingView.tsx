import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { translations } from '../translations';
import { Plus, Search, Trash2, ArrowUpRight, DollarSign, Briefcase, Tag, Calendar } from 'lucide-react';

export const AccountingView: React.FC = () => {
  const { expenses, addExpense, deleteExpense, lang } = useShop();
  const t = translations[lang];

  // Filters State
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');

  // Form State
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [categoryEn, setCategoryEn] = useState('Utilities');
  const [categoryBn, setCategoryBn] = useState('ইউটিলিটি বিল');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  // Category Selector translations Map
  const categoriesList = [
    { en: 'Rent', bn: 'ভাড়া' },
    { en: 'Refreshments', bn: 'আপ্যায়ন' },
    { en: 'Utilities', bn: 'ইউটিলিটি বিল' },
    { en: 'Salaries', bn: 'কর্মচারী বেতন' },
    { en: 'Logistics', bn: 'যোগাযোগ ও পরিবহন' },
    { en: 'Marketing', bn: 'মার্কেটিং ও বিজ্ঞাপন' },
    { en: 'Others', bn: 'অন্যান্য খরচ' }
  ];

  const filteredExpenses = expenses.filter(e => {
    const term = search.toLowerCase();
    const matchSearch = e.title.toLowerCase().includes(term) || e.description.toLowerCase().includes(term);
    const cat = lang === 'en' ? e.categoryEn : e.categoryBn;
    const matchCat = selectedCat === '' || cat === selectedCat;
    return matchSearch && matchCat;
  });

  const handleCategoryChange = (eEn: string) => {
    const matched = categoriesList.find(c => c.en === eEn);
    if (matched) {
      setCategoryEn(matched.en);
      setCategoryBn(matched.bn);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(amount) || 0;
    if (!title || amt <= 0) return;

    addExpense({
      title,
      categoryEn,
      categoryBn,
      amount: amt,
      description
    });

    setIsOpen(false);
    setTitle('');
    setAmount('');
    setDescription('');
  };

  const totalExpenseSum = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6" id="accounting-view">
      
      {/* Top action header */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <span className="p-3 bg-red-50 dark:bg-rose-950/40 rounded-2xl text-rose-600">
            <DollarSign className="w-5 h-5 animate-pulse" />
          </span>
          <div>
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
              {t.cashFlow}
            </h3>
            <p className="text-xs text-slate-400 font-medium">Record and track commercial store outflow invoices and overhead costs</p>
          </div>
        </div>

        <button
          id="add-exp-btn"
          onClick={() => setIsOpen(true)}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 transition-all shadow-sm w-full md:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          {t.addExp}
        </button>
      </div>

      {/* Expense valuation Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Total Outflow */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <span className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-2xl text-rose-600">
            <ArrowUpRight className="w-6 h-6" />
          </span>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">{t.totalExp}</p>
            <h4 className="text-xl font-black text-rose-600 dark:text-rose-455 mt-0.5">
              ৳{expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
            </h4>
          </div>
        </div>

        {/* Current Filter Total */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <span className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl text-amber-600">
            <Briefcase className="w-6 h-6" />
          </span>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Current List Sum</p>
            <h4 className="text-xl font-black text-amber-600 dark:text-amber-450 mt-0.5">
              ৳{totalExpenseSum.toLocaleString()}
            </h4>
          </div>
        </div>

        {/* Average transaction cost */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <span className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-2xl text-blue-600">
            <Tag className="w-6 h-6" />
          </span>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Average Outflow Size</p>
            <h4 className="text-xl font-black text-blue-600 dark:text-blue-450 mt-0.5">
              ৳{expenses.length > 0 ? Math.round(expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length).toLocaleString() : 0}
            </h4>
          </div>
        </div>

      </div>

      {/* Main Block: Table Listing */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        
        {/* Search controls */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 h-4 text-slate-400" />
            </span>
            <input
              id="exp-search-input"
              type="text"
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              placeholder="Search expenses by title/description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
            <button
              id="exp-cat-all"
              type="button"
              onClick={() => setSelectedCat('')}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-xl transition-all ${
                selectedCat === ''
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {lang === 'en' ? 'All Ledger Outflows' : 'সব ক্যাটাগরি'}
            </button>
            {categoriesList.map(cat => {
              const label = lang === 'en' ? cat.en : cat.bn;
              return (
                <button
                  id={`exp-cat-${cat.en}`}
                  key={cat.en}
                  type="button"
                  onClick={() => setSelectedCat(label)}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-xl transition-all whitespace-nowrap ${
                    selectedCat === label
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Output Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left" id="expenses-table">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="pb-2">Outflow / শিরোনাম</th>
                <th className="pb-2">Category</th>
                <th className="pb-2">Description / বিবরণ</th>
                <th className="pb-2">Date</th>
                <th className="pb-2 text-right">Amount (৳)</th>
                <th className="pb-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-705 dark:text-slate-250">
              {filteredExpenses.map(e => (
                <tr key={e.id} className="hover:bg-slate-50/50">
                  <td className="py-3 font-extrabold text-slate-900 dark:text-white">{e.title}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-350 text-[10px] font-bold rounded-full">
                      {lang === 'en' ? e.categoryEn : e.categoryBn}
                    </span>
                  </td>
                  <td className="py-3 text-slate-450 italic max-w-xs truncate">{e.description}</td>
                  <td className="py-3 font-mono text-[10px] text-slate-400">
                    {new Date(e.date).toLocaleDateString(lang === 'en' ? 'en-US' : 'bn-BD')}
                  </td>
                  <td className="py-3 text-right font-black text-rose-600 dark:text-rose-450">৳{e.amount}</td>
                  <td className="py-3 text-right">
                    <button
                      id={`delete-exp-${e.id}`}
                      onClick={() => {
                        if (confirm(t.deleteConfirm)) deleteExpense(e.id);
                      }}
                      className="p-1 hover:text-rose-600 text-slate-300 rounded transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 italic">
                    No matching store outflows on record database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* DRAWER MODAL: REGISTER EXPENSE OUTFLOW */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in text-xs font-sans">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-1.5">
              💸 {t.addExp}
            </h4>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-500 mb-1">{t.expTitle} *</label>
                <input
                  id="new-exp-title"
                  type="text"
                  required
                  placeholder="e.g. Electric Power DESCO Bill"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-805 border border-slate-205 dark:border-slate-700 rounded-xl font-bold"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">{t.expCat} *</label>
                  <select
                    id="new-exp-category"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-805 border border-slate-205 dark:border-slate-700 rounded-xl font-sans"
                    value={categoryEn}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                  >
                    {categoriesList.map(c => (
                      <option key={c.en} value={c.en}>{lang === 'en' ? c.en : c.bn}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">{t.expAmount} *</label>
                  <input
                    id="new-exp-amount"
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 1500"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-805 border border-slate-205 dark:border-slate-700 rounded-xl font-black text-rose-600"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">{t.expDesc}</label>
                <textarea
                  id="new-exp-desc"
                  rows={2}
                  placeholder="Memo description details..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-805 border border-slate-205 dark:border-slate-700 rounded-xl"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  id="cancel-exp-btn"
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  id="save-exp-btn"
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold"
                >
                  Register Outflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
