import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProveX Sacrifice Calculator",
  description:
    "Unofficial ProveX sacrifice points estimator. Enter USD, rate, and bonus multiplier to estimate your points."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang=\"en\">
      <body className=\"bg-slate-950 text-slate-100 antialiased\">
        {children}
      </body>
    </html>
  );
}
