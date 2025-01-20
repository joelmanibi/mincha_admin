import { AuthForm } from '@/components/auth/AuthForm'
import { APP_CONFIG } from '@/lib/constants/config'

export default function AuthPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Brand section */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#213B4C] flex-col items-center justify-center p-8 text-white">
        <div className="max-w-md text-center">
          <h1 className="text-5xl font-bold mb-4">{APP_CONFIG.name}</h1>
          <p className="text-xl">{APP_CONFIG.description}</p>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[#213B4C]">Authentification</h2>
            <p className="mt-2 text-gray-600">
              Connectez-vous avec vos identifiants
            </p>
          </div>

          <AuthForm />
        </div>
      </div>
    </div>
  )
}

