'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Heart, Calendar, Clock, Users, Bell,
  CheckCircle, XCircle, AlertCircle,
  TrendingUp, LogOut, User, Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function MedecinDashboard() {
  const [activeTab, setActiveTab] = useState('accueil')

  const rendezvous = [
    { id: 1, patient: 'Mohamed Ould Ahmed', age: 34, date: 'Aujourd\'hui', heure: '09:30', motif: 'Consultation générale', statut: 'confirme' },
    { id: 2, patient: 'Fatima Mint Salem', age: 28, date: 'Aujourd\'hui', heure: '11:00', motif: 'Suivi cardiaque', statut: 'confirme' },
    { id: 3, patient: 'Ahmed Ould Bah', age: 52, date: 'Demain', heure: '10:00', motif: 'Douleurs thoraciques', statut: 'en_attente' },
    { id: 4, patient: 'Mariem Bint Cheikh', age: 41, date: 'Demain', heure: '14:30', motif: 'Bilan annuel', statut: 'en_attente' },
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
        <XCircle className="w-3 h-3" /> Annulé
      </span>
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
            <span className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full font-medium">
              ● Disponible
            </span>
            <button className="relative p-2 rounded-xl hover:bg-gray-100">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center text-green-600 font-bold text-sm">
              F
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* BONJOUR */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Bonjour, Dr. Fatima 👨‍⚕️</h1>
          <p className="text-gray-500 text-sm mt-1">Vous avez 4 rendez-vous aujourd'hui</p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'RDV aujourd\'hui', valeur: '4', couleur: 'bg-blue-50 text-blue-600', icon: <Calendar className="w-5 h-5" /> },
            { label: 'Cette semaine', valeur: '18', couleur: 'bg-green-50 text-green-600', icon: <TrendingUp className="w-5 h-5" /> },
            { label: 'Total patients', valeur: '124', couleur: 'bg-purple-50 text-purple-600', icon: <Users className="w-5 h-5" /> },
            { label: 'Note moyenne', valeur: '4.9', couleur: 'bg-yellow-50 text-yellow-600', icon: <Star className="w-5 h-5" /> },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className={`w-10 h-10 ${stat.couleur} rounded-xl flex items-center justify-center mb-3`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.valeur}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1 shadow-sm border border-gray-100">
          {[
            { id: 'accueil', label: 'Agenda', icon: <Calendar className="w-4 h-4" /> },
            { id: 'patients', label: 'Patients', icon: <Users className="w-4 h-4" /> },
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

        {/* Tab: Agenda */}
        {activeTab === 'accueil' && (
          <div className="space-y-3">
            <h2 className="font-bold text-gray-900 mb-4">Rendez-vous du jour</h2>
            {rendezvous.map((rdv) => (
              <div key={rdv.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold">
                      {rdv.patient.split(' ')[0][0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{rdv.patient}</p>
                      <p className="text-xs text-gray-400">{rdv.age} ans • {rdv.motif}</p>
                    </div>
                  </div>
                  {statutBadge(rdv.statut)}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {rdv.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {rdv.heure}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs h-7">
                      Annuler
                    </Button>
                    <Button size="sm" className="bg-blue-600 text-white text-xs h-7">
                      Voir
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Patients */}
        {activeTab === 'patients' && (
          <div className="space-y-3">
            <h2 className="font-bold text-gray-900 mb-4">Mes patients récents</h2>
            {rendezvous.map((rdv, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 font-bold">
                    {rdv.patient.split(' ')[0][0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{rdv.patient}</p>
                    <p className="text-xs text-gray-400">{rdv.age} ans</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="text-xs">
                  Dossier
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Profil */}
        {activeTab === 'profil' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 font-bold text-2xl">
                F
              </div>
              <div>
                <p className="font-bold text-gray-900">Dr. Fatima Mint Ahmed</p>
                <p className="text-sm text-blue-600">Cardiologue</p>
                <p className="text-sm text-gray-500">CHN Nouakchott</p>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Email', valeur: 'fatima@maurihealth.mr' },
                { label: 'Téléphone', valeur: '+222 XX XX XX XX' },
                { label: 'N° Ordre', valeur: 'MED-2024-001' },
                { label: 'Tarif consultation', valeur: '2000 MRU' },
                { label: 'Ville', valeur: 'Nouakchott' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-500">{item.label}</span>
                  <span className="text-sm font-medium text-gray-900">{item.valeur}</span>
                </div>
              ))}
            </div>
            <button className="mt-6 flex items-center gap-2 text-red-500 text-sm hover:text-red-600">
              <LogOut className="w-4 h-4" />
              Se déconnecter
            </button>
          </div>
        )}

      </div>
    </div>
  )
}