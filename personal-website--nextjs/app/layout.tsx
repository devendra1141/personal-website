import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Devendra Pandey | Portfolio",
  description: "Devendra Pandey — creative developer & commerce student.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
