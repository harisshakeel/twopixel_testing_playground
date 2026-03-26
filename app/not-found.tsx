import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
      <p className="text-5xl font-bold text-zinc-800">404</p>
      <p className="text-zinc-500 text-sm">District not found</p>
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-purple-400 hover:underline mt-2">
        <ArrowLeft className="w-4 h-4" />
        Back to dashboard
      </Link>
    </div>
  )
}
