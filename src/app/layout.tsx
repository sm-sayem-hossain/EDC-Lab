import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EDC Lab Workbench — CSE-216",
  description:
    "Interactive circuit simulation workbench and viva preparation for Electronic Devices and Circuits Lab.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#f6f6f5] text-zinc-900 font-sans">
        {children}
      </body>
    </html>
  );
}
