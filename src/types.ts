export type Role = 'Admin' | 'Salesperson' | 'Manager';

export interface Product {
  id: string;
  nameEn: string;
  nameBn: string;
  code: string; // Barcode or SKU
  categoryEn: string;
  categoryBn: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  alertLimit: number;
  image?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  dueAmount: number;
  loyaltyPoints: number;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productNameEn: string;
  productNameBn: string;
  quantity: number;
  price: number;
}

export type PaymentMethod = 'Cash' | 'Card' | 'bKash' | 'Nagad' | 'Rocket';

export interface Sale {
  id: string;
  receiptNo: string;
  date: string;
  items: SaleItem[];
  subTotal: number;
  discount: number;
  vat: number; // TAX/VAT
  total: number;
  paymentMethod: PaymentMethod;
  paidAmount: number;
  dueAmount: number;
  customerId?: string;
  customerName?: string;
  cashierId: string;
  cashierName: string;
  branchId: string;
}

export interface Expense {
  id: string;
  title: string;
  categoryEn: string;
  categoryBn: string;
  amount: number;
  date: string;
  description: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email?: string;
  companyName: string;
  dueAmount: number;
}

export interface StockLog {
  id: string;
  productId: string;
  productName: string;
  type: 'IN' | 'OUT';
  quantity: number;
  reasonEn: string;
  reasonBn: string;
  date: string;
  operator: string;
}

export interface Staff {
  id: string;
  name: string;
  role: Role;
  email: string;
  phone: string;
  attendanceStatus?: 'Present' | 'Absent' | 'Late';
  salesPerformance: number; // Total volume sold
}

export interface ShopSettings {
  shopNameEn: string;
  shopNameBn: string;
  addressEn: string;
  addressBn: string;
  phone: string;
  vatRate: number; // percentage
  currency: string; // "৳" | "$"
  branches: string[];
  activeBranch: string;
}
