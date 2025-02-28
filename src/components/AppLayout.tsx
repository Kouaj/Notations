
import React from "react";
import { UserMenu } from "./UserMenu";
import { Navigation } from "./Navigation";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <span className="hidden font-bold sm:inline-block">
                Eco-Viticulture
              </span>
            </a>
            <Navigation />
          </div>
          <div className="flex flex-1 items-center space-x-2 justify-end">
            <UserMenu />
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
