'use client'

import { useState } from 'react'
import { Play, Loader2, CheckCircle, XCircle } from 'lucide-react'

type State = 'idle' | 'loading' | 'success' | 'error'

export function StartPipelineButton() {
  const [state, setState] = useState<State>('idle')
  const [msg, setMsg] = useState<string>('')

  async function handleStart() {
    setState('loading')
    setMsg('')
    try {
      const res = await fetch('/api/pipeline/start', { method: 'POST' })
      const data = await res.json()
      if (data.ok) {
        setState('success')
        setMsg('Pipeline started')
      } else {
        setState('error')
        setMsg(data.error ?? 'Failed to start')
      }
    } catch {
      setState('error')
      setMsg('Network error')
    }
    // Reset to idle after 4 seconds
    setTimeout(() => { setState('idle'); setMsg('') }, 4000)
  }

  const styles: Record<State, string> = {
    idle:    'bg-purple-600 hover:bg-purple-500 text-white',
    loading: 'bg-purple-600/60 text-white cursor-not-allowed',
    success: 'bg-emerald-600/80 text-white cursor-default',
    error:   'bg-red-600/80 text-white cursor-default',
  }

  const icons: Record<State, React.ReactNode> = {
    idle:    <Play className="w-3.5 h-3.5" />,
    loading: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
    success: <CheckCircle className="w-3.5 h-3.5" />,
    error:   <XCircle className="w-3.5 h-3.5" />,
  }

  const labels: Record<State, string> = {
    idle:    'Run Pipeline',
    loading: 'Starting…',
    success: msg || 'Started',
    error:   msg || 'Error',
  }

  return (
    <button
      onClick={handleStart}
      disabled={state === 'loading'}
      title={state === 'error' ? msg : undefined}
      className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${styles[state]}`}
    >
      {icons[state]}
      {labels[state]}
    </button>
  )
}
