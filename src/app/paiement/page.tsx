'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, Lock, CheckCircle, ArrowLeft, Phone, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'

type MethodePaiement = 'bankily' | 'masrvi' | 'sedad' | null

export default function PaiementPage() {
  const [etape, setEtape] = useState<'choix' | 'formulaire' | 'confirmation' | 'succes'>('choix')
  const [methode, setMethode] = useState<MethodePaiement>(null)
  const [loading, setLoading] = useState(false)
  const [telephone, setTelephone] = useState('')
  const [code, setCode] = useState('')
  const [codeEnvoye, setCodeEnvoye] = useState(false)

  const rdv = {
    medecin: 'Dr. Fatima Mint Ahmed',
    specialite: 'Cardiologue',
    hopital: 'CHN Nouakchott',
    date: 'Lundi 9 Juin 2026',
    heure: '09:30',
    tarif: 2000,
  }

  const methodes = [
    {
      id: 'bankily' as const,
      nom: 'Bankily',
      desc: 'Mobile Money BMI',
      couleur: '#00a651',
      bg: '#f0fdf4',
      border: '#86efac',
      icon: '🏦',
      prefixes: ['22', '32', '42'],
    },
    {
      id: 'masrvi' as const,
      nom: 'Masrvi',
      desc: 'Paiement Mobile',
      couleur: '#f97316',
      bg: '#fff7ed',
      border: '#fdba74',
      icon: '📱',
      prefixes: ['20', '30', '40'],
    },
    {
      id: 'sedad' as const,
      nom: 'Sedad',
      desc: 'Paiement Électronique',
      couleur: '#2563eb',
      bg: '#eff6ff',
      border: '#93c5fd',
      icon: '💳',
      prefixes: ['21', '31', '41'],
    },
  ]

  const methodeSelectionnee = methodes.find(m => m.id === methode)

  const envoyerCode = async () => {
    if (telephone.length < 8) {
      alert('Entrez un numéro valide')
      return
    }
    setLoading(true)
    // Simulation envoi code
    await new Promise(r => setTimeout(r, 1500))
    setCodeEnvoye(true)
    setLoading(false)
    alert(`Code envoyé au +222 ${telephone}`)
  }

  const confirmerPaiement = async () => {
    if (code.length < 4) {
      alert('Entrez le code reçu')
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 2000))
    setLoading(false)
    setEtape('succes')
  }

  // PAGE SUCCÈS
  if (etape === 'succes') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Paiement réussi ! 🎉</h2>
          <p className="text-gray-500 mb-1">Votre rendez-vous est confirmé.</p>
          <p className="text-sm text-gray-400 mb-6">
            Un reçu a été envoyé au {telephone ? `+222 ${telephone}` : 'votre numéro'}
          </p>

          <div className="bg-green-50 rounded-xl p-4 mb-6 text-left space-y-2">
            {[
              { label: 'Médecin', valeur: rdv.medecin },
              { label: 'Date', valeur: rdv.date },
              { label: 'Heure', valeur: rdv.heure },
              { label: 'Méthode', valeur: methodeSelectionnee?.nom || '' },
              { label: 'Montant', valeur: `${rdv.tarif} MRU` },
              { label: 'Statut', valeur: '✅ Payé et confirmé' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-500">{item.label}</span>
                <span className="font-semibold text-gray-900">{item.valeur}</span>
              </div>
            ))}
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
          <button
            onClick={() => etape === 'choix' ? window.history.back() : setEtape('choix')}
            className="p-2 hover:bg-gray-100 rounded-xl"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Paiement sécurisé</span>
          </div>
          <div className="ml-auto flex items-center gap-1 text-xs text-gray-400">
            <Lock className="w-3 h-3" /> Sécurisé
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* RÉCAP RDV */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 font-bold text-xl">
              F
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">{rdv.medecin}</p>
              <p className="text-sm text-blue-600">{rdv.specialite}</p>
              <p className="text-xs text-gray-400">{rdv.date} à {rdv.heure}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{rdv.tarif}</p>
              <p className="text-xs text-gray-400">MRU</p>
            </div>
          </div>
        </div>

        {/* ÉTAPE 1 — CHOIX MÉTHODE */}
        {etape === 'choix' && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-2">Choisissez votre méthode de paiement</h2>
            <p className="text-sm text-gray-400 mb-6">Toutes les méthodes de paiement mauritaniennes acceptées</p>

            <div className="space-y-3">
              {methodes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setMethode(m.id); setEtape('formulaire') }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 hover:shadow-md transition-all text-left"
                  style={{ borderColor: m.border, backgroundColor: m.bg }}
                >
                  <span className="text-3xl">{m.icon}</span>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{m.nom}</p>
                    <p className="text-sm text-gray-500">{m.desc}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium" style={{ color: m.couleur }}>
                      Disponible ✓
                    </p>
                    <p className="text-xs text-gray-400">Instantané</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
              <p className="text-xs text-blue-700 text-center">
                🔒 Tous vos paiements sont sécurisés et chiffrés
              </p>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 — FORMULAIRE */}
        {etape === 'formulaire' && methodeSelectionnee && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">{methodeSelectionnee.icon}</span>
              <div>
                <h2 className="font-bold text-gray-900">Payer avec {methodeSelectionnee.nom}</h2>
                <p className="text-sm text-gray-500">{methodeSelectionnee.desc}</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Numéro de téléphone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro {methodeSelectionnee.nom}
                </label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-3">
                    <span className="text-sm font-medium text-gray-600">🇲🇷 +222</span>
                  </div>
                  <input
                    type="tel"
                    placeholder="XX XX XX XX"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Préfixes acceptés : {methodeSelectionnee.prefixes.join(', ')}
                </p>
              </div>

              {/* Montant */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Consultation</span>
                  <span className="font-medium">{rdv.tarif} MRU</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Frais de service</span>
                  <span className="font-medium text-green-600">Gratuit</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">{rdv.tarif} MRU</span>
                </div>
              </div>

              {/* Bouton envoyer code */}
              {!codeEnvoye ? (
                <Button
                  className="w-full text-white py-3"
                  style={{ backgroundColor: methodeSelectionnee.couleur }}
                  onClick={envoyerCode}
                  disabled={loading || telephone.length < 8}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Envoi en cours...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Recevoir le code de confirmation
                    </span>
                  )}
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                    <p className="text-sm text-green-700 font-medium">
                      ✅ Code envoyé au +222 {telephone}
                    </p>
                    <p className="text-xs text-green-600 mt-1">Valable 5 minutes</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Code de confirmation
                    </label>
                    <input
                      type="text"
                      placeholder="Entrez le code reçu"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <Button
                    className="w-full text-white py-3"
                    style={{ backgroundColor: methodeSelectionnee.couleur }}
                    onClick={confirmerPaiement}
                    disabled={loading || code.length < 4}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Vérification...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Confirmer le paiement de {rdv.tarif} MRU
                      </span>
                    )}
                  </Button>

                  <button
                    onClick={() => { setCodeEnvoye(false); setCode('') }}
                    className="w-full text-sm text-gray-400 hover:text-gray-600"
                  >
                    Renvoyer le code
                  </button>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-center gap-2">
              <Lock className="w-3 h-3 text-gray-400" />
              <p className="text-xs text-gray-400">Paiement 100% sécurisé</p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}