import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Parcelle, Note, HistoryRecord, NotationType, PartiePlante, Reseau } from "@/shared/schema";
import { storage } from "@/lib/storage/index";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

export default function Home() {
  const [_, setLocation] = useLocation();
  const [reseaux, setReseaux] = useState<Reseau[]>([]);
  const [parcelles, setParcelles] = useState<Parcelle[]>([]);
  const [selectedReseau, setSelectedReseau] = useState<Reseau | null>(null);
  const [selectedParcelle, setSelectedParcelle] = useState<Parcelle | null>(null);
  const [selectedPlacette, setSelectedPlacette] = useState<number | null>(null);
  const [notationType, setNotationType] = useState<NotationType>("maladie");
  const [partie, setPartie] = useState<PartiePlante>("feuilles");
  const [notes, setNotes] = useState<Note[]>([]);
  const [showNotes, setShowNotes] = useState(false);
  const [currentNote, setCurrentNote] = useState({
    mildiou: "",
    oidium: "",
    BR: "",
    botrytis: ""
  });
  const [showContinueDialog, setShowContinueDialog] = useState(false);
  const { toast } = useToast();
  const mildouInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      storage.getReseaux(),
      storage.getParcelles(),
      storage.getSelectedReseau(),
      storage.getSelectedParcelle()
    ]).then(([reseaux, parcelles, selectedReseau, selectedParcelle]) => {
      setReseaux(reseaux);
      setParcelles(parcelles);
      
      if (selectedReseau) {
        setSelectedReseau(selectedReseau);
        
        const filteredParcelles = parcelles.filter(p => p.reseauId === selectedReseau.id);
        
        if (selectedParcelle && selectedParcelle.reseauId === selectedReseau.id) {
          setSelectedParcelle(selectedParcelle);
        } else if (filteredParcelles.length > 0) {
          setSelectedParcelle(null);
        }
      }
    });
  }, []);

  useEffect(() => {
    if (selectedReseau) {
      const filteredParcelles = parcelles.filter(p => p.reseauId === selectedReseau.id);
      if (selectedParcelle && selectedParcelle.reseauId !== selectedReseau.id) {
        setSelectedParcelle(null);
        setSelectedPlacette(null);
      }
    }
  }, [selectedReseau, parcelles]);

  const handleSubmit = () => {
    if (!selectedParcelle || selectedPlacette === null) {
      toast({
        title: "Erreur",
        description: "Merci de choisir une parcelle et une placette",
        variant: "destructive"
      });
      return;
    }

    const note: Note = {
      mildiou: Number(currentNote.mildiou) || 0,
      oidium: Number(currentNote.oidium) || 0,
      BR: Number(currentNote.BR) || 0,
      botrytis: Number(currentNote.botrytis) || 0,
      partie,
      type: notationType,
      date: new Date().toISOString()
    };

    setNotes([...notes, note]);
    setCurrentNote({ mildiou: "", oidium: "", BR: "", botrytis: "" });
    
    setTimeout(() => {
      if (mildouInputRef.current) {
        mildouInputRef.current.focus();
      }
    }, 10);
  };

  const handleRemoveNote = (index: number) => {
    const updatedNotes = [...notes];
    updatedNotes.splice(index, 1);
    setNotes(updatedNotes);
    
    toast({
      title: "Note supprimée",
      description: "La note a été supprimée avec succès",
    });
  };

  const calculateResults = () => {
    if (notes.length === 0) return null;

    const totals = { mildiou: 0, oidium: 0, BR: 0, botrytis: 0 };
    const positives = { mildiou: 0, oidium: 0, BR: 0, botrytis: 0 };

    notes.forEach(note => {
      ['mildiou', 'oidium', 'BR', 'botrytis'].forEach(disease => {
        const value = Number(note[disease as keyof typeof note]);
        totals[disease as keyof typeof totals] += value;
        if (value > 0) {
          positives[disease as keyof typeof positives]++;
        }
      });
    });

    const frequency = Object.keys(totals).reduce((acc, disease) => ({
      ...acc,
      [disease]: (positives[disease as keyof typeof positives] / notes.length) * 100
    }), {} as Record<string, number>);

    const intensity = Object.keys(totals).reduce((acc, disease) => ({
      ...acc,
      [disease]: totals[disease as keyof typeof totals] / notes.length
    }), {} as Record<string, number>);

    return { frequency, intensity };
  };

  const handleFinish = async () => {
    if (!selectedReseau || !selectedParcelle || selectedPlacette === null || notes.length === 0) {
      toast({
        title: "Erreur",
        description: "Merci de compléter tous les champs et d'ajouter au moins une note",
        variant: "destructive"
      });
      return;
    }

    try {
      const currentUser = await storage.getCurrentUser();
      if (!currentUser) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour enregistrer une notation",
          variant: "destructive"
        });
        return;
      }

      const results = calculateResults();
      if (!results) return;

      const historyRecord: HistoryRecord = {
        id: Date.now(),
        reseauName: selectedReseau.name,
        reseauId: selectedReseau.id,
        parcelleName: selectedParcelle.name,
        parcelleId: selectedParcelle.id,
        placetteId: selectedPlacette,
        notes,
        count: notes.length,
        frequency: results.frequency,
        intensity: results.intensity,
        type: notationType,
        partie: partie,
        date: new Date().toISOString(),
        userId: currentUser.id
      };

      await storage.saveHistory(historyRecord);
      setShowContinueDialog(true);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la notation:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'enregistrement",
        variant: "destructive"
      });
    }
  };

  const handleContinue = (shouldContinue: boolean) => {
    setShowContinueDialog(false);
    if (shouldContinue) {
      setNotes([]);
      setShowNotes(false);
    } else {
      storage.setSelectedReseau(null);
      storage.setSelectedParcelle(null);
      setLocation("/parcelles");
    }
  };

  const results = calculateResults();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notation des maladies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label>Réseau</label>
            <Select value={selectedReseau?.id.toString()} onValueChange={(value) => {
              const reseau = reseaux.find(r => r.id === Number(value));
              setSelectedReseau(reseau || null);
              storage.setSelectedReseau(reseau || null);
              setSelectedParcelle(null);
              setSelectedPlacette(null);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un réseau" />
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

          {selectedReseau && (
            <div className="space-y-2">
              <label>Parcelle</label>
              <Select value={selectedParcelle?.id.toString()} onValueChange={(value) => {
                const parcelle = parcelles.find(p => p.id === Number(value));
                setSelectedParcelle(parcelle || null);
                storage.setSelectedParcelle(parcelle || null);
                setSelectedPlacette(null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une parcelle" />
                </SelectTrigger>
                <SelectContent>
                  {parcelles
                    .filter(p => p.reseauId === selectedReseau.id)
                    .map(parcelle => (
                      <SelectItem key={parcelle.id} value={parcelle.id.toString()}>
                        {parcelle.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedParcelle && (
            <div className="space-y-2">
              <label>Placette</label>
              <Select value={selectedPlacette?.toString()} onValueChange={(value) => setSelectedPlacette(Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une placette" />
                </SelectTrigger>
                <SelectContent>
                  {selectedParcelle.placettes.map(placette => (
                    <SelectItem key={placette.id} value={placette.id.toString()}>
                      {placette.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedPlacette !== null && (
            <div className="space-y-2">
              <label>Type de notation</label>
              <Select value={notationType} onValueChange={(value: NotationType) => setNotationType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Type de notation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maladie">Maladie</SelectItem>
                  <SelectItem value="pheno">Phéno</SelectItem>
                  <SelectItem value="ravageur">Ravageur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {notationType === "maladie" && (
            <div className="space-y-2">
              <label>Partie de la plante</label>
              <Select value={partie} onValueChange={(value: PartiePlante) => setPartie(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Partie de la plante" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feuilles">Feuilles</SelectItem>
                  <SelectItem value="grappe">Grappe</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {notationType === "maladie" && partie && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label>Mildiou</label>
                <Input
                  ref={mildouInputRef}
                  type="number"
                  value={currentNote.mildiou}
                  onChange={e => setCurrentNote({ ...currentNote, mildiou: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label>Oidium</label>
                <Input
                  type="number"
                  value={currentNote.oidium}
                  onChange={e => setCurrentNote({ ...currentNote, oidium: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label>BR</label>
                <Input
                  type="number"
                  value={currentNote.BR}
                  onChange={e => setCurrentNote({ ...currentNote, BR: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label>Botrytis</label>
                <Input
                  type="number"
                  value={currentNote.botrytis}
                  onChange={e => setCurrentNote({ ...currentNote, botrytis: e.target.value })}
                />
              </div>
            </div>
          )}

          {(notationType === "pheno" || notationType === "ravageur") && (
            <div className="p-4 bg-muted rounded-md text-center">
              Les champs pour {notationType === "pheno" ? "phénologie" : "ravageurs"} seront ajoutés dans une future version.
            </div>
          )}

          {notationType && (notationType !== "maladie" || partie) && (
            <div className="flex gap-4">
              <Button onClick={handleSubmit} className="flex-1">
                Ajouter
              </Button>
              <Button onClick={handleFinish} className="flex-1" variant="secondary">
                Terminer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {notes.length > 0 && (
        <div className="flex items-center justify-center py-2">
          <Badge variant="outline" className="text-sm">
            {notes.length} note{notes.length > 1 ? 's' : ''} en cours
          </Badge>
        </div>
      )}

      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Résultats</span>
              <Badge>{notes.length} note{notes.length > 1 ? 's' : ''}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-[200px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Maladie</TableHead>
                    <TableHead>Fréquence (%)</TableHead>
                    <TableHead>Intensité</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(results.frequency).map(([disease, freq]) => (
                    <TableRow key={disease}>
                      <TableCell>{disease}</TableCell>
                      <TableCell>{freq.toFixed(2)}%</TableCell>
                      <TableCell>{results.intensity[disease].toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
            
            <Button 
              variant="outline" 
              onClick={() => setShowNotes(!showNotes)}
              className="w-full"
            >
              {showNotes ? "Masquer les notes" : "Afficher les notes"}
            </Button>
            
            {showNotes && notes.length > 0 && (
              <ScrollArea className="h-[200px] border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N°</TableHead>
                      <TableHead>Mildiou</TableHead>
                      <TableHead>Oidium</TableHead>
                      <TableHead>BR</TableHead>
                      <TableHead>Botrytis</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...notes].reverse().map((note, index) => (
                      <TableRow key={index}>
                        <TableCell>{notes.length - index}</TableCell>
                        <TableCell>{note.mildiou}</TableCell>
                        <TableCell>{note.oidium}</TableCell>
                        <TableCell>{note.BR}</TableCell>
                        <TableCell>{note.botrytis}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRemoveNote(notes.length - 1 - index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}

      <AlertDialog open={showContinueDialog} onOpenChange={setShowContinueDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Poursuivre la notation ?</AlertDialogTitle>
            <AlertDialogDescription>
              Souhaitez-vous faire une nouvelle notation sur cette parcelle ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleContinue(false)}>
              Non, revenir à la liste des parcelles
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleContinue(true)}>
              Oui, poursuivre
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
