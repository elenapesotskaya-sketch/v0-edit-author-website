import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Lora } from "next/font/google"
import { EditModeProvider } from "@/contexts/edit-mode-context"
import "./globals.css"

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" })
const lora = Lora({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Author Portfolio - Tales & Stories",
  description: "A collection of literary tales and stories",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${lora.className} font-sans antialiased`}>
        <EditModeProvider>{children}</EditModeProvider>
        {/* Analytics component removed */}
</body>
    </html>
  )
}
