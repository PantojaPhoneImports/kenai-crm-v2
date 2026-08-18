import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const verifyToken = process.env.META_WHATSAPP_VERIFY_TOKEN;
  if (!verifyToken) {
    return NextResponse.json({ variableFound: false, status: null, body: null, redirected: false });
  }

  const challenge = "123456789";
  const webhookUrl = new URL("/api/whatsapp/meta/webhook", request.nextUrl.origin);
  webhookUrl.searchParams.set("hub.mode", "subscribe");
  webhookUrl.searchParams.set("hub.verify_token", verifyToken);
  webhookUrl.searchParams.set("hub.challenge", challenge);

  const response = await fetch(webhookUrl, {
    cache: "no-store",
    redirect: "manual",
    signal: AbortSignal.timeout(15_000),
  });
  const body = await response.text();

  return NextResponse.json({
    variableFound: true,
    status: response.status,
    body,
    redirected: response.status >= 300 && response.status < 400,
    exactChallenge: body === challenge,
    contentType: response.headers.get("content-type"),
  });
}
