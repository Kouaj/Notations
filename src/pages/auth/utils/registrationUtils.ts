
import { storage } from '@/lib/storage';
import { User } from '@/shared/schema';
import { RegisterFormData } from '../validation/registerSchema';

export async function registerUser(formData: RegisterFormData): Promise<User> {
  const { name, email, password } = formData;
  
  try {
    console.log("registerUser: Début de l'inscription pour:", email);
    
    // Vérifier si l'email existe déjà
    const existingUsers = await storage.getUsers();
    console.log("registerUser: Utilisateurs existants récupérés:", existingUsers.length);
    
    const emailExists = existingUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (emailExists) {
      console.log("registerUser: Email déjà utilisé:", email);
      throw new Error("Cet email est déjà utilisé");
    }
    
    // Créer un nouvel utilisateur
    const id = crypto.randomUUID();
    console.log("registerUser: Nouvel ID utilisateur généré:", id);
    
    const newUser: User = {
      id,
      email,
      name
    };
    
    // Stocker le mot de passe hashé (sécurité minimale)
    const hashedPassword = btoa(password);
    const passwordKey = `user_${id}_password`;
    localStorage.setItem(passwordKey, hashedPassword);
    console.log("registerUser: Mot de passe stocké avec la clé:", passwordKey);
    
    // Sauvegarder l'utilisateur
    console.log("registerUser: Sauvegarde de l'utilisateur:", newUser);
    const savedUser = await storage.saveUser(newUser);
    console.log("registerUser: Utilisateur sauvegardé avec succès:", savedUser);
    
    // Vérifier la sauvegarde
    const verifiedUser = await storage.getUserById(id);
    if (!verifiedUser) {
      console.error("registerUser: L'utilisateur n'a pas été trouvé après la sauvegarde");
      throw new Error("L'utilisateur n'a pas été sauvegardé correctement");
    }
    
    console.log("registerUser: Utilisateur vérifié:", verifiedUser);
    console.log("registerUser: Inscription réussie pour:", email);
    
    return savedUser;
  } catch (error) {
    console.error("registerUser: Erreur lors de l'inscription:", error);
    throw error;
  }
}
