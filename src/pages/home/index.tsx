
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    console.log("🏠 Page d'accueil montée");
    
    // Notification pour indiquer que tout a fonctionné
    setTimeout(() => {
      setIsLoaded(true);
      toast({
        title: "Application chargée",
        description: "Bienvenue sur AgriApp !",
      });
    }, 1000);
  }, [toast]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin mr-2">⟳</div> Chargement de l'accueil...
      </div>
    );
  }

  // Version simplifiée de la page d'accueil pour débloquer le développement
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bienvenue sur AgriApp</h1>
      
      <Card className="mb-4">
        <CardContent className="p-4">
          <p>Système de notation des maladies viticoles</p>
          <Button className="mt-4">Commencer une notation</Button>
        </CardContent>
      </Card>
      
      <div className="text-sm text-gray-500 mt-8">
        Version de développement - Contenu simplifié
      </div>
    </div>
  );
}
