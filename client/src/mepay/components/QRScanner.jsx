import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

export default function QRScanner({ onScan, onClose }) {
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    const defaultCameraId = { facingMode: "environment" };
    const html5QrCode = new Html5Qrcode("qr-reader");

    html5QrCode.start(
      defaultCameraId,
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText, decodedResult) => {
        html5QrCode.stop().then(() => {
          onScan(decodedText);
        }).catch(err => {
          console.error(err);
        });
      },
      (errorMessage) => {
        // usually just "Not found", ignore to avoid console spam
      }
    ).catch(err => {
      setError("Camera permission denied or camera not found.");
      console.error(err);
    });

    scannerRef.current = html5QrCode;

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [onScan]);

  return (
    <div className="absolute inset-0 z-50 bg-[var(--color-canvas)] flex flex-col pt-10 px-4 pb-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-[var(--text-main)] flex items-center">
          <Camera className="mr-2 text-[var(--color-primary)]" size={24} /> Scan QR
        </h2>
        <button onClick={onClose} className="p-2 bg-[var(--color-surface)] rounded-full text-[var(--text-main)] border border-[var(--border-subtle)]">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="w-full max-w-[300px] bg-black rounded-3xl overflow-hidden shrink-0 border-2 border-[var(--color-primary)]/50 relative shadow-[0_0_30px_rgba(16,185,129,0.2)]">
          <div id="qr-reader" className="w-full h-full"></div>
        </div>

        {error ? (
          <p className="mt-8 text-[var(--color-danger)] font-bold text-center px-4 text-sm">{error}</p>
        ) : (
          <p className="mt-8 text-[var(--text-muted)] text-center text-sm font-medium px-6 leading-relaxed">
            Align the QR code within the frame to scan. <br/> UPI QRs and generic QRs are supported.
          </p>
        )}
      </div>
    </div>
  );
}
