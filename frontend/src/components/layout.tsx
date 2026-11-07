import type { ReactNode } from "react";
import Header from "./header";
import Footer from "./footer";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-studio-backdrop text-zinc-900 dark:text-zinc-100 font-sans antialiased relative selection:bg-zinc-200 selection:text-zinc-900 dark:selection:bg-zinc-800 dark:selection:text-zinc-100">
      <Header />

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-4 sm:py-6 relative z-10 flex flex-col justify-center">
        {children}
      </main>

      <Footer />
    </div>
  );
}

export default Layout;
