'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import {
  Heart, Calendar, Clock, User, Bell,
  Search, MapPin, Star,
  CheckCircle, XCircle, AlertCircle, LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState('accueil')
  const [rendezvous, setRendezvous] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    chargerDonnees()
  }, [])

  const chargerDonnees = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profileData)

      const { data: patientData } = await supabase
        .from('patients')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      if (patientData) {
        const { data: rdvData } = await supabase
          .from('appointments')
          .select(`
            *,
            medecins (
              specialite,
              hopital,
              ville,
              profiles ( full_name )
            )
          `)
          .eq('patient_id', patientData.id)
          .order('date_heure', { ascending: true })

        setRendezvous(rdvData || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const medecins = [
    { nom: 'Dr. Fatima Mint Ahmed', specialite: 'Cardiologue', note: 4.9, ville: 'Nouakchott' },
    { nom: 'Dr. Ahmed Ould Bah', specialite: 'Généraliste', note: 4.7, ville: 'Nouakchott' },
    { nom: 'Dr. Khadija Mint Salem', specialite: 'Dermatologue', note: 4.8, ville: 'Nouadhibou' },
  ]

  const statutBadge = (statut: string) => {
    if (statut === 'confirme') return (
      <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium">
        <CheckCircle className="w-3 h-3" /> Confirmé
      </span>
    )
    if (statut === 'en_attente') return (
      <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded-full text-xs font-medium">
        <AlertCircle className="w-3 h-3" /> En attente
      </span>
    )
    return (
      <span className="flex items-center gap-1 text-gray-500 bg-gray-100 px-2 py-1 rounded-full text-xs font-medium">
        <XCircle className="w-3 h-3" /> Terminé
      </span>
    )
  }

  const prochainRDV = rendezvous.find(r => r.statut !== 'termine')
  const prenom = profile?.full_name?.split(' ')[0] || 'vous'

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-500 text-sm">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Mauri<span className="text-blue-600">Health</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-gray-100">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-sm">
              {prenom[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* BONJOUR */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Bonjour, {prenom} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Comment vous sentez-vous aujourd'hui ?</p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Rendez-vous', valeur: rendezvous.filter(r => r.statut !== 'termine').length.toString(), souslabel: 'à venir', couleur: 'bg-blue-50 text-blue-600', icon: <Calendar className="w-5 h-5" /> },
            { label: 'Médecins', valeur: '5', souslabel: 'consultés', couleur: 'bg-green-50 text-green-600', icon: <User className="w-5 h-5" /> },
            { label: 'Prochain RDV', valeur: prochainRDV ? '1' : '0', souslabel: 'planifié', couleur: 'bg-purple-50 text-purple-600', icon: <Clock className="w-5 h-5" /> },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className={`w-10 h-10 ${stat.couleur} rounded-xl flex items-center justify-center mb-3`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.valeur}</p>
              <p className="text-xs text-gray-500">{stat.souslabel}</p>
            </div>
          ))}
        </div>

        {/* PROCHAIN RDV */}
        {prochainRDV ? (
          <div className="bg-blue-600 rounded-2xl p-5 mb-6 text-white">
            <p className="text-blue-200 text-xs font-medium mb-2">PROCHAIN RENDEZ-VOUS</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-lg">
                  {prochainRDV.medecins?.profiles?.full_name || 'Médecin'}
                </p>
                <p className="text-blue-200 text-sm">
                  {prochainRDV.medecins?.specialite} • {prochainRDV.medecins?.hopital}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="flex items-center gap-1 bg-blue-500 px-3 py-1 rounded-full text-xs">
                    <Calendar className="w-3 h-3" />
                    {new Date(prochainRDV.date_heure).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </span>
                  <span className="flex items-center gap-1 bg-blue-500 px-3 py-1 rounded-full text-xs">
                    <Clock className="w-3 h-3" />
                    {new Date(prochainRDV.date_heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-2xl font-bold">
                {prochainRDV.medecins?.profiles?.full_name?.[0] || 'M'}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-100 rounded-2xl p-5 mb-6 text-center">
            <p className="text-gray-500 text-sm">Aucun rendez-vous à venir</p>
            <Link href="/medecins">
              <Button size="sm" className="mt-3 bg-blue-600 text-white">
                Prendre un rendez-vous
              </Button>
            </Link>
          </div>
        )}

        {/* TABS */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1 shadow-sm border border-gray-100">
          {[
            { id: 'accueil', label: 'Mes RDV', icon: <Calendar className="w-4 h-4" /> },
            { id: 'medecins', label: 'Médecins', icon: <Search className="w-4 h-4" /> },
            { id: 'profil', label: 'Mon profil', icon: <User className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Mes RDV */}
        {activeTab === 'accueil' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Mes rendez-vous</h2>
              <Link href="/medecins">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                  + Nouveau RDV
                </Button>
              </Link>
            </div>
            {rendezvous.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Aucun rendez-vous pour le moment</p>
              </div>
            ) : (
              rendezvous.map((rdv) => (
                <div key={rdv.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold">
                        {rdv.medecins?.profiles?.full_name?.[0] || 'M'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {rdv.medecins?.profiles?.full_name || 'Médecin'}
                        </p>
                        <p className="text-xs text-blue-600">{rdv.medecins?.specialite}</p>
                      </div>
                    </div>
                    {statutBadge(rdv.statut)}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(rdv.date_heure).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(rdv.date_heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                    <MapPin className="w-3 h-3" /> {rdv.medecins?.hopital}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab: Médecins */}
        {activeTab === 'medecins' && (
          <div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Chercher un médecin ou une spécialité..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-3">
              {medecins.map((m, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold">
                      {m.nom.split(' ')[1][0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{m.nom}</p>
                      <p className="text-xs text-blue-600">{m.specialite}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <MapPin className="w-3 h-3" /> {m.ville}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-yellow-500">
                          <Star className="w-3 h-3 fill-yellow-400" /> {m.note}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link href="/medecins">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                      Réserver
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Profil */}
        {activeTab === 'profil' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 font-bold text-2xl">
                {prenom[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-bold text-gray-900">{profile?.full_name || 'Utilisateur'}</p>
                <p className="text-sm text-gray-500">Patient • Nouakchott</p>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Email', valeur: profile?.email || '-' },
                { label: 'Téléphone', valeur: profile?.phone || '-' },
                { label: 'Groupe sanguin', valeur: 'A+' },
                { label: 'Allergies', valeur: 'Aucune' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-500">{item.label}</span>
                  <span className="text-sm font-medium text-gray-900">{item.valeur}</span>
                </div>
              ))}
            </div>
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                window.location.href = '/'
              }}
              className="mt-6 flex items-center gap-2 text-red-500 text-sm hover:text-red-600"
            >
              <LogOut className="w-4 h-4" />
              Se déconnecter
            </button>
          </div>
        )}

      </div>
    </div>
  )
}