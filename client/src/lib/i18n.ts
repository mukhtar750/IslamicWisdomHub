import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// English translations
const enTranslations = {
  common: {
    appName: "Al Hikmah Library",
    loading: "Loading...",
    error: "An error occurred",
    notFound: "Not found",
    save: "Save",
    cancel: "Cancel",
    submit: "Submit",
    delete: "Delete",
    edit: "Edit",
    more: "More",
    search: "Search",
    login: "Login",
    logout: "Logout",
    register: "Register",
    username: "Username",
    password: "Password",
    email: "Email",
    fullName: "Full Name",
    confirmPassword: "Confirm Password"
  },
  navigation: {
    home: "Home",
    catalog: "Catalog",
    aiAssistant: "AI Assistant",
    dashboard: "Dashboard",
    about: "About",
    myAccount: "My Account"
  },
  home: {
    hero: {
      title: "Discover Islamic Knowledge",
      subtitle: "Access the wealth of Islamic literature and wisdom from Al Hikmah Library's digital platform",
      searchPlaceholder: "Search for books, authors, topics...",
      quickResults: "Quick Results",
      viewAllResults: "View all results",
      browseButton: "Browse Catalog",
      askAiButton: "Ask AI Assistant"
    },
    categories: {
      title: "Browse by Category",
      books: "books"
    },
    featured: {
      title: "Featured Books",
      viewAll: "View all",
      available: "Available",
      borrowed: "Borrowed"
    },
    aiAssistant: {
      title: "Islamic Knowledge Assistant",
      subtitle: "Get answers to your Islamic questions with references from the Quran, Hadith, and Sunnah, in both English and Arabic.",
      askQuestion: "Ask your question:",
      placeholder: "E.g., What does the Quran say about kindness?",
      sampleQuestions: {
        howToPray: "How to pray?",
        hadithHonesty: "Hadith about honesty",
        fastingRamadan: "Fasting in Ramadan"
      },
      learnMore: "Learn more about the AI Assistant"
    },
    dashboard: {
      title: "Your Personal Library Experience",
      userDashboard: "User Dashboard",
      welcome: "Welcome",
      memberSince: "Member since",
      activity: {
        title: "Library Activity",
        booksBorrowed: "Books Borrowed",
        booksReturned: "Books Returned",
        bookmarks: "Bookmarks",
        aiQueries: "AI Queries"
      },
      currentBooks: {
        title: "Currently Borrowed Books",
        dueInDays: "Due in {{days}} days",
        overdueByDays: "Overdue by {{days}} days",
        renew: "Renew",
        return: "Return"
      },
      bookmarks: {
        title: "Bookmarks",
        viewAll: "View all",
        borrow: "Borrow"
      },
      goToDashboard: "Go to Dashboard"
    }
  },
  catalog: {
    title: "Book Catalog",
    search: "Search Books",
    filter: "Filter",
    sort: "Sort",
    noResults: "No books found",
    availableOnly: "Available books only",
    filters: {
      categories: "Categories",
      language: "Language",
      year: "Publication Year"
    }
  },
  book: {
    available: "Available",
    borrowed: "Borrowed",
    bookId: "Book ID",
    published: "Published",
    language: "Language",
    borrowButton: "Borrow Book",
    returnButton: "Return Book",
    renewButton: "Renew",
    bookmarkButton: "Add to Bookmarks",
    removeBookmarkButton: "Remove from Bookmarks",
    unavailable: "Currently Unavailable",
    aboutBook: "About the Book",
    aboutAuthor: "About the Author"
  },
  auth: {
    loginTitle: "Welcome Back",
    registerTitle: "Create an Account",
    loginSubtitle: "Sign in to access your personal library dashboard",
    registerSubtitle: "Join Al Hikmah Library to borrow books and use our services",
    forgotPassword: "Forgot Password?",
    alreadyHaveAccount: "Already have an account?",
    dontHaveAccount: "Don't have an account?"
  },
  aiAssistant: {
    title: "Islamic Knowledge Assistant",
    subtitle: "Ask questions about Islam and receive answers with references to the Quran, Hadith, and scholarly sources",
    askButton: "Ask",
    placeholder: "Type your question about Islam...",
    references: "References",
    recentQuestions: "Recent Questions",
    suggestedQuestions: "Suggested Questions",
    loadingAnswer: "Generating answer...",
    aiDisclaimer: "AI responses are generated based on Islamic sources but should not replace proper scholarly guidance."
  },
  dashboard: {
    welcome: "Welcome to your Dashboard",
    myBooks: "My Books",
    borrowingHistory: "Borrowing History",
    savedBooks: "Saved Books",
    aiHistory: "AI Assistant History",
    settings: "Account Settings",
    currentlyBorrowed: "Currently Borrowed",
    pastBorrowings: "Past Borrowings",
    notifications: "Notifications",
    statistics: "Statistics"
  },
  admin: {
    title: "Admin Dashboard",
    users: "User Management",
    books: "Book Management",
    borrowings: "Borrowings Management",
    addBook: "Add New Book",
    editBook: "Edit Book",
    deleteBook: "Delete Book",
    addCategory: "Add Category",
    reports: "Reports"
  },
  footer: {
    quickLinks: "Quick Links",
    browseCatalog: "Browse Catalog",
    aiAssistant: "AI Assistant",
    myAccount: "My Account",
    borrowingPolicy: "Borrowing Policy",
    contactUs: "Contact Us",
    libraryHours: "Library Hours",
    monday: "Monday - Thursday",
    friday: "Friday",
    weekend: "Saturday - Sunday",
    location: "Location",
    address: "123 Knowledge Street, Lagos, Nigeria",
    rights: "© 2023 Al Hikmah Library. All rights reserved."
  }
};

