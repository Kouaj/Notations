
import { useState, useEffect, useCallback } from "react";

/**
 * Un hook personnalisé pour utiliser le hash comme mécanisme de navigation
 * Version simplifiée sans vérification d'authentification
 */
export const useHashLocation = (): [
  string,
  (to: string) => void
] => {
  // Récupération du hash actuel sans le '#'
  const getHash = useCallback(() => window.location.hash.replace(/^#/, "") || "/", []);

  // État local pour stocker le hash actuel
  const [hash, setHash] = useState(getHash());

  // Fonction pour changer de hash
  const navigate = useCallback((to: string) => {
    console.log("Navigation vers:", to);
    window.location.hash = to;
  }, []);

  // Écouter les changements de hash
  useEffect(() => {
    const onHashChange = () => {
      const newHash = getHash();
      console.log("Hash changé:", newHash);
      setHash(newHash);
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [getHash]);

  return [hash, navigate];
};
