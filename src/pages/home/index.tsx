
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/lib/storage/index";
import { NotationForm } from "./components/NotationForm";
import { ResultsDisplay } from "./components/ResultsDisplay";
import { ContinueDialog } from "./components/ContinueDialog";
import { CancelDialog } from "./components/CancelDialog";
import { Reseau, Parcelle, HistoryRecord, NotationType, PartiePlante, Note } from "@/shared/schema";

export default function Home() {
  const [location, setLocation] = useLocation();
  const [reseaux, setReseaux] = useState<Reseau[]>([]);
  const [parcelles, setParcelles] = useState<Parcelle[]>([]);
  const [selectedReseau, setSelectedReseau] = useState<Reseau | null>(null);
  const [selectedParcelle, setSelectedParcelle] = useState<Parcelle | null>(null);
  const [selectedPlacette, setSelectedPlacette] = useState<number | null>(null);
  const [notationType, setNotationType] = useState<NotationType | null>(null);
  const [partie, setPartie] = useState<PartiePlante | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [showNotes, setShowNotes] = useState(false);
  const [showContinueDialog, setShowContinueDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [hauteurIR, setHauteurIR] = useState<string>("");
  const [hauteurCavaillon, setHauteurCavaillon] = useState<string>("");
  const [nbVDT, setNbVDT] = useState<string>("");
  const [fait, setFait] = useState<boolean>(false);
  const [commentaire, setCommentaire] = useState<string>("");
  const [fromHistory, setFromHistory] = useState<boolean>(false);

  const { toast } = useToast();

  useEffect(() => {
    const checkRoute = () => {
      const fromHistoryPage = location.includes("history");
      setFromHistory(fromHistoryPage);
      
      if (fromHistoryPage) {
        resetAllFields();
      }
    };
    
    checkRoute();
    
    async function loadUserData() {
      const currentUser = await storage.getCurrentUser();
      
      if (!currentUser) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour accéder à cette page",
          variant: "destructive"
        });
        return;
      }
      
      const [userReseaux, userParcelles, selectedReseau, selectedParcelle] = await Promise.all([
        storage.getReseauxByUser(currentUser.id),
        storage.getParcellesByUser(currentUser.id),
        storage.getSelectedReseau(),
        storage.getSelectedParcelle()
      ]);
      
      setReseaux(userReseaux);
      setParcelles(userParcelles);
      
      if (selectedReseau && userReseaux.some(r => r.id === selectedReseau.id)) {
        setSelectedReseau(selectedReseau);
        
        const filteredParcelles = userParcelles.filter(p => p.reseauId === selectedReseau.id);
        
        if (selectedParcelle && selectedParcelle.reseauId === selectedReseau.id && 
            userParcelles.some(p => p.id === selectedParcelle.id)) {
          setSelectedParcelle(selectedParcelle);
        } else if (filteredParcelles.length > 0) {
          setSelectedParcelle(null);
        }
      }
    }
    
    loadUserData();
  }, [location, toast]);

  useEffect(() => {
    if (selectedReseau) {
      const filteredParcelles = parcelles.filter(p => p.reseauId === selectedReseau.id);
      if (selectedParcelle && selectedParcelle.reseauId !== selectedReseau.id) {
        setSelectedParcelle(null);
        setSelectedPlacette(null);
        setNotationType(null);
        setPartie(null);
      }
    }
  }, [selectedReseau, parcelles, selectedParcelle]);

  const resetAllFields = () => {
    setSelectedReseau(null);
    setSelectedParcelle(null);
    setSelectedPlacette(null);
    setNotationType(null);
    setPartie(null);
    setNotes([]);
    setHauteurIR("");
    setHauteurCavaillon("");
    setNbVDT("");
    setFait(false);
    setCommentaire("");
    setShowNotes(false);
  };

  const resetNotation = () => {
    setNotes([]);
    setHauteurIR("");
    setHauteurCavaillon("");
    setNbVDT("");
    setFait(false);
    setCommentaire("");
    setShowNotes(false);
    toast({
      title: "Notation annulée",
      description: "La notation a été annulée avec succès",
    });
  };

  const handleCancel = () => {
    if (notes.length > 0 || commentaire) {
      setShowCancelDialog(true);
    } else {
      resetNotation();
    }
  };

  const confirmCancel = () => {
    resetNotation();
    setShowCancelDialog(false);
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

    if (!notationType) {
      toast({
        title: "Erreur",
        description: "Merci de choisir un type de notation",
        variant: "destructive"
      });
      return;
    }

    const needsPlacette = !["pollinisateur", "pot_barber", "commentaire"].includes(notationType);
    
    if (notationType === "maladie" && selectedPlacette === null) {
      toast({
        title: "Erreur",
        description: "Merci de choisir une placette",
        variant: "destructive"
      });
      return;
    }

    if (notationType === "maladie" && notes.length === 0) {
      toast({
        title: "Erreur",
        description: "Merci d'ajouter au moins une note pour ce type de notation",
        variant: "destructive"
      });
      return;
    }

    if (["analyse_sols", "pollinisateur", "pot_barber"].includes(notationType) && !fait) {
      toast({
        title: "Erreur",
        description: "Merci de marquer l'opération comme réalisée avant de terminer",
        variant: "destructive"
      });
      return;
    }

    if (notationType === "commentaire" && !commentaire) {
      toast({
        title: "Erreur",
        description: "Merci d'entrer un commentaire avant de terminer",
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

      const historyRecord: HistoryRecord = {
        id: Date.now(),
        reseauName: selectedReseau.name,
        reseauId: selectedReseau.id,
        parcelleName: selectedParcelle.name,
        parcelleId: selectedParcelle.id,
        placetteId: !["pollinisateur", "pot_barber", "commentaire"].includes(notationType) 
          ? (selectedPlacette || 0) 
          : -1,
        notes: notationType === "maladie" ? notes : [],
        count: notes.length,
        frequency: {},
        intensity: {},
        type: notationType,
        partie: partie || "feuilles",
        date: new Date().toISOString(),
        userId: currentUser.id
      };

      if (notationType === "maladie") {
        const results = calculateResults();
        if (results) {
          historyRecord.frequency = results.frequency;
          historyRecord.intensity = results.intensity;
        }
      } else if (notationType === "recouvrement" && hauteurIR && hauteurCavaillon) {
        historyRecord.hauteurIR = Number(hauteurIR);
        historyRecord.hauteurCavaillon = Number(hauteurCavaillon);
      } else if (notationType === "vers_terre" && nbVDT) {
        historyRecord.nbVDT = Number(nbVDT);
      } else if (["analyse_sols", "pollinisateur", "pot_barber"].includes(notationType)) {
        historyRecord.fait = fait;
      } else if (notationType === "commentaire") {
        historyRecord.commentaire = commentaire;
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
      setHauteurIR("");
      setHauteurCavaillon("");
      setNbVDT("");
      setFait(false);
      setCommentaire("");
      setShowNotes(false);
    } else {
      storage.setSelectedReseau(null);
      storage.setSelectedParcelle(null);
      resetAllFields();
      setLocation("/history");
    }
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

  const handleSubmit = (note: Note) => {
    setNotes([...notes, note]);
  };

  const results = calculateResults();
  const isEcumesReseau = selectedReseau?.name === "Ecumes";

  return (
    <div className="container mx-auto p-1 space-y-2">
      <NotationForm
        reseaux={reseaux}
        parcelles={parcelles}
        selectedReseau={selectedReseau}
        selectedParcelle={selectedParcelle}
        selectedPlacette={selectedPlacette}
        notationType={notationType}
        partie={partie}
        notes={notes}
        hauteurIR={hauteurIR}
        hauteurCavaillon={hauteurCavaillon}
        nbVDT={nbVDT}
        fait={fait}
        commentaire={commentaire}
        isEcumesReseau={isEcumesReseau}
        setSelectedReseau={(reseau) => {
          setSelectedReseau(reseau);
          storage.setSelectedReseau(reseau);
          setSelectedParcelle(null);
          setSelectedPlacette(null);
          setNotationType(null);
          setPartie(null);
        }}
        setSelectedParcelle={(parcelle) => {
          setSelectedParcelle(parcelle);
          storage.setSelectedParcelle(parcelle);
          setSelectedPlacette(null);
          setNotationType(null);
          setPartie(null);
        }}
        setSelectedPlacette={setSelectedPlacette}
        setNotationType={setNotationType}
        setPartie={setPartie}
        setHauteurIR={setHauteurIR}
        setHauteurCavaillon={setHauteurCavaillon}
        setNbVDT={setNbVDT}
        setFait={setFait}
        setCommentaire={setCommentaire}
        onSubmit={handleSubmit}
        onFinish={handleFinish}
        onCancel={handleCancel}
      />

      {notes.length > 0 && (
        <div className="flex items-center justify-center py-1">
          <Badge variant="outline" className="text-sm">
            {notes.length} note{notes.length > 1 ? 's' : ''} en cours
          </Badge>
        </div>
      )}

      {results && (
        <ResultsDisplay
          results={results}
          notes={notes}
          showNotes={showNotes}
          setShowNotes={setShowNotes}
          onRemoveNote={handleRemoveNote}
        />
      )}

      <ContinueDialog
        open={showContinueDialog}
        onOpenChange={setShowContinueDialog}
        onContinue={handleContinue}
      />

      <CancelDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={confirmCancel}
        onCancel={() => setShowCancelDialog(false)}
      />
    </div>
  );
}
