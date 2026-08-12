import { NextRequest, NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebase-admin";
import { authStatus, requireUser } from "@/lib/api-admin-auth";

export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request); const db = adminFirestore(); const clienteId = request.nextUrl.searchParams.get("clienteId") || "";
    let query: FirebaseFirestore.Query = db.collection("whatsappMensagens");
    if (user.perfil === "SOCIO") query = query.where("socioId", "==", user.socioId);
    if (clienteId) { const client = await db.collection("clientes").doc(clienteId).get(); if (!client.exists || (user.perfil === "SOCIO" && client.data()?.socioId !== user.socioId)) return NextResponse.json({ error: "Acesso negado." }, { status: 403 }); query = query.where("clienteId", "==", clienteId); }
    const snapshot = await query.limit(200).get(); const messages: Array<Record<string, unknown> & { id: string }> = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); messages.sort((a, b) => String(b.timestamp || "").localeCompare(String(a.timestamp || "")));
    return NextResponse.json({ readOnly: user.perfil === "SOCIO", messages });
  } catch (error) { return NextResponse.json({ error: "Acesso negado." }, { status: authStatus(error) }); }
}
