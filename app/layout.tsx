import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import QueryProviders from "@/components/query-providers";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "React Query Playground",
  description: "Created to test React Query features",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <QueryProviders>
          <TooltipProvider>{children}</TooltipProvider>
        </QueryProviders>
        <Toaster />
      </body>
    </html>
  );
}
