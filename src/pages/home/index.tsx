
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/lib/storage";
import { NotationForm } from "./components/NotationForm";
import { HistoryRecord } from "@/shared/schema";

export default function Home() {
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedParcelleId, setSelectedParcelleId] = useState<number | undefined>(undefined);
  const [notations, setNotations] = useState<HistoryRecord[]>([]);

  useEffect(() => {
    console.log("🏠 Page d'accueil montée");
    
    const loadData = async () => {
      try {
        const currentUser = await storage.getCurrentUser();
        if (currentUser) {
          // Charger les notations récentes
          const history = await storage.getHistoryByUser(currentUser.id);
          setNotations(history.slice(0, 5)); // 5 dernières notations
          
          // Récupérer les sélections actuelles
          const selectedParcelle = await storage.getSelectedParcelle();
          if (selectedParcelle) {
            setSelectedParcelleId(selectedParcelle.id);
          }
        }
        
        setIsLoaded(true);
        toast({
          title: "Application chargée",
          description: "Bienvenue sur AgriApp !",
        });
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setIsLoaded(true);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données",
          variant: "destructive"
        });
      }
    };
    
    loadData();
  }, [toast]);

  const handleStartNotation = () => {
    setShowForm(true);
  };

  const handleCancelNotation = () => {
    setShowForm(false);
  };

  const handleNotationSaved = (newNotation: HistoryRecord) => {
    // Ajout de la nouvelle notation au début de la liste
    setNotations([newNotation, ...notations.slice(0, 4)]);
    setShowForm(false);
    toast({
      title: "Notation enregistrée",
      description: "Votre notation a été enregistrée avec succès",
    });
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin mr-2">⟳</div> Chargement de l'accueil...
      </div>
    );
  }

  if (showForm) {
    return (
      <NotationForm 
        onCancel={handleCancelNotation} 
        parcelleId={selectedParcelleId}
        onNotationSaved={handleNotationSaved}
      />
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bienvenue sur AgriApp</h1>
      
      <Card className="mb-4">
        <CardContent className="p-4">
          <p>Système de notation des maladies viticoles</p>
          <Button className="mt-4" onClick={handleStartNotation}>Commencer une notation</Button>
        </CardContent>
      </Card>
      
      {notations.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Notations récentes</h2>
          <div className="space-y-2">
            {notations.map((notation, index) => (
              <Card key={index} className="p-2">
                <CardContent className="p-2">
                  <p className="font-medium">{notation.parcelleName}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(notation.date).toLocaleDateString()} - {notation.type}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      <div className="text-sm text-gray-500 mt-8">
        Version de développement
      </div>
    </div>
  );
}
