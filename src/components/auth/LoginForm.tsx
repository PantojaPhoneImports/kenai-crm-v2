"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Lock, Mail } from "lucide-react";

import { login } from "@/services/auth";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function LoginForm() {

  const router = useRouter();

  const [email, setEmail] = useState("");

  const [senha, setSenha] = useState("");

  const [loading, setLoading] = useState(false);

  async function entrar(event?: React.FormEvent<HTMLFormElement>) {

    event?.preventDefault();

    console.info("[login:form] submit recebido", { email });

    if (!email || !senha) {

      alert("Preencha e-mail e senha.");

      return;

    }

    try {

      setLoading(true);

      const usuarioFirebase = await login(email, senha);

      console.info("[login:form] login retornou usuário Firebase; navegando para dashboard", {
        email,
        uid: usuarioFirebase.uid,
      });

      router.push("/dashboard");

    } catch (error) {

      const firebaseError = error as { code?: string; message?: string };
      console.error("[login:form] falha no submit", {
        email,
        code: firebaseError.code,
        message: firebaseError.message,
        error,
      });

      alert("E-mail ou senha inválidos.");

    } finally {

      setLoading(false);

    }

  }

  return (

    <form onSubmit={entrar} className="w-full rounded-3xl border border-zinc-800 bg-zinc-900/90 p-5 shadow-2xl backdrop-blur-xl sm:p-8">

      <div className="text-center mb-8">

        <h2 className="text-2xl font-bold text-white">

          Entrar no Sistema

        </h2>

        <p className="text-zinc-400 mt-2">

          Informe seus dados para acessar o CRM.

        </p>

      </div>

      <div className="space-y-6">

        <div>

          <Label className="mb-2 block">

            E-mail

          </Label>

          <div className="relative">

            <Mail
              size={18}
              className="absolute left-3 top-3 text-zinc-500"
            />

            <Input

              type="email"

              placeholder="Digite seu e-mail"

              className="pl-10"

              value={email}

              onChange={(e)=>setEmail(e.target.value)}

            />

          </div>

        </div>

        <div>

          <Label className="mb-2 block">

            Senha

          </Label>

          <div className="relative">

            <Lock
              size={18}
              className="absolute left-3 top-3 text-zinc-500"
            />

            <Input

              type="password"

              placeholder="Digite sua senha"

              className="pl-10"

              value={senha}

              onChange={(e)=>setSenha(e.target.value)}

            />

          </div>

        </div>

        <Button
          type="submit"

          disabled={loading}

          className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700"

        >

          {loading ? "Entrando..." : "Entrar no CRM"}

        </Button>

      </div>

      <div className="mt-8 border-t border-zinc-800 pt-6 text-center">

        <p className="text-xs text-zinc-500">

          © {new Date().getFullYear()} Pantoja Phone Imports

        </p>

      </div>

    </form>

  );

}
