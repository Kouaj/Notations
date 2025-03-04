
import React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-purple-50 rounded-lg p-8">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-4">
          <AlertTriangle size={48} className="text-yellow-500" />
        </div>
        <h1 className="text-4xl font-bold mb-4 text-purple-800">Page non trouvée</h1>
        <p className="text-xl text-gray-600 mb-6">
          Désolé, la page que vous recherchez n'existe pas ou n'est pas accessible.
        </p>
        <Button 
          onClick={() => navigate("/")} 
          className="flex items-center gap-2 mx-auto bg-purple-700 hover:bg-purple-800"
        >
          <ArrowLeft size={18} />
          Retour à l'accueil
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
