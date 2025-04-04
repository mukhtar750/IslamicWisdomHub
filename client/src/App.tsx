import { Switch, Route, Link } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AiAssistantPage from "@/pages/ai-assistant-page";
import AuthPage from "@/pages/auth-page";
import { useAuth } from "@/hooks/use-auth";
import { Menu, X, Book, User, LogIn, LogOut, Search, BookOpen, BrainCircuit } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useLocation } from "wouter";
import { ProtectedRoute } from "@/lib/protected-route";

// Enhanced navigation component with mobile support
function EnhancedNav() {
  // Using try-catch to handle potential context errors
  let user = null;
  let logoutMutation = { mutate: () => {}, isPending: false };
  try {
    const auth = useAuth();
    user = auth.user;
    logoutMutation = auth.logoutMutation;
  } catch (error) {
    console.error("Auth context not available:", error);
  }
  
  const [location] = useLocation();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <nav className="bg-primary text-white p-4 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-primary font-bold text-lg">م</span>
          </div>
          <h1 className="text-xl font-bold">Al Hikmah Library</h1>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/" className={`hover:text-secondary transition-colors ${location === '/' ? 'font-bold' : ''}`}>
            Home
          </Link>
          <Link href="/catalog" className={`hover:text-secondary transition-colors ${location === '/catalog' ? 'font-bold' : ''}`}>
            Catalog
          </Link>
          <Link href="/ai-assistant" className={`hover:text-secondary transition-colors ${location === '/ai-assistant' ? 'font-bold' : ''}`}>
            AI Assistant
          </Link>
          
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="hover:text-secondary transition-colors">
                My Account
              </Link>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="flex items-center gap-1"
              >
                <LogOut className="h-4 w-4" />
                {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
              </Button>
            </div>
          ) : (
            <Link href="/auth">
              <Button variant="secondary" size="sm" className="flex items-center gap-1">
                <LogIn className="h-4 w-4" />
                Login / Register
              </Button>
            </Link>
          )}
        </div>
        
        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="text-white">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] sm:w-[320px]">
            <div className="flex flex-col h-full py-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">م</span>
                  </div>
                  <h2 className="font-bold">Al Hikmah Library</h2>
                </div>
              </div>
              
              <div className="flex flex-col space-y-4">
                <Link href="/" className="flex items-center gap-3 px-2 py-3 rounded-md hover:bg-accent">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span>Home</span>
                </Link>
                
                <Link href="/catalog" className="flex items-center gap-3 px-2 py-3 rounded-md hover:bg-accent">
                  <Book className="h-5 w-5 text-primary" />
                  <span>Catalog</span>
                </Link>
                
                <Link href="/ai-assistant" className="flex items-center gap-3 px-2 py-3 rounded-md hover:bg-accent">
                  <BrainCircuit className="h-5 w-5 text-primary" />
                  <span>AI Assistant</span>
                </Link>
                
                {user ? (
                  <>
                    <Link href="/dashboard" className="flex items-center gap-3 px-2 py-3 rounded-md hover:bg-accent">
                      <User className="h-5 w-5 text-primary" />
                      <span>My Account</span>
                    </Link>
                    
                    <button 
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                      className="flex items-center gap-3 px-2 py-3 rounded-md hover:bg-accent text-left"
                    >
                      <LogOut className="h-5 w-5 text-primary" />
                      <span>{logoutMutation.isPending ? 'Logging out...' : 'Logout'}</span>
                    </button>
                  </>
                ) : (
                  <Link href="/auth" className="flex items-center gap-3 px-2 py-3 rounded-md hover:bg-accent">
                    <LogIn className="h-5 w-5 text-primary" />
                    <span>Login / Register</span>
                  </Link>
                )}
              </div>
              
              <div className="mt-auto">
                <p className="text-sm text-gray-500">
                  © {new Date().getFullYear()} Al Hikmah Library
                </p>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}

// Enhanced footer component
function EnhancedFooter() {
  return (
    <footer className="bg-gray-900 text-white py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-lg">م</span>
              </div>
              <h2 className="text-xl font-bold">Al Hikmah Library</h2>
            </div>
            <p className="text-gray-400">
              Your gateway to Islamic knowledge and wisdom through a comprehensive digital platform.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/catalog" className="text-gray-400 hover:text-white transition-colors">Book Catalog</Link></li>
              <li><Link href="/ai-assistant" className="text-gray-400 hover:text-white transition-colors">AI Assistant</Link></li>
              <li><Link href="/auth" className="text-gray-400 hover:text-white transition-colors">Login / Register</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <address className="not-italic text-gray-400">
              <p>Al Hikmah Library</p>
              <p>123 Wisdom Street</p>
              <p>Abuja, Nigeria</p>
              <p className="mt-2">Email: info@alhikmahlibrary.org</p>
            </address>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Al Hikmah Library. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <EnhancedNav />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/ai-assistant" component={AiAssistantPage} />
          <Route path="/:rest*" component={NotFound} />
        </Switch>
      </main>
      <EnhancedFooter />
      <Toaster />
    </div>
  );
}

export default App;
