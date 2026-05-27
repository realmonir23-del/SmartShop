import { Product, Customer, Sale, Expense, Staff, Supplier, StockLog, ShopSettings } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "p1",
    nameEn: "Miniket Rice Premium 10kg",
    nameBn: "মিনিকেট চাল প্রিমিয়াম ১০ কেজি",
    code: "8901030755861",
    categoryEn: "Rice & Grains",
    categoryBn: "চাল ও ডাল",
    purchasePrice: 650,
    sellingPrice: 720,
    stock: 25,
    alertLimit: 5,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=120"
  },
  {
    id: "p2",
    nameEn: "Teer Soybean Oil 5L",
    nameBn: "তীর সয়াবিন তেল ৫ লিটার",
    code: "8941234560021",
    categoryEn: "Cooking Oil",
    categoryBn: "ভোজ্য তেল",
    purchasePrice: 780,
    sellingPrice: 830,
    stock: 12,
    alertLimit: 4,
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=120"
  },
  {
    id: "p3",
    nameEn: "Radhuni Turmeric Powder 200g",
    nameBn: "রাঁধুনী হলুদ গুঁড়ো ২০০ গ্রাম",
    code: "8941234560038",
    categoryEn: "Spices & Herbs",
    categoryBn: "মসলা সামগ্রী",
    purchasePrice: 65,
    sellingPrice: 80,
    stock: 45,
    alertLimit: 10,
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=120"
  },
  {
    id: "p4",
    nameEn: "Sunsilk Shampoo Smooth 375ml",
    nameBn: "সানসিল্ক শ্যাম্পু স্মুথ ৩৭৫ মিলি",
    code: "8901030825960",
    categoryEn: "Cosmetics & Care",
    categoryBn: "কসমেটিকস ও কেয়ার",
    purchasePrice: 320,
    sellingPrice: 380,
    stock: 3, // Trigger Low Stock Alert!
    alertLimit: 5,
    image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?q=80&w=120"
  },
  {
    id: "p5",
    nameEn: "Savlon Antiseptic Liquid 1L",
    nameBn: "স্যাভলন লিকুইড এন্ট্রি সেপটিক ১ লিটার",
    code: "8941234560052",
    categoryEn: "Hygiene & Pharmacy",
    categoryBn: "ফার্মেসি ও হাইজিন",
    purchasePrice: 240,
    sellingPrice: 275,
    stock: 18,
    alertLimit: 5,
    image: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?q=80&w=120"
  },
  {
    id: "p6",
    nameEn: "Dano Powder Milk Daily 1kg",
    nameBn: "ডানো গুঁড়ো দুধ ডেইলি ১ কেজি",
    code: "8941234560069",
    categoryEn: "Dairy Products",
    categoryBn: "দুগ্ধ জাতীয়",
    purchasePrice: 740,
    sellingPrice: 820,
    stock: 2, // Trigger Low Stock Alert!
    alertLimit: 4,
    image: "https://images.unsplash.com/photo-1380060941305-64dc5ba9b265?q=80&w=120"
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "c1",
    name: "Kamal Uddin (Mirpur)",
    phone: "01712345678",
    dueAmount: 1250,
    loyaltyPoints: 120,
    createdAt: "2026-05-20T08:00:00Z"
  },
  {
    id: "c2",
    name: "Sultana Begum",
    phone: "01823456789",
    dueAmount: 0,
    loyaltyPoints: 340,
    createdAt: "2026-05-21T09:00:00Z"
  },
  {
    id: "c3",
    name: "Mohammad Yusuf",
    phone: "01934567890",
    dueAmount: 4300,
    loyaltyPoints: 50,
    createdAt: "2026-05-22T10:00:00Z"
  },
  {
    id: "c4",
    name: "Anika Rahman (Dhanmondi)",
    phone: "01545678901",
    dueAmount: 0,
    loyaltyPoints: 15,
    createdAt: "2026-05-25T11:00:00Z"
  }
];

