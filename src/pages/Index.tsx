
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, ChartBar } from "lucide-react";
import { useState } from "react";

interface Parcelle {
  id: string;
  nom: string;
  maladie: string;
  notation: number;
  date: string;
}

export default function Index() {
  const [parcelles, setParcelles] = useState<Parcelle[]>([
    {
      id: "1",
      nom: "Parcelle A",
      maladie: "Mildiou",
      notation: 3,
      date: "2024-03-19"
    },
    {
      id: "2",
      nom: "Parcelle B",
      maladie: "Oïdium",
      notation: 2,
      date: "2024-03-19"
    }
  ]);

  const [newParcelle, setNewParcelle] = useState({
    nom: "",
    maladie: "",
    notation: "0"
  });

  const ajouterParcelle = () => {
    const parcelle: Parcelle = {
      id: (parcelles.length + 1).toString(),
      nom: newParcelle.nom,
      maladie: newParcelle.maladie,
      notation: parseInt(newParcelle.notation),
      date: new Date().toISOString().split('T')[0]
    };
    setParcelles([...parcelles, parcelle]);
    setNewParcelle({ nom: "", maladie: "", notation: "0" });
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            Notation des Maladies par Parcelle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <Input
              placeholder="Nom de la parcelle"
              value={newParcelle.nom}
              onChange={(e) => setNewParcelle({...newParcelle, nom: e.target.value})}
            />
            <Select
              value={newParcelle.maladie}
              onValueChange={(value) => setNewParcelle({...newParcelle, maladie: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type de maladie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mildiou">Mildiou</SelectItem>
                <SelectItem value="Oïdium">Oïdium</SelectItem>
                <SelectItem value="Rouille">Rouille</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={newParcelle.notation}
              onValueChange={(value) => setNewParcelle({...newParcelle, notation: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Notation" />
              </SelectTrigger>
              <SelectContent>
                {[0,1,2,3,4,5].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num.toString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={ajouterParcelle} className="w-full">
              Ajouter une notation
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ChartBar className="h-5 w-5" />
                Liste des Notations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parcelle</TableHead>
                    <TableHead>Maladie</TableHead>
                    <TableHead>Notation</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parcelles.map((parcelle) => (
                    <TableRow key={parcelle.id}>
                      <TableCell>{parcelle.nom}</TableCell>
                      <TableCell>{parcelle.maladie}</TableCell>
                      <TableCell>{parcelle.notation}</TableCell>
                      <TableCell>{parcelle.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
