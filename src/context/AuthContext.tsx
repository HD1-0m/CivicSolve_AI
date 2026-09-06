import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, UserRole } from "../types";
import { StorageService } from "../services/storage";
import { SEED_USERS } from "../data/seedData";

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  loginAs: (roleOrId: UserRole | string) => void;
  loginWithEmail: (email: string, pass: string) => Promise<boolean>;
  registerUser: (userData: Partial<UserProfile>) => Promise<UserProfile>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  availableSeedUsers: UserProfile[];
  personaList: UserProfile[];
  switchPersona: (roleOrId: UserRole | string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = "civicsolve_current_user_id";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedId = localStorage.getItem(CURRENT_USER_KEY);
    const users = StorageService.getUsers();
    if (savedId) {
      const found = users.find(u => u.id === savedId);
      if (found) return found;
    }
    // Default to Student innovator persona for rich interactive testing
    return users.find(u => u.role === "student") || users[0] || SEED_USERS[2];
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, user.id);
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [user]);

  const loginAs = (roleOrId: UserRole | string) => {
    const users = StorageService.getUsers();
    const byId = users.find(u => u.id === roleOrId);
    if (byId) {
      setUser(byId);
      return;
    }
    const byRole = users.find(u => u.role === roleOrId);
    if (byRole) {
      setUser(byRole);
    }
  };

  const loginWithEmail = async (email: string, _pass: string): Promise<boolean> => {
    const users = StorageService.getUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setUser(found);
      return true;
    }
    // Auto-create a temporary account if new email
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: email.split("@")[0],
      email,
      role: "citizen",
      location: "Maharashtra, India",
      skills: ["Community Advocate"],
      interests: ["Civic Improvement"],
      expertise: ["Local Knowledge"],
      reputationScore: 100,
      challengesSubmittedCount: 0,
      solutionsProposedCount: 0,
      projectsJoinedCount: 0,
      createdAt: new Date().toISOString(),
    };
    StorageService.saveUser(newUser);
    setUser(newUser);
    return true;
  };

  const registerUser = async (data: Partial<UserProfile>): Promise<UserProfile> => {
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: data.name || "Civic Contributor",
      email: data.email || `contributor-${Date.now()}@civicsolve.org`,
      role: data.role || "citizen",
      organization: data.organization,
      location: data.location || "India",
      skills: data.skills || ["Civic Problem Solving"],
      interests: data.interests || ["Public Welfare"],
      expertise: data.expertise || ["Field Research"],
      reputationScore: 100,
      challengesSubmittedCount: 0,
      solutionsProposedCount: 0,
      projectsJoinedCount: 0,
      createdAt: new Date().toISOString(),
    };
    StorageService.saveUser(newUser);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    StorageService.saveUser(updated);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || "citizen",
        isAuthenticated: Boolean(user),
        loginAs,
        loginWithEmail,
        registerUser,
        logout,
        updateProfile,
        availableSeedUsers: StorageService.getUsers(),
        personaList: StorageService.getUsers(),
        switchPersona: loginAs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
