
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Reseau, reseauSchema } from "@/shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2 } from "lucide-react";
import { storage } from "@/lib/storage";

export default function Reseaux() {
  const [reseaux, setReseaux] = useState<Reseau[]>([]);
  const [newReseau, setNewReseau] = useState({
    name: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    storage.getReseaux().then(setReseaux);
  }, []);

  const handleSubmit = async () => {
    try {
      const newReseauData: Reseau = {
        id: Date.now(),
        name: newReseau.name
      };

      reseauSchema.parse(newReseauData);
      await storage.saveReseau(newReseauData);
      setReseaux([...reseaux, newReseauData]);

      setNewReseau({
        name: ""
      });

      toast({
        title: "Réussi",
        description: "Réseau ajouté"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Merci de remplir tous les champs requis",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: number) => {
    await storage.deleteReseau(id);
    const updatedReseaux = reseaux.filter(r => r.id !== id);
    setReseaux(updatedReseaux);
    toast({
      title: "Réussi",
      description: "Réseau supprimé"
    });
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
            {reseaux.map(reseau => (
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
            ))}
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
