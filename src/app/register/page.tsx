'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, Mail, Lock, User, Phone, Eye, EyeOff, Stethoscope, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')
  const [role, setRole] = useState<'patient' | 'medecin'>('patient')
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    specialite: '',
    hopital: '',
    ville: 'Nouakchott',
    tarif: '',
    numeroOrdre: '',
  })

  const specialites = [
    'Médecine Générale',
    'Cardiologie',
    'Pédiatrie',
    'Gynécologie',
    'Dermatologie',
    'Neurologie',
    'Ophtalmologie',
    'Orthopédie',
    'Psychiatrie',
    'Radiologie',
  ]

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

      // 1. Créer le compte Auth
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.fullName,
            phone: form.phone,
            role: role,
          }
        }
      })

      if (error) {
        setErreur(error.message)
        return
      }

      if (!data.user) {
        setErreur('Erreur lors de la création du compte')
        return
      }

      // 2. Créer le profil
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: form.email,
          full_name: form.fullName,
          phone: form.phone,
          role: role,
        })

      if (profileError) {
        console.error('Erreur profil:', profileError)
      }

      // 3. Si médecin → créer la fiche médecin
      if (role === 'medecin') {
        const { error: medecinError } = await supabase
          .from('medecins')
          .insert({
            profile_id: data.user.id,
            specialite: form.specialite,
            hopital: form.hopital,
            ville: form.ville,
            tarif_consultation: parseFloat(form.tarif) || 0,
            numero_ordre: form.numeroOrdre,
            disponible: true,
            bio: `${form.specialite} à ${form.hopital}, ${form.ville}.`,
          })

        if (medecinError) {
          console.error('Erreur médecin:', medecinError)
        }
      } else {
        // 4. Si patient → créer la fiche patient
        await supabase
          .from('patients')
          .insert({ profile_id: data.user.id })
      }

      // 5. Redirection
      if (role === 'medecin') {
        window.location.href = '/dashboard/medecin'
      } else {
        window.location.href = '/dashboard/patient'
      }

    } catch (err) {
      setErreur('Une erreur est survenue, réessayez')
      console.error(err)
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-2xl font-bold text-gray-900 mt-6">Créer un compte</h1>
          <p className="text-gray-500 mt-1">Rejoignez MauriHealth gratuitement</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {/* Erreur */}
          {erreur && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
              ❌ {erreur}
            </div>
          )}

          {/* Choix du rôle */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole('patient')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                role === 'patient'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">👤</span>
              <span className="text-sm font-medium text-gray-700">Je suis patient</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('medecin')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                role === 'medecin'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">👨‍⚕️</span>
              <span className="text-sm font-medium text-gray-700">Je suis médecin</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Nom complet */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
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

            {/* Email */}
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

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  placeholder="+222 XX XX XX XX"
                  value={form.phone}
                  onChange={(e) => setForm({...form, phone: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Champs supplémentaires pour médecin */}
            {role === 'medecin' && (
              <>
                {/* Spécialité */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Spécialité</label>
                  <div className="relative">
                    <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={form.specialite}
                      onChange={(e) => setForm({...form, specialite: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      required
                    >
                      <option value="">Choisir une spécialité</option>
                      {specialites.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Hôpital */}
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
                      required
                    />
                  </div>
                </div>

                {/* Ville */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                  <select
                    value={form.ville}
                    onChange={(e) => setForm({...form, ville: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option>Nouakchott</option>
                    <option>Nouadhibou</option>
                    <option>Rosso</option>
                    <option>Kaédi</option>
                    <option>Zouerate</option>
                    <option>Atar</option>
                    <option>Kiffa</option>
                  </select>
                </div>

                {/* Tarif */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tarif consultation (MRU)</label>
                  <input
                    type="number"
                    placeholder="1500"
                    value={form.tarif}
                    onChange={(e) => setForm({...form, tarif: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Numéro ordre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Numéro d'ordre médical</label>
                  <input
                    type="text"
                    placeholder="MED-2024-XXX"
                    value={form.numeroOrdre}
                    onChange={(e) => setForm({...form, numeroOrdre: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </>
            )}

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Bouton */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium mt-2"
              disabled={loading}
            >
              {loading ? '⏳ Création du compte...' : 'Créer mon compte'}
            </Button>

          </form>

          <p className="text-xs text-gray-400 text-center mt-4">
            En vous inscrivant, vous acceptez nos{' '}
            <Link href="#" className="text-blue-600 hover:underline">conditions d'utilisation</Link>
          </p>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-blue-600 font-medium hover:underline">
            Se connecter
          </Link>
        </p>

      </div>
    </div>
  )
}