import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "@/styles/globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { TenantProvider } from "@/contexts/tenant-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { SidebarProvider } from "@/contexts/sidebar-context";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "PrintAI ERP | Gestão Inteligente para Gráficas",
    template: "%s | PrintAI ERP",
  },
  description: "ERP com Kanban de produção e IA para gráficas. Gerencie pedidos, estoque, financeiro e produção em uma única plataforma.",
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Print.AI ERP",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Print.AI ERP",
      },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
  ],
};

import { Toaster } from "sonner";
import { RecoveryScript } from "@/components/error-handling/recovery-script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${inter.variable}`}
    >
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" />
        {/* Inline script to prevent FOUC - applies theme before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('printai-theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else if (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${inter.className} min-h-screen bg-background antialiased transition-colors duration-300`}>
        <RecoveryScript />
        <ThemeProvider>
          <AuthProvider>
            <TenantProvider>
              <SidebarProvider>
                <ToastProvider>
                  {children}
                  <Toaster richColors position="top-right" />
                </ToastProvider>
              </SidebarProvider>
            </TenantProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
