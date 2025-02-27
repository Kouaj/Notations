
import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Download, Trash2, ChevronDown, ChevronUp } from "lucide-react";
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
      const typeKey = `${record.type}_${record.partie}`;
      if (!recordsByType[typeKey]) {
        recordsByType[typeKey] = [];
      }
      recordsByType[typeKey].push(record);
    });
    
    // Pour chaque type, créer une feuille avec toutes les notes
    Object.entries(recordsByType).forEach(([typeKey, records]) => {
      const [type, partie] = typeKey.split('_');
      const sheetName = `${type}_${partie}`;
      
      // Rassembler toutes les notes
      const allNotes = records.flatMap(record => 
        record.notes.map(note => ({
          'Placette': record.placetteId,
          'Mildiou': note.mildiou,
          'Oidium': note.oidium,
          'BR': note.BR,
          'Botrytis': note.botrytis,
        }))
      );
      
      const notesWS = XLSX.utils.json_to_sheet(allNotes);
      XLSX.utils.book_append_sheet(wb, notesWS, sheetName);
      
      // Feuille de résultats pour ce type
      const resultsData = records.map(record => ({
        'Placette': record.placetteId,
        'Nb notes': record.count,
        'Fréq. Mildiou (%)': record.frequency.mildiou.toFixed(2),
        'Fréq. Oidium (%)': record.frequency.oidium.toFixed(2),
        'Fréq. BR (%)': record.frequency.BR.toFixed(2),
        'Fréq. Botrytis (%)': record.frequency.botrytis.toFixed(2),
        'Int. Mildiou': record.intensity.mildiou.toFixed(2),
        'Int. Oidium': record.intensity.oidium.toFixed(2),
        'Int. BR': record.intensity.BR.toFixed(2),
        'Int. Botrytis': record.intensity.botrytis.toFixed(2)
      }));
      
      const resultsWS = XLSX.utils.json_to_sheet(resultsData);
      XLSX.utils.book_append_sheet(wb, resultsWS, `${sheetName}_résultats`);
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
    if (type === "maladie") {
      return `Maladie - ${partie === "feuilles" ? "Feuilles" : "Grappe"}`;
    } else if (type === "pheno") {
      return "Phénologie";
    } else {
      return "Ravageurs";
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {groupedHistory.length === 0 ? (
        <Card>
          <CardContent className="flex justify-center items-center p-6">
            <p className="text-muted-foreground">Aucune notation enregistrée</p>
          </CardContent>
        </Card>
      ) : (
        groupedHistory.map(group => (
          <Card key={`${group.parcelleId}_${group.date}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-lg font-medium">
                  {group.parcelleName}
                </CardTitle>
                <CardDescription>
                  {group.formattedDate} • {group.records.length} notation{group.records.length > 1 ? 's' : ''}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport(group)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleGroup(`${group.parcelleId}_${group.date}`)}
                >
                  {expandedGroups[`${group.parcelleId}_${group.date}`] ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            {expandedGroups[`${group.parcelleId}_${group.date}`] && (
              <CardContent>
                <Accordion type="multiple" className="space-y-4">
                  {group.records.map(record => (
                    <AccordionItem key={record.id} value={record.id.toString()} className="border rounded-md">
                      <AccordionTrigger className="px-4 py-2 hover:no-underline">
                        <div className="flex justify-between items-center w-full">
                          <div className="flex items-center gap-2">
                            <span>{getTypeLabel(record.type, record.partie)}</span>
                            <span className="text-sm text-muted-foreground">
                              • Placette {record.placetteId} • {record.count} note{record.count > 1 ? 's' : ''}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(record.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-4">
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
                            >
                              {expandedNotes[record.id.toString()] ? 'Masquer les notes' : 'Afficher les notes'}
                            </Button>
                          </div>
                          
                          {expandedNotes[record.id.toString()] && (
                            <ScrollArea className="h-[200px] border rounded-md p-2">
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
