import { Theme } from "@radix-ui/themes";
import type { Metadata } from "next";
import "@radix-ui/themes/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Music player",
  description: "By FEDs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Theme appearance="dark" radius="small">
          <div className="mx-auto my-[50px] max-w-[600px]">{children}</div>
        </Theme>
      </body>
    </html>
  );
}
