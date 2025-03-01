import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Parcelle, parcelleSchema, Reseau } from "@/shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { storage } from "@/lib/storage";
import { Badge } from "@/components/ui/badge";

export default function Parcelles() {
  const [_, setLocation] = useLocation();
  const [parcelles, setParcelles] = useState<Parcelle[]>([]);
  const [reseaux, setReseaux] = useState<Reseau[]>([]);
  const [newParcelle, setNewParcelle] = useState({
    name: "",
    reseauId: "",
    placettes: [{ name: "" }]
  });
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([
      storage.getParcelles(),
      storage.getReseaux()
    ]).then(([parcelles, reseaux]) => {
      setParcelles(parcelles);
      setReseaux(reseaux);
    });
  }, []);

  const handleAddPlacette = () => {
    setNewParcelle({
      ...newParcelle,
      placettes: [...newParcelle.placettes, { name: "" }]
    });
  };

  const handlePlacetteChange = (index: number, value: string) => {
    const updatedPlacettes = [...newParcelle.placettes];
    updatedPlacettes[index] = { name: value };
    setNewParcelle({ ...newParcelle, placettes: updatedPlacettes });
  };

  const handleSubmit = async () => {
    try {
      const currentUser = await storage.getCurrentUser();
      if (!currentUser) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour créer une parcelle",
          variant: "destructive"
        });
        return;
      }

      const selectedReseau = reseaux.find(r => r.id === Number(newParcelle.reseauId));
      
      if (!selectedReseau) {
        toast({
          title: "Erreur",
          description: "Merci de sélectionner un réseau",
          variant: "destructive"
        });
        return;
      }

      const newParcelleData: Parcelle = {
        id: Date.now(),
        name: newParcelle.name,
        reseauId: Number(newParcelle.reseauId),
        reseauName: selectedReseau.name,
        userId: currentUser.id,
        placettes: newParcelle.placettes.map((p, index) => ({
          id: index + 1,
          name: p.name,
          parcelleId: 0, // Sera mis à jour après la création de la parcelle
          notes: []
        }))
      };

      // Mettre à jour les IDs des placettes
      newParcelleData.placettes = newParcelleData.placettes.map(p => ({
        ...p,
        parcelleId: newParcelleData.id
      }));

      parcelleSchema.parse(newParcelleData);
      await storage.saveParcelle(newParcelleData);
      setParcelles([...parcelles, newParcelleData]);

      setNewParcelle({
        name: "",
        reseauId: "",
        placettes: [{ name: "" }]
      });

      toast({
        title: "Réussi",
        description: "Parcelle ajoutée"
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erreur",
        description: "Merci de remplir tous les champs requis",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: number) => {
    await storage.deleteParcelle(id);
    const updatedParcelles = parcelles.filter(p => p.id !== id);
    setParcelles(updatedParcelles);
    toast({
      title: "Réussi",
      description: "Parcelle supprimée"
    });
  };

  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list">Liste des parcelles</TabsTrigger>
          <TabsTrigger value="add">Ajouter une parcelle</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {parcelles.map(parcelle => (
              <Card key={parcelle.id} className="hover:bg-gray-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {parcelle.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(parcelle.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground mb-2">
                    Réseau: {parcelle.reseauName}
                  </div>
                  <Badge variant="secondary">
                    {parcelle.placettes.length} placette{parcelle.placettes.length > 1 ? 's' : ''}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Nouvelle parcelle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label>Nom de la parcelle</label>
                <Input
                  value={newParcelle.name}
                  onChange={e => setNewParcelle({ ...newParcelle, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label>Réseau</label>
                <Select 
                  value={newParcelle.reseauId} 
                  onValueChange={(value) => setNewParcelle({ ...newParcelle, reseauId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un réseau" />
                  </SelectTrigger>
                  <SelectContent>
                    {reseaux.map(reseau => (
                      <SelectItem key={reseau.id} value={reseau.id.toString()}>
                        {reseau.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <label>Placettes</label>
                {newParcelle.placettes.map((placette, index) => (
                  <Input
                    key={index}
                    value={placette.name}
                    onChange={e => handlePlacetteChange(index, e.target.value)}
                    placeholder={`Placette ${index + 1}`}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddPlacette}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une placette
                </Button>
              </div>

              <Button onClick={handleSubmit} className="w-full">
                Créer la parcelle
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
