import Image from "next/image";

import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {

  return (

    <div className="relative isolate flex min-h-[100dvh] items-center justify-center overflow-hidden bg-zinc-950 px-4 py-6 sm:px-6">

      {/* Fundo */}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black" />

      <div className="pointer-events-none absolute -left-40 -top-40 size-[500px] rounded-full bg-blue-600/10 blur-3xl" />

      <div className="pointer-events-none absolute bottom-0 right-0 size-[450px] rounded-full bg-yellow-500/10 blur-3xl" />

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
