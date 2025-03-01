
import { useState, useEffect, useRef } from "react";

/**
 * Hook personnalisé pour la gestion de la navigation basée sur le hash
 * Optimisé pour wouter avec GitHub Pages
 */
export const useHashLocation = (): [string, (to: string) => void] => {
  const [loc, setLoc] = useState(() => window.location.hash.slice(1) || "/");
  const initialRender = useRef(true);
  const processingHashChange = useRef(false);
  const lastHash = useRef(window.location.hash.slice(1) || "/");

  useEffect(() => {
    // Fonction pour mettre à jour l'emplacement basé sur le hash
    const handler = () => {
      if (processingHashChange.current) return;
      
      processingHashChange.current = true;
      const hash = window.location.hash.slice(1);
      
      // Éviter les redirections en boucle en vérifiant si le hash a réellement changé
      if (hash !== lastHash.current) {
        console.log("Hash changé:", hash, "précédent:", lastHash.current);
        lastHash.current = hash;
        setLoc(hash || "/");
      }
      
      setTimeout(() => {
        processingHashChange.current = false;
      }, 100);
    };

    // S'assurer que nous avons un hash initial si nous sommes à la racine
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
    if (to === lastHash.current) return; // Éviter la navigation vers la même page
    
    console.log("Navigation vers:", to);
    processingHashChange.current = true;
    lastHash.current = to;
    window.location.hash = to;
    
    setTimeout(() => {
      processingHashChange.current = false;
    }, 100);
  };

  return [loc, navigate];
};
