import { statusCobranca } from "./cobranca";

export function gerarMensagemWhatsapp(parcela: any) {

  const status = statusCobranca(

    parcela.vencimento?.seconds

      ? new Date(parcela.vencimento.seconds * 1000)

      : new Date(parcela.vencimento)

  );

  const valor = Number(parcela.valor).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  );

  const vencimento = new Date(

    parcela.vencimento?.seconds

      ? parcela.vencimento.seconds * 1000

      : parcela.vencimento

  ).toLocaleDateString("pt-BR");

  if (status === "LEMBRAR") {

    return `Olá ${parcela.clienteNome}!

Passando para lembrar que sua parcela vence daqui a 3 dias.

📅 Vencimento: ${vencimento}
💰 Valor: ${valor}

Caso já tenha programado o pagamento, desconsidere esta mensagem.

🤖 Esta é uma mensagem automática.

Obrigado!
Pantoja Phone Imports`;

  }

  if (status === "HOJE") {

    return `Olá ${parcela.clienteNome}!

Sua parcela vence hoje.

📅 Vencimento: ${vencimento}
💰 Valor: ${valor}

Caso já tenha efetuado o pagamento, desconsidere esta mensagem.

🤖 Mensagem automática.

Obrigado!
Pantoja Phone Imports`;

  }

  if (status === "ATRASADA") {

    return `Olá ${parcela.clienteNome}!

Verificamos que sua parcela encontra-se em atraso.

📅 Vencimento: ${vencimento}
💰 Valor: ${valor}

Caso o pagamento já tenha sido realizado, desconsidere esta mensagem.

Se precisar de qualquer informação, estamos à disposição.

🤖 Mensagem automática.

Pantoja Phone Imports`;

  }

  return `Olá ${parcela.clienteNome}!

Tudo bem?

Estamos entrando em contato referente ao seu financiamento.

Obrigado!

Pantoja Phone Imports`;

}

export function abrirWhatsapp(

  telefone: string,

  mensagem: string

) {

  const numero = telefone.replace(/\D/g, "");

  const url = `https://wa.me/55${numero}?text=${encodeURIComponent(mensagem)}`;

  window.open(url, "_blank");

}