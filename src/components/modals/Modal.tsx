import type { ReactNode } from 'react'

interface ModalProps {
  children: ReactNode
}

export function Modal({ children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/60 p-4">
      <div className="w-full max-w-[520px] rounded-xl border border-[#0b2a4a] bg-[#0b1220] p-4">
        {children}
      </div>
    </div>
  )
}
