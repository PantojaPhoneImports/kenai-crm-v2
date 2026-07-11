export function diferencaDias(data: Date) {

  const hoje = new Date();

  hoje.setHours(0,0,0,0);

  const vencimento = new Date(data);

  vencimento.setHours(0,0,0,0);

  return Math.ceil(

    (vencimento.getTime() - hoje.getTime())

    /

    (1000 * 60 * 60 * 24)

  );

}

export function statusCobranca(data: Date) {

  const dias = diferencaDias(data);

  if (dias < 0) {

    return "ATRASADA";

  }

  if (dias === 0) {

    return "HOJE";

  }

  if (dias <= 3) {

    return "LEMBRAR";

  }

  return "NORMAL";

}