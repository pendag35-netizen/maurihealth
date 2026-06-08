'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import {
  Heart, Phone, Lock, User, Eye, EyeOff,
  Stethoscope, Building, ArrowRight, CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'

type Etape = 'infos' | 'verification' | 'succes'

export default function RegisterPage() {
  const [etape, setEtape] = useState<Etape>('infos')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')
  const [role, setRole] = useState<'patient' | 'medecin'>('patient')
  const [codeOTP, setCodeOTP] = useState('')
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    password: '',
    specialite: '',
    hopital: '',
    ville: 'Nouakchott',
    tarif: '',
    numeroOrdre: '',
  })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const specialites = [
    'Médecine Générale', 'Cardiologie', 'Pédiatrie',
    'Gynécologie', 'Dermatologie', 'Neurologie',
    'Ophtalmologie', 'Orthopédie', 'Psychiatrie', 'Radiologie',
  ]

  const phoneComplet = `+222${form.phone}`

  const envoyerOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setErreur('')

    if (!form.fullName) { setErreur('Entrez votre nom complet'); return }
    if (form.phone.length < 8) { setErreur('Entrez un numéro valide (8 chiffres)'); return }
    if (form.password.length < 8) { setErreur('Mot de passe minimum 8 caractères'); return }
    if (role === 'medecin' && !form.specialite) { setErreur('Choisissez votre spécialité'); return }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneComplet,
      })

      if (error) {
        // Mode test — pas de vrai SMS
        if (error.message.includes('not supported') || error.message.includes('SMS')) {
          setEtape('verification')
          alert(`📱 SMS envoyé au ${phoneComplet}\n\nEn mode test, utilisez le code : 123456`)
        } else {
          setErreur(error.message)
        }
      } else {
        setEtape('verification')
        alert(`✅ Code SMS envoyé au ${phoneComplet}`)
      }
    } catch (err) {
      setErreur('Erreur lors de l\'envoi du SMS')
    } finally {
      setLoading(false)
    }
  }

  const verifierOTP = async () => {
    if (codeOTP.length < 4) { setErreur('Entrez le code reçu'); return }
    setLoading(true)
    setErreur('')

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phoneComplet,
        token: codeOTP,
        type: 'sms',
      })

      if (error) {
        setErreur('Code incorrect. Réessayez.')
        setLoading(false)
        return
      }

      if (data.user) {
        // Créer le profil
        await supabase.from('profiles').insert({
          id: data.user.id,
          email: `${form.phone}@maurihealth.mr`,
          full_name: form.fullName,
          phone: phoneComplet,
          role,
        })

        if (role === 'patient') {
          await supabase.from('patients').insert({
            profile_id: data.user.id
          })
        } else {
          await supabase.from('medecins').insert({
            profile_id: data.user.id,
            specialite: form.specialite,
            hopital: form.hopital || 'Non renseigné',
            ville: form.ville,
            tarif_consultation: parseFloat(form.tarif) || 0,
            numero_ordre: form.numeroOrdre,
            disponible: true,
            plan: 'essai',
            essai_debut: new Date().toISOString().split('T')[0],
            essai_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          })
        }

        setEtape('succes')
      }
    } catch (err) {
      setErreur('Erreur de vérification')
    } finally {
      setLoading(false)
    }
  }

  const renvoyerCode = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ phone: phoneComplet })
    setLoading(false)
    if (!error) alert(`✅ Nouveau code envoyé au ${phoneComplet}`)
  }

  // PAGE SUCCÈS
  if (etape === 'succes') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Bienvenue sur MauriHealth ! 🎉
          </h2>
          <p className="text-gray-500 mb-2">
            Compte créé avec le numéro {phoneComplet}
          </p>
          {role === 'medecin' && (
            <div className="bg-blue-50 rounded-xl p-4 mb-4 text-left">
              <p className="text-sm text-blue-700 font-medium mb-1">🎁 Essai gratuit activé !</p>
              <p className="text-xs text-blue-600">
                30 jours d'accès complet gratuit. Aucune carte bancaire requise.
              </p>
            </div>
          )}
          <Link href={role === 'medecin' ? '/dashboard/medecin' : '/dashboard/patient'}>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4">
              Accéder à mon espace →
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
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
        </div>

        {/* ÉTAPE 1 — INFOS */}
        {etape === 'infos' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Créer un compte</h1>
            <p className="text-gray-500 text-sm mb-6">Inscription avec votre numéro mauritanien</p>

            {erreur && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
                ❌ {erreur}
              </div>
            )}

            {/* Choix rôle */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {(['patient', 'medecin'] as const).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    role === r ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">{r === 'patient' ? '👤' : '👨‍⚕️'}</span>
                  <span className="text-sm font-medium text-gray-700">
                    {r === 'patient' ? 'Je suis patient' : 'Je suis médecin'}
                  </span>
                </button>
              ))}
            </div>

            <form onSubmit={envoyerOTP} className="space-y-4">

              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={role === 'medecin' ? 'Dr. Mohamed Ould Ahmed' : 'Mohamed Ould Ahmed'}
                    value={form.fullName}
                    onChange={(e) => setForm({...form, fullName: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de téléphone *
                </label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 flex-shrink-0">
                    <span className="text-lg">🇲🇷</span>
                    <span className="text-sm font-semibold text-gray-700">+222</span>
                  </div>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="XX XX XX XX"
                      value={form.phone}
                      onChange={(e) => setForm({...form, phone: e.target.value.replace(/\D/g, '').slice(0, 8)})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Un SMS de confirmation sera envoyé à ce numéro
                </p>
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 8 caractères"
                    value={form.password}
                    onChange={(e) => setForm({...form, password: e.target.value})}
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    minLength={8}
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

              {/* Champs médecin */}
              {role === 'medecin' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Spécialité *</label>
                    <div className="relative">
                      <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        value={form.specialite}
                        onChange={(e) => setForm({...form, specialite: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        required
                      >
                        <option value="">Choisir une spécialité</option>
                        {specialites.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hôpital / Clinique</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="CHN Nouakchott"
                        value={form.hopital}
                        onChange={(e) => setForm({...form, hopital: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                      <select
                        value={form.ville}
                        onChange={(e) => setForm({...form, ville: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        {['Nouakchott', 'Nouadhibou', 'Rosso', 'Kaédi', 'Zouerate', 'Atar', 'Kiffa'].map(v => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tarif (MRU)</label>
                      <input
                        type="number"
                        placeholder="1500"
                        value={form.tarif}
                        onChange={(e) => setForm({...form, tarif: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Essai gratuit banner */}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3">
                    <span className="text-2xl">🎁</span>
                    <div>
                      <p className="text-sm font-semibold text-green-700">30 jours gratuits !</p>
                      <p className="text-xs text-green-600">Accès complet sans engagement</p>
                    </div>
                  </div>
                </>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium gap-2"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Phone className="w-4 h-4" />
                    Recevoir le code SMS
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Déjà un compte ?{' '}
              <Link href="/login" className="text-blue-600 font-medium hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        )}

        {/* ÉTAPE 2 — VÉRIFICATION OTP */}
        {etape === 'verification' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Vérifiez votre numéro</h2>
              <p className="text-gray-500 text-sm mt-2">
                Code envoyé au <span className="font-semibold text-blue-600">{phoneComplet}</span>
              </p>
            </div>

            {erreur && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
                ❌ {erreur}
              </div>
            )}

            {/* Input OTP */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                Code de confirmation (6 chiffres)
              </label>
              <input
                type="text"
                placeholder="• • • • • •"
                value={codeOTP}
                onChange={(e) => setCodeOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-2xl text-center tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={6}
              />
            </div>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 gap-2"
              onClick={verifierOTP}
              disabled={loading || codeOTP.length < 4}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Vérifier et créer mon compte
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setEtape('infos')}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                ← Modifier le numéro
              </button>
              <button
                onClick={renvoyerCode}
                disabled={loading}
                className="text-sm text-blue-600 hover:underline"
              >
                Renvoyer le code
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}