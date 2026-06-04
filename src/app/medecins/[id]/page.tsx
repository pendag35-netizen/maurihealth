'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, MapPin, Star, Clock, ChevronLeft, CheckCircle, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@supabase/supabase-js'

export default function PriseRDV() {
  const [etape, setEtape] = useState(1)
  const [jourSelectionne, setJourSelectionne] = useState('')
  const [heureSelectionnee, setHeureSelectionnee] = useState('')
  const [motif, setMotif] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const jours = [
    { date: 'Lun 9 Juin', dispo: true },
    { date: 'Mar 10 Juin', dispo: true },
    { date: 'Mer 11 Juin', dispo: false },
    { date: 'Jeu 12 Juin', dispo: true },
    { date: 'Ven 13 Juin', dispo: true },
  ]

  const heures = [
    '08:00', '08:30', '09:00', '09:30',
    '10:00', '10:30', '11:00', '14:00',
    '14:30', '15:00', '15:30', '16:00'
  ]

  const medecin = {
    nom: 'Dr. Fatima Mint Ahmed',
    specialite: 'Cardiologue',
    hopital: 'CHN Nouakchott',
    note: 4.9,
    avis: 124,
    tarif: 2000,
  }

  const confirmerRDV = async () => {
    setLoading(true)

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // Vérifier si l'utilisateur est connecté
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        alert('Vous devez être connecté pour prendre un rendez-vous')
        window.location.href = '/login'
        return
      }

      // Récupérer le patient
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      // Si le patient n'existe pas encore, le créer
      let patientId = patient?.id

      if (!patientId) {
        const { data: newPatient } = await supabase
          .from('patients')
          .insert({ profile_id: user.id })
          .select('id')
          .single()
        patientId = newPatient?.id
      }

      // Récupérer le premier médecin disponible (pour la démo)
      const { data: medecinData } = await supabase
        .from('medecins')
        .select('id')
        .limit(1)
        .single()

      if (!medecinData) {
        alert('Aucun médecin disponible pour le moment')
        return
      }

      // Construire la date/heure du RDV
      const dateRDV = new Date()
      dateRDV.setDate(dateRDV.getDate() + 3)
      const [heures, minutes] = heureSelectionnee.split(':')
      dateRDV.setHours(parseInt(heures), parseInt(minutes), 0, 0)

      // Créer le rendez-vous
      const { error } = await supabase
        .from('appointments')
        .insert({
          patient_id: patientId,
          medecin_id: medecinData.id,
          date_heure: dateRDV.toISOString(),
          motif: motif || 'Consultation générale',
          statut: 'en_attente',
        })

      if (error) {
        console.error(error)
        alert('Erreur lors de la création du rendez-vous')
        return
      }

      setSuccess(true)

    } catch (err) {
      console.error(err)
      alert('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  // PAGE DE SUCCÈS
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Rendez-vous confirmé !</h2>
          <p className="text-gray-500 mb-2">Votre rendez-vous a été enregistré avec succès.</p>
          <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Médecin</span>
              <span className="font-semibold">{medecin.nom}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Date</span>
              <span className="font-semibold">{jourSelectionne}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Heure</span>
              <span className="font-semibold">{heureSelectionnee}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Statut</span>
              <span className="font-semibold text-orange-500">En attente de confirmation</span>
            </div>
          </div>
          <Link href="/dashboard/patient">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Voir mes rendez-vous
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/medecins" className="p-2 hover:bg-gray-100 rounded-xl">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Prise de rendez-vous</span>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* CARTE MÉDECIN */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 font-bold text-2xl">
              F
            </div>
            <div>
              <p className="font-bold text-gray-900">{medecin.nom}</p>
              <p className="text-sm text-blue-600">{medecin.specialite}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <MapPin className="w-3 h-3" /> {medecin.hopital}
                </span>
                <span className="flex items-center gap-1 text-xs text-yellow-500">
                  <Star className="w-3 h-3 fill-yellow-400" /> {medecin.note}
                </span>
              </div>
            </div>
            <div className="ml-auto text-right">
              <p className="font-bold text-gray-900">{medecin.tarif} MRU</p>
              <p className="text-xs text-gray-400">consultation</p>
            </div>
          </div>
        </div>

        {/* ÉTAPES */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((e) => (
            <div key={e} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                etape >= e ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                {etape > e ? <CheckCircle className="w-4 h-4" /> : e}
              </div>
              <span className="text-xs text-gray-500 hidden sm:block">
                {e === 1 ? 'Date' : e === 2 ? 'Heure' : 'Confirmer'}
              </span>
              {e < 3 && <div className={`flex-1 h-0.5 ${etape > e ? 'bg-blue-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* ÉTAPE 1 */}
        {etape === 1 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Choisissez une date
            </h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {jours.map((j) => (
                <button
                  key={j.date}
                  disabled={!j.dispo}
                  onClick={() => setJourSelectionne(j.date)}
                  className={`p-4 rounded-xl border-2 text-sm font-medium transition-all ${
                    !j.dispo
                      ? 'border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed'
                      : jourSelectionne === j.date
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-200 text-gray-700 hover:border-blue-300'
                  }`}
                >
                  {j.date}
                  {!j.dispo && <span className="block text-xs text-gray-300 mt-1">Indisponible</span>}
                </button>
              ))}
            </div>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!jourSelectionne}
              onClick={() => setEtape(2)}
            >
              Continuer
            </Button>
          </div>
        )}

        {/* ÉTAPE 2 */}
        {etape === 2 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Choisissez une heure
            </h2>
            <p className="text-sm text-gray-400 mb-4">{jourSelectionne}</p>
            <div className="grid grid-cols-4 gap-2 mb-6">
              {heures.map((h) => (
                <button
                  key={h}
                  onClick={() => setHeureSelectionnee(h)}
                  className={`py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                    heureSelectionnee === h
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-200 text-gray-700 hover:border-blue-300'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motif de consultation
              </label>
              <textarea
                placeholder="Décrivez brièvement votre motif..."
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setEtape(1)} className="flex-1">
                Retour
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!heureSelectionnee}
                onClick={() => setEtape(3)}
              >
                Continuer
              </Button>
            </div>
          </div>
        )}

        {/* ÉTAPE 3 */}
        {etape === 3 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              Confirmez votre rendez-vous
            </h2>
            <div className="bg-blue-50 rounded-xl p-4 mb-6 space-y-3">
              {[
                { label: 'Médecin', valeur: medecin.nom },
                { label: 'Spécialité', valeur: medecin.specialite },
                { label: 'Date', valeur: jourSelectionne },
                { label: 'Heure', valeur: heureSelectionnee },
                { label: 'Lieu', valeur: medecin.hopital },
                { label: 'Tarif', valeur: `${medecin.tarif} MRU` },
                { label: 'Motif', valeur: motif || 'Non précisé' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{item.label}</span>
                  <span className="font-semibold text-gray-900">{item.valeur}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setEtape(2)} className="flex-1">
                Retour
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
                onClick={confirmerRDV}
              >
                {loading ? 'Enregistrement...' : 'Confirmer le RDV ✓'}
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}