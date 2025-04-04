import { 
  users, User, InsertUser,
  books, Book, InsertBook,
  categories, Category, InsertCategory,
  borrowings, Borrowing, InsertBorrowing,
  bookmarks, Bookmark, InsertBookmark,
  aiQueries, AiQuery, InsertAiQuery,
  userActivity, UserActivity, InsertUserActivity
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

// Interface for storage operations
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  
  // Books
  getBook(id: number): Promise<Book | undefined>;
  getBookByInventoryId(inventoryId: string): Promise<Book | undefined>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: number, book: Partial<Book>): Promise<Book | undefined>;
  deleteBook(id: number): Promise<boolean>;
  getAllBooks(): Promise<Book[]>;
  searchBooks(query: string): Promise<Book[]>;
  getBooksByCategory(category: string): Promise<Book[]>;
  getAvailableBooks(): Promise<Book[]>;
  
  // Categories
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryByName(name: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<Category>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  getAllCategories(): Promise<Category[]>;
  
  // Borrowings
  getBorrowing(id: number): Promise<Borrowing | undefined>;
  createBorrowing(borrowing: InsertBorrowing): Promise<Borrowing>;
  updateBorrowing(id: number, borrowing: Partial<Borrowing>): Promise<Borrowing | undefined>;
  getUserBorrowings(userId: number): Promise<Borrowing[]>;
  getActiveBorrowings(): Promise<Borrowing[]>;
  getOverdueBorrowings(): Promise<Borrowing[]>;
  
  // Bookmarks
  getBookmark(id: number): Promise<Bookmark | undefined>;
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  deleteBookmark(id: number): Promise<boolean>;
  getUserBookmarks(userId: number): Promise<Bookmark[]>;
  
  // AI Queries
  getAiQuery(id: number): Promise<AiQuery | undefined>;
  createAiQuery(query: InsertAiQuery): Promise<AiQuery>;
  getUserAiQueries(userId: number): Promise<AiQuery[]>;
  
  // User Activity
  getUserActivity(userId: number): Promise<UserActivity[]>;
  createUserActivity(activity: InsertUserActivity): Promise<UserActivity>;
  
  // Session Store
  sessionStore: session.Store;
}

