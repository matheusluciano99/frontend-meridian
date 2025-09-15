import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10 pointer-events-none" />
      
      <div className="relative z-10 text-center px-4">
        <div className="mb-8">
          <h1 className="text-8xl font-bold text-gradient-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-2">Página não encontrada</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            A página que você está procurando não existe ou foi removida.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button asChild className="gradient-primary">
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Link>
          </Button>
          
          <div>
            <Button variant="ghost" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Página anterior
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
