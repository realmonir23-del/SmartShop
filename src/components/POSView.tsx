import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Product } from '../types';
import { translations } from '../translations';
import { Search, ShoppingCart, Trash2, Plus, Minus, UserCheck, ShieldCheck, Printer, CheckCircle, Smartphone } from 'lucide-react';

export const POSView: React.FC = () => {
  const { products, customers, checkoutPOS, settings, lang } = useShop();
  const t = translations[lang];

  // Cart State
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  const [selectedCustId, setSelectedCustId] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'bKash' | 'Nagad' | 'Rocket'>('Cash');
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Receipt Modal State
  const [tempReceipt, setTempReceipt] = useState<any>(null);

  // Filter Categories
  const categories = Array.from(new Set(products.map(p => lang === 'en' ? p.categoryEn : p.categoryBn)));

  // Filter Products
  const filteredProducts = products.filter(p => {
    const term = searchQuery.toLowerCase();
    const matchesSearch = 
      p.nameEn.toLowerCase().includes(term) || 
      p.nameBn.includes(term) || 
      p.code.includes(term);
    const cat = lang === 'en' ? p.categoryEn : p.categoryBn;
    const matchesCategory = selectedCategory === '' || cat === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Cart Handlers
  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) return prev; // Limit to stock
        return prev.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const nextQty = item.qty + delta;
        const matchedProd = products.find(p => p.id === productId);
        if (nextQty <= 0) return null;
        if (matchedProd && nextQty > matchedProd.stock) return item; // limit to stock
        return { ...item, qty: nextQty };
      }
      return item;
    }).filter(Boolean) as any);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  // Math aggregates
  const subTotal = cart.reduce((sum, item) => sum + (item.product.sellingPrice * item.qty), 0);
  const vatAmount = 0; // Removed tax/VAT option from POS calculations
  const grandTotal = Math.max(0, subTotal - discount);

  // Set default full paid amount on cart change
  React.useEffect(() => {
    setPaidAmount(grandTotal.toString());
  }, [grandTotal]);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const receipt = checkoutPOS({
      items: cart,
      customerId: selectedCustId || undefined,
      discount: Number(discount),
      paymentMethod,
      paidAmount: Number(paidAmount) || grandTotal
    });

    setTempReceipt(receipt);
    // Reset cart
    setCart([]);
    setSelectedCustId('');
    setDiscount(0);
    setPaymentMethod('Cash');
    setPaidAmount('');
  };

  // MFS wallet branding styling map
  const getWalletColor = (method: string) => {
    switch(method) {
      case 'bKash': return 'bg-[#E11D48] text-white hover:bg-[#BE123C] border-rose-600';
      case 'Nagad': return 'bg-[#EA580C] text-white hover:bg-[#C2410C] border-orange-600';
      case 'Rocket': return 'bg-[#8B5CF6] text-white hover:bg-[#6D28D9] border-violet-600';
      case 'Card': return 'bg-[#0369A1] text-white hover:bg-[#035480] border-sky-700';
      default: return 'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-1 md:p-3" id="pos-view">
      
      {/* LEFT: Products Selector (7 Cols) */}
      <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-4 md:p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          {t.pos}
        </h2>

        {/* Search controls */}
        <div className="relative mb-4">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 h-5 text-slate-400" />
          </span>
          <input
            id="searchQuery"
            type="text"
            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder={t.searchProd}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Quick manual barcode mock trigger */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
          <button
            id="cat-all"
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 text-xs font-semibold rounded-full shrink-0 transition-all ${
              selectedCategory === '' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {t.allCategories}
          </button>
          {categories.map((cat, i) => (
            <button
              id={`cat-${i}`}
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-semibold rounded-full shrink-0 transition-all ${
                selectedCategory === cat 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Interactive mock barcode scanner buttons */}
        <div className="bg-emerald-50 dark:bg-slate-800/60 p-3 rounded-2xl mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
              Mock Barcode Auto-Scanner (Simulate Scan)
            </span>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {products.slice(0, 3).map(p => (
              <button
                id={`mock-scan-${p.id}`}
                key={p.id}
                onClick={() => addToCart(p)}
                className="bg-white dark:bg-slate-700 hover:bg-emerald-100 dark:hover:bg-emerald-990 border border-emerald-200 dark:border-slate-600 px-2 py-1 text-[10px] font-mono rounded-lg text-emerald-800 dark:text-emerald-200"
              >
                [📷 {p.code.slice(-4)}]
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[480px] overflow-y-auto pr-1">
          {filteredProducts.map(p => {
            const isLow = p.stock <= p.alertLimit;
            const inCartStock = cart.find(c => c.product.id === p.id)?.qty || 0;
            const availableStock = p.stock - inCartStock;

            return (
              <div
                key={p.id}
                onClick={() => availableStock > 0 && addToCart(p)}
                className={`group border rounded-3xl p-3 transition-all cursor-pointer flex flex-col justify-between ${
                  availableStock <= 0 
                    ? 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-60' 
                    : 'bg-white dark:bg-slate-800 hover:border-emerald-500 hover:shadow-md border-slate-100 dark:border-slate-700'
                }`}
              >
                <div>
                  <div className="relative h-20 w-full mb-2 bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center">
                    {p.image ? (
                      <img src={p.image} alt={p.nameEn} refererpolicy="no-referrer" className="object-cover h-full w-full" />
                    ) : (
                      <div className="text-2xl font-bold text-emerald-700 select-none">
                        {p.nameEn.substring(0,2).toUpperCase()}
                      </div>
                    )}
                    {isLow && (
                      <span className="absolute top-1 left-1 bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-md font-semibold font-sans">
                        LOW
                      </span>
                    )}
                    {inCartStock > 0 && (
                      <span className="absolute top-1 right-1 bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {inCartStock}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight">
                    {lang === 'en' ? p.nameEn : p.nameBn}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">#{p.code}</p>
                </div>
                
                <div className="mt-2 flex items-center justify-between pt-1">
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    ৳{p.sellingPrice}
                  </span>
                  <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-lg">
                    {p.stock} Qty
                  </span>
                </div>
              </div>
            );
          })}
          {filteredProducts.length === 0 && (
            <div className="col-span-3 text-center py-12 text-slate-400 text-sm">
              No products found matching query.
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: POS cart details, Customer setup (5 Cols) */}
      <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-4 md:p-6 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <ShoppingCart className="w-5 h-5 text-emerald-600" />
            Cart Invoice Total ({cart.reduce((sum, i) => sum + i.qty, 0)})
          </h3>

          {/* Cart Items List */}
          <div className="max-h-[220px] overflow-y-auto mb-4 divide-y divide-slate-100 dark:divide-slate-800">
            {cart.map(item => (
              <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-2">
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {lang === 'en' ? item.product.nameEn : item.product.nameBn}
                  </h4>
                  <p className="text-[10px] text-slate-400">৳{item.product.sellingPrice} per unit</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id={`minus-${item.product.id}`}
                    onClick={() => updateQty(item.product.id, -1)}
                    className="p-1 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-600 dark:text-slate-300 rounded-lg"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold w-5 text-center text-slate-800 dark:text-slate-200">
                    {item.qty}
                  </span>
                  <button
                    id={`plus-${item.product.id}`}
                    onClick={() => updateQty(item.product.id, 1)}
                    className="p-1 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-600 dark:text-slate-300 rounded-lg"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    id={`remove-${item.product.id}`}
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1 hover:text-rose-500 text-slate-300 transition-all rounded-lg ml-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {cart.length === 0 && (
              <div className="text-center py-10">
                <p className="text-slate-400 text-xs italic">{t.cartEmpty}</p>
              </div>
            )}
          </div>

          {/* Customer Selection for Loyalty & Dues */}
          <div className="mb-4">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              {t.customerSelect}
            </label>
            <select
              id="selectedCustId"
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 rounded-xl focus:outline-emerald-500"
              value={selectedCustId}
              onChange={(e) => setSelectedCustId(e.target.value)}
            >
              <option value="">-- {t.walkInCustomer} --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  👤 {c.name} ({c.phone}) - Due: ৳{c.dueAmount}
                </option>
              ))}
            </select>
          </div>

          {/* Pricing Ledger Details */}
          <div className="bg-slate-50 dark:bg-slate-800/55 p-3.5 rounded-2xl mb-4 space-y-1.5">
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>{t.subtotal}</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">৳{subTotal}</span>
            </div>
            
            {/* Discount input in cart context */}
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
              <span>{t.discount}</span>
              <input
                id="discount"
                type="number"
                min="0"
                className="w-20 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-0.5 text-right font-semibold rounded"
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, parseInt(e.target.value) || 0))}
              />
            </div>

            <div className="flex justify-between text-sm font-bold text-slate-800 dark:text-slate-100 pt-1.5 border-t border-slate-200 dark:border-slate-700">
              <span>{t.payableTotal}</span>
              <span className="text-base text-emerald-600 dark:text-emerald-400">৳{grandTotal}</span>
            </div>
          </div>
        </div>

        {/* Payment Gate & Form */}
        <form onSubmit={handleCheckout} className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              {t.paymentMethod}
            </label>
            <div className="grid grid-cols-5 gap-1.5 font-sans">
              {(['Cash', 'Card', 'bKash', 'Nagad', 'Rocket'] as any[]).map(method => {
                const isActive = paymentMethod === method;
                return (
                  <button
                    id={`pay-${method}`}
                    type="button"
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 text-[10px] md:text-[11px] font-bold rounded-xl border text-center transition-all ${
                      isActive 
                        ? getWalletColor(method) + ' shadow-sm scale-102' 
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {method === 'Cash' ? t.cash : method === 'Card' ? t.card : method}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                {t.paidAmount}
              </label>
              <input
                id="paidAmount"
                type="number"
                disabled={paymentMethod !== 'Cash'}
                className="w-full text-xs font-bold p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 text-slate-400">
                {t.dueAmount}
              </label>
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400">
                ৳{Math.max(0, grandTotal - (Number(paidAmount) || 0))}
              </div>
            </div>
          </div>

          <button
            id="checkout-btn"
            type="submit"
            disabled={cart.length === 0}
            className={`w-full py-4 rounded-2xl font-bold transition-all text-sm shadow-sm flex items-center justify-center gap-2 ${
              cart.length === 0 
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-98'
            }`}
          >
            <UserCheck className="w-5 h-5" />
            {t.checkoutSuccess}
          </button>
        </form>
      </div>

      {/* MODAL PRINTABLE MOCK THERMAL INVOICE */}
      {tempReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 animate-fade-in">
          <div className="bg-white text-slate-900 w-full max-w-[370px] rounded-3xl p-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Receipt top branding */}
            <div className="text-center font-sans tracking-tight border-b border-dashed border-slate-250 pb-3">
              <span className="bg-emerald-150 text-emerald-800 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest">
                OFFICIAL RECEIPT
              </span>
              <h3 className="font-extrabold text-lg mt-2 text-slate-900">
                {lang === 'en' ? settings.shopNameEn : settings.shopNameBn}
              </h3>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                {lang === 'en' ? settings.addressEn : settings.addressBn}
              </p>
              <p className="text-[11px] text-slate-600">Cell: {settings.phone}</p>
            </div>

            {/* Receipt core descriptors */}
            <div className="text-[10px] font-mono py-3 space-y-0.5 text-slate-600 border-b border-dashed border-slate-200">
              <div className="flex justify-between">
                <span>RECEIPT: #{tempReceipt.receiptNo}</span>
                <span>DATE: {new Date(tempReceipt.date).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>CASHIER: {tempReceipt.cashierName}</span>
                <span>BRANCH: {tempReceipt.branchId}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-800">
                <span>CUSTOMER: {tempReceipt.customerName}</span>
                <span>METHOD: {tempReceipt.paymentMethod}</span>
              </div>
            </div>

            {/* Receipt items list */}
            <div className="text-[11px] font-mono py-3 border-b border-dashed border-slate-200 space-y-1.5">
              <div className="flex justify-between font-bold border-b border-slate-200 pb-1 text-slate-800">
                <span className="flex-1">ITEMS / বিবরণ</span>
                <span className="w-12 text-center">QTY</span>
                <span className="w-16 text-right">TOTAL</span>
              </div>
              {tempReceipt.items.map((it: any, index: number) => (
                <div key={index} className="flex justify-between leading-snug">
                  <span className="flex-1">{lang === 'en' ? it.productNameEn : it.productNameBn}</span>
                  <span className="w-12 text-center">{it.quantity}</span>
                  <span className="w-16 text-right">৳{it.quantity * it.price}</span>
                </div>
              ))}
            </div>

            {/* Receipt pricing final aggregates */}
            <div className="text-xs font-semibold font-sans py-3 space-y-1 border-b border-dashed border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (উপমোট):</span>
                <span>৳{tempReceipt.subTotal}</span>
              </div>
              {tempReceipt.vat > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>TAX/VAT ({settings.vatRate}%):</span>
                  <span>৳{tempReceipt.vat}</span>
                </div>
              )}
              {tempReceipt.discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Discount (ছাড়):</span>
                  <span>-৳{tempReceipt.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold pt-1.5 border-t border-slate-200 border-dashed text-slate-900">
                <span>Net Total (সর্বমোট প্রদেয়):</span>
                <span>৳{tempReceipt.total}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Paid (গৃহীত):</span>
                <span>৳{tempReceipt.paidAmount}</span>
              </div>
              {tempReceipt.dueAmount > 0 && (
                <div className="flex justify-between text-rose-600 font-extrabold">
                  <span>Remaining Due (বকেয়া):</span>
                  <span>৳{tempReceipt.dueAmount}</span>
                </div>
              )}
            </div>

            {/* Welcome banner */}
            <div className="text-center pt-4 tracking-wide">
              <div className="flex items-center justify-center gap-1.5 text-emerald-600 font-bold text-xs mb-1">
                <CheckCircle className="w-4 h-4" />
                <span>PAID - {t.thankYou}</span>
              </div>
              <p className="text-[12px] font-semibold text-emerald-700 font-sans mt-1">
                {t.bengaliWelcome}
              </p>
              <p className="text-[9px] text-slate-400 mt-2 font-mono">
                System powered by SmartShop Core Engine
              </p>
            </div>

            {/* Action buttons */}
            <div className="mt-5 grid grid-cols-2 gap-3 no-print">
              <button
                id="print-receipt-btn"
                type="button"
                onClick={() => window.print()}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 text-slate-800 transition-all font-sans"
              >
                <Printer className="w-4 h-4" />
                {t.printInvoice}
              </button>
              <button
                id="close-receipt-btn"
                type="button"
                onClick={() => setTempReceipt(null)}
                className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all font-sans"
              >
                {t.closeReceipt}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
