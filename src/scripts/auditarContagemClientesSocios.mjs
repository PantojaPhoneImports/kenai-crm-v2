/**
 * Auditoria somente leitura da contagem de clientes no Dashboard.
 * Nenhum documento do Firestore e alterado por este arquivo.
 */
import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore } from "firebase/firestore";

const NOMES_ALVO = new Set([
  "Josivane dos Santos Aguiar",
  "Neusiane Corrêa Conceição",
  "Carla Cristina Alves do Nascimento",
  "Sarah Sales Almeida",
  "Gabriel Adriano Santa Brígida Cordovil",
]);

const db = getFirestore(initializeApp({
  apiKey: "AIzaSyDodu3gbTsu-B5WYsMberz1gb-8lprM2Ic",
  authDomain: "pantoja-phone-imports.firebaseapp.com",
  projectId: "pantoja-phone-imports",
  storageBucket: "pantoja-phone-imports.firebasestorage.app",
  messagingSenderId: "455745095069",
  appId: "1:455745095069:web:9570433372eb70ea221b74",
}));

const [clientesSnapshot, sociosSnapshot, usuariosSnapshot] = await Promise.all([
  getDocs(collection(db, "clientes")),
  getDocs(collection(db, "socios")),
  getDocs(collection(db, "usuarios")),
]);

const clientes = clientesSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
const socios = sociosSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
const usuarios = usuariosSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));

const resumoPorSocioId = clientes.reduce((resultado, cliente) => {
  const socioId = String(cliente.socioId || "SEM_SOCIO_ID");
  resultado[socioId] = (resultado[socioId] || 0) + 1;
  return resultado;
}, {});

const amostrasPorSocioId = Object.fromEntries(
  Object.keys(resumoPorSocioId).map((socioId) => [
    socioId,
    clientes
      .filter((cliente) => String(cliente.socioId || "SEM_SOCIO_ID") === socioId)
      .slice(0, 3)
      .map((cliente) => ({ nome: cliente.nome, socioNome: cliente.socioNome ?? null })),
  ])
);

const clientesAlvo = clientes
  .filter((cliente) => NOMES_ALVO.has(String(cliente.nome)))
  .map((cliente) => ({
    id: cliente.id,
    nome: cliente.nome,
    socioId: cliente.socioId ?? null,
    socioNome: cliente.socioNome ?? null,
    socio: cliente.socio ?? null,
    nomeSocio: cliente.nomeSocio ?? null,
    campos: Object.keys(cliente).sort(),
  }));

const sociosDiogoAntonio = socios
  .filter((socio) => /^(diogo|antonio|antônio)$/i.test(String(socio.nome || "")))
  .map((socio) => ({ id: socio.id, nome: socio.nome, socioId: socio.socioId ?? null }));

const usuariosDiogoAntonio = usuarios
  .filter((usuario) => /^(diogo|antonio|antônio)$/i.test(String(usuario.nome || "")))
  .map((usuario) => ({
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil,
    socioId: usuario.socioId ?? null,
  }));

const clientesAntigos = clientes
  .filter((cliente) => /^(diogo|antonio|antônio)$/i.test(String(cliente.socioNome || "")))
  .slice(0, 20)
  .map((cliente) => ({
    id: cliente.id,
    nome: cliente.nome,
    socioId: cliente.socioId ?? null,
    socioNome: cliente.socioNome ?? null,
    socio: cliente.socio ?? null,
    nomeSocio: cliente.nomeSocio ?? null,
    campos: Object.keys(cliente).sort(),
  }));

const clientesSemSocioId = clientes
  .filter((cliente) => !cliente.socioId)
  .map((cliente) => ({
    id: cliente.id,
    nome: cliente.nome,
    socioId: cliente.socioId ?? null,
    socioNome: cliente.socioNome ?? null,
    socio: cliente.socio ?? null,
    nomeSocio: cliente.nomeSocio ?? null,
    campos: Object.keys(cliente).sort(),
    dados: cliente,
  }));

console.info("[auditarContagemClientesSocios]", JSON.stringify({
  totalClientes: clientes.length,
  sociosDiogoAntonio,
  usuariosDiogoAntonio,
  resumoPorSocioId,
  amostrasPorSocioId,
  clientesAlvo,
  clientesAntigos,
  clientesSemSocioId,
}, null, 2));

process.exit(0);
