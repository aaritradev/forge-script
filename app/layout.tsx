import './globals.css'
import Providers from '../components/Providers'
import Image from "next/image";


export const metadata = {
  title: "ForgeScript — High Retention Masculinity Scripts",
  description: "Stop writing weak scripts. Forge high-retention masculinity content.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
