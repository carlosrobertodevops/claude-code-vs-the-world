"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QueueQr({ url }: { url: string }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    QRCode.toDataURL(url, {
      color: {
        dark: "#0f172a",
        light: "#f8fafc",
      },
      margin: 1,
      width: 240,
    }).then(setSrc);
  }, [url]);

  if (!src) {
    return <div className="surface-soft h-60 rounded-[28px]" />;
  }

  return (
    <Image
      src={src}
      alt="QR Code da fila publica"
      width={240}
      height={240}
      className="rounded-[28px] bg-white p-3"
    />
  );
}
