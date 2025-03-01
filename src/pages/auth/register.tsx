
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useLocation } from 'wouter';
import { storage } from '@/lib/storage';
import { User } from '@/shared/schema';
import { z } from 'zod';

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
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    console.log("Register: Page d'inscription chargée");
    const checkCurrentUser = async () => {
      try {
        const user = await storage.getCurrentUser();
        if (user) {
          console.log("Register: Utilisateur déjà connecté, redirection vers /");
          setLocation('/');
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
    try {
      // Check if email already exists
      const users = await storage.getUsers();
      console.log("Register: Utilisateurs récupérés:", users);
      
      const emailExists = users.some(u => u.email === email);
      
      if (emailExists) {
        console.log("Register: Email déjà utilisé");
        toast({
          title: "Erreur d'inscription",
          description: "Cet email est déjà utilisé",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // Create new user
      const id = crypto.randomUUID();
      const newUser: User = {
        id,
        email,
        name
      };
      
      console.log("Register: Création d'un nouvel utilisateur:", newUser);
      
      // Save user to database
      await storage.saveUser(newUser);
      console.log("Register: Utilisateur sauvegardé");
      
      // For demo purposes only - in real app, NEVER store passwords client-side
      // This is only for demonstration and should be replaced with proper authentication
      localStorage.setItem(`user_${id}_password`, btoa(password));
      
      // Set as current user
      await storage.setCurrentUser(newUser);
      console.log("Register: Utilisateur défini comme courant");
      
      console.log("Register: Inscription réussie");
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès"
      });
      
      // Ajouter un délai pour s'assurer que le currentUser est bien enregistré
      setTimeout(() => {
        console.log("Register: Redirection vers la page d'accueil");
        setLocation('/');
      }, 1000);
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'inscription",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 px-4">
      <div className="w-full max-w-md px-8 py-10 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-purple-800">Inscription</h1>
        
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
      </div>
    </div>
  );
}
