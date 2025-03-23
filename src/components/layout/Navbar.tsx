import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Menu, X, LogOut, User } from "lucide-react";
import { Logo, LogoText } from "@/assets/logo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="border-b bg-secondary">
      <div className="flex h-16 items-center px-4">
        {isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="mr-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:w-64">
              <SheetHeader className="text-left">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <Link to="/" className="block py-2 px-4 hover:bg-accent rounded-md">
                  Dashboard
                </Link>
                <Link to="/tasks" className="block py-2 px-4 hover:bg-accent rounded-md">
                  Tasks
                </Link>
                <Link to="/pomodoro" className="block py-2 px-4 hover:bg-accent rounded-md">
                  Pomodoro
                </Link>
                <Link to="/calendar" className="block py-2 px-4 hover:bg-accent rounded-md">
                  Calendar
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        ) : null}

        <div className="container flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <LogoText showTagline={!isMobile} />
          </Link>
          {user ? (
            <div className="flex items-center gap-4">
              {!isMobile && (
                <div className="hidden md:flex items-center gap-4">
                  <Link
                    to="/"
                    className={`py-2 px-4 rounded-md hover:bg-accent ${location.pathname === "/" ? "bg-accent text-accent-foreground" : ""
                      }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/tasks"
                    className={`py-2 px-4 rounded-md hover:bg-accent ${location.pathname === "/tasks" ? "bg-accent text-accent-foreground" : ""
                      }`}
                  >
                    Tasks
                  </Link>
                  <Link
                    to="/pomodoro"
                    className={`py-2 px-4 rounded-md hover:bg-accent ${location.pathname === "/pomodoro" ? "bg-accent text-accent-foreground" : ""
                      }`}
                  >
                    Pomodoro
                  </Link>
                  <Link
                    to="/calendar"
                    className={`py-2 px-4 rounded-md hover:bg-accent ${location.pathname === "/calendar" ? "bg-accent text-accent-foreground" : ""
                      }`}
                  >
                    Calendar
                  </Link>
                </div>
              )}

              <TooltipProvider>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <TooltipTrigger>
                      <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                        <User className="h-4 w-4" />
                        <span className="sr-only">Open user menu</span>
                      </Button>
                    </TooltipTrigger>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled>
                      <User className="mr-2 h-4 w-4" />
                      <span>{user.email}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        logout();
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipProvider>
            </div>
          ) : (
            <div>
              {location.pathname !== "/auth" && (
                <Link to="/auth">
                  <Button>Login</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
