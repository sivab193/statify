import { Suspense } from 'react'
import { AuthContent } from '@/components/auth-content'
import { Loader2 } from 'lucide-react'

function AuthFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthFallback />}>
      <AuthContent />
    </Suspense>
  )
}
