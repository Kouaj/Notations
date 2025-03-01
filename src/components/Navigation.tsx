
import React from "react";
import { useLocation } from "wouter";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Network, Map, History as HistoryIcon } from "lucide-react";

export default function Navigation() {
  const [location, setLocation] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-gradient-to-r from-purple-700 to-indigo-600 shadow-lg">
      <div className="container mx-auto px-4 py-1">
        <Tabs value={location} onValueChange={setLocation} className="w-full">
          <TabsList className="w-full grid grid-cols-4 h-16 bg-transparent">
            <TabsTrigger 
              value="/" 
              className="flex flex-col items-center justify-center space-y-1 py-2 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white rounded-lg transition-all"
            >
              <BookOpen size={20} />
              <span className="text-xs">Notation</span>
            </TabsTrigger>
            <TabsTrigger 
              value="/reseaux" 
              className="flex flex-col items-center justify-center space-y-1 py-2 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white rounded-lg transition-all"
            >
              <Network size={20} />
              <span className="text-xs">Réseaux</span>
            </TabsTrigger>
            <TabsTrigger 
              value="/parcelles" 
              className="flex flex-col items-center justify-center space-y-1 py-2 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white rounded-lg transition-all"
            >
              <Map size={20} />
              <span className="text-xs">Parcelles</span>
            </TabsTrigger>
            <TabsTrigger 
              value="/history" 
              className="flex flex-col items-center justify-center space-y-1 py-2 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white rounded-lg transition-all"
            >
              <HistoryIcon size={20} />
              <span className="text-xs">Historique</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
