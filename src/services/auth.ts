import {
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { auth } from "@/lib/firebase";

export async function login(
  email: string,
  senha: string
) {
  const credencial =
    await signInWithEmailAndPassword(
      auth,
      email,
      senha
    );

  return credencial.user;
}

export async function logout() {
  await signOut(auth);
}