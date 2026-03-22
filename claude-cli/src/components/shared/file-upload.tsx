"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X, FileIcon, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  accept?: string;
  onUpload?: (url: string) => void;
  maxSize?: number;
  className?: string;
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

export function FileUpload({
  accept = "image/jpeg,image/png,image/webp,application/pdf",
  onUpload,
  maxSize = 10 * 1024 * 1024,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setStatus("idle");
    setProgress(0);
    setPreview(null);
    setFileName(null);
    setErrorMessage(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, []);

  const uploadFile = useCallback(
    async (file: File) => {
      const allowedTypes = accept.split(",").map((t) => t.trim());
      if (!allowedTypes.includes(file.type)) {
        setStatus("error");
        setErrorMessage(
          "Tipo de arquivo nao permitido. Tipos aceitos: JPG, PNG, WebP, PDF"
        );
        return;
      }

      if (file.size > maxSize) {
        setStatus("error");
        setErrorMessage(
          `Arquivo excede o tamanho maximo de ${Math.round(maxSize / (1024 * 1024))}MB`
        );
        return;
      }

      setFileName(file.name);
      setErrorMessage(null);

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(file);
      }

      setStatus("uploading");
      setProgress(0);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const xhr = new XMLHttpRequest();

        const uploadPromise = new Promise<{ url: string }>((resolve, reject) => {
          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              const percent = Math.round((e.loaded / e.total) * 100);
              setProgress(percent);
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const response = JSON.parse(xhr.responseText);
              if (response.success) {
                resolve(response.data);
              } else {
                reject(new Error(response.error?.message || "Erro no upload"));
              }
            } else {
              reject(new Error("Erro no upload do arquivo"));
            }
          });

          xhr.addEventListener("error", () => {
            reject(new Error("Erro de rede ao enviar arquivo"));
          });

          xhr.open("POST", "/api/upload");
          xhr.send(formData);
        });

        const data = await uploadPromise;
        setStatus("success");
        setProgress(100);
        onUpload?.(data.url);
      } catch (error) {
        setStatus("error");
        setErrorMessage(
          error instanceof Error ? error.message : "Erro ao enviar arquivo"
        );
        setPreview(null);
      }
    },
    [accept, maxSize, onUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        uploadFile(file);
      }
    },
    [uploadFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        uploadFile(file);
      }
    },
    [uploadFile]
  );

  const handleClick = useCallback(() => {
    if (status !== "uploading") {
      inputRef.current?.click();
    }
  }, [status]);

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer",
          isDragging && "border-primary bg-primary/5",
          status === "error" && "border-destructive bg-destructive/5",
          status === "success" && "border-green-500 bg-green-50 dark:bg-green-950/20",
          status === "idle" &&
            !isDragging &&
            "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
        )}
      >
        {status === "idle" && (
          <>
            <Upload className="h-10 w-10 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium">
                Arraste e solte um arquivo aqui
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ou clique para selecionar
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              JPG, PNG, WebP ou PDF (max. {Math.round(maxSize / (1024 * 1024))}
              MB)
            </p>
          </>
        )}

        {status === "uploading" && (
          <>
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            {fileName && (
              <p className="text-sm font-medium truncate max-w-full">
                {fileName}
              </p>
            )}
            <div className="w-full max-w-xs">
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center mt-1">
                {progress}%
              </p>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="h-24 w-24 rounded-md object-cover"
              />
            ) : (
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            )}
            {fileName && (
              <p className="text-sm font-medium truncate max-w-full">
                {fileName}
              </p>
            )}
            <p className="text-xs text-green-600 dark:text-green-400">
              Upload concluido com sucesso
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                reset();
              }}
            >
              <X className="h-4 w-4 mr-1" />
              Remover
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <FileIcon className="h-10 w-10 text-destructive" />
            {errorMessage && (
              <p className="text-sm text-destructive text-center">
                {errorMessage}
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                reset();
              }}
            >
              Tentar novamente
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
