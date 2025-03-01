
import React from 'react';

export default function Fallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-4">AgriApp</h1>
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Bienvenue</h2>
        <p className="mb-4">
          Application de suivi et notation des maladies viticoles.
        </p>
        <div className="flex justify-between">
          <a 
            href="/auth/login" 
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
          >
            Connexion
          </a>
          <a 
            href="/auth/register" 
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
          >
            Inscription
          </a>
        </div>
      </div>
    </div>
  );
}
