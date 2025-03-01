
import { useLocation } from "wouter";
import { useEffect } from "react";

const NotFound = () => {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location
    );
    
    // Rediriger automatiquement vers la page d'accueil après 2 secondes
    const timer = setTimeout(() => {
      setLocation('/');
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [location, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page non trouvée</p>
        <p className="text-gray-500 mb-2">Redirection automatique en cours...</p>
        <a href="#/" className="text-blue-500 hover:text-blue-700 underline">
          Retourner à l'accueil
        </a>
      </div>
    </div>
  );
};

export default NotFound;
