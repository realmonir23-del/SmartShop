import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { translations } from '../translations';
import { 
  BarChart3, 
  ArrowDownToLine, 
  Layers, 
  Bookmark, 
  RefreshCw, 
  CheckCircle, 
  LineChart, 
  PieChart, 
  Award,
  Calendar
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { sales, products, expenses, lang, settings } = useShop();
  const t = translations[lang];

  const [dateRange, setDateRange] = useState<'7days' | '30days' | 'all'>('7days');
  const [reportGenerated, setReportGenerated] = useState(false);

  // Aggregates
  const totalSalesVolume = sales.reduce((sum, s) => sum + s.total, 0);
  const totalItemsSoldQty = sales.reduce((sum, s) => sum + s.items.reduce((acc, it) => acc + it.quantity, 0), 0);
  const totalExpensesSum = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Inventory value (stock * purchasePrice)
  const totalInventoryValuation = products.reduce((sum, p) => sum + (p.stock * p.purchasePrice), 0);
  // Selling asset potential (stock * sellingPrice)
  const potentialAssetValue = products.reduce((sum, p) => sum + (p.stock * p.sellingPrice), 0);

  // Margin calculation
  const grossProfitMargin = potentialAssetValue - totalInventoryValuation;
  const estimatedMarginPercent = potentialAssetValue > 0 
    ? Math.round((grossProfitMargin / potentialAssetValue) * 100) 
    : 15;

  // Best Sellers (Aggregate Qty by Product)
  const getBestSellersList = () => {
    const counts: { [key: string]: { id: string, nameEn: string, nameBn: string, qty: number, revenue: number } } = {};
    sales.forEach(s => {
      s.items.forEach(it => {
        if (!counts[it.productId]) {
          counts[it.productId] = {
            id: it.productId,
            nameEn: it.productNameEn,
            nameBn: it.productNameBn,
            qty: 0,
            revenue: 0
          };
        }
        counts[it.productId].qty += it.quantity;
        counts[it.productId].revenue += (it.quantity * it.price);
      });
    });
    return Object.values(counts).sort((a,b) => b.qty - a.qty).slice(0, 4);
  };

  const bestSellers = getBestSellersList();

  // Export CSV mock utility
  const handleExportCSV = () => {
    const headers = lang === 'en' 
      ? "Receipt No,Date,Customer,Subtotal,Discount,VAT,Total,Method,Cashier,Branch"
      : "রশিদ নং,তারিখ,ক্রেতার নাম,উপমোট,ছাড়,ভ্যাট,সর্বমোট,পেমেন্ট মাধ্যম,ক্যাশিয়ার,শাখা";
    
    const rows = sales.map(s => 
      `"${s.receiptNo}","${new Date(s.date).toLocaleDateString()}","${s.customerName}",${s.subTotal},${s.discount},${s.vat},${s.total},"${s.paymentMethod}","${s.cashierName}","${s.branchId}"`
    );
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SmartShop_Sales_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerGenerateReport = () => {
    setReportGenerated(true);
    setTimeout(() => {
      setReportGenerated(false);
      alert(lang === 'en' ? 'Analytical summaries refreshed successfully!' : 'এনালিটিক্যাল রিপোর্ট সামারি সফলভাবে রিফ্রেশ করা হয়েছে!');
    }, 800);
  };

  return (
    <div className="space-y-6" id="reports-view">
      
      {/* Top action header */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <span className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl text-emerald-600">
            <BarChart3 className="w-5 h-5 animate-pulse" />
          </span>
          <div>
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
              {t.salesStats}
            </h3>
            <p className="text-xs text-slate-400 font-medium">Bilingual automated dashboard audit charts and inventory appraisals</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
          <button
            id="rep-regen-btn"
            onClick={triggerGenerateReport}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-2xl flex items-center gap-1.5 transition-all w-full md:w-auto justify-center"
          >
            <RefreshCw className={`w-4 h-4 ${reportGenerated ? 'animate-spin' : ''}`} />
            {t.generateRep}
          </button>
          
          <button
            id="rep-csv-btn"
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 transition-all shadow-sm w-full md:w-auto justify-center"
          >
            <ArrowDownToLine className="w-4 h-4" />
            {t.downloadExcel}
          </button>
        </div>
      </div>

      {/* Grid: Appraisal Valuations & estimated Margins (3 Stats Rows) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Inventory Appraisal */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <span className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl text-indigo-600">
            <Layers className="w-6 h-6" />
          </span>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">{t.inventoryVal}</p>
            <h4 className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
              ৳{totalInventoryValuation.toLocaleString()}
            </h4>
          </div>
        </div>

        {/* Estimated Margin percentage */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <span className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl text-emerald-600">
            <Bookmark className="w-6 h-6" />
          </span>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">{t.profitMargin}</p>
            <h4 className="text-xl font-black text-emerald-600 dark:text-emerald-450 mt-0.5">
              {estimatedMarginPercent}% Estimated GPM
            </h4>
          </div>
        </div>

        {/* Sales aggregated volume */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <span className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-2xl text-purple-600">
            <LineChart className="w-6 h-6" />
          </span>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Gross Sales Revenue pool</p>
            <h4 className="text-xl font-black text-purple-600 dark:text-purple-400 mt-0.5">
              ৳{totalSalesVolume.toLocaleString()}
            </h4>
          </div>
        </div>

      </div>

      {/* Main Analysis Block: Best Sellers & Printable Spreadsheet */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* Best sellers bar tracker (5 Cols) */}
        <div className="xl:col-span-5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            {t.bestSellers}
          </h4>

          <div className="space-y-4">
            {bestSellers.map((item, index) => {
              const maxVal = Math.max(...bestSellers.map(b => b.qty), 1);
              const percentageWidth = Math.min(100, Math.round((item.qty / maxVal) * 100));
              
              return (
                <div key={item.id} className="text-xs space-y-1">
                  <div className="flex justify-between items-center text-slate-800 dark:text-slate-205">
                    <span className="font-extrabold truncate max-w-[180px]">
                      {lang === 'en' ? item.nameEn : item.nameBn}
                    </span>
                    <span className="font-bold font-mono">
                      {item.qty} {t.itemsSold}
                    </span>
                  </div>

                  {/* Horizontal visual progress bars */}
                  <div className="w-full h-3 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentageWidth}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-450 font-mono">
                    <span>Active Product #{item.id}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Total volume: ৳{item.revenue}</span>
                  </div>
                </div>
              );
            })}
            {bestSellers.length === 0 && (
              <p className="text-center text-slate-400 italic py-10">No items sold yet.</p>
            )}
          </div>
        </div>

        {/* Sales registry invoice visual grid list (7 Cols) */}
        <div className="xl:col-span-7 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <span>📊</span>
            Official Sales Registers & Tax Statements
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs" id="reports-sales-table">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-2">
                  <th className="pb-2">Receipt</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2 text-right">Subtotal</th>
                  <th className="pb-2 text-right">VAT</th>
                  <th className="pb-2 text-right">Discount</th>
                  <th className="pb-2 text-right font-black">Net Total (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {sales.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 font-bold font-mono text-emerald-600 dark:text-emerald-400">#{s.receiptNo}</td>
                    <td className="py-2.5">{new Date(s.date).toLocaleDateString()}</td>
                    <td className="py-2.5 text-right font-mono">৳{s.subTotal}</td>
                    <td className="py-2.5 text-right font-mono text-slate-400">৳{s.vat}</td>
                    <td className="py-2.5 text-right font-mono text-rose-500">-৳{s.discount}</td>
                    <td className="py-2.5 text-right font-black text-slate-900 dark:text-white">৳{s.total}</td>
                  </tr>
                ))}
                {sales.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400 italic">No sales logs on file record yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
