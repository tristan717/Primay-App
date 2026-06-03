import "./globals.css";
import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import Header from "@/components/header";
import Footer from "@/components/Footer";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";

export const metadata = {
  title: "Primary",
  description: "Project management and tracking system",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <Script src="https://kit.fontawesome.com/cad9bf11d7.js" crossorigin="anonymous"></Script>
      </head>
      <body>
        <ClerkProvider>
          
            <main className="min-h-full flex flex-col bg-mist-100">
              {/* Header */}
              <Header />

              {/* Content body */}
              {children}

              {/* Footer */}
              <Footer/>
            </main>
          
        </ClerkProvider>
      </body>
    </html>
  );
}
