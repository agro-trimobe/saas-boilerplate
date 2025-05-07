"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div suppressHydrationWarning>
        {children}
        <Toaster />
      </div>
    </SessionProvider>
  );
}
