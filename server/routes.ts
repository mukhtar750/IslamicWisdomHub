import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { getIslamicKnowledgeResponse } from "./ai-assistant";
import { 
  insertBookSchema, 
  insertCategorySchema, 
  insertBorrowingSchema,
  insertBookmarkSchema
} from "@shared/schema";
import { z } from "zod";

// Helper function to check if user is authenticated
function isAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
}

// Helper function to check if user is admin or librarian
function isAdminOrLibrarian(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated() && (req.user?.role === "admin" || req.user?.role === "librarian")) {
    return next();
  }
  res.status(403).json({ message: "Insufficient permissions" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // API Routes
  // =========================================================
  
  // Books API
  app.get("/api/books", async (req, res) => {
    try {
      if (req.query.search) {
        const books = await storage.searchBooks(req.query.search as string);
        return res.json(books);
      }
      
      if (req.query.category) {
        const books = await storage.getBooksByCategory(req.query.category as string);
        return res.json(books);
      }
      
      const books = await storage.getAllBooks();
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: "Error fetching books" });
    }
  });
  
  app.get("/api/books/:id", async (req, res) => {
    try {
      const book = await storage.getBook(parseInt(req.params.id));
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      res.json(book);
    } catch (error) {
      res.status(500).json({ message: "Error fetching book" });
    }
  });
  
  app.post("/api/books", isAdminOrLibrarian, async (req, res) => {
    try {
      const bookData = insertBookSchema.parse(req.body);
      const book = await storage.createBook(bookData);
      res.status(201).json(book);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid book data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating book" });
    }
  });
  
  app.put("/api/books/:id", isAdminOrLibrarian, async (req, res) => {
    try {
      const bookId = parseInt(req.params.id);
      const book = await storage.getBook(bookId);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      const updatedBook = await storage.updateBook(bookId, req.body);
      res.json(updatedBook);
    } catch (error) {
      res.status(500).json({ message: "Error updating book" });
    }
  });
  
  app.delete("/api/books/:id", isAdminOrLibrarian, async (req, res) => {
    try {
      const bookId = parseInt(req.params.id);
      const book = await storage.getBook(bookId);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      await storage.deleteBook(bookId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting book" });
    }
  });
  
  // Categories API
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Error fetching categories" });
    }
  });
  
  app.post("/api/categories", isAdminOrLibrarian, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating category" });
    }
  });
  
  // Borrowings API
  app.get("/api/borrowings", isAuthenticated, async (req, res) => {
    try {
      if (req.user?.role === "admin" || req.user?.role === "librarian") {
        const borrowings = await storage.getActiveBorrowings();
        return res.json(borrowings);
      }
      
      const borrowings = await storage.getUserBorrowings(req.user!.id);
      res.json(borrowings);
    } catch (error) {
      res.status(500).json({ message: "Error fetching borrowings" });
    }
  });
  
  app.post("/api/borrowings", isAuthenticated, async (req, res) => {
    try {
      const borrowingData = insertBorrowingSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      // Check if book is available
      const book = await storage.getBook(borrowingData.bookId);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      if (!book.available) {
        return res.status(400).json({ message: "Book is not available" });
      }
      
      const borrowing = await storage.createBorrowing(borrowingData);
      
      // Record user activity
      await storage.createUserActivity({
        userId: req.user!.id,
        activityType: "borrow",
        bookId: borrowingData.bookId
      });
      
      res.status(201).json(borrowing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid borrowing data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating borrowing" });
    }
  });
  
  app.patch("/api/borrowings/:id/return", isAuthenticated, async (req, res) => {
    try {
      const borrowingId = parseInt(req.params.id);
      const borrowing = await storage.getBorrowing(borrowingId);
      
      if (!borrowing) {
        return res.status(404).json({ message: "Borrowing record not found" });
      }
      
      // Only admin/librarian or the user who borrowed can return
      if (req.user!.id !== borrowing.userId && 
          req.user!.role !== "admin" && 
          req.user!.role !== "librarian") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const now = new Date();
      const updatedBorrowing = await storage.updateBorrowing(borrowingId, {
        returnDate: now,
        status: "returned"
      });
      
      // Record user activity
      await storage.createUserActivity({
        userId: borrowing.userId,
        activityType: "return",
        bookId: borrowing.bookId
      });
      
      res.json(updatedBorrowing);
    } catch (error) {
      res.status(500).json({ message: "Error returning book" });
    }
  });
  
  // Bookmarks API
  app.get("/api/bookmarks", isAuthenticated, async (req, res) => {
    try {
      const bookmarks = await storage.getUserBookmarks(req.user!.id);
      res.json(bookmarks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching bookmarks" });
    }
  });
  
  app.post("/api/bookmarks", isAuthenticated, async (req, res) => {
    try {
      const bookmarkData = insertBookmarkSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      // Check if book exists
      const book = await storage.getBook(bookmarkData.bookId);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      const bookmark = await storage.createBookmark(bookmarkData);
      
      // Record user activity
      await storage.createUserActivity({
        userId: req.user!.id,
        activityType: "bookmark",
        bookId: bookmarkData.bookId
      });
      
      res.status(201).json(bookmark);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid bookmark data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating bookmark" });
    }
  });
  
  app.delete("/api/bookmarks/:id", isAuthenticated, async (req, res) => {
    try {
      const bookmarkId = parseInt(req.params.id);
      const bookmark = await storage.getBookmark(bookmarkId);
      
      if (!bookmark) {
        return res.status(404).json({ message: "Bookmark not found" });
      }
      
      if (bookmark.userId !== req.user!.id) {
        return res.status(403).json({ message: "Cannot delete another user's bookmark" });
      }
      
      await storage.deleteBookmark(bookmarkId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting bookmark" });
    }
  });
  
  // AI Assistant API
  app.post("/api/ai-assistant", async (req, res) => {
    try {
      const { query } = req.body;
      
      if (!query || typeof query !== "string") {
        return res.status(400).json({ message: "Query is required" });
      }
      
      // Get user ID if authenticated
      const userId = req.isAuthenticated() ? (req.user as any).id : undefined;
      
      const response = await getIslamicKnowledgeResponse(query, userId);
      res.json(response);
    } catch (error) {
      res.status(500).json({ 
        message: "Error processing AI query",
        error: (error as Error).message
      });
    }
  });
  
  // User Activity API (for dashboard)
  app.get("/api/user-activity", isAuthenticated, async (req, res) => {
    try {
      const activities = await storage.getUserActivity(req.user!.id);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user activity" });
    }
  });
  
  // User Management API (admin only)
  app.get("/api/users", isAdminOrLibrarian, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords from response
      const sanitizedUsers = users.map(({ password, ...user }) => user);
      res.json(sanitizedUsers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });
  
  app.patch("/api/users/:id/role", isAdminOrLibrarian, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { role } = req.body;
      
      if (!role || !["user", "librarian", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      // Prevent changing own role
      if (userId === req.user!.id) {
        return res.status(400).json({ message: "Cannot change your own role" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUser(userId, { role });
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser!;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error updating user role" });
    }
  });
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
