import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { translations } from '../translations';
import { UserCheck, Clock, Shield, Plus, Award } from 'lucide-react';
import { Role } from '../types';

export const StaffView: React.FC = () => {
  const { staff, addStaff, markAttendance, lang } = useShop();
  const t = translations[lang];

  // Forms states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('Salesperson');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) return;
    addStaff({ name, role, email, phone });
    setIsAddOpen(false);
    setName('');
    setEmail('');
    setPhone('');
  };

  // Roles translations map
  const getRoleStr = (r: Role) => {
    switch(r) {
      case 'Admin': return t.admin;
      case 'Manager': return t.manager;
      default: return t.salesperson;
    }
  };

  return (
    <div className="space-y-6" id="staff-view">
      
      {/* Top action header info */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
        <h3 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
          <span>👥</span>
          {t.employeesRole}
        </h3>

        <button
          id="add-staff-btn"
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 transition-all shadow-sm w-full md:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          {t.addStaff}
        </button>
      </div>

      {/* Main Grid: Split Attendance Spreadsheet & Sales Leaderboard */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Attendance ledger checklist (7 Cols) */}
        <div className="xl:col-span-7 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            {t.attendance}
          </h4>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {staff.map(member => (
              <div key={member.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-emerald-700 shrink-0">
                    {member.name.substring(0,2).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {member.name}
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-355 text-[9px] font-bold rounded-full">
                        {getRoleStr(member.role)}
                      </span>
                    </h5>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">📞 {member.phone}</p>
                  </div>
                </div>

                {/* Checklist statuses selectors */}
                <div className="flex gap-1.5 font-sans">
                  {(['Present', 'Late', 'Absent'] as any[]).map(status => {
                    const isSelected = member.attendanceStatus === status;
                    let color = 'bg-slate-50 border-slate-205 text-slate-600 hover:bg-slate-100 dark:bg-slate-805 dark:border-slate-700 dark:text-slate-350';
                    if (isSelected) {
                      if (status === 'Present') color = 'bg-emerald-500 text-white border-emerald-500';
                      if (status === 'Late') color = 'bg-amber-500 text-white border-amber-500';
                      if (status === 'Absent') color = 'bg-rose-500 text-white border-rose-500';
                    }
                    return (
                      <button
                        id={`att-${member.id}-${status}`}
                        key={status}
                        onClick={() => markAttendance(member.id, status)}
                        className={`px-3 py-1.5 font-extrabold text-[10px] rounded-xl border transition-all ${color}`}
                      >
                        {status === 'Present' ? t.present : status === 'Late' ? t.late : t.absent}
                      </button>
                    );
                  })}
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Leadboard (5 Cols) */}
        <div className="xl:col-span-5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            {t.perfMonitor} (Leaderboard)
          </h4>

          <div className="space-y-4">
            {staff
              .slice()
              .sort((a,b) => b.salesPerformance - a.salesPerformance)
              .map((member, index) => {
                const isFirst = index === 0;
                return (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-805 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold font-mono text-xs shrink-0 ${
                        isFirst ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'
                      }`}>
                        #{index + 1}
                      </span>
                      <div>
                        <h5 className="font-extrabold text-slate-800 dark:text-slate-200">{member.name}</h5>
                        <p className="text-[10px] text-slate-400 tracking-wider font-bold">{getRoleStr(member.role)}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 block">{t.loggedSales}</span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400">৳{member.salesPerformance.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

      </div>

      {/* DRAWER MODAL: REGISTER STAFF */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4">
              👥 Register New Staff Account
            </h4>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-bold text-slate-500 mb-1">{t.staffName} *</label>
                <input
                  id="new-st-name"
                  type="text"
                  required
                  placeholder="e.g. Salim Uddin"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">{t.email} *</label>
                <input
                  id="new-st-email"
                  type="email"
                  required
                  placeholder="salim@example.com"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">{t.phone} *</label>
                  <input
                    id="new-st-phone"
                    type="text"
                    required
                    placeholder="01712..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-205 rounded-xl"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">{t.staffRole} *</label>
                  <select
                    id="new-st-role"
                    className="w-full p-2.5 bg-slate-50 border border-slate-205 rounded-xl text-xs"
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                  >
                    <option value="Salesperson">{t.salesperson}</option>
                    <option value="Manager">{t.manager}</option>
                    <option value="Admin">{t.admin}</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  id="cancel-add-st"
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  id="save-add-st"
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold font-sans"
                >
                  Save Account
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
