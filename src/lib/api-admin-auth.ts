import { NextRequest } from "next/server";

import { adminFirestore } from "@/lib/firebase-admin";
import { firebasePublicConfig } from "@/lib/firebase-public-config";

type FirebaseLookup = { users?: Array<{ localId?: string; email?: string; displayName?: string }> };

export async function requireAdmin(request: NextRequest) {
  const user = await requireUser(request);
  if (user.perfil !== "ADMIN") throw new Error("FORBIDDEN");
  return { uid: user.uid, email: user.email, nome: user.nome };
}

export async function requireUser(request: NextRequest) {
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) throw new Error("UNAUTHORIZED");
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firebasePublicConfig.apiKey)}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ idToken: token }), cache: "no-store", signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error("UNAUTHORIZED");
  const lookup = await response.json() as FirebaseLookup;
  const identity = lookup.users?.[0];
  if (!identity?.localId) throw new Error("UNAUTHORIZED");
  const db = adminFirestore();
  let profile = await db.collection("usuarios").doc(identity.localId).get();
  if (!profile.exists && identity.email) {
    const legacy = await db.collection("usuarios").where("email", "==", identity.email).limit(1).get();
    profile = legacy.empty ? profile : legacy.docs[0];
  }
  const perfil = String(profile.data()?.perfil || "").toUpperCase();
  const admin = ["ADMIN", "ADMINISTRADOR"].includes(perfil);
  const socio = perfil === "SOCIO";
  if ((!admin && !socio) || profile.data()?.ativo === false) throw new Error("FORBIDDEN");
  const socioId = socio ? String(profile.data()?.socioId || "") : "";
  if (socio && !socioId) throw new Error("FORBIDDEN");
  return { uid: identity.localId, email: identity.email || "", nome: String(profile.data()?.nome || identity.displayName || "Usuário"), perfil: admin ? "ADMIN" as const : "SOCIO" as const, socioId };
}

export function logAuthError(context: string, error: unknown) {
  const value = error as { name?: string; message?: string; code?: string; stack?: string };
  console.error(`[${context}] falha segura`, { name: value?.name || "Error", message: value?.message || "Falha desconhecida", code: value?.code || null, stack: value?.stack || null });
}

export function authStatus(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  return message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
}
