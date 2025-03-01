
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User, SystemLog } from "@/shared/schema";
import { storage } from "@/lib/storage";

export default function Admin() {
  const [location, setLocation] = useLocation();
  const [users, setUsers] = useState<User[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkAdmin = async () => {
      const currentUser = await storage.getCurrentUser();
      const isAdmin = await storage.isAdmin(currentUser);
      
      if (!isAdmin) {
        setLocation('/');
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas les droits d'administrateur",
          variant: "destructive"
        });
      } else {
        setIsLoading(false);
      }
    };
    
    checkAdmin();
    
    // Only load data if user is admin (checked above)
    const loadData = async () => {
      try {
        const [users, logs] = await Promise.all([
          storage.getUsers(),
          storage.getSystemLogs()
        ]);
        
        setUsers(users);
        setSystemLogs(logs);
        setIsLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des données admin:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données d'administration",
          variant: "destructive"
        });
      }
    };
    
    loadData();
  }, [setLocation, toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="mr-2 h-4 w-4 animate-spin">⟳</div> Chargement...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea>
            <Table>
              <TableCaption>Tous les utilisateurs enregistrés.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>{user.name || "N/A"}</TableCell>
                    <TableCell>{user.email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logs du système</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea>
            <Table>
              <TableCaption>Activité récente du système.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Détails</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {systemLogs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.id}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.details}</TableCell>
                    <TableCell>{log.userId}</TableCell>
                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
