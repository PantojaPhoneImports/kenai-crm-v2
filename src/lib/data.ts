/** Formatação defensiva de datas armazenadas pelo Firestore, sempre em Brasília. */
type DataFirestore = { toDate?: () => Date; seconds?: number; nanoseconds?: number };

function converterData(valor: unknown): Date | null {
  if (valor instanceof Date) return Number.isNaN(valor.getTime()) ? null : valor;
  if (valor && typeof valor === "object") {
    const firestore = valor as DataFirestore;
    if (typeof firestore.toDate === "function") {
      const data = firestore.toDate();
      return Number.isNaN(data.getTime()) ? null : data;
    }
    if (typeof firestore.seconds === "number") return new Date(firestore.seconds * 1000);
  }
  if (typeof valor === "string" || typeof valor === "number") {
    const data = new Date(valor);
    return Number.isNaN(data.getTime()) ? null : data;
  }
  return null;
}

export function formatarData(valor: unknown, fallback = "Não informado") {
  const data = converterData(valor);
  return data ? new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo" }).format(data) : fallback;
}

export function formatarDataHora(valor: unknown, fallback = "Não informado") {
  const data = converterData(valor);
  return data ? new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(data).replace(",", "") : fallback;
}
