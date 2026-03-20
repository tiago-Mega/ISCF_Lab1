import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import LogoutButton from '@/components/LogoutButton';
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ISCF Lab 1 - UR5 Monitor",
  description: "Real-time accelerometer and weather monitoring dashboard for the UR5 robot in CoppeliaSim",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <nav className="flex justify-between items-center p-4 border-b">
          <span className="font-bold">ISCF Dashboard</span>
          <LogoutButton />
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
