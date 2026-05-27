import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Customer, Sale, Expense, Staff, Supplier, StockLog, ShopSettings } from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_EXPENSES,
  INITIAL_STAFF,
  INITIAL_SUPPLIERS,
  INITIAL_STOCK_LOGS,
  INITIAL_SETTINGS
} from '../data';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  getDoc,
  getDocs,
  getDocFromServer
} from 'firebase/firestore';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { db, auth, googleProvider, handleFirestoreError, OperationType } from '../firebase';

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

  // Firebase Auth and State
  firebaseUser: FirebaseUser | null;
  isFirebaseLoading: boolean;
  isFirebaseConnected: boolean;
  loginWithGoogle: () => Promise<void>;
  logoutFirebase: () => Promise<void>;

  // Mutators
  // Products
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  adjustStock: (productId: string, delta: number, type: 'IN' | 'OUT', reasonEn: string, reasonBn: string) => Promise<void>;

  // Customers
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'loyaltyPoints' | 'dueAmount'>) => Promise<void>;
  collectDuePayment: (customerId: string, amount: number) => Promise<void>;
  
  // Expenses
  addExpense: (expense: Omit<Expense, 'id' | 'date'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  // Suppliers (Local only)
  addSupplier: (supplier: Omit<Supplier, 'id' | 'dueAmount'>) => void;
  updateSupplierDue: (supplierId: string, deltaAmount: number) => void;

  // Staff
  addStaff: (member: Omit<Staff, 'id' | 'salesPerformance'>) => Promise<void>;
  markAttendance: (staffId: string, status: 'Present' | 'Absent' | 'Late') => Promise<void>;

  // POS Processes
  checkoutPOS: (params: {
    items: { product: Product; qty: number }[];
    customerId?: string;
    discount: number;
    paymentMethod: 'Cash' | 'Card' | 'bKash' | 'Nagad' | 'Rocket';
    paidAmount: number;
  }) => Sale;

  // Configuration settings
  updateSettings: (newSettings: ShopSettings) => Promise<void>;

  // Operations
  backupData: () => void;
  restoreData: () => void;
  startOver: () => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Localization and theme hooks
  const [lang, setLang] = useState<'en' | 'bn'>(() => {
    return (localStorage.getItem('hp_lang') as 'en' | 'bn') || 'en';
  });
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('hp_theme') as 'light' | 'dark') || 'light';
  });

  const [currentUser, setCurrentUser] = useState<Staff | null>(() => {
    const saved = localStorage.getItem('hp_user');
    return saved ? JSON.parse(saved) : INITIAL_STAFF[0];
  });

  const [activeBranch, setActiveBranch] = useState<string>(() => {
    return localStorage.getItem('hp_branch') || INITIAL_SETTINGS.activeBranch;
  });

  // Base offline lists
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [staff, setStaff] = useState<Staff[]>(INITIAL_STAFF);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [stockLogs, setStockLogs] = useState<StockLog[]>(INITIAL_STOCK_LOGS);
  const [settings, setSettings] = useState<ShopSettings>(INITIAL_SETTINGS);

  // Firebase integration states
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState<boolean>(true);
  const isFirebaseConnected = !!firebaseUser;

  // Check connection on start up as per CRITICAL CONSTRAINT
  const testConnection = async () => {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration.");
      }
    }
  };

  // Google Authentication mechanisms
  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google Auth popup failed: ", error);
    }
  };

  const logoutFirebase = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Signout failed: ", error);
    }
  };

  // Monitor Auth Changes
  useEffect(() => {
    testConnection();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return unsubscribe;
  }, []);

  // Sync parameters to local storage
  useEffect(() => {
    localStorage.setItem('hp_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('hp_theme', theme);
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

  // Seeding Helper: Populates cloud storage if a signed-in user has empty directories
  const seedFirebaseDataIfEmpty = async (userId: string) => {
    try {
      // 1. Settings Document
      const settingsRef = doc(db, 'shops', userId, 'settings', 'global');
      const settingsSnap = await getDoc(settingsRef);
      if (!settingsSnap.exists()) {
        const savedSettings = localStorage.getItem('hp_settings');
        const defaultSettings = savedSettings ? JSON.parse(savedSettings) : INITIAL_SETTINGS;
        await setDoc(settingsRef, defaultSettings);
      }

      // 2. Products Collection
      const productsColRef = collection(db, 'shops', userId, 'products');
      const productsSnap = await getDocs(productsColRef);
      if (productsSnap.empty) {
        const savedProducts = localStorage.getItem('hp_products');
        const defaultProducts: Product[] = savedProducts ? JSON.parse(savedProducts) : INITIAL_PRODUCTS;
        for (const p of defaultProducts) {
          await setDoc(doc(db, 'shops', userId, 'products', p.id), p);
        }
      }

      // 3. Customers Collection
      const customersColRef = collection(db, 'shops', userId, 'customers');
      const customersSnap = await getDocs(customersColRef);
      if (customersSnap.empty) {
        const savedCustomers = localStorage.getItem('hp_customers');
        const defaultCustomers: Customer[] = savedCustomers ? JSON.parse(savedCustomers) : INITIAL_CUSTOMERS;
        for (const c of defaultCustomers) {
          await setDoc(doc(db, 'shops', userId, 'customers', c.id), c);
        }
      }

      // 4. Expenses Collection
      const expensesColRef = collection(db, 'shops', userId, 'expenses');
      const expensesSnap = await getDocs(expensesColRef);
      if (expensesSnap.empty) {
        const savedExpenses = localStorage.getItem('hp_expenses');
        const defaultExpenses: Expense[] = savedExpenses ? JSON.parse(savedExpenses) : INITIAL_EXPENSES;
        for (const e of defaultExpenses) {
          await setDoc(doc(db, 'shops', userId, 'expenses', e.id), e);
        }
      }

      // 5. Staff Collection
      const staffColRef = collection(db, 'shops', userId, 'staff');
      const staffSnap = await getDocs(staffColRef);
      if (staffSnap.empty) {
        const savedStaff = localStorage.getItem('hp_staff');
        const defaultStaff: Staff[] = savedStaff ? JSON.parse(savedStaff) : INITIAL_STAFF;
        for (const s of defaultStaff) {
          await setDoc(doc(db, 'shops', userId, 'staff', s.id), s);
        }
      }
    } catch (e) {
      console.error("Cloud Seeding error: ", e);
    }
  };

  // Realtime Cloud Synchronization Effects
  useEffect(() => {
    if (!isFirebaseConnected || !firebaseUser) {
      // Fallback: Read state values from Local Storage or default initials
      const savedProducts = localStorage.getItem('hp_products');
      setProducts(savedProducts ? JSON.parse(savedProducts) : INITIAL_PRODUCTS);
      
      const savedCustomers = localStorage.getItem('hp_customers');
      setCustomers(savedCustomers ? JSON.parse(savedCustomers) : INITIAL_CUSTOMERS);
      
      const savedSales = localStorage.getItem('hp_sales');
      setSales(savedSales ? JSON.parse(savedSales) : []);
      
      const savedExpenses = localStorage.getItem('hp_expenses');
      setExpenses(savedExpenses ? JSON.parse(savedExpenses) : []);
      
      const savedStaff = localStorage.getItem('hp_staff');
      setStaff(savedStaff ? JSON.parse(savedStaff) : INITIAL_STAFF);

      const savedSettings = localStorage.getItem('hp_settings');
      setSettings(savedSettings ? JSON.parse(savedSettings) : INITIAL_SETTINGS);

      setIsFirebaseLoading(false);
      return;
    }

    const userId = firebaseUser.uid;
    setIsFirebaseLoading(true);

    let unsubProducts = () => {};
    let unsubCustomers = () => {};
    let unsubSales = () => {};
    let unsubExpenses = () => {};
    let unsubStaff = () => {};
    let unsubSettings = () => {};

    seedFirebaseDataIfEmpty(userId).then(() => {
      // Realtime lists subscriptions
      unsubProducts = onSnapshot(collection(db, 'shops', userId, 'products'), (snapshot) => {
        const list: Product[] = [];
        snapshot.forEach(doc => list.push(doc.data() as Product));
        setProducts(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, `shops/${userId}/products`);
      });

      unsubCustomers = onSnapshot(collection(db, 'shops', userId, 'customers'), (snapshot) => {
        const list: Customer[] = [];
        snapshot.forEach(doc => list.push(doc.data() as Customer));
        setCustomers(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, `shops/${userId}/customers`);
      });

      unsubSales = onSnapshot(collection(db, 'shops', userId, 'sales'), (snapshot) => {
        const list: Sale[] = [];
        snapshot.forEach(doc => list.push(doc.data() as Sale));
        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setSales(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, `shops/${userId}/sales`);
      });

      unsubExpenses = onSnapshot(collection(db, 'shops', userId, 'expenses'), (snapshot) => {
        const list: Expense[] = [];
        snapshot.forEach(doc => list.push(doc.data() as Expense));
        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setExpenses(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, `shops/${userId}/expenses`);
      });

      unsubStaff = onSnapshot(collection(db, 'shops', userId, 'staff'), (snapshot) => {
        const list: Staff[] = [];
        snapshot.forEach(doc => list.push(doc.data() as Staff));
        setStaff(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, `shops/${userId}/staff`);
      });

      unsubSettings = onSnapshot(doc(db, 'shops', userId, 'settings', 'global'), (doc) => {
        if (doc.exists()) {
          setSettings(doc.data() as ShopSettings);
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `shops/${userId}/settings/global`);
      });

      setIsFirebaseLoading(false);
    });

    return () => {
      unsubProducts();
      unsubCustomers();
      unsubSales();
      unsubExpenses();
      unsubStaff();
      unsubSettings();
    };
  }, [firebaseUser, isFirebaseConnected]);

  // Sync changes back to Local Storage if offline
  useEffect(() => {
    if (!isFirebaseConnected) {
      localStorage.setItem('hp_products', JSON.stringify(products));
    }
  }, [products, isFirebaseConnected]);

  useEffect(() => {
    if (!isFirebaseConnected) {
      localStorage.setItem('hp_customers', JSON.stringify(customers));
    }
  }, [customers, isFirebaseConnected]);

  useEffect(() => {
    if (!isFirebaseConnected) {
      localStorage.setItem('hp_sales', JSON.stringify(sales));
    }
  }, [sales, isFirebaseConnected]);

  useEffect(() => {
    if (!isFirebaseConnected) {
      localStorage.setItem('hp_expenses', JSON.stringify(expenses));
    }
  }, [expenses, isFirebaseConnected]);

  useEffect(() => {
    if (!isFirebaseConnected) {
      localStorage.setItem('hp_staff', JSON.stringify(staff));
    }
  }, [staff, isFirebaseConnected]);

  useEffect(() => {
    localStorage.setItem('hp_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('hp_stock_logs', JSON.stringify(stockLogs));
  }, [stockLogs]);

  useEffect(() => {
    if (!isFirebaseConnected) {
      localStorage.setItem('hp_settings', JSON.stringify(settings));
    }
  }, [settings, isFirebaseConnected]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Products Mutation Actions
  const addProduct = async (p: Omit<Product, 'id'>) => {
    const newId = 'p-' + Math.random().toString(36).substr(2, 9);
    const newProduct: Product = { ...p, id: newId };
    
    if (isFirebaseConnected && firebaseUser) {
      try {
        await setDoc(doc(db, 'shops', firebaseUser.uid, 'products', newId), newProduct);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `shops/${firebaseUser.uid}/products/${newId}`);
      }
    } else {
      setProducts(prev => [newProduct, ...prev]);
    }
    
    await adjustStock(newId, p.stock, 'IN', 'Initial stock assignment', 'প্রাথমিক স্টক বরাদ্দকরণ');
  };

  const updateProduct = async (updated: Product) => {
    if (isFirebaseConnected && firebaseUser) {
      try {
        await setDoc(doc(db, 'shops', firebaseUser.uid, 'products', updated.id), updated);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `shops/${firebaseUser.uid}/products/${updated.id}`);
      }
    } else {
      setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    }
  };

  const deleteProduct = async (id: string) => {
    if (isFirebaseConnected && firebaseUser) {
      try {
        await deleteDoc(doc(db, 'shops', firebaseUser.uid, 'products', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `shops/${firebaseUser.uid}/products/${id}`);
      }
    } else {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const adjustStock = async (productId: string, delta: number, type: 'IN' | 'OUT', reasonEn: string, reasonBn: string) => {
    const matchedProd = products.find(p => p.id === productId);
    if (!matchedProd) return;

    const nextStock = type === 'IN' ? matchedProd.stock + delta : Math.max(0, matchedProd.stock - delta);
    const updatedProd = { ...matchedProd, stock: nextStock };

    if (isFirebaseConnected && firebaseUser) {
      try {
        await setDoc(doc(db, 'shops', firebaseUser.uid, 'products', productId), updatedProd);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `shops/${firebaseUser.uid}/products/${productId}`);
      }
    } else {
      setProducts(prev => prev.map(p => p.id === productId ? updatedProd : p));
    }

    const logName = matchedProd ? matchedProd.nameEn : 'Unknown Product';
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

  // Customers Mutation Actions
  const addCustomer = async (c: Omit<Customer, 'id' | 'createdAt' | 'loyaltyPoints' | 'dueAmount'>) => {
    const newId = 'c-' + Math.random().toString(36).substr(2, 9);
    const newCustomer: Customer = {
      ...c,
      id: newId,
      dueAmount: 0,
      loyaltyPoints: 0,
      createdAt: new Date().toISOString()
    };

    if (isFirebaseConnected && firebaseUser) {
      try {
        await setDoc(doc(db, 'shops', firebaseUser.uid, 'customers', newId), newCustomer);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `shops/${firebaseUser.uid}/customers/${newId}`);
      }
    } else {
      setCustomers(prev => [newCustomer, ...prev]);
    }
  };

  const collectDuePayment = async (customerId: string, amount: number) => {
    const target = customers.find(c => c.id === customerId);
    if (!target) return;

    const nextDue = Math.max(0, target.dueAmount - amount);
    const updated = { ...target, dueAmount: nextDue };

    const newSaleId = 'due-' + Math.random().toString(36).substr(2, 9);
    const receiptNo = 'DUEREC-' + Math.floor(10000 + Math.random() * 90000);
    const newSale: Sale = {
      id: newSaleId,
      receiptNo,
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
      customerName: target.name || 'Valued Customer',
      cashierId: currentUser?.id || 'sys',
      cashierName: currentUser?.name || 'Manager',
      branchId: activeBranch
    };

    if (isFirebaseConnected && firebaseUser) {
      try {
        await setDoc(doc(db, 'shops', firebaseUser.uid, 'customers', customerId), updated);
        await setDoc(doc(db, 'shops', firebaseUser.uid, 'sales', newSaleId), newSale);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `shops/${firebaseUser.uid}/customers/${customerId}`);
      }
    } else {
      setCustomers(prev => prev.map(c => c.id === customerId ? updated : c));
      setSales(prev => [newSale, ...prev]);
    }
  };

  // Expenses Mutation Actions
  const addExpense = async (exp: Omit<Expense, 'id' | 'date'>) => {
    const newId = 'e-' + Math.random().toString(36).substr(2, 9);
    const newExp: Expense = {
      ...exp,
      id: newId,
      date: new Date().toISOString()
    };

    if (isFirebaseConnected && firebaseUser) {
      try {
        await setDoc(doc(db, 'shops', firebaseUser.uid, 'expenses', newId), newExp);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `shops/${firebaseUser.uid}/expenses/${newId}`);
      }
    } else {
      setExpenses(prev => [newExp, ...prev]);
    }
  };

  const deleteExpense = async (id: string) => {
    if (isFirebaseConnected && firebaseUser) {
      try {
        await deleteDoc(doc(db, 'shops', firebaseUser.uid, 'expenses', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `shops/${firebaseUser.uid}/expenses/${id}`);
      }
    } else {
      setExpenses(prev => prev.filter(e => e.id !== id));
    }
  };

  // Local-only Suppliers actions
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

  // Staff Mutation Actions
  const addStaff = async (member: Omit<Staff, 'id' | 'salesPerformance'>) => {
    const newId = 'st-' + Math.random().toString(36).substr(2, 9);
    const newStaff: Staff = {
      ...member,
      id: newId,
      salesPerformance: 0
    };

    if (isFirebaseConnected && firebaseUser) {
      try {
        await setDoc(doc(db, 'shops', firebaseUser.uid, 'staff', newId), newStaff);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `shops/${firebaseUser.uid}/staff/${newId}`);
      }
    } else {
      setStaff(prev => [...prev, newStaff]);
    }
  };

  const markAttendance = async (staffId: string, status: 'Present' | 'Absent' | 'Late') => {
    const target = staff.find(s => s.id === staffId);
    if (!target) return;
    const updated = { ...target, attendanceStatus: status };

    if (isFirebaseConnected && firebaseUser) {
      try {
        await setDoc(doc(db, 'shops', firebaseUser.uid, 'staff', staffId), updated);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `shops/${firebaseUser.uid}/staff/${staffId}`);
      }
    } else {
      setStaff(prev => prev.map(s => s.id === staffId ? updated : s));
    }
  };

  // POS Processes checkout
  const checkoutPOS = (params: {
    items: { product: Product; qty: number }[];
    customerId?: string;
    discount: number;
    paymentMethod: 'Cash' | 'Card' | 'bKash' | 'Nagad' | 'Rocket';
    paidAmount: number;
  }) => {
    const { items, customerId, discount, paymentMethod, paidAmount } = params;

    const subTotal = items.reduce((sum, item) => sum + (item.product.sellingPrice * item.qty), 0);
    const vat = 0; 
    const total = subTotal + vat - discount;
    const dueAmount = Math.max(0, total - paidAmount);

    // Auto stock decrements
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

    if (isFirebaseConnected && firebaseUser) {
      // 1. Save Sale record to Firestore
      setDoc(doc(db, 'shops', firebaseUser.uid, 'sales', newId), newSale).catch(error => {
        handleFirestoreError(error, OperationType.CREATE, `shops/${firebaseUser.uid}/sales/${newId}`);
      });

      // 2. Adjust cloud Loyalty points & due tracking
      if (customerId && activeCust) {
        const pointsEarned = Math.floor(total / 100);
        const updatedCust = {
          ...activeCust,
          dueAmount: activeCust.dueAmount + dueAmount,
          loyaltyPoints: activeCust.loyaltyPoints + pointsEarned
        };
        setDoc(doc(db, 'shops', firebaseUser.uid, 'customers', customerId), updatedCust).catch(error => {
          handleFirestoreError(error, OperationType.UPDATE, `shops/${firebaseUser.uid}/customers/${customerId}`);
        });
      }

      // 3. Increment cloud sales Performance status for cashier staff
      if (currentUser) {
        const staffMem = staff.find(s => s.id === currentUser.id);
        if (staffMem) {
          const updatedStaff = {
            ...staffMem,
            salesPerformance: staffMem.salesPerformance + total
          };
          setDoc(doc(db, 'shops', firebaseUser.uid, 'staff', currentUser.id), updatedStaff).catch(error => {
            handleFirestoreError(error, OperationType.UPDATE, `shops/${firebaseUser.uid}/staff/${currentUser.id}`);
          });
        }
      }
    } else {
      // Offline fallback handlers
      if (customerId) {
        setCustomers(prev => prev.map(c => {
          if (c.id === customerId) {
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

      if (currentUser) {
        setStaff(prev => prev.map(s => {
          if (s.id === currentUser.id) {
            return { ...s, salesPerformance: s.salesPerformance + total };
          }
          return s;
        }));
      }

      setSales(prev => [newSale, ...prev]);
    }

    return newSale;
  };

  const updateSettings = async (newSettings: ShopSettings) => {
    if (isFirebaseConnected && firebaseUser) {
      try {
        await setDoc(doc(db, 'shops', firebaseUser.uid, 'settings', 'global'), newSettings);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `shops/${firebaseUser.uid}/settings/global`);
      }
    } else {
      setSettings(newSettings);
    }
  };

  // Offline Backups mechanisms
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
    localStorage.setItem('hp_master_backup', JSON.stringify(backupObj));
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
      console.error("Backup restoration failed: ", e);
    }
  };

  const startOver = async () => {
    // 1. Clear LocalStorage keys
    const keysToRemoval = [
      'hp_products', 'hp_customers', 'hp_sales', 'hp_expenses', 'hp_staff',
      'hp_settings', 'hp_suppliers', 'hp_stock_logs', 'hp_master_backup',
      'hp_user', 'hp_branch'
    ];
    keysToRemoval.forEach(k => localStorage.removeItem(k));

    // 2. If logged in with Firebase, delete their custom documents
    if (isFirebaseConnected && firebaseUser) {
      try {
        // Delete all products
        for (const p of products) {
          await deleteDoc(doc(db, 'shops', firebaseUser.uid, 'products', p.id));
        }
        // Delete all customers
        for (const c of customers) {
          await deleteDoc(doc(db, 'shops', firebaseUser.uid, 'customers', c.id));
        }
        // Delete all sales
        for (const s of sales) {
          await deleteDoc(doc(db, 'shops', firebaseUser.uid, 'sales', s.id));
        }
        // Delete all expenses
        for (const e of expenses) {
          await deleteDoc(doc(db, 'shops', firebaseUser.uid, 'expenses', e.id));
        }
        // Delete all staff (except preserving the default ones)
        for (const stf of staff) {
          await deleteDoc(doc(db, 'shops', firebaseUser.uid, 'staff', stf.id));
        }
        // Restore default settings
        await setDoc(doc(db, 'shops', firebaseUser.uid, 'settings', 'global'), INITIAL_SETTINGS);
      } catch (err) {
        console.error("Failed to fully wipe Firestore during startover: ", err);
      }
    }

    // 3. Reset internal React states to blank slate
    setProducts([]);
    setCustomers([]);
    setSales([]);
    setExpenses([]);
    setStaff(INITIAL_STAFF.map(s => ({ ...s, salesPerformance: 0 })));
    setSuppliers([]);
    setStockLogs([]);
    setSettings(INITIAL_SETTINGS);
    setCurrentUser(INITIAL_STAFF[0]);
    setActiveBranch(INITIAL_SETTINGS.activeBranch);
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
      firebaseUser,
      isFirebaseLoading,
      isFirebaseConnected,
      loginWithGoogle,
      logoutFirebase,
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
      restoreData,
      startOver
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
