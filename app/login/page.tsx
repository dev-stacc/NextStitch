import { Suspense } from 'react'
import AuthCard, { AuthFooterLink } from '@/src/components/auth/AuthCard'
import LoginForm from '@/src/components/auth/LoginForm'
import Spinner from '@/src/components/ui/Spinner'

export const metadata = { title: 'Sign in – Sewing Assistant' }

export default function LoginPage() {
  return (
    <AuthCard
      title="Sign in"
      footer={<AuthFooterLink prompt="No account yet?" href="/signup" label="Create one" />}
    >
      <Suspense fallback={<div className="flex justify-center py-4"><Spinner size="md" /></div>}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  )
}
