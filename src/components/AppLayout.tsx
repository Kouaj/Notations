
import { Outlet } from "wouter";
import { Navigation } from "./Navigation";
import UserMenu from "./UserMenu";
import { Toaster } from "@/components/ui/toaster";

export function AppLayout() {
  return (
    <div>
      <div className="relative">
        <Navigation />
        <UserMenu />
      </div>
      <div className="container mx-auto my-6">
        <Outlet />
      </div>
      <Toaster />
    </div>
  );
}
