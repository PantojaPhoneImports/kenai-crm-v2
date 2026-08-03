import { NextResponse } from "next/server";

/**
 * Ponto de entrada compatível com Vercel Cron. A ativação futura deve fornecer
 * credenciais de servidor para o provider escolhido, sem alterar nenhuma tela.
 */
export async function GET() {
  return NextResponse.json({ ready: true, scheduledFor: "08:00", message: "Processamento automático aguarda a configuração de um provider servidor." });
}
