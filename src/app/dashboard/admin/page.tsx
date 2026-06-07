'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import {
  Heart, Users, Calendar, TrendingUp, Bell,
  CheckCircle, XCircle, AlertCircle, Activity,
  User, Shield, LogOut, RefreshCw, Circle
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('accueil')
  const [medecins, setMedecins] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalMedecins: 0,
    totalRDV: 0,
    rdvAujourdhui: 0,
    rdvEnAttente: 0,
    rdvConfirmes: 0,
  })
  const [activites, setActivites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    chargerDonnees()
    setupRealtime()
    return () => {
      supabase.removeAllChannels()
    }
  }, [])

  const chargerDonnees = async () => {
    try {
      // Charger tout en parallèle
      const [
        { data: medecinData, count: mCount },
        { data: patientData, count: pCount },
        { data: rdvData, count: rCount },
      ] = await Promise.all([
        supabase.from('medecins').select('*, profiles(full_name, email, phone)', { count: 'exact' }).order('created_at', { ascending: false }),
        supabase.from('patients').select('*, profiles(full_name, email, phone)', { count: 'exact' }).order('created_at', { ascending: false }),
        supabase.from('appointments').select('*, patients(profiles(full_name)), medecins(specialite, hopital, profiles(full_name))', { count: 'exact' }).order('created_at', { ascending: false }),
      ])

      setMedecins(medecinData || [])
      setPatients(patientData || [])
      setAppointments(rdvData || [])

      // Calculer les stats
      const aujourd_hui = new Date().toDateString()
      const rdvAujourdhui = rdvData?.filter(r =>
        new Date(r.date_heure).toDateString() === aujourd_hui
      ).length || 0

      setStats({
        totalPatients: pCount || 0,
        totalMedecins: mCount || 0,
        totalRDV: rCount || 0,
        rdvAujourdhui,
        rdvEnAttente: rdvData?.filter(r => r.statut === 'en_attente').length || 0,
        rdvConfirmes: rdvData?.filter(r => r.statut === 'confirme').length || 0,
      })

      // Créer les activités récentes
      const activitesRecentes = [
        ...(rdvData?.slice(0, 5).map(r => ({
          texte: `Nouveau RDV : ${r.patients?.profiles?.full_name || 'Patient'} → ${r.medecins?.profiles?.full_name || 'Médecin'}`,
          temps: new Date(r.created_at),
          type: 'rdv',
          icon: '📅',
        })) || []),
        ...(medecinData?.slice(0, 3).map(m => ({
          texte: `Médecin inscrit : ${m.profiles?.full_name || 'Nouveau médecin'}`,
          temps: new Date(m.created_at),
          type: 'medecin',
          icon: '👨‍⚕️',
        })) || []),
        ...(patientData?.slice(0, 3).map(p => ({
          texte: `Patient inscrit : ${p.profiles?.full_name || 'Nouveau patient'}`,
          temps: new Date(p.created_at),
          type: 'patient',
          icon: '👤',
        })) || []),
      ]
        .sort((a, b) => b.temps.getTime() - a.temps.getTime())
        .slice(0, 10)

      setActivites(activitesRecentes)
      setLastUpdate(new Date())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const setupRealtime = () => {
    // Écouter les nouveaux rendez-vous en temps réel
    const rdvChannel = supabase
      .channel('rdv-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'appointments',
      }, (payload) => {
        console.log('RDV changé:', payload)
        chargerDonnees()
        setLastUpdate(new Date())
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
      }, (payload) => {
        console.log('Profil changé:', payload)
        chargerDonnees()
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'medecins',
      }, (payload) => {
        console.log('Médecin changé:', payload)
        chargerDonnees()
      })
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED')
      })

    return rdvChannel
  }

  const toggleDisponibilite = async (id: string, actuel: boolean) => {
    await supabase
      .from('medecins')
      .update({ disponible: !actuel })
      .eq('id', id)
    chargerDonnees()
  }

  const changerStatutRDV = async (id: string, statut: string) => {
    await supabase
      .from('appointments')
      .update({ statut })
      .eq('id', id)
    chargerDonnees()
  }

  const formatTemps = (date: Date) => {
    const diff = (new Date().getTime() - date.getTime()) / 1000
    if (diff < 60) return 'À l\'instant'
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`
    return `Il y a ${Math.floor(diff / 86400)}j`
  }

  const statutBadge = (statut: string) => {
    const config: any = {
      confirme: { bg: '#f0fdf4', color: '#16a34a', text: '✓ Confirmé' },
      en_attente: { bg: '#fff7ed', color: '#ea580c', text: '⏳ En attente' },
      annule: { bg: '#fef2f2', color: '#ef4444', text: '✗ Annulé' },
      termine: { bg: '#f9fafb', color: '#6b7280', text: '● Terminé' },
    }
    const c = config[statut] || config.en_attente
    return (
      <span className="text-xs px-2 py-1 rounded-full font-medium"
        style={{ backgroundColor: c.bg, color: c.color }}>
        {c.text}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-500">Chargement du dashboard...</p>
        </div>
      </div>
    )
  }

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
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full ml-1 font-medium">Admin</span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Indicateur temps réel */}
            <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full ${connected ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              <Circle className={`w-2 h-2 fill-current ${connected ? 'animate-pulse' : ''}`} />
              {connected ? 'Temps réel actif' : 'Connexion...'}
            </div>

            {/* Dernière mise à jour */}
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <RefreshCw className="w-3 h-3" />
              {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>

            <button className="relative p-2 rounded-xl hover:bg-gray-100">
              <Bell className="w-5 h-5 text-gray-600" />
              {stats.rdvEnAttente > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                  {stats.rdvEnAttente}
                </span>
              )}
            </button>

            <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center text-red-600 font-bold text-sm">
              A
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* TITRE */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord Admin ⚙️</h1>
            <p className="text-gray-500 text-sm mt-1">Données en temps réel • MauriHealth</p>
          </div>
          <Button onClick={chargerDonnees} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </Button>
        </div>

        {/* STATS GLOBALES */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
          {[
            { label: 'Patients', valeur: stats.totalPatients, icon: <Users className="w-4 h-4" />, bg: 'bg-blue-50', color: 'text-blue-600' },
            { label: 'Médecins', valeur: stats.totalMedecins, icon: <User className="w-4 h-4" />, bg: 'bg-green-50', color: 'text-green-600' },
            { label: 'Total RDV', valeur: stats.totalRDV, icon: <Calendar className="w-4 h-4" />, bg: 'bg-purple-50', color: 'text-purple-600' },
            { label: "Aujourd'hui", valeur: stats.rdvAujourdhui, icon: <Activity className="w-4 h-4" />, bg: 'bg-yellow-50', color: 'text-yellow-600' },
            { label: 'En attente', valeur: stats.rdvEnAttente, icon: <AlertCircle className="w-4 h-4" />, bg: 'bg-orange-50', color: 'text-orange-600' },
            { label: 'Confirmés', valeur: stats.rdvConfirmes, icon: <CheckCircle className="w-4 h-4" />, bg: 'bg-emerald-50', color: 'text-emerald-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className={`w-8 h-8 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-2`}>
                {stat.icon}
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.valeur}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1 shadow-sm border border-gray-100 overflow-x-auto">
          {[
            { id: 'accueil', label: 'Activité', icon: <Activity className="w-4 h-4" /> },
            { id: 'rdv', label: `RDV (${stats.totalRDV})`, icon: <Calendar className="w-4 h-4" /> },
            { id: 'medecins', label: `Médecins (${stats.totalMedecins})`, icon: <Shield className="w-4 h-4" /> },
            { id: 'patients', label: `Patients (${stats.totalPatients})`, icon: <Users className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
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

        {/* TAB: ACTIVITÉ */}
        {activeTab === 'accueil' && (
          <div className="grid md:grid-cols-2 gap-6">

            {/* Activité récente */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Activité en temps réel</h2>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Circle className="w-2 h-2 fill-green-500 animate-pulse" />
                  Live
                </div>
              </div>
              <div className="space-y-3">
                {activites.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">Aucune activité récente</p>
                ) : activites.map((a, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">{a.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 truncate">{a.texte}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatTemps(a.temps)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RDV en attente */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">RDV en attente</h2>
                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium">
                  {stats.rdvEnAttente} en attente
                </span>
              </div>
              <div className="space-y-3">
                {appointments
                  .filter(r => r.statut === 'en_attente')
                  .slice(0, 5)
                  .map((rdv, i) => (
                    <div key={i} className="bg-orange-50 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {rdv.patients?.profiles?.full_name || 'Patient'}
                          </p>
                          <p className="text-xs text-gray-500">
                            → {rdv.medecins?.profiles?.full_name || 'Médecin'}
                          </p>
                          <p className="text-xs text-gray-400">
                            📅 {new Date(rdv.date_heure).toLocaleDateString('fr-FR', {
                              weekday: 'short', day: 'numeric', month: 'short',
                            })} à {new Date(rdv.date_heure).toLocaleTimeString('fr-FR', {
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="flex gap-1 flex-col">
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white text-xs h-7 px-3"
                            onClick={() => changerStatutRDV(rdv.id, 'confirme')}
                          >
                            ✓ Confirmer
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 px-3 text-red-500 border-red-200 hover:bg-red-50"
                            onClick={() => changerStatutRDV(rdv.id, 'annule')}
                          >
                            ✗ Annuler
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                {stats.rdvEnAttente === 0 && (
                  <div className="text-center py-4">
                    <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Tout est à jour !</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: RDV */}
        {activeTab === 'rdv' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Tous les rendez-vous</h2>
              <span className="text-xs text-gray-400">{appointments.length} au total</span>
            </div>
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {appointments.length === 0 ? (
                <div className="p-8 text-center text-gray-400">Aucun rendez-vous</div>
              ) : appointments.map((rdv, i) => (
                <div key={i} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-sm">
                        {rdv.patients?.profiles?.full_name?.[0] || 'P'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {rdv.patients?.profiles?.full_name || 'Patient inconnu'}
                        </p>
                        <p className="text-xs text-blue-600">
                          {rdv.medecins?.profiles?.full_name || 'Médecin'}
                        </p>
                        <p className="text-xs text-gray-400">
                          📅 {new Date(rdv.date_heure).toLocaleDateString('fr-FR', {
                            weekday: 'short', day: 'numeric', month: 'short'
                          })} • {new Date(rdv.date_heure).toLocaleTimeString('fr-FR', {
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {statutBadge(rdv.statut)}
                      {rdv.statut === 'en_attente' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => changerStatutRDV(rdv.id, 'confirme')}
                            className="w-7 h-7 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg text-xs flex items-center justify-center"
                            title="Confirmer"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => changerStatutRDV(rdv.id, 'annule')}
                            className="w-7 h-7 bg-red-100 hover:bg-red-200 text-red-500 rounded-lg text-xs flex items-center justify-center"
                            title="Annuler"
                          >
                            ✗
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: MÉDECINS */}
        {activeTab === 'medecins' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Gestion des médecins</h2>
              <span className="text-xs text-gray-400">{medecins.length} médecins</span>
            </div>
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {medecins.length === 0 ? (
                <div className="p-8 text-center text-gray-400">Aucun médecin</div>
              ) : medecins.map((m, i) => (
                <div key={i} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 font-bold text-sm">
                      {m.profiles?.full_name?.split(' ')[1]?.[0] || 'M'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{m.profiles?.full_name}</p>
                      <p className="text-xs text-blue-600">{m.specialite}</p>
                      <p className="text-xs text-gray-400">🏥 {m.hopital} • 📍 {m.ville}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      m.disponible ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                    }`}>
                      {m.disponible ? '● Actif' : '● Inactif'}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7"
                      onClick={() => toggleDisponibilite(m.id, m.disponible)}
                    >
                      {m.disponible ? 'Désactiver' : 'Activer'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: PATIENTS */}
        {activeTab === 'patients' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Liste des patients</h2>
              <span className="text-xs text-gray-400">{patients.length} patients</span>
            </div>
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {patients.length === 0 ? (
                <div className="p-8 text-center text-gray-400">Aucun patient</div>
              ) : patients.map((p, i) => (
                <div key={i} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-sm">
                      {p.profiles?.full_name?.[0] || 'P'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {p.profiles?.full_name || 'Patient'}
                      </p>
                      <p className="text-xs text-gray-400">{p.profiles?.email}</p>
                      <p className="text-xs text-gray-400">📞 {p.profiles?.phone || 'Non renseigné'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {appointments.filter(r =>
                        r.patient_id === p.id
                      ).length} RDV
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}