import type { Metadata } from "next";
import "./globals.css";
import { ShopProvider } from "@/components/shop-provider";
export const metadata: Metadata = {
  title: "AJ Baby Shop | Little things. Endless love.",
  description:
    "Thoughtfully chosen essentials for your little one. Shop beautiful baby clothing, nursery pieces, toys and everyday essentials.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ShopProvider>{children}</ShopProvider>
      </body>
    </html>
  );
}
