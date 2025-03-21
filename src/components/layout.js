import { Space_Mono } from "next/font/google"
import '../styles/global.css'

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
})

export const metadata = {
  title: "Clothing Store",
  description: "Premium clothing and outerwear",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={spaceMono.className}>{children}</body>
    </html>
  )
}

