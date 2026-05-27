import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Product } from '../types';
import { translations } from '../translations';
import { Search, Plus, Edit3, Trash2, Sliders, Warehouse, History, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

export const ProductsView: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, adjustStock, stockLogs, lang } = useShop();
  const t = translations[lang];

  // Search & Filters state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Drawer/Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdjustingStock, setIsAdjustingStock] = useState<Product | null>(null);

  // Form State
  const [nameEn, setNameEn] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [code, setCode] = useState('');
  const [categoryEn, setCategoryEn] = useState('Grocery');
  const [categoryBn, setCategoryBn] = useState('মুদি সামগ্রী');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [stock, setStock] = useState('');
  const [alertLimit, setAlertLimit] = useState('5');
  const [image, setImage] = useState('');

  // Stock Adjust form State
  const [adjustQty, setAdjustQty] = useState('1');
  const [adjustType, setAdjustType] = useState<'IN' | 'OUT'>('IN');
  const [adjustReasonEn, setAdjustReasonEn] = useState('Supplier Replenishment');
  const [adjustReasonBn, setAdjustReasonBn] = useState('সরবরাহকারীর থেকে সোর্সিং');

  const categories = Array.from(new Set(products.map(p => lang === 'en' ? p.categoryEn : p.categoryBn)));

  const filteredProd = products.filter(p => {
    const term = search.toLowerCase();
    const matchSearch = p.nameEn.toLowerCase().includes(term) || p.nameBn.includes(term) || p.code.includes(term);
    const cat = lang === 'en' ? p.categoryEn : p.categoryBn;
    const matchCat = selectedCategory === '' || cat === selectedCategory;
    return matchSearch && matchCat;
  });

  // Open Form for Adding
  const openAddModal = () => {
    setEditingProduct(null);
    setNameEn('');
    setNameBn('');
    setCode(Math.floor(8941230000000 + Math.random() * 9999999).toString()); // random barcode SKU
    setCategoryEn('Grocery');
    setCategoryBn('মুদি সামগ্রী');
    setPurchasePrice('');
    setSellingPrice('');
    setStock('');
    setAlertLimit('5');
    setImage('');
    setIsFormOpen(true);
  };

  // Open Form for Editing
  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setNameEn(p.nameEn);
    setNameBn(p.nameBn);
    setCode(p.code);
    setCategoryEn(p.categoryEn);
    setCategoryBn(p.categoryBn);
    setPurchasePrice(p.purchasePrice.toString());
    setSellingPrice(p.sellingPrice.toString());
    setStock(p.stock.toString());
    setAlertLimit(p.alertLimit.toString());
    setImage(p.image || '');
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pData = {
      nameEn,
      nameBn,
      code,
      categoryEn,
      categoryBn,
      purchasePrice: Number(purchasePrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      stock: Number(stock) || 0,
      alertLimit: Number(alertLimit) || 3,
      image: image || undefined
    };

    if (editingProduct) {
      updateProduct({ ...pData, id: editingProduct.id });
    } else {
      addProduct(pData);
    }
    setIsFormOpen(false);
  };

  const handleAdjustStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdjustingStock) return;
    adjustStock(
      isAdjustingStock.id,
      Number(adjustQty) || 1,
      adjustType,
      adjustReasonEn,
      adjustReasonBn
    );
    setIsAdjustingStock(null);
    setAdjustQty('1');
  };

  return (
    <div className="space-y-6" id="products-view">
      
      {/* Header operations bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-slate-400" />
          </span>
          <input
            id="product-search-input"
            type="text"
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-emerald-500"
            placeholder={t.searchProd}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Categories selector & Add Button */}
        <div className="flex w-full md:w-auto items-center justify-end gap-3 shrink-0">
          <select
            id="product-cat-select"
            className="p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">{t.allCategories}</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <button
            id="add-prod-btn"
            onClick={openAddModal}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {t.addProd}
          </button>
        </div>
      </div>

      {/* Main product listings layout & Inventory changes log side-by-side on desktop */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* Directory Listing Grid (8 Cols) */}
        <div className="xl:col-span-8 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-emerald-600" />
            {t.products} {filteredProd.length > 0 && `(${filteredProd.length})`}
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left" id="products-table">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="pb-2">Preview</th>
                  <th className="pb-2">Item / বিবরণ</th>
                  <th className="pb-2">SKU Barcode</th>
                  <th className="pb-2">Buying</th>
                  <th className="pb-2">Selling</th>
                  <th className="pb-2">In Stock</th>
                  <th className="pb-2 text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredProd.map(p => {
                  const isLow = p.stock <= p.alertLimit;
                  return (
                    <tr key={p.id} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50/50">
                      
                      {/* Avatar preview */}
                      <td className="py-3">
                        <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-700 shrink-0">
                          {p.image ? (
                            <img src={p.image} alt={p.nameEn} refererpolicy="no-referrer" className="object-cover h-full w-full" />
                          ) : (
                            <span className="text-xs font-bold text-emerald-700">
                              {p.nameEn.substring(0,2).toUpperCase()}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Name bilingual */}
                      <td className="py-3 pr-2">
                        <h4 className="font-extrabold text-slate-900 dark:text-white line-clamp-1">
                          {lang === 'en' ? p.nameEn : p.nameBn}
                        </h4>
                        <span className="text-[10px] text-slate-400 italic">
                          {lang === 'en' ? p.categoryEn : p.categoryBn}
                        </span>
                      </td>

                      {/* Barcode code */}
                      <td className="py-3 font-mono text-[11px] text-slate-500">#{p.code}</td>

                      {/* Price margins */}
                      <td className="py-3 font-bold">৳{p.purchasePrice}</td>
                      <td className="py-3 font-bold text-emerald-600 dark:text-emerald-400">৳{p.sellingPrice}</td>

                      {/* Stock counts with trigger alarms */}
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                          isLow 
                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-450 animate-pulse' 
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30'
                        }`}>
                          {p.stock} units
                        </span>
                      </td>

                      {/* Interaction Actions */}
                      <td className="py-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          id={`adjust-stock-btn-${p.id}`}
                          onClick={() => setIsAdjustingStock(p)}
                          className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-[10px] font-bold rounded-lg text-slate-700 dark:text-slate-300 inline-flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                        >
                          <Sliders className="w-3 h-3 text-emerald-600" />
                          Stock +/-
                        </button>
                        <button
                          id={`edit-prod-btn-${p.id}`}
                          onClick={() => openEditModal(p)}
                          className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-500 rounded-lg inline-flex"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`delete-prod-btn-${p.id}`}
                          onClick={() => {
                            if (window.confirm(t.deleteConfirm)) {
                              deleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500 rounded-lg inline-flex"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>

                    </tr>
                  );
                })}

                {filteredProd.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400 italic">No items found matching filter bounds.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Realtime Inventory Stock logs / History tracker (4 Cols) */}
        <div className="xl:col-span-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600" />
            {t.stockLogs}
          </h3>

          <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
            {stockLogs.map((log) => {
              const isAdd = log.type === 'IN';
              return (
                <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-slate-400">{new Date(log.date).toLocaleDateString()}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold inline-flex items-center gap-0.5 ${
                      isAdd 
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300' 
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300'
                    }`}>
                      {isAdd ? <ArrowUpCircle className="w-3 h-3" /> : <ArrowDownCircle className="w-3 h-3" />}
                      {log.type} {log.quantity}
                    </span>
                  </div>

                  <p className="font-bold text-slate-800 dark:text-slate-100">
                    {log.productName}
                  </p>
                  <p className="text-[11px] text-slate-500 italic mt-0.5">
                    "{lang === 'en' ? log.reasonEn : log.reasonBn}"
                  </p>
                  <div className="mt-1.5 pt-1 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[10px] text-slate-400">
                    <span>{t.operator}:</span>
                    <span className="font-medium text-slate-600 dark:text-slate-350">{log.operator}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* DRAWER MODAL: ADD / EDIT PRODUCT FORM */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {editingProduct ? t.editProd : t.addProd}
            </h4>
            
            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-sans">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">{t.prodNameEn} *</label>
                  <input
                    id="form-nameEn"
                    type="text"
                    required
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">{t.prodNameBn} *</label>
                  <input
                    id="form-nameBn"
                    type="text"
                    required
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    value={nameBn}
                    onChange={(e) => setNameBn(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">{t.barcode} *</label>
                  <input
                    id="form-code"
                    type="text"
                    required
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 text-xs font-mono rounded-xl"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Stock Amount *</label>
                  <input
                    id="form-stock"
                    type="number"
                    required
                    disabled={editingProduct !== null} // Manual stock adjust module should handle quantity alterations after creation to ensure proper logs
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl disabled:opacity-50"
                    placeholder="e.g. 50"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">{t.categoryEn} *</label>
                  <input
                    id="form-categoryEn"
                    type="text"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    value={categoryEn}
                    onChange={(e) => setCategoryEn(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">{t.categoryBn} *</label>
                  <input
                    id="form-categoryBn"
                    type="text"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    value={categoryBn}
                    onChange={(e) => setCategoryBn(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">{t.purchasePrice} *</label>
                  <input
                    id="form-purchase"
                    type="number"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">{t.sellingPrice} *</label>
                  <input
                    id="form-selling"
                    type="number"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">{t.alertLimit}</label>
                  <input
                    id="form-alert"
                    type="number"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    value={alertLimit}
                    onChange={(e) => setAlertLimit(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Cover Image Source (Unsplash Link URL)</label>
                <input
                  id="form-image"
                  type="text"
                  placeholder="https://..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[10px]"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 font-sans">
                <button
                  id="cancel-add-btn"
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-205 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  id="save-add-btn"
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                >
                  Save
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* QUICK MODAL: MANUAL STOCK +/- ADJUST TERMINAL */}
      {isAdjustingStock && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-2">
              📊 {t.realTimeStock} Adjustment
            </h4>
            <p className="text-xs text-slate-400 mb-4 font-bold">
              {lang === 'en' ? isAdjustingStock.nameEn : isAdjustingStock.nameBn}
            </p>

            <form onSubmit={handleAdjustStockSubmit} className="space-y-4 text-xs font-sans">
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  id="adjust-in"
                  type="button"
                  onClick={() => {
                    setAdjustType('IN');
                    setAdjustReasonEn('Supplier replenishment');
                    setAdjustReasonBn('নতুন পণ্য সোর্সিং আমদানি');
                  }}
                  className={`py-3 rounded-xl border font-bold text-xs ${
                    adjustType === 'IN' 
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-990/40 dark:text-emerald-300' 
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 border-transparent hover:bg-slate-100'
                  }`}
                >
                  ➕ Stock In (বৃদ্ধি)
                </button>
                <button
                  id="adjust-out"
                  type="button"
                  onClick={() => {
                    setAdjustType('OUT');
                    setAdjustReasonEn('Stock damage wastage');
                    setAdjustReasonBn('অপচয় বা মাল ক্ষতি বা নষ্ট');
                  }}
                  className={`py-3 rounded-xl border font-bold text-xs ${
                    adjustType === 'OUT' 
                      ? 'bg-rose-50 border-rose-500 text-rose-800 dark:bg-rose-990/40 dark:text-rose-300' 
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 border-transparent hover:bg-slate-100'
                  }`}
                >
                  ➖ Stock Out (অপনোদন)
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">{t.quantity} *</label>
                <input
                  id="adjust-quantity-input"
                  type="number"
                  min="1"
                  required
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Reason (En) *</label>
                  <input
                    id="adjust-reason-en"
                    type="text"
                    required
                    className="w-full p-2 bg-slate-50 rounded-lg text-[11px]"
                    value={adjustReasonEn}
                    onChange={(e) => setAdjustReasonEn(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Reason (Bn) *</label>
                  <input
                    id="adjust-reason-bn"
                    type="text"
                    required
                    className="w-full p-2 bg-slate-50 rounded-lg text-[11px]"
                    value={adjustReasonBn}
                    onChange={(e) => setAdjustReasonBn(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  id="cancel-adjust-btn"
                  type="button"
                  onClick={() => setIsAdjustingStock(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-205 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  id="save-adjust-btn"
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                >
                  Save Log
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
