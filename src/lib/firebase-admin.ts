import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

type ServiceAccountEnv = {
  project_id?: string;
  client_email?: string;
  private_key?: string;
};

function serviceAccount(): ServiceAccountEnv {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON não configurada.");
  const value = JSON.parse(raw) as ServiceAccountEnv;
  if (!value.project_id || !value.client_email || !value.private_key) throw new Error("Credencial Firebase Admin incompleta.");
  return { ...value, private_key: value.private_key.replace(/\\n/g, "\n") };
}

export function adminFirestore() {
  if (!getApps().length) {
    const account = serviceAccount();
    initializeApp({ credential: cert(account as Parameters<typeof cert>[0]), projectId: account.project_id });
  }
  return getFirestore();
}
