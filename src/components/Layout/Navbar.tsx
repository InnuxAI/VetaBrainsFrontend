import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../App";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Menu,
  LogOut,
  UserIcon,
  Shield,
  Sun,
  Moon,
  Command as CommandIcon,
} from "lucide-react";
import {
  applyTheme,
  getStoredTheme,
  resolveTheme,
  type ThemeMode,
} from "@/lib/theme";

const routes = [
  { to: "/", label: "Home", private: true },
  { to: "/chat", label: "Chat", private: true },
  { to: "/admin", label: "Admin", private: true, admin: true },
];

const FuturisticNavbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [openCmd, setOpenCmd] = React.useState(false);
  const [mode, setMode] = React.useState<ThemeMode>(() => getStoredTheme());
  const resolved = resolveTheme(mode);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpenCmd((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const filteredRoutes = routes.filter((r) => {
    if (!user && r.private) return false;
    if (r.admin && user?.role !== "admin") return false;
    return true;
  });

  const toggleTheme = () => {
    const next: ThemeMode = resolved === "light" ? "dark" : "light";
    setMode(next);
    applyTheme(next);
  };

  const ActiveIndicator: React.FC<{ active: boolean }> = ({ active }) => (
    <AnimatePresence>
      {active && (
        <motion.span
          layoutId="active-pill"
          className="absolute inset-0 rounded-md bg-gradient-to-r from-[var(--color-chart-1)] via-[var(--color-chart-3)] to-[var(--color-chart-5)] opacity-70"
          transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
        />
      )}
    </AnimatePresence>
  );

  const Brand = (
    <Link to="/" className="group inline-flex items-center gap-3" style={{ fontFamily: "var(--font-sans)" }}>
      <motion.div whileHover={{ scale: 1.05, rotate: 1 }} className="relative">
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[var(--color-chart-1)] via-[var(--color-chart-3)] to-[var(--color-chart-5)] blur opacity-50 group-hover:opacity-80 transition" />
        <div className="relative h-10 w-10 rounded-full bg-[var(--color-foreground)]/95 ring-1 ring-[var(--color-border)] flex items-center justify-center">
          <span className="text-[var(--color-chart-5)] text-sm font-semibold tracking-wider">VB</span>
        </div>
      </motion.div>
      <span className="font-semibold text-lg bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-chart-1)] via-[var(--color-chart-3)] to-[var(--color-chart-5)] tracking-wide">
        VetaBrains
      </span>
    </Link>
  );

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="sticky top-0 z-50 border-b border-[var(--color-border)]/40 bg-[var(--color-background)]/60 backdrop-blur-2xl shadow-[0_8px_40px_-10px_var(--shadow-color)]"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        <div className="w-full mx-12 px-6 md:px-10 lg:px-16">
          <div className="flex h-16 items-center justify-between">
            {/* Brand */}
            {Brand}

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2 relative">
              <NavigationMenu>
                <NavigationMenuList className="bg-transparent rounded-md">
                  {filteredRoutes.map(({ to, label }) => {
                    const active = pathname === to;
                    return (
                      <NavigationMenuItem key={to} className="relative">
                        <Link to={to} className="relative overflow-hidden">
                          <span
                            className={[
                              "relative z-10 px-3 py-1.5 rounded-md text-sm tracking-wide transition-all",
                              active
                                ? "text-[var(--color-foreground)] font-semibold"
                                : "text-[var(--color-foreground)]",
                            ].join(" ")}
                          >
                            {label}
                          </span>
                          <ActiveIndicator active={active} />
                          {!active && (
                            <motion.span
                              whileHover={{
                                background:
                                  "linear-gradient(to right, var(--color-chart-1)/.25, var(--color-chart-3)/.25, var(--color-chart-5)/.25)",
                                scale: 1.05,
                              }}
                              className="absolute inset-0 rounded-md transition"
                            />
                          )}
                        </Link>
                      </NavigationMenuItem>
                    );
                  })}
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* Right Side */}
            <div className="hidden md:flex items-center gap-3">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                aria-label="Toggle theme"
                onClick={toggleTheme}
                className="hover:bg-[var(--color-accent)]/40"
              >
                {resolved === "light" ? (
                  <Moon className="h-5 w-5 text-[var(--color-chart-1)]" />
                ) : (
                  <Sun className="h-5 w-5 text-[var(--color-chart-3)]" />
                )}
              </Button>

              {user ? (
                <>
                  <motion.div className="relative flex items-center gap-2 cursor-pointer group" whileHover={{ scale: 1.03 }}>
                    <Avatar className="h-8 w-8 ring-2 ring-[var(--color-chart-1)]/40">
                      <AvatarFallback className="bg-gradient-to-br from-[var(--color-chart-1)] to-[var(--color-chart-5)] text-white text-xs">
                        {user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-xs text-[var(--color-foreground)]/90">
                      <div className="font-semibold leading-tight truncate max-w-[140px]" title={user.username}>
                        {user.username}
                      </div>
                      <div className="flex items-center gap-1 leading-tight text-[var(--color-chart-1)]">
                        {user.role === "admin" ? (
                          <Shield className="h-3.5 w-3.5 text-[var(--color-chart-5)]" />
                        ) : (
                          <UserIcon className="h-3.5 w-3.5 text-[var(--color-chart-1)]" />
                        )}
                        <span className="capitalize">{user.role}</span>
                      </div>
                    </div>
                  </motion.div>

                  <Button
                    onClick={handleLogout}
                    className="text-white bg-[var(--primary)] hover:shadow-[0_0_18px_2px_var(--shadow-color)]"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    className="bg-gradient-to-r from-[var(--color-chart-1)] via-[var(--color-chart-3)] to-[var(--color-chart-5)] text-white hover:shadow-[0_0_18px_1px_var(--shadow-color)]"
                  >
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button
                    asChild
                    variant="secondary"
                    className="bg-[var(--color-card)] text-[var(--color-foreground)] ring-1 ring-[var(--color-border)]"
                  >
                    <Link to="/signup">Sign Up</Link>
                  </Button>
                </>
              )}

              {/* Command Orb */}
              {user && (
                <motion.div whileHover={{ scale: 1.08 }}>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setOpenCmd(true)}
                    title="Command (⌘K / Ctrl+K)"
                    className="rounded-full bg-gradient-to-br from-[var(--color-chart-1)]/40 to-[var(--color-chart-5)]/40 hover:from-[var(--color-chart-1)] hover:to-[var(--color-chart-5)]"
                  >
                    <CommandIcon className="h-5 w-5 text-white" />
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                title={`Switch to ${resolved === "light" ? "dark" : "light"} mode`}
              >
                {resolved === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 bg-primary backdrop-blur-xl">
                  <div className="mt-6 space-y-4">{Brand}</div>
                  <Separator className="my-4" />
                  {filteredRoutes.map(({ to, label }) => (
                    <Button
                      key={to}
                      variant={pathname === to ? "default" : "ghost"}
                      asChild
                      className="w-full justify-start"
                    >
                      <Link to={to}>{label}</Link>
                    </Button>
                  ))}
                  <Separator className="my-4" />
                  {user ? (
                    <Button onClick={handleLogout} className="w-full">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button asChild className="flex-1">
                        <Link to="/login">Login</Link>
                      </Button>
                      <Button asChild variant="secondary" className="flex-1">
                        <Link to="/signup">Sign Up</Link>
                      </Button>
                    </div>
                  )}
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Command Palette */}
      <CommandDialog open={openCmd} onOpenChange={setOpenCmd} className="command-dialog-content">
        <CommandInput placeholder="Type a command or search..." className="command-input" />
        <CommandList>
          <CommandEmpty className="command-empty">No results found.</CommandEmpty>

          <CommandGroup heading="Navigation" className="command-group">
            {filteredRoutes.map(({ to, label }) => (
              <CommandItem
                key={to}
                onSelect={() => {
                  setOpenCmd(false);
                  navigate(to);
                }}
                className="command-item"
              >
                {label}
              </CommandItem>
            ))}
          </CommandGroup>

          {user ? (
            <CommandGroup heading="Account" className="command-group">
              <CommandItem
                onSelect={() => {
                  setOpenCmd(false);
                  handleLogout();
                }}
                className="command-item"
              >
                Logout
              </CommandItem>
            </CommandGroup>
          ) : (
            <CommandGroup heading="Auth" className="command-group">
              <CommandItem
                onSelect={() => {
                  setOpenCmd(false);
                  navigate("/login");
                }}
                className="command-item"
              >
                Login
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setOpenCmd(false);
                  navigate("/signup");
                }}
                className="command-item"
              >
                Sign Up
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default FuturisticNavbar;
