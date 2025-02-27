
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { HistoryRecord } from "@/shared/schema";
import { storage } from "@/lib/storage";
import * as XLSX from 'xlsx';

export default function History() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    storage.getHistory().then(setHistory);
  }, []);

  const handleExport = (record: HistoryRecord) => {
    const wb = XLSX.utils.book_new();

    // Notes worksheet
    const notesWS = XLSX.utils.json_to_sheet(record.notes.map((note, index) => ({
      'N°': index + 1,
      'Mildiou': note.mildiou,
      'Oidium': note.oidium,
      'BR': note.BR,
      'Botrytis': note.botrytis,
      'Partie': note.partie
    })));
    XLSX.utils.book_append_sheet(wb, notesWS, 'Notes');

    // Results worksheet
    const resultsWS = XLSX.utils.json_to_sheet([
      {
        'Métrique': 'Fréquence (%)',
        'Mildiou': record.frequency.mildiou.toFixed(2),
        'Oidium': record.frequency.oidium.toFixed(2),
        'BR': record.frequency.BR.toFixed(2),
        'Botrytis': record.frequency.botrytis.toFixed(2)
      },
      {
        'Métrique': 'Intensité',
        'Mildiou': record.intensity.mildiou.toFixed(2),
        'Oidium': record.intensity.oidium.toFixed(2),
        'BR': record.intensity.BR.toFixed(2),
        'Botrytis': record.intensity.botrytis.toFixed(2)
      }
    ]);
    XLSX.utils.book_append_sheet(wb, resultsWS, 'Résultats');

    XLSX.writeFile(wb, `${record.parcelleName}_${new Date(record.date).toLocaleDateString()}.xlsx`);
  };

  const handleDelete = async (id: number) => {
    await storage.deleteHistory(id);
    const updatedHistory = history.filter(h => h.id !== id);
    setHistory(updatedHistory);
    toast({
      title: "Réussi",
      description: "Notation supprimée"
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {history.map(record => (
        <Card key={record.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {record.parcelleName} - Placette {record.placetteId}
            </CardTitle>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport(record)}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(record.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
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
                  {Object.entries(record.frequency).map(([disease, frequency]) => (
                    <TableRow key={disease}>
                      <TableCell>{disease}</TableCell>
                      <TableCell>{frequency.toFixed(2)}%</TableCell>
                      <TableCell>{record.intensity[disease as keyof typeof record.intensity].toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