// Arabic translations
const arTranslations = {
  common: {
    appName: "مكتبة الحكمة",
    loading: "جاري التحميل...",
    error: "حدث خطأ",
    notFound: "غير موجود",
    save: "حفظ",
    cancel: "إلغاء",
    submit: "إرسال",
    delete: "حذف",
    edit: "تعديل",
    more: "المزيد",
    search: "بحث",
    login: "تسجيل الدخول",
    logout: "تسجيل الخروج",
    register: "إنشاء حساب",
    username: "اسم المستخدم",
    password: "كلمة المرور",
    email: "البريد الإلكتروني",
    fullName: "الاسم الكامل",
    confirmPassword: "تأكيد كلمة المرور"
  },
  navigation: {
    home: "الرئيسية",
    catalog: "الفهرس",
    aiAssistant: "المساعد الذكي",
    dashboard: "لوحة التحكم",
    about: "حول",
    myAccount: "حسابي"
  },
  home: {
    hero: {
      title: "اكتشف المعرفة الإسلامية",
      subtitle: "الوصول إلى ثروة الأدب الإسلامي والحكمة من منصة مكتبة الحكمة الرقمية",
      searchPlaceholder: "ابحث عن الكتب والمؤلفين والمواضيع...",
      quickResults: "نتائج سريعة",
      viewAllResults: "عرض جميع النتائج",
      browseButton: "تصفح الفهرس",
      askAiButton: "اسأل المساعد الذكي"
    },
    categories: {
      title: "تصفح حسب الفئة",
      books: "كتاب"
    },
    featured: {
      title: "الكتب المميزة",
      viewAll: "عرض الكل",
      available: "متوفر",
      borrowed: "مستعار"
    },
    aiAssistant: {
      title: "مساعد المعرفة الإسلامية",
      subtitle: "احصل على إجابات لأسئلتك الإسلامية مع مراجع من القرآن والحديث والسنة، باللغتين الإنجليزية والعربية.",
      askQuestion: "اطرح سؤالك:",
      placeholder: "مثال: ماذا يقول القرآن عن اللطف؟",
      sampleQuestions: {
        howToPray: "كيف تصلي؟",
        hadithHonesty: "حديث عن الصدق",
        fastingRamadan: "الصيام في رمضان"
      },
      learnMore: "اعرف المزيد عن المساعد الذكي"
    },
    dashboard: {
      title: "تجربة مكتبتك الشخصية",
      userDashboard: "لوحة المستخدم",
      welcome: "مرحبًا",
      memberSince: "عضو منذ",
      activity: {
        title: "نشاط المكتبة",
        booksBorrowed: "الكتب المستعارة",
        booksReturned: "الكتب المرجعة",
        bookmarks: "الإشارات المرجعية",
        aiQueries: "استعلامات الذكاء الاصطناعي"
      },
      currentBooks: {
        title: "الكتب المستعارة حاليًا",
        dueInDays: "مستحق في {{days}} أيام",
        overdueByDays: "متأخر بـ {{days}} أيام",
        renew: "تجديد",
        return: "إرجاع"
      },
      bookmarks: {
        title: "الإشارات المرجعية",
        viewAll: "عرض الكل",
        borrow: "استعارة"
      },
      goToDashboard: "الذهاب إلى لوحة التحكم"
    }
  },
  catalog: {
    title: "فهرس الكتب",
    search: "البحث عن الكتب",
    filter: "تصفية",
    sort: "ترتيب",
    noResults: "لم يتم العثور على كتب",
    availableOnly: "الكتب المتاحة فقط",
    filters: {
      categories: "الفئات",
      language: "اللغة",
      year: "سنة النشر"
    }
  },
  book: {
    available: "متوفر",
    borrowed: "مستعار",
    bookId: "معرف الكتاب",
    published: "نُشر",
    language: "اللغة",
    borrowButton: "استعارة الكتاب",
    returnButton: "إرجاع الكتاب",
    renewButton: "تجديد",
    bookmarkButton: "إضافة إلى الإشارات المرجعية",
    removeBookmarkButton: "إزالة من الإشارات المرجعية",
    unavailable: "غير متوفر حاليًا",
    aboutBook: "عن الكتاب",
    aboutAuthor: "عن المؤلف"
  },
  auth: {
    loginTitle: "مرحبًا بعودتك",
    registerTitle: "إنشاء حساب",
    loginSubtitle: "قم بتسجيل الدخول للوصول إلى لوحة تحكم المكتبة الشخصية",
    registerSubtitle: "انضم إلى مكتبة الحكمة لاستعارة الكتب واستخدام خدماتنا",
    forgotPassword: "نسيت كلمة المرور؟",
    alreadyHaveAccount: "لديك حساب بالفعل؟",
    dontHaveAccount: "ليس لديك حساب؟"
  },
  aiAssistant: {
    title: "مساعد المعرفة الإسلامية",
    subtitle: "اطرح أسئلة حول الإسلام واحصل على إجابات مع مراجع من القرآن والحديث والمصادر العلمية",
    askButton: "اسأل",
    placeholder: "اكتب سؤالك عن الإسلام...",
    references: "المراجع",
    recentQuestions: "الأسئلة الأخيرة",
    suggestedQuestions: "أسئلة مقترحة",
    loadingAnswer: "جاري إنشاء الإجابة...",
    aiDisclaimer: "تم إنشاء ردود الذكاء الاصطناعي بناءً على المصادر الإسلامية ولكن يجب ألا تحل محل التوجيه العلمي المناسب."
  },
  dashboard: {
    welcome: "مرحبًا بك في لوحة التحكم",
    myBooks: "كتبي",
    borrowingHistory: "سجل الاستعارة",
    savedBooks: "الكتب المحفوظة",
    aiHistory: "سجل المساعد الذكي",
    settings: "إعدادات الحساب",
    currentlyBorrowed: "مستعار حاليًا",
    pastBorrowings: "الاستعارات السابقة",
    notifications: "الإشعارات",
    statistics: "الإحصائيات"
  },
  admin: {
    title: "لوحة تحكم المدير",
    users: "إدارة المستخدمين",
    books: "إدارة الكتب",
    borrowings: "إدارة الاستعارات",
    addBook: "إضافة كتاب جديد",
    editBook: "تعديل كتاب",
    deleteBook: "حذف كتاب",
    addCategory: "إضافة فئة",
    reports: "التقارير"
  },
  footer: {
    quickLinks: "روابط سريعة",
    browseCatalog: "تصفح الفهرس",
    aiAssistant: "المساعد الذكي",
    myAccount: "حسابي",
    borrowingPolicy: "سياسة الاستعارة",
    contactUs: "اتصل بنا",
    libraryHours: "ساعات المكتبة",
    monday: "الاثنين - الخميس",
    friday: "الجمعة",
    weekend: "السبت - الأحد",
    location: "الموقع",
    address: "١٢٣ شارع المعرفة، لاغوس، نيجيريا",
    rights: "© ٢٠٢٣ مكتبة الحكمة. جميع الحقوق محفوظة."
  }
};

// Configure i18next
i18n.use(initReactI18next).init({
  resources: {
    en: enTranslations,
    ar: arTranslations
  },
  lng: "en", // Default language
  fallbackLng: "en",
  interpolation: {
    escapeValue: false // React already safes from XSS
  }
});

export default i18n;