export const INITIAL_SALES: Sale[] = [
  {
    id: "s1",
    receiptNo: "HP-10025",
    date: "2026-05-26T10:30:00Z",
    items: [
      {
        productId: "p1",
        productNameEn: "Miniket Rice Premium 10kg",
        productNameBn: "মিনিকেট চাল প্রিমিয়াম ১০ কেজি",
        quantity: 1,
        price: 720
      },
      {
        productId: "p3",
        productNameEn: "Radhuni Turmeric Powder 200g",
        productNameBn: "রাঁধুনী হলুদ গুঁড়ো ২০০ গ্রাম",
        quantity: 2,
        price: 80
      }
    ],
    subTotal: 880,
    discount: 30,
    vat: 44,
    total: 894,
    paymentMethod: "bKash",
    paidAmount: 894,
    dueAmount: 0,
    customerId: "c2",
    customerName: "Sultana Begum",
    cashierId: "st1",
    cashierName: "Hasan Ahmed",
    branchId: "b-01"
  },
  {
    id: "s2",
    receiptNo: "HP-10026",
    date: "2026-05-26T14:15:00Z",
    items: [
      {
        productId: "p2",
        productNameEn: "Teer Soybean Oil 5L",
        productNameBn: "তীর সয়াবিন তেল ৫ লিটার",
        quantity: 1,
        price: 830
      }
    ],
    subTotal: 830,
    discount: 0,
    vat: 41.5,
    total: 871.5,
    paymentMethod: "Cash",
    paidAmount: 871.5,
    dueAmount: 0,
    customerId: undefined,
    customerName: "Walk-in Guest",
    cashierId: "st2",
    cashierName: "Kazi Nabil",
    branchId: "b-01"
  },
  {
    id: "s3",
    receiptNo: "HP-10027",
    date: "2026-05-27T08:12:00Z", // Today's sale
    items: [
      {
        productId: "p5",
        productNameEn: "Savlon Antiseptic Liquid 1L",
        productNameBn: "স্যাভলন লিকুইড এন্ট্রি সেপটিক ১ লিটার",
        quantity: 2,
        price: 275
      }
    ],
    subTotal: 550,
    discount: 50,
    vat: 27.5,
    total: 527.5,
    paymentMethod: "Nagad",
    paidAmount: 527.5,
    dueAmount: 0,
    customerId: "c1",
    customerName: "Kamal Uddin (Mirpur)",
    cashierId: "st1",
    cashierName: "Hasan Ahmed",
    branchId: "b-01"
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: "e1",
    title: "Store Rent Mirpur Outlet",
    categoryEn: "Rent",
    categoryBn: "ভাড়া",
    amount: 12000,
    date: "2026-05-01T06:00:00Z",
    description: "Paid rental for Mirpur physical outlet branch."
  },
  {
    id: "e2",
    title: "Sells Desk Tea & Biscuits",
    categoryEn: "Refreshments",
    categoryBn: "আপ্যায়ন",
    amount: 320,
    date: "2026-05-26T12:00:00Z",
    description: "Entertainment snacks bought for customers."
  },
  {
    id: "e3",
    title: "Electricity DESCO Bill",
    categoryEn: "Utilities",
    categoryBn: "ইউটিলিটি বিল",
    amount: 3450,
    date: "2026-05-15T09:00:00Z",
    description: "Monthly power connection bill."
  }
];

export const INITIAL_STAFF: Staff[] = [
  {
    id: "st1",
    name: "Hasan Ahmed",
    role: "Admin",
    email: "hasan@smartshop.com",
    phone: "01711223344",
    attendanceStatus: "Present",
    salesPerformance: 125000
  },
  {
    id: "st2",
    name: "Kazi Nabil",
    role: "Salesperson",
    email: "nabil@smartshop.com",
    phone: "01855667788",
    attendanceStatus: "Present",
    salesPerformance: 45000
  },
  {
    id: "st3",
    name: "Tahmina Chowdhury",
    role: "Manager",
    email: "tahmina@smartshop.com",
    phone: "01999887766",
    attendanceStatus: "Absent",
    salesPerformance: 89000
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: "sup1",
    name: "Abul Khair Foods Ltd",
    phone: "01899998888",
    email: "contact@abulkhair.com",
    companyName: "Abul Khair Distributors",
    dueAmount: 8500
  },
  {
    id: "sup2",
    name: "Unilever BD Mirpur Agent",
    phone: "01722233344",
    email: "agent.unilever@unilever.com",
    companyName: "Unilever Bangladesh",
    dueAmount: 0
  }
];

export const INITIAL_STOCK_LOGS: StockLog[] = [
  {
    id: "l1",
    productId: "p1",
    productName: "Miniket Rice Premium 10kg",
    type: "IN",
    quantity: 15,
    reasonEn: "Supplier Purchase",
    reasonBn: "নতুন সোর্সিং সরবরাহ",
    date: "2026-05-25T05:00:00Z",
    operator: "Tahmina Chowdhury"
  },
  {
    id: "l2",
    productId: "p4",
    productName: "Sunsilk Shampoo Smooth 375ml",
    type: "OUT",
    quantity: 1,
    reasonEn: "Item damaged / spilled on shelf",
    reasonBn: "বোতল লিক হয়ে নষ্ট বা অপচয়",
    date: "2026-05-26T15:20:00Z",
    operator: "Kazi Nabil"
  }
];

export const INITIAL_SETTINGS: ShopSettings = {
  shopNameEn: "Mizaan Super Store",
  shopNameBn: "মিজান সুপার স্টোর",
  addressEn: "Section 10, Mirpur, Dhaka-1216",
  addressBn: "সেকশন ১০, মিরপুর, ঢাকা-১২১৬",
  phone: "01712345678",
  vatRate: 5,
  currency: "৳",
  branches: ["Mirpur Main Outlet", "Dhanmondi Express", "Chittagong GEC Branch"],
  activeBranch: "Mirpur Main Outlet"
};
