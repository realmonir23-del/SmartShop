import { Product, Customer, Sale, Expense, Staff, Supplier, StockLog, ShopSettings } from './types';

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_CUSTOMERS: Customer[] = [];

export const INITIAL_SALES: Sale[] = [];

export const INITIAL_EXPENSES: Expense[] = [];

export const INITIAL_STAFF: Staff[] = [
  {
    id: "st1",
    name: "Hasan Ahmed",
    role: "Admin",
    email: "hasan@smartshop.com",
    phone: "01711223344",
    attendanceStatus: "Present",
    salesPerformance: 0
  },
  {
    id: "st2",
    name: "Kazi Nabil",
    role: "Salesperson",
    email: "nabil@smartshop.com",
    phone: "01855667788",
    attendanceStatus: "Present",
    salesPerformance: 0
  },
  {
    id: "st3",
    name: "Tahmina Chowdhury",
    role: "Manager",
    email: "tahmina@smartshop.com",
    phone: "01999887766",
    attendanceStatus: "Present",
    salesPerformance: 0
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [];

export const INITIAL_STOCK_LOGS: StockLog[] = [];

export const INITIAL_SETTINGS: ShopSettings = {
  shopNameEn: "My Retail Shop",
  shopNameBn: "আমার রিটেল শপ",
  addressEn: "Dhaka, Bangladesh",
  addressBn: "ঢাকা, বাংলাদেশ",
  phone: "01700000000",
  vatRate: 0,
  currency: "৳",
  branches: ["Main Outlet Branch"],
  activeBranch: "Main Outlet Branch"
};
