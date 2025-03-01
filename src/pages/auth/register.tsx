
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useLocation } from 'wouter';
import { storage } from '@/lib/storage';
import { User } from '@/shared/schema';
import { z } from 'zod';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const registerSchema = z.object({
  name: z.string().min(2, { message: "Nom doit contenir au moins 2 caractères" }),
  email: z.string().email({ message: "Email invalide" }),
  password: z.string().min(6, { message: "Mot de passe doit contenir au moins 6 caractères" }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorDetails, setErrorDetails] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    console.log("Register: Page d'inscription chargée");
    const checkCurrentUser = async () => {
      try {
        const user = await storage.getCurrentUser();
        console.log("Register: Vérification de l'utilisateur actuel:", user);
        if (user) {
          console.log("Register: Utilisateur déjà connecté, redirection vers /");
          setLocation('/');
        } else {
          console.log("Register: Aucun utilisateur connecté, affichage du formulaire d'inscription");
        }
      } catch (error) {
        console.error("Register: Erreur lors de la vérification de l'utilisateur actuel:", error);
      }
    };
    checkCurrentUser();
  }, [setLocation]);

  const validateForm = () => {
    try {
      registerSchema.parse({ name, email, password, confirmPassword });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: any = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as string;
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Register: Tentative d'inscription avec email:", email);
    
    if (!validateForm()) {
      console.log("Register: Validation du formulaire échouée");
      return;
    }

    setIsLoading(true);
    setErrors({});
    
    try {
      // Vérifier la base de données avant de créer l'utilisateur
      console.log("Register: Vérification des utilisateurs existants");
      const existingUsers = await storage.getUsers();
      console.log("Register: Utilisateurs en base avant inscription:", existingUsers);
      
      // Check if email already exists
      const emailExists = existingUsers.some(u => u.email === email);
      
      if (emailExists) {
        console.log("Register: Email déjà utilisé");
        setErrors({ email: "Cet email est déjà utilisé" });
        toast({
          title: "Erreur d'inscription",
          description: "Cet email est déjà utilisé",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // Create new user with all required fields
      const id = crypto.randomUUID();
      const newUser: User = {
        id,
        email,
        name
      };
      
      console.log("Register: Création d'un nouvel utilisateur:", newUser);
      
      // Stockage du mot de passe simplifié en base64 (pour démo seulement)
      const hashedPassword = btoa(password);
      localStorage.setItem(`user_${id}_password`, hashedPassword);
      console.log("Register: Mot de passe stocké dans localStorage");
      
      // Sauvegarde de l'utilisateur
      try {
        console.log("Register: Tentative de sauvegarde de l'utilisateur");
        const savedUser = await storage.saveUser(newUser);
        console.log("Register: Utilisateur sauvegardé avec succès:", savedUser);
        
        // Vérification immédiate
        const verifiedUser = await storage.getUserById(id);
        console.log("Register: Vérification de la sauvegarde:", verifiedUser);
        
        if (!verifiedUser) {
          throw new Error("L'utilisateur n'a pas été sauvegardé correctement");
        }
        
        // Définir comme utilisateur courant
        await storage.setCurrentUser(verifiedUser);
        console.log("Register: Utilisateur défini comme courant");
        
        toast({
          title: "Inscription réussie",
          description: "Votre compte a été créé avec succès",
          variant: "success"
        });
        
        // Redirection plus douce
        setTimeout(() => {
          console.log("Register: Redirection vers la page d'accueil");
          setLocation('/');
        }, 1000);
      } catch (saveError: any) {
        console.error("Register: Erreur lors de la sauvegarde de l'utilisateur:", saveError);
        // Nettoyage en cas d'erreur
        localStorage.removeItem(`user_${id}_password`);
        
        // Stocker les détails de l'erreur pour affichage
        const errorMessage = saveError.message || "Erreur inconnue";
        console.error("Détails de l'erreur:", errorMessage);
        setErrorDetails(`Erreur de sauvegarde: ${errorMessage}`);
        setShowErrorDialog(true);
        
        throw saveError;
      }
    } catch (error: any) {
      console.error("Register: Erreur lors de l'inscription:", error);
      const errorMessage = error.message || "Une erreur s'est produite lors de l'inscription";
      setErrors(prev => ({ ...prev, general: errorMessage }));
      
      toast({
        title: "Erreur d'inscription",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetDatabase = async () => {
    try {
      console.log("Tentative de réinitialisation de la base de données...");
      const success = await storage.clearAllUsers();
      
      if (success) {
        console.log("Base de données réinitialisée avec succès");
        toast({
          title: "Base de données réinitialisée",
          description: "Toutes les données utilisateur ont été effacées",
          variant: "success"
        });
        // Rafraîchir la page pour repartir à zéro
        window.location.reload();
      } else {
        console.error("Échec de la réinitialisation de la base de données");
        toast({
          title: "Erreur",
          description: "Impossible de réinitialiser la base de données",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la réinitialisation:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la réinitialisation",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 px-4">
      <div className="w-full max-w-md px-8 py-10 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-purple-800">Inscription</h1>
        
        {errors.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.general}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">Nom</label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">Mot de passe</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={errors.confirmPassword ? "border-red-500" : ""}
            />
            {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Inscription en cours..." : "S'inscrire"}
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Déjà un compte?{" "}
            <Button variant="link" className="p-0" onClick={() => setLocation('/auth/login')}>
              Se connecter
            </Button>
          </p>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-200">
          <details className="text-sm text-gray-500">
            <summary className="cursor-pointer hover:text-purple-600">Options de débogage</summary>
            <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Ces options sont uniquement pour le développement et le débogage.</p>
              <Button 
                variant="destructive" 
                size="sm" 
                className="w-full mt-2"
                onClick={resetDatabase}
              >
                Réinitialiser la base de données
              </Button>
            </div>
          </details>
        </div>
      </div>
      
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Erreur technique</AlertDialogTitle>
            <AlertDialogDescription>
              Une erreur s'est produite lors de l'inscription. Détails techniques:
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                {errorDetails}
              </pre>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowErrorDialog(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
