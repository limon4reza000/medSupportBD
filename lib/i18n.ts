export type Language = "en" | "bn";

export interface TranslationDictionary {
  [key: string]: {
    en: string;
    bn: string;
  };
}

export const translations = {
  // Navigation & Core
  appName: { en: "MedSupply BD", bn: "মেডসাপ্লাই বিডি" },
  appSubtitle: { en: "Smart Pharmacy Management Platform", bn: "স্মার্ট ফার্মেসি ম্যানেজমেন্ট প্ল্যাটফর্ম" },
  pos: { en: "Daily Sales (POS)", bn: "দৈনিক বিক্রি (POS)" },
  medicines: { en: "Medicine Database & Stock", bn: "ঔষধ ডাটাবেজ ও স্টক" },
  distributorOrders: { en: "Company / Distributor Orders", bn: "কোম্পানি / ডিস্ট্রিবিউটর অর্ডার" },
  employees: { en: "Employee Management", bn: "কর্মচারী ব্যবস্থাপনা" },
  reports: { en: "Reports & Charts", bn: "রিপোর্ট ও চার্ট" },
  customerDue: { en: "Customer Due Ledger", bn: "কাস্টমার বাকি খাতা" },
  expenses: { en: "Expense Tracking", bn: "খরচ ট্র্যাকিং" },
  mrPortal: { en: "MR / Field Manager Panel", bn: "এমআর / ফিল্ড ম্যানেজার প্যানেল" },
  settings: { en: "Settings & Backup", bn: "সেটিংস ও ব্যাকআপ" },
  dashboard: { en: "Dashboard", bn: "ড্যাশবোর্ড" },
  
  // POS
  searchMedicine: { en: "Search medicine by brand or generic name...", bn: "ব্র্যান্ড বা জেনেরিক নাম দিয়ে খুঁজুন..." },
  cart: { en: "Cart", bn: "কার্ট" },
  emptyCart: { en: "Cart is empty. Add medicines to begin sale.", bn: "কার্ট খালি। বিক্রি শুরু করতে ঔষধ যোগ করুন।" },
  box: { en: "Box", bn: "বক্স" },
  strip: { en: "Strip", bn: "পাতা/স্ট্রিপ" },
  piece: { en: "Piece", bn: "পিস" },
  subtotal: { en: "Subtotal", bn: "সাবটোটাল" },
  discount: { en: "Discount", bn: "ছাড়" },
  vatTax: { en: "VAT / Tax", bn: "ভ্যাট / ট্যাক্স" },
  netPayable: { en: "Net Payable", bn: "সর্বমোট প্রদেয়" },
  cash: { en: "Cash", bn: "নগদ (Cash)" },
  bkash: { en: "bKash", bn: "বিকাশ (bKash)" },
  nagad: { en: "Nagad", bn: "নগদ (Nagad)" },
  dueCredit: { en: "Due / Credit", bn: "বাকি (Due)" },
  splitPayment: { en: "Split Payment", bn: "মিশ্র পেমেন্ট" },
  customerName: { en: "Customer Name", bn: "গ্রাহকের নাম" },
  customerPhone: { en: "Customer Mobile", bn: "মোবাইল নম্বর" },
  amountTendered: { en: "Amount Tendered (Cash Given)", bn: "নগদ গ্রহণকৃত টাকা" },
  changeReturn: { en: "Change to Return", bn: "ফেরত দেওয়ার টাকা" },
  completeSale: { en: "Complete Sale & Print Receipt", bn: "বিক্রি সম্পন্ন ও রসিদ প্রিন্ট" },
  dailyClosing: { en: "Daily Closing Report", bn: "দৈনিক ক্লোজিং রিপোর্ট" },
  closingReport: { en: "Closing Report (Z-Report)", bn: "ক্লোজিং রিপোর্ট (Z-রিপোর্ট)" },
  shareReceipt: { en: "Share Receipt", bn: "রসিদ শেয়ার" },
  printReceipt: { en: "Print Receipt", bn: "রসিদ প্রিন্ট" },
  whatsappShare: { en: "Send via WhatsApp", bn: "হোয়াটসঅ্যাপে পাঠান" },
  
  // Medicine & Stock
  brandName: { en: "Brand Name", bn: "ব্র্যান্ডের নাম" },
  genericName: { en: "Generic Name", bn: "জেনেরিক নাম" },
  company: { en: "Company / Manufacturer", bn: "কোম্পানি" },
  strength: { en: "Strength", bn: "মাত্রা (Strength)" },
  dosageForm: { en: "Dosage Form", bn: "ডোজের ধরন" },
  purchasePrice: { en: "Purchase Price (TP)", bn: "ক্রয় মূল্য (TP)" },
  mrp: { en: "MRP", bn: "খুচরা মূল্য (MRP)" },
  batchNo: { en: "Batch Number", bn: "ব্যাচ নম্বর" },
  expiryDate: { en: "Expiry Date", bn: "মেয়াদোত্তীর্ণ তারিখ" },
  availableStock: { en: "Available Stock", bn: "মজুত পরিমাণ" },
  nearExpiryAlert: { en: "Near Expiry (< 3 Months)", bn: "মেয়াদ শেষ হচ্ছে (< ৩ মাস)" },
  lowStockAlert: { en: "Low Stock Alert", bn: "কম মজুত সতর্কতা" },
  reorderSuggestions: { en: "Reorder Suggestions", bn: "পুনরায় ক্রয়ের পরামর্শ" },
  barcodeScan: { en: "Barcode Scanner", bn: "বারকোড স্ক্যানার" },
  addMedicine: { en: "Add Medicine", bn: "নতুন ঔষধ যোগ করুন" },
  addBatch: { en: "Add New Batch", bn: "নতুন ব্যাচ যোগ করুন" },

  // Distributor Orders
  companyOrders: { en: "Company Purchase Orders", bn: "কোম্পানি ক্রয় অর্ডার" },
  companyList: { en: "Pharma Companies & MRs", bn: "ফার্মা কোম্পানি ও এমআর তালিকা" },
  createOrder: { en: "Create Purchase Order", bn: "নতুন অর্ডার তৈরি করুন" },
  orderHistory: { en: "Order History", bn: "অর্ডার ইতিহাস" },
  companyDueBalance: { en: "Company Due Balance", bn: "কোম্পানির কাছে দেনা/বাকি" },
  sendWhatsApp: { en: "Send to MR (WhatsApp)", bn: "এমআর-কে পাঠান (WhatsApp)" },
  sendSms: { en: "Send to MR (SMS)", bn: "এমআর-কে পাঠান (SMS)" },
  orderStatus: { en: "Order Status", bn: "অর্ডারের অবস্থা" },
  pending: { en: "Pending", bn: "অপেক্ষমাণ (Pending)" },
  confirmed: { en: "Confirmed", bn: "নিশ্চিত (Confirmed)" },
  delivered: { en: "Delivered", bn: "সরবরাহকৃত (Delivered)" },
  paid: { en: "Paid", bn: "পরিশোধিত" },
  partial: { en: "Partially Paid", bn: "আংশিক পরিশোধিত" },
  unpaid: { en: "Due / Unpaid", bn: "বাকি / অপরিশোধিত" },
  invoicePdf: { en: "Invoice PDF", bn: "ইনভয়েস PDF" },

  // Employee Management
  employeeDirectory: { en: "Staff & Pharmacists", bn: "কর্মচারী ও ফার্মাসিস্ট তালিকা" },
  monthlySalary: { en: "Monthly Salary Sheet", bn: "মাসিক বেতন শিট" },
  attendanceTracker: { en: "Attendance Calendar", bn: "উপস্থিতি ক্যালেন্ডার" },
  absentLeaveReport: { en: "Absence & Leave Summary", bn: "অনুপস্থিতি ও ছুটি রিপোর্ট" },
  leaveRequests: { en: "Leave Requests & Approvals", bn: "ছুটির আবেদন ও অনুমোদন" },
  baseSalary: { en: "Base Salary", bn: "মূল বেতন" },
  bonus: { en: "Bonus", bn: "বোনাস" },
  deduction: { en: "Deductions", bn: "কর্তন" },
  advance: { en: "Advance Taken", bn: "অগ্রিম গ্রহণ" },
  absenceDeduction: { en: "Absence Deduction", bn: "অনুপস্থিতির জন্য কর্তন" },
  netSalary: { en: "Net Payable Salary", bn: "প্রদেয় নিট বেতন" },
  present: { en: "Present", bn: "উপস্থিত" },
  absent: { en: "Absent", bn: "অনুপস্থিত" },
  leave: { en: "Leave", bn: "ছুটি" },

  // Reports
  monthlySalesChart: { en: "Monthly Sales Trend", bn: "মাসিক বিক্রির ধারা" },
  salesByCompany: { en: "Sales by Pharma Company", bn: "কোম্পানিভিত্তিক বিক্রি" },
  topMedicines: { en: "Top Selling Medicines", bn: "শীর্ষ বিক্রিত ঔষধ" },
  grossProfit: { en: "Gross Profit", bn: "মোট লাভ (Gross Profit)" },
  totalExpenses: { en: "Total Expenses", bn: "মোট খরচ" },
  netProfit: { en: "Net Profit (After Expenses)", bn: "নিট লাভ (খরচ বাদে)" },
  exportPdf: { en: "Export PDF", bn: "PDF ডাউনলোড" },
  exportExcel: { en: "Export Excel / CSV", bn: "এক্সেল / CSV ডাউনলোড" },

  // Customer Due
  customerDueList: { en: "Customer Due Directory", bn: "গ্রাহক বাকি খাতা" },
  collectPayment: { en: "Record Payment Collection", bn: "বাকি টাকা আদায়" },
  sendReminder: { en: "Send Due Reminder", bn: "বাকি তাগাদা পাঠান" },
  totalDue: { en: "Total Due Balance", bn: "মোট বাকি টাকা" },

  // Expenses
  expenseTracker: { en: "Daily & Monthly Expenses", bn: "দৈনিক ও মাসিক খরচ" },
  addExpense: { en: "Add Expense", bn: "নতুন খরচ লিখুন" },
  rent: { en: "Rent", bn: "দোকান ভাড়া" },
  electricity: { en: "Electricity & Utilities", bn: "বিদ্যুৎ ও ইউটিলিটি" },
  transport: { en: "Transport", bn: "পরিবহন" },
  salaryExpense: { en: "Staff Salaries", bn: "কর্মচারীদের বেতন" },
  maintenance: { en: "Maintenance", bn: "মেরামত ও রক্ষণাবেক্ষণ" },
  other: { en: "Other Expenses", bn: "অন্যান্য খরচ" },

  // MR Panel
  mrPanelTitle: { en: "MR & Territory Manager Portal", bn: "এমআর ও টেরিটরি ম্যানেজার পোর্টাল" },
  privatePanel: { en: "Private Panel (Confidential)", bn: "গোপনীয় প্যানেল (মালিক ও কর্মীদের জন্য নয়)" },
  fieldVisits: { en: "Pharmacy Visits & Notes", bn: "ফার্মেসি ভিজিট ও নোট" },
  ordersCollected: { en: "Orders Collected by MR", bn: "এমআর দ্বারা সংগৃহীত অর্ডার" },
  targetVsAchievement: { en: "Target vs Achievement", bn: "লক্ষ্যমাত্রা বনাম অর্জন" },
  unlockPanel: { en: "Unlock MR Portal", bn: "এমআর পোর্টাল আনলক করুন" },
  passcode: { en: "Enter MR Security Passcode", bn: "এমআর সিকিউরিটি পাসকোড দিন" },

  // Extras
  language: { en: "Language", bn: "ভাষা" },
  online: { en: "Online", bn: "অনলাইন" },
  offline: { en: "Offline Mode", bn: "অফলাইন মোড" },
  syncPending: { en: "Sync Pending", bn: "সিঙ্ক বাকি আছে" },
  backupRestore: { en: "Backup & Restore", bn: "ব্যাকআপ ও রিস্টোর" },
  downloadBackup: { en: "Download Full Backup (JSON)", bn: "সম্পূর্ণ ব্যাকআপ ডাউনলোড (JSON)" },
  restoreData: { en: "Restore from File", bn: "ফাইল থেকে রিস্টোর করুন" },
  resetDemo: { en: "Reset to Demo Data", bn: "ডেমো ডাটা রিসেট করুন" },
};

export const getTranslation = (key: keyof typeof translations, lang: Language): string => {
  return translations[key]?.[lang] || translations[key]?.en || key;
};
