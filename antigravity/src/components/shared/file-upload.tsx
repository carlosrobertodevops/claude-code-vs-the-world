"use client";

import { useRef, useState } from "react";
import { Upload, X, FileIcon, Loader2 } from "lucide-react";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@/lib/constants";

interface FileUploadProps {
  onUpload: (file: File) => Promise<string>;
  accept?: string;
  maxSize?: number;
  value?: string;
  onChange?: (url: string | null) => void;
  label?: string;
}

export function FileUpload({
  onUpload,
  accept = ALLOWED_FILE_TYPES.join(","),
  maxSize = MAX_FILE_SIZE,
  value,
  onChange,
  label = "Enviar arquivo",
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    if (file.size > maxSize) {
      setError(`Arquivo muito grande. Máximo: ${maxSize / 1024 / 1024}MB`);
      return;
    }

    setUploading(true);
    try {
      const url = await onUpload(file);
      onChange?.(url);
    } catch {
      setError("Erro ao enviar arquivo");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)]">
          {value.match(/\.(jpg|jpeg|png|webp)$/i) ? (
            <img src={value} alt="Preview" className="w-12 h-12 rounded-md object-cover" />
          ) : (
            <FileIcon className="w-8 h-8 text-[hsl(var(--muted-foreground))]" />
          )}
          <span className="flex-1 text-sm truncate">{value.split("/").pop()}</span>
          <button
            type="button"
            onClick={() => onChange?.(null)}
            className="p-1 rounded hover:bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:text-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--muted)/0.3)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--primary))]" />
          ) : (
            <Upload className="w-6 h-6 text-[hsl(var(--muted-foreground))]" />
          )}
          <span className="text-sm text-[hsl(var(--muted-foreground))]">
            {uploading ? "Enviando..." : label}
          </span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
