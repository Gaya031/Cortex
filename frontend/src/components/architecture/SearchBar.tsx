"use client";

import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({
  value,
  onChange,
}: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search files, functions, components"
        className="h-9 w-[320px] rounded-lg border border-white/[0.08] bg-white/[0.035] pl-9 pr-9 text-xs text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-cyan-300/40"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:bg-white/[0.06] hover:text-slate-200"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
