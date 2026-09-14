import React, { createContext, useContext, useEffect, useState } from "react";

import { getUserFromToken } from "../services/jwtService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (token, user = null) => {
    localStorage.setItem("token", token);

    let loggedInUser = user;

    if (!loggedInUser) {
      loggedInUser = getUserFromToken(token);
    }

    localStorage.setItem("user", JSON.stringify(loggedInUser));

    setToken(token);
    setUser(loggedInUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    const storedUser = localStorage.getItem("user");

    if (storedToken) {
      setToken(storedToken);

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        const tokenUser = getUserFromToken(storedToken);

        if (tokenUser) {
          setUser(tokenUser);

          localStorage.setItem("user", JSON.stringify(tokenUser));
        }
      }
    }
  }, []);

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
