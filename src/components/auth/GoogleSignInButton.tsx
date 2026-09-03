"use client";
import { useEffect, useRef } from "react";
import Script from "next/script";

type GoogleCredentialResponse = { credential: string };

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (resp: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

export default function GoogleSignInButton({
  clientId,
  onCredential,
}: {
  clientId: string;
  onCredential: (credential: string) => void;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  onCredentialRef.current = onCredential;

  const init = () => {
    if (!window.google || !divRef.current) return;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (resp) => onCredentialRef.current(resp.credential),
    });
    window.google.accounts.id.renderButton(divRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "signin_with",
      shape: "pill",
      width: 360,
      locale: "ar",
    });
  };

  useEffect(() => {
    if (window.google) init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={init} />
      <div ref={divRef} style={{ display: "flex", justifyContent: "center" }} />
    </>
  );
}
