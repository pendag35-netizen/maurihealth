'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { Heart, Mail, Lock, Eye, EyeOff, Phone, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

type LoginMode = 'email' | 'phone'
type PhoneEtape = 'numero' | 'code'

export default function LoginPage() {
  const [mode, setMode] = useState<LoginMode>('phone')
  const [phoneEtape, setPhoneEtape] = useState<PhoneEtape>('numero')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')
  const [telephone, setTelephone] = useState('')
  const [codeOTP, setCodeOTP] = useState('')
  const [form, setForm] = useState({ email: '', password: '' })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const phoneComplet = `+222${telephone}`

  const envoyerOTP = async () => {
    if (telephone.length < 8) { setErreur('Entrez un numéro valide'); return }
    setLoading(true)
    setErreur('')
    const { error } = await supabase.auth.signInWithOtp({ phone: phoneComplet })
    setLoading(false)
    if (error && !error.message.includes('SMS')) {
      setErreur(error.message)
    } else {
      setPhoneEtape('code')
      alert(`✅ Code SMS envoyé au ${phoneComplet}`)
    }
  }

  const verifierOTP = async () => {
    if (codeOTP.length < 4) { setErreur('Entrez le code reçu'); return }
    setLoading(true)
    setErreur('')
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phoneComplet,
      token: codeOTP,
      type: 'sms',
    })
    if (error) {
      setErreur('Code incorrect')
      setLoading(false)
      return
    }
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', data.user.id).single()
      if (profile?.role === 'medecin') window.location.href = '/dashboard/medecin'
      else if (profile?.role === 'admin') window.location.href = '/dashboard/admin'
      else window.location.href = '/dashboard/patient'
    }
    setLoading(false)
  }

  const handleLoginEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErreur('')
    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email, password: form.password,
    })
    if (error) { setErreur('Email ou mot de passe incorrect'); setLoading(false); return }
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', data.user.id).single()
    if (!profile) {
      await supabase.from('profiles').insert({
        id: data.user.id, email: form.email,
        full_name: 'Utilisateur', phone: '', role: 'patient',
      })
      window.location.href = '/dashboard/patient'
    } else {
      if (profile.role === 'medecin') window.location.href = '/dashboard/medecin'
      else if (profile.role === 'admin') window.location.href = '/dashboard/admin'
      else window.location.href = '/dashboard/patient'
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
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

          {/* Toggle mode */}
          <div className="flex gap-2 mb-6 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => { setMode('phone'); setErreur('') }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'phone' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              <Phone className="w-4 h-4" /> Téléphone
            </button>
            <button
              onClick={() => { setMode('email'); setErreur('') }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'email' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              <Mail className="w-4 h-4" /> Email
            </button>
          </div>

          {erreur && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
              ❌ {erreur}
            </div>
          )}

          {/* LOGIN PAR TÉLÉPHONE */}
          {mode === 'phone' && (
            <div className="space-y-4">
              {phoneEtape === 'numero' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro de téléphone
                    </label>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-3">
                        <span className="text-lg">🇲🇷</span>
                        <span className="text-sm font-semibold text-gray-700">+222</span>
                      </div>
                      <input
                        type="tel"
                        placeholder="XX XX XX XX"
                        value={telephone}
                        onChange={(e) => setTelephone(e.target.value.replace(/\D/g, '').slice(0, 8))}
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 gap-2"
                    onClick={envoyerOTP}
                    disabled={loading || telephone.length < 8}
                  >
                    {loading
                      ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <><Phone className="w-4 h-4" /> Recevoir le code SMS</>
                    }
                  </Button>
                </>
              ) : (
                <>
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-500">
                      Code envoyé au <span className="font-bold text-blue-600">{phoneComplet}</span>
                    </p>
                  </div>
                  <input
                    type="text"
                    placeholder="• • • • • •"
                    value={codeOTP}
                    onChange={(e) => setCodeOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-2xl text-center tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 gap-2"
                    onClick={verifierOTP}
                    disabled={loading || codeOTP.length < 4}
                  >
                    {loading
                      ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <>Connexion <ArrowRight className="w-4 h-4" /></>
                    }
                  </Button>
                  <div className="flex justify-between">
                    <button onClick={() => setPhoneEtape('numero')} className="text-sm text-gray-400">
                      ← Changer le numéro
                    </button>
                    <button onClick={envoyerOTP} className="text-sm text-blue-600">
                      Renvoyer le code
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* LOGIN PAR EMAIL */}
          {mode === 'email' && (
            <form onSubmit={handleLoginEmail} className="space-y-4">
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
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Mot de passe</label>
                  <Link href="/forgot-password" className="text-xs text-blue-600">Oublié ?</Link>
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                disabled={loading}
              >
                {loading
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                  : 'Se connecter'
                }
              </Button>
            </form>
          )}
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