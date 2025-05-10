import type { Metadata } from "next";
// import { Montserrat, Geist, Geist_Mono } from "next/font/google";
import { Montserrat } from "next/font/google"; // Keep Montserrat for now
// Removed motion and AnimatePresence, they are now in PageTransitionWrapper
import "./globals.css";
import Header from "@/components/Header"; // Assuming components are in src/components
import Footer from "@/components/Footer"; // Assuming components are in src/components
import PageTransitionWrapper from "@/components/PageTransitionWrapper"; // Import the new wrapper
import { ThemeProvider } from "@/components/ThemeProvider"; // Import ThemeProvider

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });
//
// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "700"], // You can adjust weights as needed
});

export const metadata: Metadata = {
  title: "Movies Library",
  description: "A library to browse and discover movies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>{/* Add suppressHydrationWarning for next-themes */}<body
        className={`${montserrat.variable} antialiased text-foreground bg-theme-bg-light dark:bg-theme-bg-dark flex flex-col min-h-screen`} // Use theme-aware backgrounds and remove fixed text-white
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <PageTransitionWrapper>
            <main className="flex-grow pt-20 pb-8 container mx-auto px-4"> {/* Added pt-20 for header, pb-8 for spacing, and container styles */}
              {children}
            </main>
          </PageTransitionWrapper>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
