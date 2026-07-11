import Image from "next/image";

import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {

  return (

    <div className="min-h-screen bg-zinc-950 flex items-center justify-center relative overflow-hidden">

      {/* Fundo */}

      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black" />

      <div className="absolute w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-3xl -top-40 -left-40" />

      <div className="absolute w-[450px] h-[450px] rounded-full bg-yellow-500/10 blur-3xl bottom-0 right-0" />

      <div className="relative z-10 w-full max-w-md">

        {/* Logo */}

        <div className="flex flex-col items-center mb-8">

          <Image
            src="/logo.png"
            alt="Pantoja Phone Imports"
            width={170}
            height={170}
            priority
            className="object-contain"
          />

          <h1 className="mt-5 text-3xl font-bold text-white">

            KENAI CRM

          </h1>

          <p className="text-zinc-400 mt-2 text-center">

            Pantoja Phone Imports

          </p>

        </div>

        <LoginForm />

      </div>

    </div>

  );

}