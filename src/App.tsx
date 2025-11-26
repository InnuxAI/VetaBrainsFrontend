import React, { useEffect, useState, createContext, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DomainView from "./pages/DomainView";
import Navbar from "./components/Layout/Navbar";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import UsersMatrix from "./components/Admin/UsersMatrix";
// import DomainsAdmin from "./components/Admin/DomainsAdmin";
// import GlobalChat from "./pages/GlobalChat";
// import UsersAdmin from "./components/Admin/UsersAdmin";
import Chat from "./pages/Chat";
import UploadDocumentPage from "./pages/UploadDocumentPage";
// import UploadDocx from "./pages/UploadDocx";

// ---------- Types ----------
interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  domains: string[];
}

// ---------- Auth Context ----------
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("accessToken")
  );

  const login = (user: User, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("accessToken", token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ---------- Route Guards ----------
const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
};

// ---------- App Component ----------
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div
          className="min-h-screen flex flex-col font-[var(--font-sans)] 
                     bg-[var(--background)] text-[var(--foreground)] 
                     transition-colors duration-300"
        >
          {/* Subtle Accent Backgrounds */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-[-100px] w-[600px] h-[600px] 
                            bg-[var(--primary)]/5 blur-[160px]" />
            <div className="absolute bottom-0 right-[-100px] w-[500px] h-[500px] 
                            bg-[var(--accent)]/10 blur-[160px]" />
          </div>

          {/* Navbar */}
          <Navbar />

          {/* Main Content */}
          <main className="flex-1 relative z-10 px-2 sm:px-6 md:px-8">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Authenticated Routes */}
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/domains/:domain"
                element={
                  <PrivateRoute>
                    <DomainView />
                  </PrivateRoute>
                }
              />
              <Route
                path="/chat"
                element={
                  <PrivateRoute>
                    <Chat />
                    {/* <GlobalChat /> */}
                  </PrivateRoute>
                }
              />

              <Route
              path="/upload"
              element={
                <AdminRoute>
                  <UploadDocumentPage />
                </AdminRoute>
              }
            />


              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              >

                
                <Route index element={<Navigate to="matrix" replace />} />
                <Route
                  path="matrix"
                  element={
                    <AdminRoute>
                      <UsersMatrix />
                    </AdminRoute>
                  }
                />
          
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer
            className="text-center p-4 text-sm text-[var(--muted-foreground)] 
                       border-t border-[var(--border)] bg-[var(--card)] relative z-10"
          >
            © 2025 <span className="text-[var(--primary)] font-semibold">VetaBrains</span>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
