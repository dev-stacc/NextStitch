import AuthCard, { AuthFooterLink } from '@/src/components/auth/AuthCard'
import SignupForm from '@/src/components/auth/SignupForm'

export const metadata = { title: 'Create account – Sewing Assistant' }

export default function SignupPage() {
  return (
    <AuthCard
      title="Create your account"
      footer={<AuthFooterLink prompt="Already registered?" href="/login" label="Sign in" />}
    >
      <SignupForm />
    </AuthCard>
  )
}
