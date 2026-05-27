import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Customer } from '../types';
import { translations } from '../translations';
import { Search, Plus, UserCheck, MessageSquare, DollarSign, Award, CreditCard } from 'lucide-react';

export const CustomersView: React.FC = () => {
  const { customers, addCustomer, collectDuePayment, lang } = useShop();
  const t = translations[lang];

  // Search & states
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [collectingCust, setCollectingCust] = useState<Customer | null>(null);
  const [smsTarget, setSmsTarget] = useState<Customer | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Collection cash state
  const [collectAmt, setCollectAmt] = useState('');

  const filteredCust = customers.filter(c => {
    const term = search.toLowerCase();
    return c.name.toLowerCase().includes(term) || c.phone.includes(term);
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    addCustomer({ name, phone });
    setIsAddOpen(false);
    setName('');
    setPhone('');
  };

  const handleCollectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectingCust) return;
    const amt = Number(collectAmt) || 0;
    if (amt <= 0) return;
    collectDuePayment(collectingCust.id, amt);
    setCollectingCust(null);
    setCollectAmt('');
    alert(t.collectSuccess);
  };

  // Generate WhatsApp SMS reminder draft link for small merchants
  const getWhatsAppLink = (c: Customer) => {
    const msg = lang === 'en' 
      ? `Dear ${c.name}, this is a friendly reminder from Mizaan Super Store. Your current outstanding balance is ৳${c.dueAmount}. Please settle your dues at your earliest convenience. Thank you!`
      : `প্রিয় ${c.name}, মিজান সুপার স্টোর থেকে বকেয়া সংক্রান্ত বিনীত তাগাদা। আপনার বর্তমান মোট বকেয়া হচ্ছে ৳${c.dueAmount}। অনুগ্রহ করে দ্রুত পরিশোধের ব্যবস্থা করুন। ধন্যবাদ!`;
    
    return `https://wa.me/${c.phone.startsWith('0') ? '88' + c.phone : c.phone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-6" id="customers-view">
      
      {/* Top action header */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-slate-400" />
          </span>
          <input
            id="cust-search"
            type="text"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white"
            placeholder="Search customers by name/phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          id="add-cust-btn"
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 transition-all shadow-sm shrink-0 w-full md:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          {t.addCust}
        </button>
      </div>

      {/* Stats summaries for Debtors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <span className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-2xl text-rose-600">
            <CreditCard className="w-6 h-6" />
          </span>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Outstanding Dues Penning</p>
            <h4 className="text-xl font-black text-rose-600 dark:text-rose-450 mt-0.5">
              ৳{customers.reduce((sum, c) => sum + c.dueAmount, 0).toLocaleString()}
            </h4>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <span className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-2xl text-purple-600">
            <Award className="w-6 h-6" />
          </span>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Customer Loyalty Pool</p>
            <h4 className="text-xl font-black text-purple-600 dark:text-purple-400 mt-0.5">
              {customers.reduce((sum, c) => sum + c.loyaltyPoints, 0).toLocaleString()} pts
            </h4>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <span className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl text-emerald-600">
            <UserCheck className="w-6 h-6" />
          </span>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Registered Buyers Count</p>
            <h4 className="text-xl font-black text-emerald-600 dark:text-emerald-450 mt-0.5">
              {customers.length} Accounts
            </h4>
          </div>
        </div>
      </div>

      {/* Directory listing Cards (High fidelity grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredCust.map(c => {
          const isDebtor = c.dueAmount > 0;
          return (
            <div 
              key={c.id} 
              className={`bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between transition-all hover:shadow ${
                isDebtor ? 'border-l-4 border-l-rose-500' : 'border-l-4 border-l-emerald-500'
              }`}
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{c.name}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">📞 {c.phone}</p>
                  </div>
                  {isDebtor && (
                    <span className="bg-rose-50 dark:bg-rose-950/30 text-rose-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      DUE (বাকি)
                    </span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs py-2 bg-slate-50 dark:bg-slate-805 rounded-2xl px-3 border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.dueBalance}</span>
                    <p className={`font-black text-sm ${isDebtor ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}`}>
                      ৳{c.dueAmount}
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.loyaltyPoints}</span>
                    <p className="font-black text-sm text-purple-600 dark:text-purple-400">
                      🏅 {c.loyaltyPoints}
                    </p>
                  </div>
                </div>
              </div>

              {/* CRM Interactivity trigger buttons */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                
                {/* Due collection cashier terminal */}
                <button
                  id={`collect-btn-${c.id}`}
                  disabled={!isDebtor}
                  onClick={() => setCollectingCust(c)}
                  className={`flex-1 py-1.5 rounded-xl text-[10px] font-extrabold inline-flex items-center justify-center gap-1 transition-all ${
                    isDebtor 
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-250 dark:bg-emerald-950/40 dark:text-emerald-300' 
                      : 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  {t.dueCollection}
                </button>

                {/* Remind Whatsapp memo dispatch simulator */}
                <a
                  id={`remind-btn-${c.id}`}
                  href={isDebtor ? getWhatsAppLink(c) : '#'}
                  target="_blank"
                  rel="noreferrer"
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold inline-flex items-center justify-center gap-1 transition-all ${
                    isDebtor 
                      ? 'bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 text-slate-700' 
                      : 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed pointer-events-none'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  SMS
                </a>
              </div>

            </div>
          );
        })}
      </div>

      {/* DRAWER MODAL: REGISTER NEW CUSTOMER */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4">
              👤 {t.addCust}
            </h4>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-bold text-slate-500 mb-1">{t.custName} *</label>
                <input
                  id="new-cust-name"
                  type="text"
                  required
                  placeholder="e.g. Abul Kashem"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-805 border border-slate-200 dark:border-slate-700 rounded-xl"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">{t.custPhone} *</label>
                <input
                  id="new-cust-phone"
                  type="text"
                  required
                  placeholder="e.g. 01700000000"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-805 border border-slate-200 dark:border-slate-700 rounded-xl"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  id="cancel-add-cust"
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-205 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  id="save-add-cust"
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                >
                  Register Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER MODAL: DUE COLLECTION DRAWER TERMINAL */}
      {collectingCust && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">
              💰 {t.dueCollection} Terminal
            </h4>
            <p className="text-xs text-slate-400 mb-4 font-bold">
              Completing credit recovery ledger entry for {collectingCust.name}
            </p>

            <form onSubmit={handleCollectSubmit} className="space-y-4 text-xs font-sans">
              <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900 rounded-2xl p-4 text-rose-800 dark:text-rose-200">
                <span className="text-[10px] uppercase font-bold text-rose-500 tracking-wider">Active Credit Debt:</span>
                <p className="text-xl font-black mt-1">৳{collectingCust.dueAmount}</p>
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">{t.collectAmount} *</label>
                <input
                  id="collect-amt-input"
                  type="number"
                  min="1"
                  max={collectingCust.dueAmount}
                  required
                  placeholder="e.g. 500"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-805 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-emerald-600 text-sm"
                  value={collectAmt}
                  onChange={(e) => setCollectAmt(e.target.value)}
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  id="cancel-collect-btn"
                  type="button"
                  onClick={() => setCollectingCust(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-205 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  id="save-collect-btn"
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                >
                  Confirm Cash Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
