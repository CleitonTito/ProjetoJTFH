import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FirebaseError } from 'firebase/app'
import logoCorre from '@/assets/branding/logo-corre.png'
import { signIn } from '@/firebase/auth'
import { useAuth } from '@/hooks/useAuth'
import { toAuthEmail } from '@/utils/phoneAuth'
import { LoadingScreen } from '@/components/LoadingScreen'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Informe o telefone ou e-mail')
    .refine((value) => {
      if (value.includes('@')) {
        return z.string().email().safeParse(value).success
      }
      return value.replace(/\D/g, '').length >= 8
    }, 'Informe um telefone com DDD ou um e-mail válido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
})

type LoginFormValues = z.infer<typeof loginSchema>

interface LocationState {
  from?: { pathname: string; search: string }
}

export function LoginPage() {
  const { firebaseUser, appUser, loading } = useAuth()
  const location = useLocation()
  const [authError, setAuthError] = useState<string | null>(null)

  const state = location.state as LocationState | null
  const redirectTo = state?.from ? `${state.from.pathname}${state.from.search}` : '/'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(values: LoginFormValues) {
    setAuthError(null)

    try {
      await signIn(toAuthEmail(values.identifier), values.password)
    } catch (error) {
      if (error instanceof FirebaseError) {
        setAuthError('Telefone/e-mail ou senha inválidos.')
      } else {
        setAuthError('Não foi possível entrar. Tente novamente.')
      }
    }
  }

  if (loading) {
    return <LoadingScreen />
  }

  if (firebaseUser && appUser) {
    return <Navigate to={redirectTo} replace />
  }

  // Autenticado, mas o perfil (Firestore) não carregou. Nunca redirecionar
  // baseado só no firebaseUser aqui — o ProtectedRoute exige os dois e manda
  // de volta pro login, o que criava um loop infinito de navegação nesse caso.
  if (firebaseUser && !appUser) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-lg font-semibold">Não foi possível carregar seu perfil.</p>
        <p className="text-sm text-muted-foreground">
          Tente novamente em alguns segundos.
        </p>
        <Button onClick={() => window.location.reload()}>Recarregar</Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-4">
      <img src={logoCorre} alt="Projeto JTFH" className="w-48 rounded-lg shadow-sm" />
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Mural de Informações</CardTitle>
          <CardDescription>Entre com sua conta para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="identifier">Telefone ou e-mail</Label>
              <Input
                id="identifier"
                type="text"
                autoComplete="username"
                placeholder="11987654321"
                {...register('identifier')}
              />
              {errors.identifier && (
                <p className="text-sm text-destructive">{errors.identifier.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            {authError && <p className="text-sm text-destructive">{authError}</p>}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
