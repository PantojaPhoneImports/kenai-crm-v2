type DadosTelefone = Record<string, unknown> | null | undefined;

export function normalizarTelefoneWhatsapp(valor: unknown) {
  let digitos = String(valor || "").replace(/\D/g, "");
  if (digitos.startsWith("55") && digitos.length >= 12) digitos = digitos.slice(2);
  return digitos.length === 10 || digitos.length === 11 ? digitos : "";
}

export function resolverTelefoneWhatsapp(...fontes: DadosTelefone[]) {
  for (const fonte of fontes) {
    if (!fonte) continue;
    for (const campo of ["telefone", "telefone2", "clienteTelefone", "telefoneCliente"]) {
      const telefone = normalizarTelefoneWhatsapp(fonte[campo]);
      if (telefone) return telefone;
    }
  }
  return "";
}

export function numeroEvolution(valor: unknown) {
  const telefone = normalizarTelefoneWhatsapp(valor);
  if (!telefone) throw new Error("Cliente sem telefone válido (informe DDD + número).");
  return `55${telefone}`;
}
