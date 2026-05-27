import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Customer, Sale, Expense, Staff, Supplier, StockLog, ShopSettings, Role } from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_SALES,
  INITIAL_EXPENSES,
  INITIAL_STAFF,
  INITIAL_SUPPLIERS,
  INITIAL_STOCK_LOGS,
  INITIAL_SETTINGS
} from '../data';

interface ShopContextType {
  // Localization & Theme
  lang: 'en' | 'bn';
  setLang: (lang: 'en' | 'bn') => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  // Auth & Roles
  currentUser: Staff | null;
  setCurrentUser: (user: Staff | null) => void;
  activeBranch: string;
  setActiveBranch: (branch: string) => void;

  // Active Lists
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  expenses: Expense[];
  staff: Staff[];
  suppliers: Supplier[];
  stockLogs: StockLog[];
  settings: ShopSettings;

  // Mutators
  // Products
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (productId: string, delta: number, type: 'IN' | 'OUT', reasonEn: string, reasonBn: string) => void;

  // Customers
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'loyaltyPoints' | 'dueAmount'>) => void;
  collectDuePayment: (customerId: string, amount: number) => void;
  
  // Expenses
  addExpense: (expense: Omit<Expense, 'id' | 'date'>) => void;
  deleteExpense: (id: string) => void;

  // Suppliers
  addSupplier: (supplier: Omit<Supplier, 'id' | 'dueAmount'>) => void;
  updateSupplierDue: (supplierId: string, deltaAmount: number) => void;

  // Staff
  addStaff: (member: Omit<Staff, 'id' | 'salesPerformance'>) => void;
  markAttendance: (staffId: string, status: 'Present' | 'Absent' | 'Late') => void;

  // POS Processes
  checkoutPOS: (params: {
    items: { product: Product; qty: number }[];
    customerId?: string;
    discount: number;
    paymentMethod: 'Cash' | 'Card' | 'bKash' | 'Nagad' | 'Rocket';
    paidAmount: number;
  }) => Sale;

  // Configuration settings
  updateSettings: (newSettings: ShopSettings) => void;

  // Operations
  backupData: () => void;
  restoreData: () => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load State from localstorage or use initials
  const [lang, setLang] = useState<'en' | 'bn'>(() => {
    return (localStorage.getItem('hp_lang') as 'en' | 'bn') || 'en';
  });
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('hp_theme') as 'light' | 'dark') || 'light';
  });

  const [currentUser, setCurrentUser] = useState<Staff | null>(() => {
    const saved = localStorage.getItem('hp_user');
    return saved ? JSON.parse(saved) : INITIAL_STAFF[0]; // Default logged-in as Admin Hasan Ahmed
  });

  const [activeBranch, setActiveBranch] = useState<string>(() => {
    return localStorage.getItem('hp_branch') || INITIAL_SETTINGS.activeBranch;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('hp_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('hp_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('hp_sales');
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('hp_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [staff, setStaff] = useState<Staff[]>(() => {
    const saved = localStorage.getItem('hp_staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('hp_suppliers');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [stockLogs, setStockLogs] = useState<StockLog[]>(() => {
    const saved = localStorage.getItem('hp_stock_logs');
    return saved ? JSON.parse(saved) : INITIAL_STOCK_LOGS;
  });

  const [settings, setSettings] = useState<ShopSettings>(() => {
    const saved = localStorage.getItem('hp_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  // Sync utilities to localStorage
  useEffect(() => {
    localStorage.setItem('hp_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('hp_theme', theme);
    // Apply dark class to body html for styling
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('hp_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('hp_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('hp_branch', activeBranch);
  }, [activeBranch]);

  useEffect(() => {
    localStorage.setItem('hp_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('hp_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('hp_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('hp_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('hp_staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('hp_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('hp_stock_logs', JSON.stringify(stockLogs));
  }, [stockLogs]);

  useEffect(() => {
    localStorage.setItem('hp_settings', JSON.stringify(settings));
  }, [settings]);

  // Handlers Implementation
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Products Handlers
  const addProduct = (p: Omit<Product, 'id'>) => {
    const newId = 'p-' + Math.random().toString(36).substr(2, 9);
    const newProduct: Product = { ...p, id: newId };
    setProducts(prev => [newProduct, ...prev]);
    
    // Add stock log
    adjustStock(newId, p.stock, 'IN', 'Initial stock assignment', 'প্রাথমিক স্টক বরাদ্দকরণ');
  };

  const updateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const adjustStock = (productId: string, delta: number, type: 'IN' | 'OUT', reasonEn: string, reasonBn: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const nextStock = type === 'IN' ? p.stock + delta : Math.max(0, p.stock - delta);
        return { ...p, stock: nextStock };
      }
      return p;
    }));

    const matchedProd = products.find(p => p.id === productId);
    const logName = matchedProd ? matchedProd.nameEn : 'Unknown Product';

    // Log the transaction
    const newLog: StockLog = {
      id: 'l-' + Math.random().toString(36).substr(2, 9),
      productId,
      productName: logName,
      type,
      quantity: delta,
      reasonEn,
      reasonBn,
      date: new Date().toISOString(),
      operator: currentUser?.name || 'Systems Operator'
    };
    setStockLogs(prev => [newLog, ...prev]);
  };

  // Customers Handlers
  const addCustomer = (c: Omit<Customer, 'id' | 'createdAt' | 'loyaltyPoints' | 'dueAmount'>) => {
    const newId = 'c-' + Math.random().toString(36).substr(2, 9);
    const newCustomer: Customer = {
      ...c,
      id: newId,
      dueAmount: 0,
      loyaltyPoints: 0,
      createdAt: new Date().toISOString()
    };
    setCustomers(prev => [newCustomer, ...prev]);
  };

  const collectDuePayment = (customerId: string, amount: number) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        return { ...c, dueAmount: Math.max(0, c.dueAmount - amount) };
      }
      return c;
    }));

    // Record as non-POS sale or special cash log
    const newSale: Sale = {
      id: 'due-' + Math.random().toString(36).substr(2, 9),
      receiptNo: 'DUEREC-' + Math.floor(10000 + Math.random() * 90000),
      date: new Date().toISOString(),
      items: [
        {
          productId: 'due-collection',
          productNameEn: 'Due Payment Credit',
          productNameBn: 'বকেয়া পরিশোধ ক্রেডিট',
          quantity: 1,
          price: amount
        }
      ],
      subTotal: amount,
      discount: 0,
      vat: 0,
      total: amount,
      paymentMethod: 'Cash',
      paidAmount: amount,
      dueAmount: 0,
      customerId,
      customerName: customers.find(c => c.id === customerId)?.name || 'Valued Customer',
      cashierId: currentUser?.id || 'sys',
      cashierName: currentUser?.name || 'Manager',
      branchId: activeBranch
    };
    setSales(prev => [newSale, ...prev]);
  };

  // Expenses Handlers
  const addExpense = (exp: Omit<Expense, 'id' | 'date'>) => {
    const newExp: Expense = {
      ...exp,
      id: 'e-' + Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString()
    };
    setExpenses(prev => [newExp, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Suppliers Handlers
  const addSupplier = (sup: Omit<Supplier, 'id' | 'dueAmount'>) => {
    const newSup: Supplier = {
      ...sup,
      id: 'sup-' + Math.random().toString(36).substr(2, 9),
      dueAmount: 0
    };
    setSuppliers(prev => [newSup, ...prev]);
  };

  const updateSupplierDue = (supplierId: string, deltaAmount: number) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        return { ...s, dueAmount: s.dueAmount + deltaAmount };
      }
      return s;
    }));
  };

  // Staff Handlers
  const addStaff = (member: Omit<Staff, 'id' | 'salesPerformance'>) => {
    const newStaff: Staff = {
      ...member,
      id: 'st-' + Math.random().toString(36).substr(2, 9),
      salesPerformance: 0
    };
    setStaff(prev => [...prev, newStaff]);
  };

  const markAttendance = (staffId: string, status: 'Present' | 'Absent' | 'Late') => {
    setStaff(prev => prev.map(s => s.id === staffId ? { ...s, attendanceStatus: status } : s));
  };

  // POS Checkout Core Controller
  const checkoutPOS = (params: {
    items: { product: Product; qty: number }[];
    customerId?: string;
    discount: number;
    paymentMethod: 'Cash' | 'Card' | 'bKash' | 'Nagad' | 'Rocket';
    paidAmount: number;
  }) => {
    const { items, customerId, discount, paymentMethod, paidAmount } = params;

    // Calculations
    const subTotal = items.reduce((sum, item) => sum + (item.product.sellingPrice * item.qty), 0);
    const vat = 0; // Removed tax/VAT option from POS calculations
    const total = subTotal + vat - discount;
    const dueAmount = Math.max(0, total - paidAmount);

    // Auto-Decrement Stock Levels
    items.forEach(item => {
      adjustStock(
        item.product.id,
        item.qty,
        'OUT',
        `Sold via POS invoice`,
        `পিওএস ইনভয়েস এর মাধ্যমে বিক্রি`
      );
    });

    const activeCust = customers.find(c => c.id === customerId);

    // Update Customer Profile (Loyalty points & due tracking)
    if (customerId) {
      setCustomers(prev => prev.map(c => {
        if (c.id === customerId) {
          // Accumulate loyalty: 1 point per ৳100 spent
          const pointsEarned = Math.floor(total / 100);
          return {
            ...c,
            dueAmount: c.dueAmount + dueAmount,
            loyaltyPoints: c.loyaltyPoints + pointsEarned
          };
        }
        return c;
      }));
    }

    // Accumulate Staff Sales Credits
    if (currentUser) {
      setStaff(prev => prev.map(s => {
        if (s.id === currentUser.id) {
          return { ...s, salesPerformance: s.salesPerformance + total };
        }
        return s;
      }));
    }

    // Register POS Sale
    const newId = 's-' + Math.random().toString(36).substr(2, 9);
    const receiptNo = 'HP-' + Math.floor(10000 + Math.random() * 90000);
    
    const formattedItems = items.map(item => ({
      productId: item.product.id,
      productNameEn: item.product.nameEn,
      productNameBn: item.product.nameBn,
      quantity: item.qty,
      price: item.product.sellingPrice
    }));

    const newSale: Sale = {
      id: newId,
      receiptNo,
      date: new Date().toISOString(),
      items: formattedItems,
      subTotal,
      discount,
      vat,
      total,
      paymentMethod,
      paidAmount,
      dueAmount,
      customerId,
      customerName: activeCust ? activeCust.name : 'Walk-in Guest',
      cashierId: currentUser?.id || 'sys',
      cashierName: currentUser?.name || 'Manager',
      branchId: activeBranch
    };

    setSales(prev => [newSale, ...prev]);
    return newSale;
  };

  const updateSettings = (newSettings: ShopSettings) => {
    setSettings(newSettings);
  };

  // Systems Backups & Recovery Operations
  const backupData = () => {
    const backupObj = {
      products,
      customers,
      sales,
      expenses,
      staff,
      suppliers,
      stockLogs,
      settings,
      lang,
      theme,
      activeBranch
    };
    const str = JSON.stringify(backupObj);
    localStorage.setItem('hp_master_backup', str);
  };

  const restoreData = () => {
    const raw = localStorage.getItem('hp_master_backup');
    if (!raw) return;
    try {
      const obj = JSON.parse(raw);
      if (obj.products) setProducts(obj.products);
      if (obj.customers) setCustomers(obj.customers);
      if (obj.sales) setSales(obj.sales);
      if (obj.expenses) setExpenses(obj.expenses);
      if (obj.staff) setStaff(obj.staff);
      if (obj.suppliers) setSuppliers(obj.suppliers);
      if (obj.stockLogs) setStockLogs(obj.stockLogs);
      if (obj.settings) setSettings(obj.settings);
      if (obj.lang) setLang(obj.lang);
      if (obj.theme) setTheme(obj.theme);
      if (obj.activeBranch) setActiveBranch(obj.activeBranch);
    } catch (e) {
      console.error("Backup restoration failed, parsing structure mismatch.", e);
    }
  };

  return (
    <ShopContext.Provider value={{
      lang,
      setLang,
      theme,
      toggleTheme,
      currentUser,
      setCurrentUser,
      activeBranch,
      setActiveBranch,
      products,
      customers,
      sales,
      expenses,
      staff,
      suppliers,
      stockLogs,
      settings,
      addProduct,
      updateProduct,
      deleteProduct,
      adjustStock,
      addCustomer,
      collectDuePayment,
      addExpense,
      deleteExpense,
      addSupplier,
      updateSupplierDue,
      addStaff,
      markAttendance,
      checkoutPOS,
      updateSettings,
      backupData,
      restoreData
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be wrapped inside ShopProvider');
  }
  return context;
};
