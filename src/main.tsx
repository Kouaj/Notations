
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Débogage détaillé du processus de rendu
console.clear();
console.log("==== DÉBUT DU RENDU DE L'APPLICATION ====");

// Vérifier si l'élément racine existe
const rootElement = document.getElementById("root");
console.log("Élément racine trouvé:", rootElement);

if (rootElement) {
  try {
    console.log("Tentative de rendu de l'App dans l'élément racine");
    createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("Rendu de l'App terminé avec succès");
  } catch (error) {
    console.error("ERREUR CRITIQUE lors du rendu:", error);
  }
} else {
  console.error("ERREUR FATALE: Élément racine '#root' introuvable dans le DOM");
}
