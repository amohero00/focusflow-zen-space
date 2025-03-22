
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LogoText } from "@/assets/logo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  CheckSquare,
  Clock,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, label, icon, isActive }) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-foreground/80 hover:bg-accent hover:text-foreground"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when changing routes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    {
      to: "/",
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    {
      to: "/tasks",
      label: "Tasks",
      icon: <CheckSquare size={18} />,
    },
    {
      to: "/pomodoro",
      label: "Pomodoro",
      icon: <Clock size={18} />,
    },
    {
      to: "/calendar",
      label: "Calendar",
      icon: <CalendarDays size={18} />,
    },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-200",
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-b"
          : "bg-background"
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <LogoText />
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                label={item.label}
                icon={item.icon}
                isActive={location.pathname === item.to}
              />
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <User size={16} />
                    <span className="hidden sm:inline-block">
                      {user.name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => logout()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth?mode=login">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/auth?mode=signup">Sign up</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="container py-3 flex flex-col gap-1 animate-slide-down">
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                label={item.label}
                icon={item.icon}
                isActive={location.pathname === item.to}
              />
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};
