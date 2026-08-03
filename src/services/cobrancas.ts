import { addDoc, collection, getDocs, query, setDoc, doc, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Cobranca, ConfiguracaoCobranca } from "@/types/cobranca";
export async function criarCobranca(cobranca: Omit<Cobranca,"id">) { return addDoc(collection(db,"cobrancas"), cobranca); }
export async function registrarLog(dados: Record<string, unknown>) { return addDoc(collection(db,"cobrancaLogs"), dados); }
export async function atualizarCobranca(id: string, dados: Partial<Cobranca>) { return updateDoc(doc(db, "cobrancas", id), dados); }
export async function jaExisteCobrancaHoje(clienteId: string | undefined, tipoMensagem: string) { const hoje=new Date().toISOString().slice(0,10); const s=await getDocs(query(collection(db,"cobrancas"),where("clienteId","==",clienteId||""),where("tipoMensagem","==",tipoMensagem))); return s.docs.some(d=>String(d.data().criadoEm||"").startsWith(hoje)); }
export async function obterConfiguracaoCobranca(): Promise<ConfiguracaoCobranca | null> { const s=await getDocs(collection(db,"configuracoesCobranca")); return s.empty?null:{id:s.docs[0].id,...s.docs[0].data()} as ConfiguracaoCobranca; }
export async function salvarConfiguracaoCobranca(configuracao: ConfiguracaoCobranca) { const atual=await getDocs(collection(db,"configuracoesCobranca")); if(atual.empty) return addDoc(collection(db,"configuracoesCobranca"),configuracao); return setDoc(doc(db,"configuracoesCobranca",atual.docs[0].id),configuracao); }
