import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Placement — Sign In',
  description: 'Sign in or create your AI Placement account',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="auth-layout">
      {children}
    </div>
  )
}
