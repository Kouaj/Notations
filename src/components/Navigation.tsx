import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { HomeIcon, FlagIcon, LayoutIcon, HistoryIcon, UserIcon, Menu, X, ShieldIcon } from 'lucide-react';
import { storage } from '@/lib/storage';
import { User } from '@/shared/schema';

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
}

function NavLink({ to, children }: NavLinkProps) {
  const [, setLocation] = useLocation();
  const isActive = useLocation().pathname === to;

  const handleClick = () => {
    setLocation(to);
  };

  return (
    <button
      onClick={handleClick}
      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
        isActive ? 'bg-purple-200 text-purple-800' : 'text-gray-600 hover:bg-purple-50 hover:text-purple-800'
      }`}
    >
      {children}
    </button>
  );
}

export function Navigation() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const loadCurrentUser = async () => {
      const user = await storage.getCurrentUser();
      setCurrentUser(user);
      
      if (user) {
        const adminStatus = await storage.isAdmin(user);
        setIsAdmin(adminStatus);
      }
    };
    
    loadCurrentUser();
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="bg-gradient-to-r from-purple-100 to-indigo-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-bold text-purple-700">Agri<span className="text-indigo-600">Notation</span></h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              <NavLink to="/">
                <HomeIcon className="h-5 w-5" />
                <span>Notation</span>
              </NavLink>
              <NavLink to="/reseaux">
                <FlagIcon className="h-5 w-5" />
                <span>Réseaux</span>
              </NavLink>
              <NavLink to="/parcelles">
                <LayoutIcon className="h-5 w-5" />
                <span>Parcelles</span>
              </NavLink>
              <NavLink to="/history">
                <HistoryIcon className="h-5 w-5" />
                <span>Historique</span>
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin">
                  <ShieldIcon className="h-5 w-5" />
                  <span>Admin</span>
                </NavLink>
              )}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex items-center">
            {currentUser ? (
              <div className="ml-3 relative">
                <div>
                  <button
                    type="button"
                    className="max-w-xs bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                    id="user-menu-button"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    <span className="sr-only">Open user menu</span>
                    <UserIcon className="h-5 w-5 text-gray-300" />
                  </button>
                </div>
              </div>
            ) : (
              <NavLink to="/auth/login">
                <UserIcon className="h-5 w-5" />
                <span>Se connecter</span>
              </NavLink>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleMobileMenu}
              type="button"
              className="bg-purple-100 inline-flex items-center justify-center p-2 rounded-md text-purple-700 hover:text-purple-900 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-purple-100 focus:ring-purple-500"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      <div className="sm:hidden" id="mobile-menu" style={{ display: isMobileMenuOpen ? 'block' : 'none' }}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          <NavLink to="/">
            <HomeIcon className="h-5 w-5" />
            <span>Notation</span>
          </NavLink>
          <NavLink to="/reseaux">
            <FlagIcon className="h-5 w-5" />
            <span>Réseaux</span>
          </NavLink>
          <NavLink to="/parcelles">
            <LayoutIcon className="h-5 w-5" />
            <span>Parcelles</span>
          </NavLink>
          <NavLink to="/history">
            <HistoryIcon className="h-5 w-5" />
            <span>Historique</span>
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin">
              <ShieldIcon className="h-5 w-5" />
              <span>Admin</span>
            </NavLink>
          )}
        </div>
        {currentUser ? null : (
          <div className="px-2 pt-2 pb-3 space-y-1">
            <NavLink to="/auth/login">
              <UserIcon className="h-5 w-5" />
              <span>Se connecter</span>
            </NavLink>
          </div>
        )}
      </div>
    </div>
  );
}
