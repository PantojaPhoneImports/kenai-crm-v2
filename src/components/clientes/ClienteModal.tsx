"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

export default function ClienteModal() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button>Novo Cliente</Button>}
      />

      <DialogContent className="max-w-3xl bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-white">
            Novo Cliente
          </DialogTitle>
        </DialogHeader>

        <div className="py-8 text-zinc-400">
          Aqui ficará o formulário do cliente.
        </div>
      </DialogContent>
    </Dialog>
  );
}