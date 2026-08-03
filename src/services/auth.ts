import {
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import type { FirebaseError } from "firebase/app";

import { auth } from "@/lib/firebase";

export async function login(
  email: string,
  senha: string
) {
  console.info("[auth:login] iniciando signInWithEmailAndPassword", { email });

  try {
    const credencial = await signInWithEmailAndPassword(auth, email, senha);
    console.info("[auth:login] signIn concluído", {
      email,
      uid: credencial.user.uid,
      authEmail: credencial.user.email,
    });
    return credencial.user;
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error("[auth:login] signIn falhou", {
      email,
      code: firebaseError.code,
      message: firebaseError.message,
      error,
    });
    throw error;
  }
}

export async function logout() {
  console.warn("[auth:logout] signOut chamado", {
    uid: auth.currentUser?.uid ?? null,
    email: auth.currentUser?.email ?? null,
    stack: new Error("signOut chamado").stack,
  });
  await signOut(auth);
}
