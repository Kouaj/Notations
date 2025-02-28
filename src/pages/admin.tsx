
import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { storage } from '@/lib/storage';
import { SystemLog } from '@/lib/storage/historyStorage';
import { User } from '@/shared/schema';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [logMessage, setLogMessage] = useState('');

  useEffect(() => {
    const checkAdmin = async () => {
      const user = await storage.getCurrentUser();
      setCurrentUser(user);
      const isUserAdmin = await storage.isAdmin(user);
      setIsAdmin(isUserAdmin);
      
      if (!isUserAdmin) {
        toast({
          title: "Accès non autorisé",
          description: "Vous n'avez pas les droits d'administrateur.",
          variant: "destructive",
        });
        setLocation('/');
      } else {
        loadData();
      }
    };
    
    checkAdmin();
  }, [setLocation, toast]);

  const loadData = async () => {
    try {
      const allUsers = await storage.getUsers();
      const systemLogs = await storage.getSystemLogs();
      
      setUsers(allUsers);
      setLogs(systemLogs.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données d'administration.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await storage.deleteUser(userId);
        toast({
          title: "Succès",
          description: "L'utilisateur a été supprimé avec succès.",
        });
        loadData(); // Recharger les données
      } catch (error) {
        console.error('Error deleting user:', error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer l'utilisateur.",
          variant: "destructive",
        });
      }
    }
  };

  const addManualLog = async () => {
    if (!logMessage.trim()) {
      toast({
        title: "Erreur",
        description: "Le message de log ne peut pas être vide.",
        variant: "destructive",
      });
      return;
    }

    try {
      await storage.addSystemLog({
        id: Date.now(),
        action: 'MANUAL_ENTRY',
        details: logMessage,
        userId: currentUser?.id || 'admin',
        timestamp: Date.now()
      });
      setLogMessage('');
      toast({
        title: "Succès",
        description: "Log ajouté avec succès.",
      });
      loadData(); // Recharger les logs
    } catch (error) {
      console.error('Error adding log:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le log.",
        variant: "destructive",
      });
    }
  };

  if (!isAdmin) {
    return <div className="p-8 text-center">Vérification des privilèges...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Administration</h1>
      
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="logs">Journaux système</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Liste des utilisateurs</h2>
            
            <Table>
              <TableCaption>Liste des utilisateurs enregistrés</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.name || '—'}</TableCell>
                    <TableCell>
                      {user.email !== 'mathieu.peraud@gmail.com' ? (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Supprimer
                        </Button>
                      ) : (
                        <span className="text-sm text-gray-500 italic">Administrateur</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="logs">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Journaux système</h2>
            
            <div className="mb-6 p-4 border rounded">
              <h3 className="font-medium mb-2">Ajouter un journal manuellement</h3>
              <Textarea
                value={logMessage}
                onChange={(e) => setLogMessage(e.target.value)}
                placeholder="Entrez un message de journal..."
                className="mb-2"
              />
              <Button onClick={addManualLog}>Ajouter</Button>
            </div>
            
            <Table>
              <TableCaption>Journaux système</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Date/Heure</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Détails</TableHead>
                  <TableHead>Utilisateur</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.details}</TableCell>
                    <TableCell>{log.userId}</TableCell>
                  </TableRow>
                ))}
                {logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      Aucun journal trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 text-center">
        <Button variant="outline" onClick={() => setLocation('/')}>
          Retour à l'accueil
        </Button>
      </div>
    </div>
  );
}
