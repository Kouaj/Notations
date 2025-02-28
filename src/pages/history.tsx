import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { HistoryGroup } from "@/shared/schema";
import { storage } from "@/lib/storage";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface HistoryRecord {
  parcelleName: string;
  date: string;
  type: string;
  partie: string;
  frequency: Record<string, number>;
  intensity: Record<string, number>;
  commentaire?: string;
  fait?: boolean;
  hauteurIR?: number;
  hauteurCavaillon?: number;
  nbVDT?: number;
}

const groupHistoryByDate = (history: HistoryRecord[]) => {
  const grouped: { [key: string]: HistoryGroup } = {};

  history.forEach(record => {
    const date = new Date(record.date).toLocaleDateString();
    const formattedDate = format(new Date(record.date), 'PPP', { locale: fr });
    const key = `${record.parcelleName}-${date}`;

    if (!grouped[key]) {
      grouped[key] = {
        parcelleName: record.parcelleName,
        parcelleId: 0, // You might want to populate this with the actual parcelleId
        date: date,
        formattedDate: formattedDate,
        records: []
      };
    }
    grouped[key].records.push(record);
  });

  return Object.values(grouped);
};

export default function History() {
  const [historyData, setHistoryData] = useState<HistoryGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const currentUser = await storage.getCurrentUser();
        
        if (!currentUser) {
          toast({
            title: "Erreur",
            description: "Vous devez être connecté pour accéder à l'historique",
            variant: "destructive"
          });
          return;
        }
        
        // Charger l'historique spécifique à l'utilisateur
        const history = await storage.getHistoryByUser(currentUser.id);
        
        // Grouper l'historique par parcelle et par date
        const grouped = groupHistoryByDate(history);
        setHistoryData(grouped);
        setIsLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement de l'historique:", error);
        setIsLoading(false);
        toast({
          title: "Erreur",
          description: "Impossible de charger l'historique",
          variant: "destructive"
        });
      }
    };

    loadHistory();
  }, [toast]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Chargement de l'historique...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Historique des notations</h1>
      {historyData.length === 0 ? (
        <p className="text-muted-foreground">Aucune notation n'a été enregistrée.</p>
      ) : (
        <div className="space-y-4">
          {historyData.map((group, groupIndex) => (
            <Card key={groupIndex} className="shadow-sm">
              <CardHeader>
                <CardTitle>{group.parcelleName}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Date: {group.formattedDate}
                </p>
                <ScrollArea>
                  <Table>
                    <TableCaption>Historique des notations pour {group.parcelleName} le {group.formattedDate}</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Type</TableHead>
                        <TableHead>Partie</TableHead>
                        <TableHead>Fréquence</TableHead>
                        <TableHead>Intensité</TableHead>
                        <TableHead>Commentaire</TableHead>
                        <TableHead>Fait</TableHead>
                        <TableHead>Hauteur IR</TableHead>
                        <TableHead>Hauteur Cavaillon</TableHead>
                        <TableHead>Nb VDT</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.records.map((record, recordIndex) => (
                        <TableRow key={recordIndex}>
                          <TableCell className="font-medium">{record.type}</TableCell>
                          <TableCell>{record.partie}</TableCell>
                          <TableCell>
                            {record.frequency &&
                              Object.entries(record.frequency).map(([key, value]) => (
                                <div key={key}>
                                  {key}: {value.toFixed(2)}%
                                </div>
                              ))}
                          </TableCell>
                          <TableCell>
                            {record.intensity &&
                              Object.entries(record.intensity).map(([key, value]) => (
                                <div key={key}>
                                  {key}: {value.toFixed(2)}
                                </div>
                              ))}
                          </TableCell>
                          <TableCell>{record.commentaire}</TableCell>
                          <TableCell>{record.fait ? 'Oui' : 'Non'}</TableCell>
                          <TableCell>{record.hauteurIR}</TableCell>
                          <TableCell>{record.hauteurCavaillon}</TableCell>
                          <TableCell>{record.nbVDT}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
