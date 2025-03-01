import { useUser } from "@/contexts/UserContext";
import useStorage from "@/hooks/useStorage";
import { Link, useLocation } from "wouter";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import UserMenu from "./UserMenu";

interface Props {
  toggleSidebar: () => void;
}

const Navigation = ({ toggleSidebar }: Props) => {
  const { user } = useUser();
  const { pathname } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const storage = useStorage();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="bg-background sticky top-0 z-50 border-b">
      <div className="container flex items-center justify-between py-2">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2 px-1">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
          <Link href="/" className="text-lg font-bold">
            Notations
          </Link>
        </div>

        {user ? (
          <UserMenu />
        ) : pathname === "/login" ? (
          <Link href="/register">
            <Button>S'inscrire</Button>
          </Link>
        ) : pathname === "/register" ? (
          <Link href="/login">
            <Button>Se connecter</Button>
          </Link>
        ) : (
          <>
            <Link href="/login">
              <Button variant="outline">Se connecter</Button>
            </Link>
            <Link href="/register">
              <Button>S'inscrire</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Navigation;
