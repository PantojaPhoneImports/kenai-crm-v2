export async function buscarCEP(cep: string) {

  const numero = cep.replace(/\D/g, "");

  if (numero.length !== 8) return null;

  const response = await fetch(
    `https://viacep.com.br/ws/${numero}/json/`
  );

  if (!response.ok) return null;

  const data = await response.json();

  if (data.erro) return null;

  return {
    endereco: data.logradouro,
    bairro: data.bairro,
    cidade: data.localidade,
    estado: data.uf,
  };

}