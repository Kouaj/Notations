
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
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const checkCurrentUser = async () => {
      const user = await storage.getCurrentUser();
      if (user) {
        setLocation('/');
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
    
    if (!validateForm()) return;

    try {
      // Simple password hashing (in production, use a proper hashing library)
      const hashedPassword = btoa(password);
      
      // Get users and check if email exists
      const users = await storage.getUsers();
      const user = users.find(u => u.email === email);
      
      if (!user) {
        toast({
          title: "Erreur de connexion",
          description: "Utilisateur non trouvé. Veuillez vous inscrire.",
          variant: "destructive"
        });
        return;
      }
      
      // For demo purposes only - in real app, NEVER store passwords client-side
      // This is only for demonstration and should be replaced with proper authentication
      if (hashedPassword === localStorage.getItem(`user_${user.id}_password`)) {
        await storage.saveUser(user); // This will also set as current user
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté"
        });
        setLocation('/');
      } else {
        toast({
          title: "Erreur de connexion",
          description: "Mot de passe incorrect",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la connexion",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-full max-w-md px-8 py-10 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Connexion</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
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
            <label htmlFor="password" className="text-sm font-medium">Mot de passe</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          </div>
          
          <Button type="submit" className="w-full">Se connecter</Button>
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
