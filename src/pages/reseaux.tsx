
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Reseau, reseauSchema } from "@/shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2 } from "lucide-react";
import { storage } from "@/lib/storage";

export default function Reseaux() {
  const [reseaux, setReseaux] = useState<Reseau[]>([]);
  const [newReseau, setNewReseau] = useState({
    name: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    loadReseaux();
  }, []);

  const loadReseaux = async () => {
    try {
      const currentUser = await storage.getCurrentUser();
      
      if (!currentUser) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour voir vos réseaux",
          variant: "destructive"
        });
        return;
      }
      
      const loadedReseaux = await storage.getReseauxByUser(currentUser.id);
      setReseaux(loadedReseaux);
    } catch (error) {
      console.error("Erreur lors du chargement des réseaux:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les réseaux",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async () => {
    try {
      if (!newReseau.name.trim()) {
        toast({
          title: "Erreur",
          description: "Le nom du réseau est requis",
          variant: "destructive"
        });
        return;
      }

      const currentUser = await storage.getCurrentUser();
      if (!currentUser) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour créer un réseau",
          variant: "destructive"
        });
        return;
      }

      const newReseauData: Reseau = {
        id: Date.now(),
        name: newReseau.name,
        userId: currentUser.id
      };

      console.log("Tentative de création du réseau:", newReseauData);
      
      // Valider avec Zod
      reseauSchema.parse(newReseauData);
      
      // Sauvegarder dans IndexedDB
      await storage.saveReseau(newReseauData);
      console.log("Réseau sauvegardé avec succès");
      
      // Mettre à jour l'état local
      setReseaux([...reseaux, newReseauData]);
      
      // Réinitialiser le formulaire
      setNewReseau({
        name: ""
      });

      toast({
        title: "Réussi",
        description: "Réseau ajouté"
      });
    } catch (error) {
      console.error("Erreur lors de la création du réseau:", error);
      toast({
        title: "Erreur",
        description: "Échec de l'ajout du réseau",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await storage.deleteReseau(id);
      const updatedReseaux = reseaux.filter(r => r.id !== id);
      setReseaux(updatedReseaux);
      toast({
        title: "Réussi",
        description: "Réseau supprimé"
      });
    } catch (error) {
      console.error("Erreur lors de la suppression du réseau:", error);
      toast({
        title: "Erreur",
        description: "Échec de la suppression du réseau",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list">Liste des réseaux</TabsTrigger>
          <TabsTrigger value="add">Ajouter un réseau</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {reseaux.length === 0 ? (
              <p className="text-muted-foreground col-span-full text-center py-8">
                Aucun réseau n'a été créé pour le moment
              </p>
            ) : (
              reseaux.map(reseau => (
                <Card key={reseau.id} className="hover:bg-gray-50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {reseau.name}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(reseau.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Nouveau réseau</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label>Nom du réseau</label>
                <Input
                  value={newReseau.name}
                  onChange={e => setNewReseau({ ...newReseau, name: e.target.value })}
                  placeholder="Saisissez le nom du réseau"
                />
              </div>

              <Button onClick={handleSubmit} className="w-full">
                Créer le réseau
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
