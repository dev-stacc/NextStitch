import { redirect } from 'next/navigation'
import AuthCard, { AuthFooterLink } from '@/src/components/auth/AuthCard'
import SignupForm from '@/src/components/auth/SignupForm'
import { auth } from '@/src/server/auth'

export const metadata = { title: 'Create account – Sewing Assistant' }

export default async function SignupPage() {
  const session = await auth()
  if (session?.user) redirect('/')
  return (
    <AuthCard
      title="Create your account"
      footer={<AuthFooterLink prompt="Already registered?" href="/login" label="Sign in" />}
    >
      <SignupForm />
    </AuthCard>
  )
}
