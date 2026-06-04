'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')
  const [form, setForm] = useState({ email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErreur('')

    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      console.log('🔵 Étape 1 - Connexion en cours...')

      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })

      console.log('🔵 Étape 2 - Résultat connexion:', { data, error })

      if (error) {
        console.log('🔴 Erreur connexion:', error.message)
        setErreur('Email ou mot de passe incorrect : ' + error.message)
        return
      }

      console.log('🟢 Étape 3 - Connecté ! User:', data.user.id)

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      console.log('🔵 Étape 4 - Profil:', { profile, profileError })

      if (!profile) {
        console.log('🟡 Étape 5 - Pas de profil, création automatique...')

        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            full_name: data.user.user_metadata?.full_name || 'Utilisateur',
            phone: data.user.user_metadata?.phone || '',
            role: data.user.user_metadata?.role || 'patient',
          })

        console.log('🔵 Étape 6 - Profil créé:', { insertError })

        console.log('🟢 Redirection vers dashboard patient...')
        window.location.replace('/dashboard/patient')
        return
      }

      console.log('🟢 Étape 7 - Redirection selon rôle:', profile.role)

      if (profile.role === 'medecin') {
        window.location.replace('/dashboard/medecin')
      } else if (profile.role === 'admin') {
        window.location.replace('/dashboard/admin')
      } else {
        window.location.replace('/dashboard/patient')
      }

    } catch (err) {
      console.error('🔴 Erreur inattendue:', err)
      setErreur('Erreur inattendue : ' + String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              Mauri<span className="text-blue-600">Health</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-6">Bon retour !</h1>
          <p className="text-gray-500 mt-1">Connectez-vous à votre compte</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {erreur && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
              ❌ {erreur}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="votre@email.com"
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">Oublié ?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({...form, password: e.target.value})}
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium"
              disabled={loading}
            >
              {loading ? '⏳ Connexion...' : 'Se connecter'}
            </Button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">ou</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { role: 'Patient', emoji: '👤' },
              { role: 'Médecin', emoji: '👨‍⚕️' },
              { role: 'Admin', emoji: '⚙️' },
            ].map((item) => (
              <button
                key={item.role}
                className="flex flex-col items-center gap-1 p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-xs text-gray-600"
              >
                <span className="text-xl">{item.emoji}</span>
                {item.role}
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Pas encore de compte ?{' '}
          <Link href="/register" className="text-blue-600 font-medium hover:underline">
            S'inscrire gratuitement
          </Link>
        </p>
      </div>
    </div>
  )
}