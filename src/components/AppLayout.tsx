
import React from "react";
import { Route, Switch } from "wouter";
import { Sidebar } from "@/components/ui/sidebar";

export function AppLayout({ children }) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="w-64 border-r" />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
