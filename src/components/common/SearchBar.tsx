"use client";

import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Pesquisar...",
}: SearchBarProps) {
  return (
    <div className="relative w-80">
      <Search
        size={18}
        className="absolute left-3 top-3 text-zinc-500"
      />

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 pl-10 pr-4 py-3 text-white outline-none focus:border-blue-500"
      />
    </div>
  );
}