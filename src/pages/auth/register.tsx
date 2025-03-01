
import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useLocation } from 'wouter';
import { storage } from '@/lib/storage';
import { z } from 'zod';
import RegisterForm from './components/RegisterForm';
import ErrorDialog from './components/ErrorDialog';
import DebugOptions from './components/DebugOptions';
import { registerUser } from './utils/registrationUtils';
import { registerSchema, RegisterFormData } from './validation/registerSchema';

export default function Register() {
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
        const lastReset = localStorage.getItem('db_reset_timestamp');
        if (lastReset) {
          const resetTime = parseInt(lastReset);
          const currentTime = Date.now();
          if ((currentTime - resetTime) < 5000) {
            console.log("Base de données récemment réinitialisée, attente...");
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        // Remove the reference to DB_VERSION which doesn't exist on the storage object
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

  const validateForm = (formData: RegisterFormData) => {
    try {
      registerSchema.parse(formData);
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

  const handleSubmit = async (formData: RegisterFormData) => {
    console.log("Register: Tentative d'inscription avec email:", formData.email);
    
    if (!validateForm(formData)) {
      console.log("Register: Validation du formulaire échouée");
      return;
    }

    setIsLoading(true);
    setErrors({});
    
    try {
      await registerUser(formData);
      
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès",
        variant: "success"
      });
      
      console.log("Register: Redirection vers la page de connexion");
      
      // Forcer une redirection complète vers la page de connexion
      setTimeout(() => {
        console.log("Exécution de la redirection...");
        window.location.href = window.location.origin + window.location.pathname + '#/auth/login';
        // Forcer un rechargement pour s'assurer que tout est bien initialisé
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error("Register: Erreur lors de l'inscription:", error);
      
      if (error.message.includes("email est déjà utilisé")) {
        setErrors({ email: "Cet email est déjà utilisé" });
        toast({
          title: "Erreur d'inscription",
          description: "Cet email est déjà utilisé",
          variant: "destructive"
        });
      } else {
        const errorMessage = error.message || "Une erreur s'est produite lors de l'inscription";
        setErrors(prev => ({ ...prev, general: errorMessage }));
        
        // Gestion des erreurs de version de base de données
        if (errorMessage.includes("version")) {
          console.warn("⚠️ Erreur de version détectée, tentative de récupération...");
          const success = await storage.clearAllUsers();
          if (success) {
            console.log("Base de données réinitialisée avec succès, rechargement...");
            toast({
              title: "Réinitialisation nécessaire",
              description: "La base de données a été réinitialisée. Veuillez réessayer.",
              variant: "default"
            });
            setTimeout(() => window.location.reload(), 2000);
            return;
          }
        }
        
        console.error("Détails de l'erreur:", errorMessage);
        setErrorDetails(`Erreur de sauvegarde: ${errorMessage}`);
        setShowErrorDialog(true);
        
        toast({
          title: "Erreur d'inscription",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 px-4">
      <div className="w-full max-w-md px-8 py-10 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-purple-800">Inscription</h1>
        
        <RegisterForm 
          onSubmit={handleSubmit}
          isLoading={isLoading}
          errors={errors}
        />
        
        <DebugOptions />
      </div>
      
      <ErrorDialog 
        open={showErrorDialog} 
        onOpenChange={setShowErrorDialog}
        errorDetails={errorDetails}
      />
    </div>
  );
}
