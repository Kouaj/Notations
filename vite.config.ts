
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Récupérer le chemin de base du projet pour GitHub Pages
  // Dans le cas d'un déploiement local, utiliser '/'
  const base = process.env.NODE_ENV === 'production' 
    ? '/' + (process.env.GITHUB_REPOSITORY?.split('/')[1] || '')
    : '/';

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    base: './', // Utilisez './' pour les chemins relatifs
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false
    }
  };
});
