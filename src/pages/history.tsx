
import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Download, Trash2, ChevronDown, ChevronUp, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { HistoryRecord, HistoryGroup } from "@/shared/schema";
import { storage } from "@/lib/storage";
import * as XLSX from 'xlsx';

export default function History() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [groupedHistory, setGroupedHistory] = useState<HistoryGroup[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const historyRecords = await storage.getHistory();
    setHistory(historyRecords);
    
    // Regrouper l'historique par parcelle et date
    const grouped: Record<string, HistoryGroup> = {};
    
    historyRecords.forEach(record => {
      const dateString = record.date.split('T')[0]; // YYYY-MM-DD
      const key = `${record.parcelleId}_${dateString}`;
      
      if (!grouped[key]) {
        grouped[key] = {
          parcelleName: record.parcelleName,
          parcelleId: record.parcelleId,
          date: dateString,
          formattedDate: format(parseISO(record.date), 'dd MMMM yyyy', { locale: fr }),
          records: []
        };
      }
      
      grouped[key].records.push(record);
    });
    
    setGroupedHistory(Object.values(grouped).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const toggleNotes = (recordId: string) => {
    setExpandedNotes(prev => ({
      ...prev,
      [recordId]: !prev[recordId]
    }));
  };

  const handleExport = (group: HistoryGroup) => {
    const wb = XLSX.utils.book_new();
    
    // Une feuille pour chaque type de notation
    const recordsByType: Record<string, HistoryRecord[]> = {};
    
    group.records.forEach(record => {
      const typeKey = `${record.type}_${record.partie || ''}`;
      if (!recordsByType[typeKey]) {
        recordsByType[typeKey] = [];
      }
      recordsByType[typeKey].push(record);
    });
    
    // Pour chaque type, créer une feuille avec toutes les notes
    Object.entries(recordsByType).forEach(([typeKey, records]) => {
      const [type, partie] = typeKey.split('_');
      const sheetName = `${type}${partie ? '_' + partie : ''}`;
      
      // Données adaptées selon le type de notation
      let notesData: any[] = [];
      
      if (type === 'maladie') {
        // Rassembler toutes les notes pour les maladies
        notesData = records.flatMap(record => 
          record.notes.map(note => ({
            'Placette': record.placetteId,
            'Mildiou': note.mildiou,
            'Oidium': note.oidium,
            'BR': note.BR,
            'Botrytis': note.botrytis,
            'Date': format(parseISO(note.date), 'dd/MM/yyyy HH:mm')
          }))
        );
      } else if (type === 'recouvrement') {
        // Données pour recouvrement
        notesData = records.map(record => ({
          'Placette': record.placetteId,
          'Hauteur IR': record.hauteurIR,
          'Hauteur Cavaillon': record.hauteurCavaillon,
          'Date': format(parseISO(record.date), 'dd/MM/yyyy HH:mm')
        }));
      } else if (type === 'vers_terre') {
        // Données pour vers de terre
        notesData = records.map(record => ({
          'Placette': record.placetteId,
          'Nombre de VDT': record.nbVDT,
          'Date': format(parseISO(record.date), 'dd/MM/yyyy HH:mm')
        }));
      } else if (['analyse_sols', 'pollinisateur', 'pot_barber'].includes(type)) {
        // Données pour les observations simples
        notesData = records.map(record => ({
          'Placette': record.placetteId,
          'Réalisé': record.fait ? 'Oui' : 'Non',
          'Date': format(parseISO(record.date), 'dd/MM/yyyy HH:mm')
        }));
      } else {
        // Autres types non implémentés
        notesData = records.map(record => ({
          'Placette': record.placetteId,
          'Type': record.type,
          'Date': format(parseISO(record.date), 'dd/MM/yyyy HH:mm')
        }));
      }
      
      if (notesData.length > 0) {
        const dataWS = XLSX.utils.json_to_sheet(notesData);
        XLSX.utils.book_append_sheet(wb, dataWS, sheetName);
      
        // Feuille de résultats pour les maladies
        if (type === 'maladie') {
          const resultsData = records.map(record => ({
            'Placette': record.placetteId,
            'Nb notes': record.count,
            'Fréq. Mildiou (%)': record.frequency.mildiou?.toFixed(2) || '0',
            'Fréq. Oidium (%)': record.frequency.oidium?.toFixed(2) || '0',
            'Fréq. BR (%)': record.frequency.BR?.toFixed(2) || '0',
            'Fréq. Botrytis (%)': record.frequency.botrytis?.toFixed(2) || '0',
            'Int. Mildiou': record.intensity.mildiou?.toFixed(2) || '0',
            'Int. Oidium': record.intensity.oidium?.toFixed(2) || '0',
            'Int. BR': record.intensity.BR?.toFixed(2) || '0',
            'Int. Botrytis': record.intensity.botrytis?.toFixed(2) || '0',
            'Date': format(parseISO(record.date), 'dd/MM/yyyy HH:mm')
          }));
          
          const resultsWS = XLSX.utils.json_to_sheet(resultsData);
          XLSX.utils.book_append_sheet(wb, resultsWS, `${sheetName}_résultats`);
        }
      }
    });
    
    XLSX.writeFile(wb, `${group.parcelleName}_${group.date}.xlsx`);
  };

  const handleDelete = async (id: number) => {
    await storage.deleteHistory(id);
    
    // Mettre à jour l'historique après suppression
    const updatedHistory = history.filter(h => h.id !== id);
    setHistory(updatedHistory);
    
    // Recharger les groupes
    loadHistory();
    
    toast({
      title: "Réussi",
      description: "Notation supprimée"
    });
  };

  const getTypeLabel = (type: string, partie?: string) => {
    switch(type) {
      case "maladie":
        return `Maladie - ${partie === "feuilles" ? "Feuilles" : "Grappe"}`;
      case "pheno":
        return "Phénologie";
      case "ravageur":
        return "Ravageurs";
      case "recouvrement":
        return "Recouvrement";
      case "analyse_sols":
        return "Analyse de sols";
      case "vers_terre":
        return "Vers de terre";
      case "pollinisateur":
        return "Pollinisateur";
      case "pot_barber":
        return "Pot Barber";
      default:
        return type;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'HH:mm', { locale: fr });
    } catch (e) {
      return "";
    }
  };

  return (
    <div className="container mx-auto p-2 space-y-4">
      {groupedHistory.length === 0 ? (
        <Card>
          <CardContent className="flex justify-center items-center p-4">
            <p className="text-muted-foreground">Aucune notation enregistrée</p>
          </CardContent>
        </Card>
      ) : (
        groupedHistory.map(group => (
          <Card key={`${group.parcelleId}_${group.date}`} className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 px-4">
              <div>
                <CardTitle className="text-base font-medium">
                  {group.parcelleName}
                </CardTitle>
                <CardDescription className="text-sm">
                  {group.formattedDate} • {group.records.length} notation{group.records.length > 1 ? 's' : ''}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport(group)}
                  className="h-8 px-2"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleGroup(`${group.parcelleId}_${group.date}`)}
                  className="h-8 px-2"
                >
                  {expandedGroups[`${group.parcelleId}_${group.date}`] ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            {expandedGroups[`${group.parcelleId}_${group.date}`] && (
              <CardContent className="px-4 py-2">
                <Accordion type="multiple" className="space-y-2">
                  {group.records.map(record => (
                    <AccordionItem key={record.id} value={record.id.toString()} className="border rounded-md">
                      <AccordionTrigger className="px-3 py-2 hover:no-underline">
                        <div className="flex justify-between items-center w-full">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{getTypeLabel(record.type, record.partie)}</span>
                            <span className="text-xs text-muted-foreground">
                              • Placette {record.placetteId} • {formatTime(record.date)}
                              {record.count > 0 && ` • ${record.count} note${record.count > 1 ? 's' : ''}`}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(record.id);
                            }}
                            className="h-7 px-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-3 pb-3">
                        <div className="space-y-3">
                          {record.type === "maladie" && (
                            <>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Maladie</TableHead>
                                    <TableHead>Fréquence (%)</TableHead>
                                    <TableHead>Intensité</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {Object.entries(record.frequency).map(([disease, frequency]) => (
                                    <TableRow key={disease}>
                                      <TableCell>{disease}</TableCell>
                                      <TableCell>{frequency.toFixed(2)}%</TableCell>
                                      <TableCell>{record.intensity[disease as keyof typeof record.intensity].toFixed(2)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                              
                              <div className="flex justify-between items-center">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => toggleNotes(record.id.toString())}
                                  className="h-8 py-1"
                                >
                                  {expandedNotes[record.id.toString()] ? 'Masquer les notes' : 'Afficher les notes'}
                                </Button>
                              </div>
                              
                              {expandedNotes[record.id.toString()] && (
                                <ScrollArea className="h-[180px] border rounded-md p-2">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>N°</TableHead>
                                        <TableHead>Mildiou</TableHead>
                                        <TableHead>Oidium</TableHead>
                                        <TableHead>BR</TableHead>
                                        <TableHead>Botrytis</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {record.notes.map((note, index) => (
                                        <TableRow key={index}>
                                          <TableCell>{index + 1}</TableCell>
                                          <TableCell>{note.mildiou}</TableCell>
                                          <TableCell>{note.oidium}</TableCell>
                                          <TableCell>{note.BR}</TableCell>
                                          <TableCell>{note.botrytis}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </ScrollArea>
                              )}
                            </>
                          )}

                          {record.type === "recouvrement" && (
                            <div className="grid grid-cols-2 gap-4 p-2">
                              <div className="bg-purple-50 p-3 rounded-md text-center">
                                <div className="text-xs text-purple-600 mb-1">Hauteur IR</div>
                                <div className="font-medium">{record.hauteurIR} cm</div>
                              </div>
                              <div className="bg-indigo-50 p-3 rounded-md text-center">
                                <div className="text-xs text-indigo-600 mb-1">Hauteur Cavaillon</div>
                                <div className="font-medium">{record.hauteurCavaillon} cm</div>
                              </div>
                            </div>
                          )}

                          {record.type === "vers_terre" && (
                            <div className="bg-purple-50 p-3 rounded-md text-center">
                              <div className="text-xs text-purple-600 mb-1">Nombre de vers de terre</div>
                              <div className="font-medium text-lg">{record.nbVDT}</div>
                            </div>
                          )}

                          {["analyse_sols", "pollinisateur", "pot_barber"].includes(record.type) && (
                            <div className="flex items-center justify-center bg-purple-50 p-3 rounded-md">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">Réalisé:</span>
                                {record.fait ? 
                                  <Check className="h-5 w-5 text-green-600" /> : 
                                  <X className="h-5 w-5 text-red-600" />
                                }
                              </div>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
