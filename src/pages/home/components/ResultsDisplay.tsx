
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { Note } from "@/shared/schema";

interface ResultsDisplayProps {
  results: {
    frequency: Record<string, number>;
    intensity: Record<string, number>;
  };
  notes: Note[];
  showNotes: boolean;
  setShowNotes: (showNotes: boolean) => void;
  onRemoveNote: (index: number) => void;
}

export function ResultsDisplay({
  results,
  notes,
  showNotes,
  setShowNotes,
  onRemoveNote
}: ResultsDisplayProps) {
  return (
    <Card className="shadow-md">
      <CardHeader className="py-2 px-4">
        <CardTitle className="flex justify-between items-center text-base">
          <span>Résultats</span>
          <Badge>{notes.length} note{notes.length > 1 ? 's' : ''}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 px-4 py-1">
        <ScrollArea className="h-[140px]">
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
          <ScrollArea className="h-[140px] border rounded-md">
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
                        onClick={() => onRemoveNote(notes.length - 1 - index)}
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
  );
}
