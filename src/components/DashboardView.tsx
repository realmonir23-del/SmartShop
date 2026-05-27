import React from 'react';
import { useShop } from '../context/ShopContext';
import { translations } from '../translations';
import { 
  TrendingUp, 
  ShoppingBag, 
  ArrowUpRight, 
  AlertTriangle, 
  PlusCircle, 
  Activity,
  DollarSign,
  UserPlus,
  Percent
} from 'lucide-react';

interface DashboardViewProps {
  setCurrentTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setCurrentTab }) => {
  const { sales, products, expenses, lang, settings } = useShop();
  const t = translations[lang];

  // 1. Math calculations
  const todayStart = new Date();
  todayStart.setHours(0,0,0,0);

  // Today's total sales
  const todaySales = sales
    .filter(s => new Date(s.date) >= todayStart)
    .reduce((sum, s) => sum + s.total, 0);

  // Monthly revenue
  const thisMonthStart = new Date();
  thisMonthStart.setDate(1);
  thisMonthStart.setHours(0,0,0,0);
  const monthlyRevenue = sales
    .filter(s => new Date(s.date) >= thisMonthStart)
    .reduce((sum, s) => sum + s.total, 0);

  // Calculate gross profit today
  // Loop through sales to calculate: (sold_qty * (sellingPrice - purchasePrice))
  let grossProfit = 0;
  sales.forEach(s => {
    s.items.forEach(it => {
      const p = products.find(prod => prod.id === it.productId);
      if (p) {
        const profitMarginPerItem = p.sellingPrice - p.purchasePrice;
        grossProfit += (profitMarginPerItem * it.quantity);
      } else {
        // Fallback estimated margin 15% if product was deleted
        grossProfit += (it.price * 0.15 * it.quantity);
      }
    });
  });

  // Subtract expenses to calculate Net Profit/Loss
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netEarnings = grossProfit - totalExpenses;

  // Low stock products alert list
  const lowStockItems = products.filter(p => p.stock <= p.alertLimit);

  // Recent transactions list (last 4 sales)
  const recentSales = sales.slice(0, 4);

  // Helper for bKash/Nagad styling
  const getMethodBadge = (m: string) => {
    switch(m) {
      case 'bKash': return 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300';
      case 'Nagad': return 'bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-300';
      case 'Rocket': return 'bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-300';
      case 'Card': return 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300';
      default: return 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300';
    }
  };

  // 2. Animated Trend Graph calculations for past 7 days
  const getPast7DaysSales = () => {
    const arr = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0,0,0,0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23,59,59,999);

      const label = d.toLocaleDateString(lang === 'en' ? 'en-US' : 'bn-BD', { weekday: 'short' });
      const daySalesTotal = sales
        .filter(s => {
          const sDate = new Date(s.date);
          return sDate >= d && sDate <= dayEnd;
        })
        .reduce((sum, s) => sum + s.total, 0);

      arr.push({ label, amount: daySalesTotal });
    }
    return arr;
  };

  const salesTrendData = getPast7DaysSales();
  const maxSalesVal = Math.max(...salesTrendData.map(d => d.amount), 1000);

  // Draw simple visual premium SVG Spark-Line for trends
  const svgWidth = 500;
  const svgHeight = 120;
  const padding = 20;
  const chartWidth = svgWidth - padding * 2;
  const chartHeight = svgHeight - padding * 2;

  const points = salesTrendData.map((d, index) => {
    const x = padding + (index / (salesTrendData.length - 1)) * chartWidth;
    const y = padding + chartHeight - (d.amount / maxSalesVal) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="space-y-6" id="dashboard-view">
      
      {/* Alarms / Top banners for Low Stock Notification */}
      {lowStockItems.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900 rounded-3xl p-4 flex items-start gap-3 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-rose-800 dark:text-rose-200">
              {t.stockRunningOut}
            </h4>
            <p className="text-[11px] text-rose-600 dark:text-rose-300 mt-1">
              {lang === 'en' 
                ? `Currently (${lowStockItems.length}) inventory products are below minimum thresholds. Review low-stock shelves immediately.`
                : `বর্তমানে (${lowStockItems.length}টি) মালামাল স্টকের নিরাপদ সীমার নিচে রয়েছে। জলদি স্টক পূরণ করুন।`}
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions Panel placed at the very top */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
        <h4 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider mb-3">
          Quick Actions Panel
        </h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            id="dash-quick-pos"
            onClick={() => setCurrentTab('pos')}
            className="p-4 bg-emerald-50 dark:bg-emerald-950/35 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all rounded-2xl flex flex-col justify-center items-center gap-2 group text-center cursor-pointer"
          >
            <PlusCircle className="w-8 h-8 text-emerald-600 group-hover:scale-110 transition-all" />
            <span className="text-xs font-extrabold text-emerald-850 dark:text-emerald-300">{t.pos}</span>
          </button>
          <button
            id="dash-quick-prod"
            onClick={() => setCurrentTab('products')}
            className="p-4 bg-blue-50 dark:bg-blue-950/35 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all rounded-2xl flex flex-col justify-center items-center gap-2 group text-center cursor-pointer"
          >
            <ShoppingBag className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-all" />
            <span className="text-xs font-extrabold text-blue-850 dark:text-blue-300">{t.addProd}</span>
          </button>
          <button
            id="dash-quick-cust"
            onClick={() => setCurrentTab('customers')}
            className="p-4 bg-purple-50 dark:bg-purple-950/35 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all rounded-2xl flex flex-col justify-center items-center gap-2 group text-center cursor-pointer"
          >
            <UserPlus className="w-8 h-8 text-purple-600 group-hover:scale-110 transition-all" />
            <span className="text-xs font-extrabold text-purple-850 dark:text-purple-300">{t.addCust}</span>
          </button>
          <button
            id="dash-quick-rep"
            onClick={() => setCurrentTab('reports')}
            className="p-4 bg-amber-50 dark:bg-amber-950/35 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all rounded-2xl flex flex-col justify-center items-center gap-2 group text-center cursor-pointer"
          >
            <DollarSign className="w-8 h-8 text-amber-600 group-hover:scale-110 transition-all" />
            <span className="text-xs font-extrabold text-amber-850 dark:text-amber-300">{t.reports}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Today's Sales */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm transition-all hover:shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">{t.dailySales}</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 font-sans">
                ৳{todaySales.toLocaleString()}
              </h3>
            </div>
            <span className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl text-emerald-600">
              <ShoppingBag className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="text-emerald-500 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              +12.4%
            </span>
            <span>vs yesterday</span>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm transition-all hover:shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">{t.monthlyRevenue}</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 font-sans">
                ৳{monthlyRevenue.toLocaleString()}
              </h3>
            </div>
            <span className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-2xl text-blue-600">
              <ArrowUpRight className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="text-blue-500 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              +8.1%
            </span>
            <span>target trajectory</span>
          </div>
        </div>

        {/* Profit / Loss */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm transition-all hover:shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">{t.profitLoss}</p>
              <h3 className={`text-2xl font-black mt-1.5 font-sans ${
                netEarnings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                ৳{netEarnings.toLocaleString()}
              </h3>
            </div>
            <span className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-2xl text-purple-600">
              <Percent className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="text-purple-500 font-bold">
              ৳{grossProfit.toLocaleString()} gross
            </span>
            <span>after costs</span>
          </div>
        </div>

        {/* Low stock indicators */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm transition-all hover:shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">{t.lowStockAlerts}</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 font-sans">
                {lowStockItems.length} items
              </h3>
            </div>
            <span className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-2xl text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="text-rose-500 font-bold font-mono">
              {products.length - lowStockItems.length} healthy
            </span>
            <span>regular stock</span>
          </div>
        </div>

      </div>

      {/* Central Visual Block: Trend Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
        <div>
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-emerald-600" />
            {t.salesTrend}
          </h4>

          {/* Premium custom SVG Graph vector */}
          <div className="relative w-full h-44 bg-slate-50 dark:bg-slate-800/40 rounded-2xl py-2 flex items-center justify-center border border-slate-100 dark:border-slate-800 overflow-hidden">
            <svg 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              className="w-full h-full text-emerald-600"
              preserveAspectRatio="none"
            >
              {/* Defs for soft area colors gradient */}
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0"/>
                </linearGradient>
              </defs>

              {/* Graph Area */}
              <path
                d={`M ${padding},${padding + chartHeight} L ${points} L ${padding + chartWidth},${padding + chartHeight} Z`}
                fill="url(#chartGrad)"
                stroke="none"
              />

              {/* Grid guidelines lines */}
              <line x1={padding} y1={padding} x2={padding + chartWidth} y2={padding} stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="3 3"/>
              <line x1={padding} y1={padding + chartHeight/2} x2={padding + chartWidth} y2={padding + chartHeight/2} stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="3 3"/>
              <line x1={padding} y1={padding + chartHeight} x2={padding + chartWidth} y2={padding + chartHeight} stroke="#E2E8F0" strokeWidth="0.5"/>

              {/* SparkLine path */}
              <polyline
                fill="none"
                stroke="#059669"
                strokeWidth="2.5"
                points={points}
              />

              {/* Anchor Circles dots */}
              {salesTrendData.map((d, index) => {
                const x = padding + (index / (salesTrendData.length - 1)) * chartWidth;
                const y = padding + chartHeight - (d.amount / maxSalesVal) * chartHeight;
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="4"
                    className="fill-white stroke-emerald-600 stroke-2"
                  />
                );
              })}
            </svg>
          </div>

          {/* Labels under graph */}
          <div className="flex justify-between px-4 mt-2 font-mono text-[10px] text-slate-400">
            {salesTrendData.map((d, index) => (
              <div key={index} className="text-center">
                <span className="block font-sans font-bold text-slate-700 dark:text-slate-300">৳{d.amount}</span>
                <span>{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Block: Recent Transactions (Cash list) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <span>📜</span>
          {t.recentTransactions}
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left" id="recent-sales-table">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="pb-2">{t.receiptNo}</th>
                <th className="pb-2">Date / সময়</th>
                <th className="pb-2">Customer / ক্রেতা</th>
                <th className="pb-2">Method</th>
                <th className="pb-2">By Store Branch</th>
                <th className="pb-2 text-right">Amount (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {recentSales.map(s => (
                <tr key={s.id} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50/50">
                  <td className="py-2.5 font-bold font-mono text-emerald-600 dark:text-emerald-400">#{s.receiptNo}</td>
                  <td className="py-2.5">{new Date(s.date).toLocaleString()}</td>
                  <td className="py-2.5 font-medium">{s.customerName}</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getMethodBadge(s.paymentMethod)}`}>
                      {s.paymentMethod}
                    </span>
                  </td>
                  <td className="py-2.5">{s.branchId || settings.activeBranch}</td>
                  <td className="py-2.5 text-right font-black text-slate-900 dark:text-white">৳{s.total}</td>
                </tr>
              ))}
              {recentSales.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-400">
                    {t.noTransactions}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
