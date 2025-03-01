
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Supprimer tous les logs précédents pour avoir un démarrage propre
console.clear();
console.log("🚀 Initialisation de l'application");

// Fonction d'initialisation de l'application
function initializeApp() {
  try {
    const rootElement = document.getElementById('root');
    
    if (!rootElement) {
      throw new Error("Élément racine '#root' introuvable dans le DOM");
    }
    
    console.log("📌 Élément racine trouvé, création du root React");
    
    const root = createRoot(rootElement);
    
    console.log("🔄 Rendu de l'application...");
    
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    console.log("✅ Application rendue avec succès");
  } catch (error) {
    console.error("❌ ERREUR CRITIQUE lors de l'initialisation:", error);
    
    // Afficher une erreur visible dans le DOM en cas d'échec
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="color: red; padding: 20px; font-family: sans-serif;">
          <h1>Erreur d'initialisation</h1>
          <p>${error instanceof Error ? error.message : String(error)}</p>
        </div>
      `;
    }
  }
}

// Démarrer l'application
initializeApp();
