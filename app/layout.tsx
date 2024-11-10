import "./globals.css";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { SchoolSettingsProvider } from "./contexts/SchoolSettingsContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "School Application System",
  description: "Application system for School",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SchoolSettingsProvider>
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </SchoolSettingsProvider>
      </body>
    </html>
  );
}
