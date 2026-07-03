import Link from 'next/link'
import type { ReactNode } from 'react'

interface Props {
  title: string
  footer: ReactNode
  children: ReactNode
}

export default function AuthCard({ title, footer, children }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card bg-base-100 border border-base-300 w-full max-w-sm">
        <div className="card-body gap-4">
          <h1 className="card-title text-xl">{title}</h1>
          {children}
          <div className="text-sm text-base-content/60 text-center">{footer}</div>
        </div>
      </div>
    </div>
  )
}

export function AuthFooterLink({ prompt, href, label }: { prompt: string; href: string; label: string }) {
  return (
    <>
      {prompt}{' '}
      <Link href={href} className="link link-primary">
        {label}
      </Link>
    </>
  )
}
