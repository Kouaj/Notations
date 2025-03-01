
import { storage } from '@/lib/storage';
import { User } from '@/shared/schema';
import { RegisterFormData } from '../validation/registerSchema';

export async function registerUser(formData: RegisterFormData): Promise<User> {
  const { name, email, password } = formData;
  
  // Vérifier si l'email existe déjà
  const existingUsers = await storage.getUsers();
  const emailExists = existingUsers.some(u => u.email === email);
  
  if (emailExists) {
    console.log("Email déjà utilisé");
    throw new Error("Cet email est déjà utilisé");
  }
  
  // Créer un nouvel utilisateur
  const id = crypto.randomUUID();
  const newUser: User = {
    id,
    email,
    name
  };
  
  // Stocker le mot de passe hashé
  const hashedPassword = btoa(password);
  localStorage.setItem(`user_${id}_password`, hashedPassword);
  
  // Sauvegarder l'utilisateur
  const savedUser = await storage.saveUser(newUser);
  
  // Vérifier la sauvegarde
  const verifiedUser = await storage.getUserById(id);
  if (!verifiedUser) {
    throw new Error("L'utilisateur n'a pas été sauvegardé correctement");
  }
  
  return savedUser;
}
