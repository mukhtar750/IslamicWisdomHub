import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";

// Simple navigation component
function SimpleNav() {
  return (
    <nav className="bg-primary text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-primary font-bold text-lg">م</span>
          </div>
          <h1 className="text-xl font-bold">Al Hikmah Library</h1>
        </div>
        <div className="hidden md:flex space-x-6">
          <a href="/" className="hover:text-secondary transition-colors">Home</a>
          <a href="/catalog" className="hover:text-secondary transition-colors">Catalog</a>
          <a href="/ai-assistant" className="hover:text-secondary transition-colors">AI Assistant</a>
        </div>
      </div>
    </nav>
  );
}

// Simple footer component
function SimpleFooter() {
  return (
    <footer className="bg-gray-900 text-white py-6">
      <div className="container mx-auto px-4 text-center">
        <p>© {new Date().getFullYear()} Al Hikmah Library. All rights reserved.</p>
      </div>
    </footer>
  );
}

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <SimpleNav />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/:rest*" component={NotFound} />
        </Switch>
      </main>
      <SimpleFooter />
      <Toaster />
    </div>
  );
}

export default App;
