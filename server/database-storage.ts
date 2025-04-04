import { 
  users, User, InsertUser,
  books, Book, InsertBook,
  categories, Category, InsertCategory,
  borrowings, Borrowing, InsertBorrowing,
  bookmarks, Bookmark, InsertBookmark,
  aiQueries, AiQuery, InsertAiQuery,
  userActivity, UserActivity, InsertUserActivity
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq, like, and, lt, or } from "drizzle-orm";
import { IStorage } from "./storage";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true,
      tableName: 'sessions'
    });
  }
  
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }
  
  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return !!result;
  }
  
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  
  // Books
  async getBook(id: number): Promise<Book | undefined> {
    const result = await db.select().from(books).where(eq(books.id, id));
    return result[0];
  }
  
  async getBookByInventoryId(inventoryId: string): Promise<Book | undefined> {
    const result = await db.select().from(books).where(eq(books.inventoryId, inventoryId));
    return result[0];
  }
  
  async createBook(book: InsertBook): Promise<Book> {
    const result = await db.insert(books).values(book).returning();
    return result[0];
  }
  
  async updateBook(id: number, bookData: Partial<Book>): Promise<Book | undefined> {
    const result = await db.update(books)
      .set(bookData)
      .where(eq(books.id, id))
      .returning();
    return result[0];
  }
  
  async deleteBook(id: number): Promise<boolean> {
    const result = await db.delete(books).where(eq(books.id, id));
    return !!result;
  }
  
  async getAllBooks(): Promise<Book[]> {
    return await db.select().from(books);
  }
  
  async searchBooks(query: string): Promise<Book[]> {
    const searchQuery = `%${query}%`;
    return await db.select().from(books).where(
      or(
        like(books.title, searchQuery),
        like(books.titleAr, searchQuery),
        like(books.author, searchQuery),
        like(books.authorAr, searchQuery),
        like(books.description || '', searchQuery),
        like(books.descriptionAr || '', searchQuery)
      )
    );
  }
  
  async getBooksByCategory(category: string): Promise<Book[]> {
    return await db.select().from(books).where(
      or(
        eq(books.category, category),
        eq(books.categoryAr, category)
      )
    );
  }
  
  async getAvailableBooks(): Promise<Book[]> {
    return await db.select().from(books).where(eq(books.available, true));
  }
  
  // Categories
  async getCategory(id: number): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id));
    return result[0];
  }
  
  async getCategoryByName(name: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(
      or(
        eq(categories.name, name),
        eq(categories.nameAr, name)
      )
    );
    return result[0];
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(category).returning();
    return result[0];
  }
  
  async updateCategory(id: number, categoryData: Partial<Category>): Promise<Category | undefined> {
    const result = await db.update(categories)
      .set(categoryData)
      .where(eq(categories.id, id))
      .returning();
    return result[0];
  }
  
  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return !!result;
  }
  
  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }
  
  // Borrowings
  async getBorrowing(id: number): Promise<Borrowing | undefined> {
    const result = await db.select().from(borrowings).where(eq(borrowings.id, id));
    return result[0];
  }
  
  async createBorrowing(borrowing: InsertBorrowing): Promise<Borrowing> {
    const now = new Date();
    const borrowingWithDate = { 
      ...borrowing, 
      borrowDate: now, 
      status: "active" 
    };
    const result = await db.insert(borrowings).values(borrowingWithDate).returning();
    
    // Update book availability
    await db.update(books)
      .set({ available: false })
      .where(eq(books.id, borrowing.bookId));
    
    return result[0];
  }
  
  async updateBorrowing(id: number, borrowingData: Partial<Borrowing>): Promise<Borrowing | undefined> {
    const result = await db.update(borrowings)
      .set(borrowingData)
      .where(eq(borrowings.id, id))
      .returning();
    
    // If returning book, update availability
    if (borrowingData.returnDate && borrowingData.status === "returned") {
      const borrowing = result[0];
      if (borrowing) {
        await db.update(books)
          .set({ available: true })
          .where(eq(books.id, borrowing.bookId));
      }
    }
    
    return result[0];
  }
  
  async getUserBorrowings(userId: number): Promise<Borrowing[]> {
    return await db.select().from(borrowings).where(eq(borrowings.userId, userId));
  }
  
  async getActiveBorrowings(): Promise<Borrowing[]> {
    return await db.select().from(borrowings).where(
      or(
        eq(borrowings.status, "active"),
        eq(borrowings.status, "overdue")
      )
    );
  }
  
  async getOverdueBorrowings(): Promise<Borrowing[]> {
    const now = new Date();
    return await db.select().from(borrowings).where(
      and(
        eq(borrowings.status, "active"),
        lt(borrowings.dueDate, now)
      )
    );
  }
  
  // Bookmarks
  async getBookmark(id: number): Promise<Bookmark | undefined> {
    const result = await db.select().from(bookmarks).where(eq(bookmarks.id, id));
    return result[0];
  }
  
  async createBookmark(bookmark: InsertBookmark): Promise<Bookmark> {
    const result = await db.insert(bookmarks).values(bookmark).returning();
    return result[0];
  }
  
  async deleteBookmark(id: number): Promise<boolean> {
    const result = await db.delete(bookmarks).where(eq(bookmarks.id, id));
    return !!result;
  }
  
  async getUserBookmarks(userId: number): Promise<Bookmark[]> {
    return await db.select().from(bookmarks).where(eq(bookmarks.userId, userId));
  }
  
  // AI Queries
  async getAiQuery(id: number): Promise<AiQuery | undefined> {
    const result = await db.select().from(aiQueries).where(eq(aiQueries.id, id));
    return result[0];
  }
  
  async createAiQuery(query: InsertAiQuery): Promise<AiQuery> {
    const result = await db.insert(aiQueries).values(query).returning();
    return result[0];
  }
  
  async getUserAiQueries(userId: number): Promise<AiQuery[]> {
    return await db.select().from(aiQueries).where(eq(aiQueries.userId, userId));
  }
  
  // User Activity
  async getUserActivity(userId: number): Promise<UserActivity[]> {
    return await db.select().from(userActivity).where(eq(userActivity.userId, userId));
  }
  
  async createUserActivity(activity: InsertUserActivity): Promise<UserActivity> {
    const result = await db.insert(userActivity).values(activity).returning();
    return result[0];
  }
  
  // Seed data function for initial setup
  async seedInitialData() {
    // Check if there are any users already
    const existingUsers = await db.select().from(users);
    if (existingUsers.length > 0) {
      console.log("Database already has data, skipping seed");
      return;
    }
    
    console.log("Seeding initial data to database...");
    
    // Seed categories
    const categories: InsertCategory[] = [
      { name: "Quran Studies", nameAr: "دراسات القرآن", icon: "menu_book", bookCount: 124 },
      { name: "Hadith", nameAr: "الحديث", icon: "history_edu", bookCount: 98 },
      { name: "Fiqh", nameAr: "الفقه", icon: "account_balance", bookCount: 156 },
      { name: "Spirituality", nameAr: "الروحانية", icon: "psychology", bookCount: 87 },
      { name: "Biography", nameAr: "السيرة", icon: "auto_stories", bookCount: 72 }
    ];
    
    for (const category of categories) {
      await this.createCategory(category);
    }
    
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
    
    for (const book of books) {
      await this.createBook(book);
    }
    
    // Seed admin user
    const hashedPassword = "$2b$10$X7o4.KN8fdHnFjbBGPqWJOsY9H9XIS62iMyhgJV7.NkZgX7rPhJHm"; // 'password'
    
    await this.createUser({
      username: "admin",
      password: hashedPassword,
      email: "admin@alhikmahlibrary.org",
      fullName: "System Administrator",
      role: "admin"
    });
    
    // Seed librarian user
    await this.createUser({
      username: "librarian",
      password: hashedPassword,
      email: "librarian@alhikmahlibrary.org",
      fullName: "Head Librarian",
      role: "librarian"
    });
    
    // Seed regular user
    await this.createUser({
      username: "user",
      password: hashedPassword,
      email: "user@example.com",
      fullName: "Regular User",
      role: "user"
    });
    
    console.log("Database seeding completed successfully");
  }
}