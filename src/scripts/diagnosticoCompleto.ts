import { initializeApp } from "firebase/app";

import {
  getFirestore,
  collection,
  getDocs,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDodu3gbTsu-B5WYsMberz1gb-8lprM2Ic",
  authDomain: "pantoja-phone-imports.firebaseapp.com",
  projectId: "pantoja-phone-imports",
  storageBucket: "pantoja-phone-imports.firebasestorage.app",
  messagingSenderId: "455745095069",
  appId: "1:455745095069:web:9570433372eb70ea221b74",
  measurementId: "G-BE7MNR59XF",
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

async function executar() {

  const socios = await getDocs(collection(db, "socios"));
  const usuarios = await getDocs(collection(db, "usuarios"));
  const clientes = await getDocs(collection(db, "clientes"));
  const estoque = await getDocs(collection(db, "estoque"));
  const vendas = await getDocs(collection(db, "vendas"));
  const parcelas = await getDocs(collection(db, "parcelas"));
  const repasses = await getDocs(collection(db, "repasses"));

  const mapaSocios = new Map<string, any>();

  console.log("\n================ SOCIOS ================");

  socios.forEach((d) => {
    mapaSocios.set(d.id, d.data());

    console.log({
      id: d.id,
      nome: d.data().nome,
    });
  });

  function verificar(nome: string, snapshot: any) {

    console.log(`\n================ ${nome} ================`);

    snapshot.forEach((doc: any) => {

      const dados = doc.data();

      if (!dados.socioId) return;

      const existe = mapaSocios.has(dados.socioId);

      console.log({
        documento: doc.id,
        nome:
          dados.nome ||
          dados.clienteNome ||
          dados.produtoNome ||
          dados.produto ||
          "-",
        socioId: dados.socioId,
        existe,
      });

    });

  }

  verificar("USUARIOS", usuarios);

  verificar("CLIENTES", clientes);

  verificar("ESTOQUE", estoque);

  verificar("VENDAS", vendas);

  verificar("PARCELAS", parcelas);

  verificar("REPASSES", repasses);

}

executar();