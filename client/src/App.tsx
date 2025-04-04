import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6">Al Hikmah Library</h1>
        <p className="text-xl mb-4">
          Welcome to Al Hikmah Library - Your gateway to Islamic knowledge and wisdom.
        </p>
        <div className="p-4 border rounded-lg bg-muted">
          <h2 className="text-2xl font-semibold mb-2">Starting up...</h2>
          <p>
            We're initializing the application. Please stand by as we prepare your
            experience.
          </p>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default App;
