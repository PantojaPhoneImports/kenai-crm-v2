import {
  collection,
  getDocs,
  writeBatch,
  doc,
} from "firebase/firestore";

import { db } from "../lib/firebase";

async function executar() {
  console.clear();

  const vendasSnap = await getDocs(collection(db, "vendas"));
  const clientesSnap = await getDocs(collection(db, "clientes"));
  const parcelasSnap = await getDocs(collection(db, "parcelas"));
  const repassesSnap = await getDocs(collection(db, "repasses"));

  const batch = writeBatch(db);

  // ==========================
  // MAPA DAS VENDAS
  // ==========================

  const mapaVendas = new Map();

  vendasSnap.forEach((d) => {
    const venda: any = d.data();

    mapaVendas.set(d.id, {
      socioId: venda.socioId,
      socioNome: venda.socioNome,
      clienteId: venda.clienteId,
    });
  });

  let clientesCorrigidos = 0;
  let parcelasCorrigidas = 0;
  let repassesCorrigidos = 0;

  // ==========================
  // CLIENTES
  // ==========================

  clientesSnap.forEach((d) => {
    const cliente: any = d.data();

    const venda = [...mapaVendas.values()].find(
      (v: any) => v.clienteId === d.id
    );

    if (!venda) return;

    if (
      cliente.socioId !== venda.socioId ||
      cliente.socioNome !== venda.socioNome
    ) {
      batch.update(doc(db, "clientes", d.id), {
        socioId: venda.socioId,
        socioNome: venda.socioNome,
      });

      clientesCorrigidos++;
    }
  });

  // ==========================
  // PARCELAS
  // ==========================

  parcelasSnap.forEach((d) => {
    const parcela: any = d.data();

    const venda = mapaVendas.get(parcela.vendaId);

    if (!venda) return;

    if (
      parcela.socioId !== venda.socioId ||
      parcela.socioNome !== venda.socioNome
    ) {
      batch.update(doc(db, "parcelas", d.id), {
        socioId: venda.socioId,
        socioNome: venda.socioNome,
      });

      parcelasCorrigidas++;
    }
  });

  // ==========================
  // REPASSES
  // ==========================

  repassesSnap.forEach((d) => {
    const repasse: any = d.data();

    const venda = mapaVendas.get(repasse.idVenda);

    if (!venda) return;

    if (
      repasse.socioId !== venda.socioId ||
      repasse.socioNome !== venda.socioNome
    ) {
      batch.update(doc(db, "repasses", d.id), {
        socioId: venda.socioId,
        socioNome: venda.socioNome,
      });

      repassesCorrigidos++;
    }
  });

  await batch.commit();

  console.log("");
  console.log("==============================");
  console.log("REPARAÇÃO FINALIZADA");
  console.log("==============================");
  console.log("");
  console.log("Clientes:", clientesCorrigidos);
  console.log("Parcelas:", parcelasCorrigidas);
  console.log("Repasses:", repassesCorrigidos);
  console.log("");
}

executar();