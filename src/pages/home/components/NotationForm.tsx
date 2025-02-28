
import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Reseau, Parcelle, Note, NotationType, PartiePlante } from "@/shared/schema";

interface NotationFormProps {
  reseaux: Reseau[];
  parcelles: Parcelle[];
  selectedReseau: Reseau | null;
  selectedParcelle: Parcelle | null;
  selectedPlacette: number | null;
  notationType: NotationType | null;
  partie: PartiePlante | null;
  notes: Note[];
  hauteurIR: string;
  hauteurCavaillon: string;
  nbVDT: string;
  fait: boolean;
  commentaire: string;
  isEcumesReseau: boolean;
  setSelectedReseau: (reseau: Reseau | null) => void;
  setSelectedParcelle: (parcelle: Parcelle | null) => void;
  setSelectedPlacette: (placetteId: number | null) => void;
  setNotationType: (type: NotationType | null) => void;
  setPartie: (partie: PartiePlante | null) => void;
  setHauteurIR: (hauteur: string) => void;
  setHauteurCavaillon: (hauteur: string) => void;
  setNbVDT: (nb: string) => void;
  setFait: (fait: boolean) => void;
  setCommentaire: (commentaire: string) => void;
  onSubmit: (note: Note) => void;
  onFinish: () => void;
  onCancel: () => void;
}

export function NotationForm({
  reseaux,
  parcelles,
  selectedReseau,
  selectedParcelle,
  selectedPlacette,
  notationType,
  partie,
  notes,
  hauteurIR,
  hauteurCavaillon,
  nbVDT,
  fait,
  commentaire,
  isEcumesReseau,
  setSelectedReseau,
  setSelectedParcelle,
  setSelectedPlacette,
  setNotationType,
  setPartie,
  setHauteurIR,
  setHauteurCavaillon,
  setNbVDT,
  setFait,
  setCommentaire,
  onSubmit,
  onFinish,
  onCancel
}: NotationFormProps) {
  const { toast } = useToast();
  const mildouInputRef = useRef<HTMLInputElement>(null);
  
  const [currentNote, setCurrentNote] = React.useState({
    mildiou: "",
    oidium: "",
    BR: "",
    botrytis: ""
  });

  const handleSubmit = () => {
    if (!selectedParcelle) {
      toast({
        title: "Erreur",
        description: "Merci de choisir une parcelle",
        variant: "destructive"
      });
      return;
    }

    if (notationType === "maladie" && selectedPlacette === null) {
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
      partie: partie || "feuilles",
      type: notationType || "maladie",
      date: new Date().toISOString()
    };

    if (notationType === "recouvrement") {
      note.hauteurIR = Number(hauteurIR) || 0;
      note.hauteurCavaillon = Number(hauteurCavaillon) || 0;
    } else if (notationType === "vers_terre") {
      note.nbVDT = Number(nbVDT) || 0;
    } else if (["analyse_sols", "pollinisateur", "pot_barber"].includes(notationType || "")) {
      note.fait = fait;
    }

    onSubmit(note);
    
    setCurrentNote({ mildiou: "", oidium: "", BR: "", botrytis: "" });
    
    setTimeout(() => {
      if (mildouInputRef.current && notationType === "maladie") {
        mildouInputRef.current.focus();
      }
    }, 10);
  };

  const needsPlacette = !["pollinisateur", "pot_barber", "commentaire"].includes(notationType || "");

  return (
    <Card className="shadow-md">
      <CardHeader className="py-2 px-4">
        <CardTitle className="text-lg">Notation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 px-4 py-1">
        <div className="space-y-1">
          <label className="text-sm font-medium">Réseau</label>
          <Select 
            value={selectedReseau?.id.toString()} 
            onValueChange={(value) => {
              const reseau = reseaux.find(r => r.id === Number(value));
              setSelectedReseau(reseau || null);
            }}
          >
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
            <label className="text-sm font-medium">Parcelle</label>
            <Select 
              value={selectedParcelle?.id.toString()} 
              onValueChange={(value) => {
                const parcelle = parcelles.find(p => p.id === Number(value));
                setSelectedParcelle(parcelle || null);
              }}
            >
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
          <div className="space-y-1">
            <label className="text-sm font-medium">Type de notation</label>
            <Select 
              value={notationType || ""} 
              onValueChange={(value: NotationType) => {
                setNotationType(value);
                setCurrentNote({ mildiou: "", oidium: "", BR: "", botrytis: "" });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type de notation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maladie">Maladie</SelectItem>
                <SelectItem value="pheno">Phéno</SelectItem>
                <SelectItem value="ravageur">Ravageur</SelectItem>
                <SelectItem value="commentaire">Commentaire</SelectItem>
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

        {selectedParcelle && notationType && needsPlacette && (
          <div className="space-y-1">
            <label className="text-sm font-medium">Placette</label>
            <Select 
              value={selectedPlacette?.toString()} 
              onValueChange={(value) => setSelectedPlacette(Number(value))}
            >
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

        {notationType === "maladie" && selectedPlacette !== null && (
          <div className="space-y-1">
            <label className="text-sm font-medium">Partie de la plante</label>
            <Select 
              value={partie || ""} 
              onValueChange={(value: PartiePlante) => setPartie(value)}
            >
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

        {notationType === "recouvrement" && selectedPlacette !== null && (
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

        {notationType === "vers_terre" && selectedPlacette !== null && (
          <div className="space-y-1">
            <label className="text-sm font-medium">Nombre de vers de terre</label>
            <Input
              type="number"
              value={nbVDT}
              onChange={e => setNbVDT(e.target.value)}
            />
          </div>
        )}

        {["analyse_sols", "pollinisateur", "pot_barber"].includes(notationType || "") && (
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

        {notationType === "commentaire" && (
          <div className="space-y-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Commentaire</label>
              <Textarea 
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder="Saisissez votre commentaire ici..."
                className="min-h-[100px]"
              />
            </div>
          </div>
        )}

        {(notationType === "pheno" || notationType === "ravageur") && (
          <div className="p-2 bg-muted rounded-md text-center text-sm">
            Les champs pour {notationType === "pheno" ? "phénologie" : "ravageurs"} seront ajoutés dans une future version.
          </div>
        )}

        {notationType && (
          <div className="flex gap-2 pt-1">
            {notationType === "maladie" && partie && (
              <Button 
                variant="default" 
                className="flex-1" 
                onClick={handleSubmit}
                disabled={
                  !currentNote.mildiou && 
                  !currentNote.oidium && 
                  !currentNote.BR && 
                  !currentNote.botrytis
                }
              >
                Ajouter
              </Button>
            )}
            <Button 
              variant="secondary" 
              className="flex-1" 
              onClick={onFinish}
              disabled={
                !selectedParcelle ||
                (notationType === "maladie" && notes.length === 0) ||
                (needsPlacette && selectedPlacette === null) ||
                (["analyse_sols", "pollinisateur", "pot_barber"].includes(notationType) && !fait) ||
                (notationType === "commentaire" && !commentaire)
              }
            >
              Terminer
            </Button>
            <Button 
              variant="outline" 
              className="flex-grow-0"
              onClick={onCancel}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
