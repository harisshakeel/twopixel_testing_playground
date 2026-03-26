import type { Metadata } from 'next'
import Image from 'next/image'
import './globals.css'

export const metadata: Metadata = {
  title: 'TwoPixel Testing Playground',
  description: 'Pipeline testing dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#09090b] text-zinc-100 antialiased">
        {/* Top nav */}
        <nav className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-zinc-800/60 bg-[#09090b]/90 backdrop-blur-md flex items-center px-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="TwoPixel" width={32} height={32} className="rounded-md" />
            <div>
              <span className="text-sm font-semibold text-zinc-100 tracking-tight">TwoPixel</span>
              <span className="text-sm text-zinc-500 ml-1.5">· Testing Playground</span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-zinc-600 font-mono">pipeline · v0.1</span>
          </div>
        </nav>
        <div className="pt-14 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}
