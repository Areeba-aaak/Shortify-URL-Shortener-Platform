
import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import authService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Check whether the user is already logged in
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authService.getMe();

        // Backend response:
        // {
        //   success: true,
        //   data: {
        //     user: {...}
        //   }
        // }

        if (response.data?.user) {
          setUser(response.data.user);
        } else {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          setUser(null);
        }
      } catch (error) {
        console.error(
          "Authentication initialization failed:",
          error
        );

        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");

        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login
  const login = async (email, password) => {
    const response = await authService.login({
      email,
      password
    });

    // Backend returns:
    // response.data.user

    if (response.data?.user) {
      setUser(response.data.user);
    }

    return response;
  };

  // Register
  const register = async (name, email, password) => {
    const response = await authService.register({
      name,
      email,
      password
    });

    // Backend registration currently returns:
    // response.data.user
    //
    // It does NOT return an accessToken.
    // Therefore registration creates the account,
    // but the user must login afterwards.

    if (response.data?.user) {
      setUser(response.data.user);
    }

    return response;
  };

  // Logout
  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    loading,

    isAuthenticated: !!user,

    isAdmin: user?.role === "admin",

    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};

export default AuthContext;
