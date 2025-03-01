
import { useState, useEffect } from "react";

/**
 * Hook personnalisé pour la gestion de la navigation basée sur le hash
 * Optimisé pour wouter avec GitHub Pages
 */
export const useHashLocation = (): [string, (to: string) => void] => {
  const [loc, setLoc] = useState(() => {
    // Initialiser avec le hash actuel ou la route par défaut
    return window.location.hash.slice(1) || "/";
  });

  useEffect(() => {
    // Fonction pour mettre à jour l'emplacement basé sur le hash
    const handler = () => {
      const hash = window.location.hash.slice(1);
      console.log("Hash changé:", hash);
      setLoc(hash || "/");
    };

    // S'assurer que nous avons un hash initial si nous sommes à la racine
    if (!window.location.hash) {
      console.log("Pas de hash détecté, définition du hash initial");
      window.location.hash = "#/";
    }

    window.addEventListener("hashchange", handler);
    handler(); // Initialiser avec le hash actuel
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const navigate = (to: string) => {
    console.log("Navigation vers:", to);
    window.location.hash = to;
  };

  return [loc, navigate];
};
