
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useLocation } from 'wouter';
import { storage } from '@/lib/storage';
import { User } from '@/shared/schema';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email({ message: "Email invalide" }),
  password: z.string().min(6, { message: "Mot de passe doit contenir au moins 6 caractères" })
});

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    console.log("Login: Page de connexion chargée");
    const checkCurrentUser = async () => {
      try {
        const user = await storage.getCurrentUser();
        if (user) {
          console.log("Login: Utilisateur déjà connecté, redirection vers /");
          setLocation('/');
        }
      } catch (error) {
        console.error("Login: Erreur lors de la vérification de l'utilisateur actuel:", error);
      }
    };
    checkCurrentUser();
  }, [setLocation]);

  const validateForm = () => {
    try {
      loginSchema.parse({ email, password });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { email?: string; password?: string } = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as string;
          newErrors[path as 'email' | 'password'] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login: Tentative de connexion avec email:", email);
    
    if (!validateForm()) {
      console.log("Login: Validation du formulaire échouée");
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Récupérer tous les utilisateurs
      const users = await storage.getUsers();
      console.log("Login: Utilisateurs récupérés:", users.length);
      console.log("Login: Liste des utilisateurs:", JSON.stringify(users, null, 2));
      
      // Trouver l'utilisateur par email
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        console.log("Login: Utilisateur non trouvé pour email:", email);
        setErrors({ general: "Email ou mot de passe incorrect" });
        toast({
          title: "Erreur de connexion",
          description: "Email ou mot de passe incorrect",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      console.log("Login: Utilisateur trouvé:", user);
      
      // Vérifier le mot de passe - sécurisation minimale en base64
      const hashedPassword = btoa(password);
      const storedPasswordKey = `user_${user.id}_password`;
      const storedPassword = localStorage.getItem(storedPasswordKey);
      
      console.log("Login: Vérification du mot de passe pour userId:", user.id);
      console.log("Login: Clé du mot de passe:", storedPasswordKey);
      console.log("Login: Mot de passe stocké existe:", !!storedPassword);
      
      if (hashedPassword === storedPassword) {
        console.log("Login: Mot de passe correct, connexion réussie");
        
        // Définir l'utilisateur actuel
        await storage.setCurrentUser(user);
        console.log("Login: Utilisateur actuel défini:", user);
        
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté"
        });
        
        // Utiliser le hash pour la redirection (compatible avec GitHub Pages)
        window.location.href = window.location.origin + window.location.pathname + '#/';
      } else {
        console.log("Login: Mot de passe incorrect");
        console.log("Login: Mot de passe fourni (hashé):", hashedPassword);
        console.log("Login: Mot de passe stocké:", storedPassword);
        
        setErrors({ general: "Email ou mot de passe incorrect" });
        toast({
          title: "Erreur de connexion",
          description: "Email ou mot de passe incorrect",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ general: "Une erreur s'est produite lors de la connexion" });
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la connexion",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 px-4">
      <div className="w-full max-w-md px-8 py-10 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-purple-800">Connexion</h1>
        
        {errors.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.general}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? "Connexion en cours..." : "Se connecter"}
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Pas encore de compte?{" "}
            <Button variant="link" className="p-0" onClick={() => setLocation('/auth/register')}>
              S'inscrire
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}
