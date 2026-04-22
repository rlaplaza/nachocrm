import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authService } from "@/services/authService";

interface AuthContextType {
  user: any | null;
  loading: boolean;
  role: string;
  profile: any | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: "salesperson",
  profile: null,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("salesperson");
  const [profile, setProfile] = useState<any | null>(null);

  useEffect(() => {
    const unsubscribe = authService.subscribeToAuthChanges(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userData = await authService.getUserProfile(firebaseUser.uid);
        if (userData) {
          setProfile(userData);
          setRole(userData.role || "salesperson");
        }
      } else {
        setProfile(null);
        setRole("salesperson");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await authService.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, role, profile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
