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
import { buscarUsuarioPorUid } from "@/services/usuarios";
import type { Usuario } from "@/types/usuario";

interface AuthContextType {
  user: User | null;
  usuario: Usuario | null;
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

  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    console.info("[auth:persistence] diagnóstico de persistência web", {
      configuracaoNoCodigo: "getAuth(app); sem initializeAuth() e sem setPersistence()",
      persistenciaPadraoWeb: "browserLocalPersistence",
      indexedDBDisponivel: typeof window !== "undefined" && "indexedDB" in window,
      localStorageDisponivel: (() => {
        try {
          return typeof window !== "undefined" && Boolean(window.localStorage);
        } catch {
          return false;
        }
      })(),
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    });

    const unsubscribe = onAuthStateChanged(

      auth,

      async (firebaseUser) => {

        console.info("[auth:context] onAuthStateChanged disparado", {
          uid: firebaseUser?.uid ?? null,
          email: firebaseUser?.email ?? null,
          possuiUsuarioFirebase: Boolean(firebaseUser),
        });

        if (firebaseUser) {

          try {
            console.info("[auth:context] buscando usuário de acesso por UID", {
              email: firebaseUser.email || "",
              uid: firebaseUser.uid,
              caminhoFirestore: `/databases/(default)/documents/usuarios/${firebaseUser.uid}`,
              consulta: `doc(db, "usuarios", "${firebaseUser.uid}")`,
            });
            const dadosUsuario = await buscarUsuarioPorUid(firebaseUser.uid);

            console.info("[auth:context] usuário entrando no contexto", {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              usuarioEncontrado: Boolean(dadosUsuario),
              perfil: dadosUsuario?.perfil ?? null,
              socioId: dadosUsuario?.socioId ?? null,
              usuario: dadosUsuario,
            });
            setUser(firebaseUser);
            setUsuario(dadosUsuario);
          } catch (error) {
            const firebaseError = error as { code?: string; message?: string };
            console.error("[auth:context] erro ao carregar usuário da coleção usuarios", {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              code: firebaseError.code,
              message: firebaseError.message,
              stack: error instanceof Error ? error.stack : undefined,
              error,
            });
            throw error;
          }
        } else {

          console.warn("[auth:context] Firebase não possui sessão; limpando contexto", {
            motivo: "onAuthStateChanged recebeu null",
          });

          setUser(null);

          setUsuario(null);

        }

        console.info("[auth:context] finalizando carregamento do contexto", {
          uid: firebaseUser?.uid ?? null,
        });
        setLoading(false);

      }

    );

    return () => unsubscribe();

  }, []);

  async function logout() {

    console.warn("[auth:context] logout solicitado", {
      uid: user?.uid ?? null,
      email: user?.email ?? null,
      stack: new Error("logout solicitado").stack,
    });
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
