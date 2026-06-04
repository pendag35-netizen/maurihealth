'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Heart, Users, Calendar, TrendingUp,
  Bell, CheckCircle, XCircle, AlertCircle,
  User, Shield, Activity, LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('accueil')

  const medecins = [
    { nom: 'Dr. Fatima Mint Ahmed', specialite: 'Cardiologue', statut: 'actif', patients: 124 },
    { nom: 'Dr. Mohamed Ould Salem', specialite: 'Pédiatre', statut: 'actif', patients: 98 },
    { nom: 'Dr. Mariem Bint Cheikh', specialite: 'Gynécologue', statut: 'en_attente', patients: 0 },
    { nom: 'Dr. Ahmed Ould Bah', specialite: 'Généraliste', statut: 'actif', patients: 76 },
  ]

  const activites = [
    { texte: 'Nouveau médecin inscrit : Dr. Mariem', temps: 'Il y a 5 min', type: 'info' },
    { texte: '12 rendez-vous confirmés aujourd\'hui', temps: 'Il y a 1h', type: 'success' },
    { texte: 'Patient signalé un problème', temps: 'Il y a 2h', type: 'warning' },
    { texte: 'Nouveau patient inscrit : Mohamed', temps: 'Il y a 3h', type: 'info' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Mauri<span className="text-blue-600">Health</span></span>
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full ml-1">Admin</span>
          </Link>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-gray-100">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center text-red-600 font-bold text-sm">
              A
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* TITRE */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord Admin ⚙️</h1>
          <p className="text-gray-500 text-sm mt-1">Vue d'ensemble de MauriHealth</p>
        </div>

        {/* STATS GLOBALES */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total patients', valeur: '5,240', evolution: '+12%', couleur: 'bg-blue-50 text-blue-600', icon: <Users className="w-5 h-5" /> },
            { label: 'Médecins actifs', valeur: '48', evolution: '+3', couleur: 'bg-green-50 text-green-600', icon: <User className="w-5 h-5" /> },
            { label: 'RDV ce mois', valeur: '1,284', evolution: '+8%', couleur: 'bg-purple-50 text-purple-600', icon: <Calendar className="w-5 h-5" /> },
            { label: 'Revenus (MRU)', valeur: '284k', evolution: '+15%', couleur: 'bg-yellow-50 text-yellow-600', icon: <TrendingUp className="w-5 h-5" /> },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className={`w-10 h-10 ${stat.couleur} rounded-xl flex items-center justify-center mb-3`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.valeur}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500">{stat.label}</p>
                <span className="text-xs text-green-500 font-medium">{stat.evolution}</span>
              </div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1 shadow-sm border border-gray-100">
          {[
            { id: 'accueil', label: 'Activité', icon: <Activity className="w-4 h-4" /> },
            { id: 'medecins', label: 'Médecins', icon: <Shield className="w-4 h-4" /> },
            { id: 'patients', label: 'Patients', icon: <Users className="w-4 h-4" /> },
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

        {/* Tab: Activité */}
        {activeTab === 'accueil' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-900 mb-4">Activité récente</h2>
              <div className="space-y-4">
                {activites.map((a, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      a.type === 'success' ? 'bg-green-50' :
                      a.type === 'warning' ? 'bg-orange-50' : 'bg-blue-50'
                    }`}>
                      {a.type === 'success' ? <CheckCircle className="w-4 h-4 text-green-500" /> :
                       a.type === 'warning' ? <AlertCircle className="w-4 h-4 text-orange-500" /> :
                       <Activity className="w-4 h-4 text-blue-500" />}
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">{a.texte}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{a.temps}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-900 mb-4">Médecins en attente</h2>
              {medecins.filter(m => m.statut === 'en_attente').map((m, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-orange-50 rounded-xl mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-bold">
                      {m.nom.split(' ')[1][0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{m.nom}</p>
                      <p className="text-xs text-gray-500">{m.specialite}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white text-xs h-7">
                      Valider
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs h-7 text-red-500 border-red-200">
                      Refuser
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Médecins */}
        {activeTab === 'medecins' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Tous les médecins</h2>
              <Button size="sm" className="bg-blue-600 text-white text-xs">
                + Ajouter
              </Button>
            </div>
            <div className="divide-y divide-gray-100">
              {medecins.map((m, i) => (
                <div key={i} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold">
                      {m.nom.split(' ')[1][0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{m.nom}</p>
                      <p className="text-xs text-gray-400">{m.specialite} • {m.patients} patients</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      m.statut === 'actif'
                        ? 'bg-green-50 text-green-600'
                        : 'bg-orange-50 text-orange-600'
                    }`}>
                      {m.statut === 'actif' ? '● Actif' : '● En attente'}
                    </span>
                    <Button size="sm" variant="outline" className="text-xs">
                      Gérer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Patients */}
        {activeTab === 'patients' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Liste des patients disponible bientôt</p>
          </div>
        )}

      </div>
    </div>
  )
}