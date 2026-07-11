"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  User,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import { auth } from "@/lib/firebase";
import { buscarUsuarioPorEmail } from "@/services/usuarios";

interface AuthContextType {
  user: User | null;
  usuario: any;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  usuario: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [user, setUser] = useState<User | null>(null);

  const [usuario, setUsuario] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(

      auth,

      async (firebaseUser) => {

        if (firebaseUser) {

          const dadosUsuario =
            await buscarUsuarioPorEmail(
              firebaseUser.email || ""
            );

          setUser(firebaseUser);

          setUsuario(dadosUsuario);

        } else {

          setUser(null);

          setUsuario(null);

        }

        setLoading(false);

      }

    );

    return () => unsubscribe();

  }, []);

  async function logout() {

    await signOut(auth);

  }

  return (

    <AuthContext.Provider
      value={{
        user,
        usuario,
        loading,
        logout,
      }}
    >

      {children}

    </AuthContext.Provider>

  );

}

export function useAuth() {

  return useContext(AuthContext);

}