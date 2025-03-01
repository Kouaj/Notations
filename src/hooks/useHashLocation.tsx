
import { useState, useEffect, useRef } from "react";

/**
 * Hook personnalisé pour la gestion de la navigation basée sur le hash
 * Optimisé pour wouter avec GitHub Pages
 */
export const useHashLocation = (): [string, (to: string) => void] => {
  const [loc, setLoc] = useState(() => {
    // Initialiser avec le hash actuel ou la route par défaut
    return window.location.hash.slice(1) || "/";
  });
  
  // Utiliser useRef pour éviter des redirections en boucle
  const initialRender = useRef(true);
  const processingHashChange = useRef(false);

  useEffect(() => {
    // Fonction pour mettre à jour l'emplacement basé sur le hash
    const handler = () => {
      if (processingHashChange.current) return;
      
      processingHashChange.current = true;
      const hash = window.location.hash.slice(1);
      console.log("Hash changé:", hash);
      setLoc(hash || "/");
      
      // Réinitialiser après un court délai
      setTimeout(() => {
        processingHashChange.current = false;
      }, 100);
    };

    // S'assurer que nous avons un hash initial si nous sommes à la racine
    // Seulement au premier rendu pour éviter une boucle
    if (initialRender.current && !window.location.hash) {
      console.log("Pas de hash détecté, définition du hash initial");
      initialRender.current = false;
      window.location.hash = "#/";
    } else {
      initialRender.current = false;
    }

    window.addEventListener("hashchange", handler);
    handler(); // Initialiser avec le hash actuel
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const navigate = (to: string) => {
    if (processingHashChange.current) return;
    
    console.log("Navigation vers:", to);
    processingHashChange.current = true;
    window.location.hash = to;
    
    // Réinitialiser après un court délai
    setTimeout(() => {
      processingHashChange.current = false;
    }, 100);
  };

  return [loc, navigate];
};