// Memory Storage Implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private books: Map<number, Book>;
  private categories: Map<number, Category>;
  private borrowings: Map<number, Borrowing>;
  private bookmarks: Map<number, Bookmark>;
  private aiQueries: Map<number, AiQuery>;
  private activities: Map<number, UserActivity>;
  
  private userIdCounter: number;
  private bookIdCounter: number;
  private categoryIdCounter: number;
  private borrowingIdCounter: number;
  private bookmarkIdCounter: number;
  private aiQueryIdCounter: number;
  private activityIdCounter: number;
  
  sessionStore: session.Store;
  
  constructor() {
    this.users = new Map();
    this.books = new Map();
    this.categories = new Map();
    this.borrowings = new Map();
    this.bookmarks = new Map();
    this.aiQueries = new Map();
    this.activities = new Map();
    
    this.userIdCounter = 1;
    this.bookIdCounter = 1;
    this.categoryIdCounter = 1;
    this.borrowingIdCounter = 1;
    this.bookmarkIdCounter = 1;
    this.aiQueryIdCounter = 1;
    this.activityIdCounter = 1;
    
    // Initialize session store
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Prune expired entries every 24h
    });
    
    // Seed initial data
    this.seedInitialData();
  }
  
  // User Methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  // Books Methods
  async getBook(id: number): Promise<Book | undefined> {
    return this.books.get(id);
  }
  
  async getBookByInventoryId(inventoryId: string): Promise<Book | undefined> {
    return Array.from(this.books.values()).find(
      (book) => book.inventoryId === inventoryId
    );
  }
  
  async createBook(insertBook: InsertBook): Promise<Book> {
    const id = this.bookIdCounter++;
    const now = new Date();
    const book: Book = { ...insertBook, id, createdAt: now };
    this.books.set(id, book);
    return book;
  }
  
  async updateBook(id: number, bookData: Partial<Book>): Promise<Book | undefined> {
    const book = this.books.get(id);
    if (!book) return undefined;
    
    const updatedBook = { ...book, ...bookData };
    this.books.set(id, updatedBook);
    return updatedBook;
  }
  
  async deleteBook(id: number): Promise<boolean> {
    return this.books.delete(id);
  }
  
  async getAllBooks(): Promise<Book[]> {
    return Array.from(this.books.values());
  }
  
  async searchBooks(query: string): Promise<Book[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.books.values()).filter(book => 
      book.title.toLowerCase().includes(lowercaseQuery) ||
      book.titleAr.includes(lowercaseQuery) ||
      book.author.toLowerCase().includes(lowercaseQuery) ||
      book.authorAr.includes(lowercaseQuery) ||
      (book.description && book.description.toLowerCase().includes(lowercaseQuery)) ||
      (book.descriptionAr && book.descriptionAr.includes(lowercaseQuery))
    );
  }
  
  async getBooksByCategory(category: string): Promise<Book[]> {
    return Array.from(this.books.values()).filter(book => 
      book.category.toLowerCase() === category.toLowerCase() ||
      book.categoryAr === category
    );
  }
  
  async getAvailableBooks(): Promise<Book[]> {
    return Array.from(this.books.values()).filter(book => book.available);
  }
  
  // Categories Methods
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async getCategoryByName(name: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.name.toLowerCase() === name.toLowerCase() || 
                    category.nameAr === name
    );
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }
  
  async updateCategory(id: number, categoryData: Partial<Category>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updatedCategory = { ...category, ...categoryData };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }
  
  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }
  
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  // Borrowings Methods
  async getBorrowing(id: number): Promise<Borrowing | undefined> {
    return this.borrowings.get(id);
  }
  
  async createBorrowing(insertBorrowing: InsertBorrowing): Promise<Borrowing> {
    const id = this.borrowingIdCounter++;
    const now = new Date();
    const borrowing: Borrowing = { 
      ...insertBorrowing, 
      id, 
      borrowDate: now,
      status: "active" 
    };
    this.borrowings.set(id, borrowing);
    
    // Update book availability
    const book = this.books.get(insertBorrowing.bookId);
    if (book) {
      book.available = false;
      this.books.set(book.id, book);
    }
    
    return borrowing;
  }
  
  async updateBorrowing(id: number, borrowingData: Partial<Borrowing>): Promise<Borrowing | undefined> {
    const borrowing = this.borrowings.get(id);
    if (!borrowing) return undefined;
    
    const updatedBorrowing = { ...borrowing, ...borrowingData };
    this.borrowings.set(id, updatedBorrowing);
    
    // If returning book, update availability
    if (borrowingData.returnDate && borrowingData.status === "returned") {
      const book = this.books.get(borrowing.bookId);
      if (book) {
        book.available = true;
        this.books.set(book.id, book);
      }
    }
    
    return updatedBorrowing;
  }
  
  async getUserBorrowings(userId: number): Promise<Borrowing[]> {
    return Array.from(this.borrowings.values()).filter(
      borrowing => borrowing.userId === userId
    );
  }
  
  async getActiveBorrowings(): Promise<Borrowing[]> {
    return Array.from(this.borrowings.values()).filter(
      borrowing => borrowing.status === "active" || borrowing.status === "overdue"
    );
  }
  
  async getOverdueBorrowings(): Promise<Borrowing[]> {
    const now = new Date();
    return Array.from(this.borrowings.values()).filter(borrowing => 
      borrowing.status === "active" && borrowing.dueDate < now
    );
  }
  
  // Bookmarks Methods
  async getBookmark(id: number): Promise<Bookmark | undefined> {
    return this.bookmarks.get(id);
  }
  
  async createBookmark(insertBookmark: InsertBookmark): Promise<Bookmark> {
    const id = this.bookmarkIdCounter++;
    const now = new Date();
    const bookmark: Bookmark = { ...insertBookmark, id, createdAt: now };
    this.bookmarks.set(id, bookmark);
    return bookmark;
  }
  
  async deleteBookmark(id: number): Promise<boolean> {
    return this.bookmarks.delete(id);
  }
  
  async getUserBookmarks(userId: number): Promise<Bookmark[]> {
    return Array.from(this.bookmarks.values()).filter(
      bookmark => bookmark.userId === userId
    );
  }
  
  // AI Queries Methods
  async getAiQuery(id: number): Promise<AiQuery | undefined> {
    return this.aiQueries.get(id);
  }
  
  async createAiQuery(insertQuery: InsertAiQuery): Promise<AiQuery> {
    const id = this.aiQueryIdCounter++;
    const now = new Date();
    const query: AiQuery = { ...insertQuery, id, createdAt: now };
    this.aiQueries.set(id, query);
    return query;
  }
  
  async getUserAiQueries(userId: number): Promise<AiQuery[]> {
    return Array.from(this.aiQueries.values()).filter(
      query => query.userId === userId
    );
  }
  
  // User Activity Methods
  async getUserActivity(userId: number): Promise<UserActivity[]> {
    return Array.from(this.activities.values()).filter(
      activity => activity.userId === userId
    );
  }
  
  async createUserActivity(insertActivity: InsertUserActivity): Promise<UserActivity> {
    const id = this.activityIdCounter++;
    const now = new Date();
    const activity: UserActivity = { ...insertActivity, id, createdAt: now };
    this.activities.set(id, activity);
    return activity;
  }
  
  // Seed Initial Data
  private seedInitialData() {
    // Seed categories
    const categories: InsertCategory[] = [
      { name: "Quran Studies", nameAr: "دراسات القرآن", icon: "menu_book", bookCount: 124 },
      { name: "Hadith", nameAr: "الحديث", icon: "history_edu", bookCount: 98 },
      { name: "Fiqh", nameAr: "الفقه", icon: "account_balance", bookCount: 156 },
      { name: "Spirituality", nameAr: "الروحانية", icon: "psychology", bookCount: 87 },
      { name: "Biography", nameAr: "السيرة", icon: "auto_stories", bookCount: 72 }
    ];
    
    categories.forEach(async category => {
      await this.createCategory(category);
    });
    
    // Seed books
    const books: InsertBook[] = [
      {
        title: "The Noble Quran", 
        titleAr: "القرآن الكريم",
        author: "Translation & Commentary",
        authorAr: "ترجمة وتفسير",
        category: "Quran Studies",
        categoryAr: "دراسات القرآن",
        description: "The Noble Quran with English translation and commentary",
        descriptionAr: "القرآن الكريم مع ترجمة وتفسير باللغة الإنجليزية",
        isbn: "QRN001",
        publicationYear: 2010,
        coverImage: "https://images.unsplash.com/photo-1594732832278-abd644401426",
        available: true,
        inventoryId: "QRN001"
      },
      {
        title: "Sahih Al-Bukhari", 
        titleAr: "صحيح البخاري",
        author: "Imam Bukhari",
        authorAr: "الإمام البخاري",
        category: "Hadith",
        categoryAr: "الحديث",
        description: "The most authentic collection of Hadith compiled by Imam Bukhari",
        descriptionAr: "أصح مجموعة من الأحاديث جمعها الإمام البخاري",
        isbn: "HDT001",
        publicationYear: 1986,
        coverImage: "https://images.unsplash.com/photo-1590656872261-81a78d508292",
        available: true,
        inventoryId: "HDT001"
      },
      {
        title: "Riyad as-Salihin", 
        titleAr: "رياض الصالحين",
        author: "Imam An-Nawawi",
        authorAr: "الإمام النووي",
        category: "Hadith",
        categoryAr: "الحديث",
        description: "A compilation of verses from the Quran and hadith by Imam Nawawi",
        descriptionAr: "مجموعة من آيات القرآن والأحاديث للإمام النووي",
        isbn: "HDT012",
        publicationYear: 1990,
        coverImage: "https://images.unsplash.com/photo-1565371577816-596d0f21dd6f",
        available: false,
        inventoryId: "HDT012"
      },
      {
        title: "The Sealed Nectar", 
        titleAr: "الرحيق المختوم",
        author: "Safiur-Rahman Al-Mubarakpuri",
        authorAr: "صفي الرحمن المباركفوري",
        category: "Biography",
        categoryAr: "السيرة",
        description: "Biography of Prophet Muhammad (peace be upon him)",
        descriptionAr: "سيرة النبي محمد (صلى الله عليه وسلم)",
        isbn: "BIO005",
        publicationYear: 1996,
        coverImage: "https://images.unsplash.com/photo-1566378800032-becdeabbc2cb",
        available: true,
        inventoryId: "BIO005"
      },
      {
        title: "Islamic Jurisprudence", 
        titleAr: "الفقه الإسلامي",
        author: "Muhammad ibn Idris al-Shafi'i",
        authorAr: "محمد بن إدريس الشافعي",
        category: "Fiqh",
        categoryAr: "الفقه",
        description: "Detailed explanation of Islamic jurisprudence principles",
        descriptionAr: "شرح مفصل لمبادئ الفقه الإسلامي",
        isbn: "FQH008",
        publicationYear: 1978,
        coverImage: "https://images.unsplash.com/photo-1601723897335-ebe64614a114",
        available: true,
        inventoryId: "FQH008"
      }
    ];
    
    books.forEach(async book => {
      await this.createBook(book);
    });
  }
}

export const storage = new MemStorage();
