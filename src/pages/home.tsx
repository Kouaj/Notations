
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
import { Trash2, XCircle, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

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
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  // Nouveaux états pour les types spécifiques
  const [hauteurIR, setHauteurIR] = useState<string>("");
  const [hauteurCavaillon, setHauteurCavaillon] = useState<string>("");
  const [nbVDT, setNbVDT] = useState<string>("");
  const [fait, setFait] = useState<boolean>(false);
  
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
    if (!selectedParcelle) {
      toast({
        title: "Erreur",
        description: "Merci de choisir une parcelle",
        variant: "destructive"
      });
      return;
    }

    // Vérifier si la placette est requise pour ce type de notation
    if (!["pollinisateur", "pot_barber"].includes(notationType) && selectedPlacette === null) {
      toast({
        title: "Erreur",
        description: "Merci de choisir une placette",
        variant: "destructive"
      });
      return;
    }

    let note: Note = {
      mildiou: Number(currentNote.mildiou) || 0,
      oidium: Number(currentNote.oidium) || 0,
      BR: Number(currentNote.BR) || 0,
      botrytis: Number(currentNote.botrytis) || 0,
      partie,
      type: notationType,
      date: new Date().toISOString()
    };

    // Ajouter les champs spécifiques selon le type de notation
    if (notationType === "recouvrement") {
      note.hauteurIR = Number(hauteurIR) || 0;
      note.hauteurCavaillon = Number(hauteurCavaillon) || 0;
    } else if (notationType === "vers_terre") {
      note.nbVDT = Number(nbVDT) || 0;
    } else if (["analyse_sols", "pollinisateur", "pot_barber"].includes(notationType)) {
      note.fait = fait;
    }

    setNotes([...notes, note]);
    
    // Réinitialiser les valeurs des champs
    setCurrentNote({ mildiou: "", oidium: "", BR: "", botrytis: "" });
    setHauteurIR("");
    setHauteurCavaillon("");
    setNbVDT("");
    setFait(false);
    
    setTimeout(() => {
      if (mildouInputRef.current && notationType === "maladie") {
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

  const handleCancel = () => {
    if (notes.length > 0) {
      setShowCancelDialog(true);
    } else {
      resetNotation();
    }
  };

  const confirmCancel = () => {
    resetNotation();
    setShowCancelDialog(false);
  };

  const resetNotation = () => {
    setNotes([]);
    setCurrentNote({ mildiou: "", oidium: "", BR: "", botrytis: "" });
    setHauteurIR("");
    setHauteurCavaillon("");
    setNbVDT("");
    setFait(false);
    setShowNotes(false);
    toast({
      title: "Notation annulée",
      description: "La notation a été annulée avec succès",
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
    if (!selectedReseau || !selectedParcelle) {
      toast({
        title: "Erreur",
        description: "Merci de choisir un réseau et une parcelle",
        variant: "destructive"
      });
      return;
    }

    // Vérifier si la placette est requise pour ce type de notation
    if (!["pollinisateur", "pot_barber"].includes(notationType) && selectedPlacette === null) {
      toast({
        title: "Erreur",
        description: "Merci de choisir une placette",
        variant: "destructive"
      });
      return;
    }

    // Vérifier si nous avons des données valides
    if (notationType === "maladie" && notes.length === 0) {
      toast({
        title: "Erreur",
        description: "Merci d'ajouter au moins une note pour ce type de notation",
        variant: "destructive"
      });
      return;
    }

    // Pour les types de notation nécessitant un marquage "fait", vérifier si c'est fait
    if (["analyse_sols", "pollinisateur", "pot_barber"].includes(notationType) && !fait) {
      toast({
        title: "Erreur",
        description: "Merci de marquer l'opération comme réalisée avant de terminer",
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

      // Pour les types de notation autres que "maladie", on crée un enregistrement simplifié
      const historyRecord: HistoryRecord = {
        id: Date.now(),
        reseauName: selectedReseau.name,
        reseauId: selectedReseau.id,
        parcelleName: selectedParcelle.name,
        parcelleId: selectedParcelle.id,
        placetteId: ["pollinisateur", "pot_barber"].includes(notationType) ? -1 : (selectedPlacette || 0),
        notes: notationType === "maladie" ? notes : [],
        count: notes.length,
        frequency: {},
        intensity: {},
        type: notationType,
        partie: partie,
        date: new Date().toISOString(),
        userId: currentUser.id
      };

      // Pour le type "maladie", calculer les résultats
      if (notationType === "maladie") {
        const results = calculateResults();
        if (results) {
          historyRecord.frequency = results.frequency;
          historyRecord.intensity = results.intensity;
        }
      }

      // Ajouter les propriétés spécifiques au type de notation
      if (notationType === "recouvrement" && hauteurIR && hauteurCavaillon) {
        historyRecord.hauteurIR = Number(hauteurIR);
        historyRecord.hauteurCavaillon = Number(hauteurCavaillon);
      } else if (notationType === "vers_terre" && nbVDT) {
        historyRecord.nbVDT = Number(nbVDT);
      } else if (["analyse_sols", "pollinisateur", "pot_barber"].includes(notationType)) {
        historyRecord.fait = fait;
      }

      await storage.saveHistory(historyRecord);

      toast({
        title: "Enregistré",
        description: `La notation de type ${notationType} a été enregistrée avec succès`,
        variant: "success"
      });

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
      // Réinitialiser les champs des types spécifiques
      setHauteurIR("");
      setHauteurCavaillon("");
      setNbVDT("");
      setFait(false);
    } else {
      storage.setSelectedReseau(null);
      storage.setSelectedParcelle(null);
      setLocation("/parcelles");
    }
  };

  const isEcumesReseau = selectedReseau?.name === "Ecumes";
  const results = calculateResults();
  const needsPlacette = !["pollinisateur", "pot_barber"].includes(notationType);

  return (
    <div className="container mx-auto p-1 space-y-3">
      <Card className="shadow-md">
        <CardHeader className="py-2 px-4">
          <CardTitle className="text-lg">Notation des maladies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-4 py-1">
          <div className="space-y-1">
            <label className="text-sm font-medium">Réseau</label>
            <Select value={selectedReseau?.id.toString()} onValueChange={(value) => {
              const reseau = reseaux.find(r => r.id === Number(value));
              setSelectedReseau(reseau || null);
              storage.setSelectedReseau(reseau || null);
              setSelectedParcelle(null);
              setSelectedPlacette(null);
              // Réinitialiser le type de notation à "maladie" par défaut
              setNotationType("maladie");
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
            <div className="space-y-1">
              <label className="text-sm font-medium">Type de notation</label>
              <Select value={notationType} onValueChange={(value: NotationType) => {
                setNotationType(value as NotationType);
                // Réinitialiser les notes lors du changement de type
                setNotes([]);
                setFait(false);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Type de notation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maladie">Maladie</SelectItem>
                  <SelectItem value="pheno">Phéno</SelectItem>
                  <SelectItem value="ravageur">Ravageur</SelectItem>
                  {isEcumesReseau && (
                    <>
                      <SelectItem value="recouvrement">Recouvrement</SelectItem>
                      <SelectItem value="analyse_sols">Analyse de sols</SelectItem>
                      <SelectItem value="vers_terre">Vers de terre</SelectItem>
                      <SelectItem value="pollinisateur">Pollinisateur</SelectItem>
                      <SelectItem value="pot_barber">Pot Barber</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedReseau && (
            <div className="space-y-1">
              <label className="text-sm font-medium">Parcelle</label>
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

          {selectedParcelle && needsPlacette && (
            <div className="space-y-1">
              <label className="text-sm font-medium">Placette</label>
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

          {notationType === "maladie" && (
            <div className="space-y-1">
              <label className="text-sm font-medium">Partie de la plante</label>
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
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">Mildiou</label>
                <Input
                  ref={mildouInputRef}
                  type="number"
                  value={currentNote.mildiou}
                  onChange={e => setCurrentNote({ ...currentNote, mildiou: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Oidium</label>
                <Input
                  type="number"
                  value={currentNote.oidium}
                  onChange={e => setCurrentNote({ ...currentNote, oidium: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">BR</label>
                <Input
                  type="number"
                  value={currentNote.BR}
                  onChange={e => setCurrentNote({ ...currentNote, BR: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Botrytis</label>
                <Input
                  type="number"
                  value={currentNote.botrytis}
                  onChange={e => setCurrentNote({ ...currentNote, botrytis: e.target.value })}
                />
              </div>
            </div>
          )}

          {notationType === "recouvrement" && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">Hauteur IR</label>
                <Input
                  type="number"
                  value={hauteurIR}
                  onChange={e => setHauteurIR(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Hauteur Cavaillon</label>
                <Input
                  type="number"
                  value={hauteurCavaillon}
                  onChange={e => setHauteurCavaillon(e.target.value)}
                />
              </div>
            </div>
          )}

          {notationType === "vers_terre" && (
            <div className="space-y-1">
              <label className="text-sm font-medium">Nombre de vers de terre</label>
              <Input
                type="number"
                value={nbVDT}
                onChange={e => setNbVDT(e.target.value)}
              />
            </div>
          )}

          {["analyse_sols", "pollinisateur", "pot_barber"].includes(notationType) && (
            <div className="flex items-center space-x-2 py-1">
              <Checkbox 
                id="fait" 
                checked={fait} 
                onCheckedChange={(checked) => setFait(checked === true)}
              />
              <label htmlFor="fait" className="text-sm font-medium cursor-pointer">
                Réalisé
              </label>
            </div>
          )}

          {(notationType === "pheno" || notationType === "ravageur") && (
            <div className="p-2 bg-muted rounded-md text-center text-sm">
              Les champs pour {notationType === "pheno" ? "phénologie" : "ravageurs"} seront ajoutés dans une future version.
            </div>
          )}

          {notationType && (
            <div className="flex gap-2 pt-1">
              {(notationType === "maladie" || notationType === "recouvrement" || notationType === "vers_terre") && (
                <Button 
                  variant="default" 
                  className="flex-1" 
                  onClick={handleSubmit}
                  disabled={
                    (notationType === "maladie" && 
                      !currentNote.mildiou && 
                      !currentNote.oidium && 
                      !currentNote.BR && 
                      !currentNote.botrytis) ||
                    (notationType === "recouvrement" && 
                      !hauteurIR && 
                      !hauteurCavaillon) ||
                    (notationType === "vers_terre" && 
                      !nbVDT) ||
                    !selectedParcelle ||
                    (needsPlacette && selectedPlacette === null)
                  }
                >
                  Ajouter
                </Button>
              )}
              <Button 
                variant="secondary" 
                className="flex-1" 
                onClick={handleFinish}
                disabled={
                  !selectedParcelle ||
                  (needsPlacette && selectedPlacette === null) ||
                  (notationType === "maladie" && notes.length === 0) ||
                  (["analyse_sols", "pollinisateur", "pot_barber"].includes(notationType) && !fait)
                }
              >
                Terminer
              </Button>
              <Button 
                variant="outline" 
                className="flex-grow-0"
                onClick={handleCancel}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {notes.length > 0 && (
        <div className="flex items-center justify-center py-1">
          <Badge variant="outline" className="text-sm">
            {notes.length} note{notes.length > 1 ? 's' : ''} en cours
          </Badge>
        </div>
      )}

      {results && (
        <Card className="shadow-md">
          <CardHeader className="py-2 px-4">
            <CardTitle className="flex justify-between items-center text-base">
              <span>Résultats</span>
              <Badge>{notes.length} note{notes.length > 1 ? 's' : ''}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-4 py-1">
            <ScrollArea className="h-[160px]">
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
              className="w-full py-1 h-8"
            >
              {showNotes ? "Masquer les notes" : "Afficher les notes"}
            </Button>
            
            {showNotes && notes.length > 0 && (
              <ScrollArea className="h-[160px] border rounded-md">
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

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler la notation ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir annuler cette notation ? Toutes les données saisies seront perdues.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowCancelDialog(false)}>
              Non, continuer
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel}>
              Oui, annuler
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
