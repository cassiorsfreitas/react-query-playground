import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProviders from "@/components/query-providers";
import { ThemeProvider } from "@/components/theme-provider";
import { AppSidebar } from "@/components/sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Toaster } from "@/components/ui/toaster";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "React Query v5 Playground",
  description: "A demonstration of React Query's key features",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="dark">
          <QueryProviders>
            <SidebarProvider>
              <div className="flex min-h-screen w-full">
                <AppSidebar />
                <SidebarInset>
                  <header className="flex h-16 items-center justify-between border-b px-6">
                    <h1 className="text-xl font-bold">
                      React Query{" "}
                      <span className="inline-block leading-snug text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500">
                        v5
                      </span>{" "}
                      Playground
                    </h1>
                    <div className="flex items-center gap-3">
                      <ThemeToggle />
                      <Link
                        className="text-sm flex items-center gap-2"
                        href="/"
                      >
                        <ExternalLink size={14} /> Docs
                      </Link>
                    </div>
                  </header>
                  <main className="p-6">{children}</main>
                </SidebarInset>
              </div>
            </SidebarProvider>
            <Toaster />
          </QueryProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
