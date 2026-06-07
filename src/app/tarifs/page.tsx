'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import {
  Heart, Check, Crown, Zap, ArrowRight,
  Lock, CheckCircle, TrendingUp, Users,
  Calendar, Clock, Star, Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TarifsPage() {
  const [planActuel, setPlanActuel] = useState<string>('essai')
  const [joursRestants, setJoursRestants] = useState<number>(30)
  const [loading, setLoading] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [stats, setStats] = useState({ rdvHonores: 0, commissionsTotal: 0 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    chargerInfos()
  }, [])

  const chargerInfos = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: medecin } = await supabase
      .from('medecins')
      .select('plan, essai_fin, abonnement_fin, rdv_honores, id')
      .eq('profile_id', user.id)
      .single()

    if (medecin) {
      setPlanActuel(medecin.plan || 'essai')

      if (medecin.essai_fin) {
        const fin = new Date(medecin.essai_fin)
        const diff = Math.ceil((fin.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        setJoursRestants(Math.max(0, diff))
      }

      // Charger les stats commissions
      const { data: commissions } = await supabase
        .from('commissions')
        .select('montant, statut')
        .eq('medecin_id', medecin.id)

      const total = commissions?.filter(c => c.statut === 'paye')
        .reduce((sum, c) => sum + c.montant, 0) || 0

      setStats({
        rdvHonores: medecin.rdv_honores || 0,
        commissionsTotal: total,
      })
    }
  }

  const souscrire = async (plan: 'saas' | 'commission') => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }

    setLoading(plan)
    try {
      const { data: medecin } = await supabase
        .from('medecins').select('id').eq('profile_id', user.id).single()

      if (!medecin) { alert('Profil médecin introuvable'); return }

      const debut = new Date()
      const fin = new Date()
      fin.setMonth(fin.getMonth() + 1)

      await supabase.from('abonnements').insert({
        medecin_id: medecin.id,
        plan,
        montant: plan === 'saas' ? 1500 : 0,
        statut: 'actif',
        debut: debut.toISOString().split('T')[0],
        fin: plan === 'saas' ? fin.toISOString().split('T')[0] : null,
        methode_paiement: 'bankily',
      })

      await supabase.from('medecins').update({
        plan,
        abonnement_debut: debut.toISOString().split('T')[0],
        abonnement_fin: plan === 'saas' ? fin.toISOString().split('T')[0] : null,
      }).eq('id', medecin.id)

      setPlanActuel(plan)
      setSuccess(plan)
    } catch (err) {
      alert('Erreur lors de la souscription')
    } finally {
      setLoading(null)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {success === 'saas' ? '🎉 Abonnement activé !' : '🤝 Commission activée !'}
          </h2>
          <p className="text-gray-500 mb-6">
            {success === 'saas'
              ? 'Votre abonnement SaaS de 1 500 MRU/mois est actif.'
              : 'Vous payez 150 MRU uniquement par rendez-vous honoré.'}
          </p>
          <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left space-y-2">
            {success === 'saas' ? [
              { label: 'Plan', valeur: 'SaaS Fixe' },
              { label: 'Montant', valeur: '1 500 MRU/mois' },
              { label: 'RDV', valeur: 'Illimités' },
              { label: 'Renouvellement', valeur: 'Dans 30 jours' },
            ] : [
              { label: 'Plan', valeur: 'Commission Performance' },
              { label: 'Commission', valeur: '150 MRU / RDV honoré' },
              { label: 'Engagement', valeur: 'Aucun' },
              { label: 'Facturation', valeur: 'À la performance' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-500">{item.label}</span>
                <span className="font-semibold text-gray-900">{item.valeur}</span>
              </div>
            ))}
          </div>
          <Link href="/dashboard/medecin">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Aller à mon dashboard →
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
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Mauri<span className="text-blue-600">Health</span></span>
          </Link>
          <Link href="/dashboard/medecin">
            <Button variant="ghost" size="sm">← Mon dashboard</Button>
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-500 bg-opacity-50 text-white text-sm px-4 py-2 rounded-full mb-6">
            <Star className="w-4 h-4" />
            Modèle de revenus MauriHealth
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Commencez gratuitement.<br />
            <span className="text-blue-200">Payez selon votre succès.</span>
          </h1>
          <p className="text-blue-200 text-lg mb-8">
            30 jours d'essai gratuit — aucune carte bancaire requise
          </p>

          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { icon: <Users className="w-5 h-5" />, valeur: '100+', label: 'Médecins cibles' },
              { icon: <TrendingUp className="w-5 h-5" />, valeur: '150k MRU', label: 'Revenus/mois' },
              { icon: <Shield className="w-5 h-5" />, valeur: '99.3%', label: 'Marge nette' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="flex justify-center text-blue-300 mb-1">{s.icon}</div>
                <p className="text-xl font-bold text-white">{s.valeur}</p>
                <p className="text-xs text-blue-200">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* ESSAI GRATUIT BANNER */}
        {planActuel === 'essai' && (
          <div className={`rounded-2xl p-5 mb-8 border-2 flex items-center justify-between ${
            joursRestants > 10
              ? 'bg-green-50 border-green-200'
              : joursRestants > 0
                ? 'bg-orange-50 border-orange-200'
                : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                joursRestants > 10 ? 'bg-green-100' : joursRestants > 0 ? 'bg-orange-100' : 'bg-red-100'
              }`}>
                <Clock className={`w-5 h-5 ${
                  joursRestants > 10 ? 'text-green-600' : joursRestants > 0 ? 'text-orange-600' : 'text-red-600'
                }`} />
              </div>
              <div>
                <p className="font-bold text-gray-900">
                  {joursRestants > 0
                    ? `🎉 Période d'essai gratuit — ${joursRestants} jours restants`
                    : '⚠️ Votre essai gratuit est terminé'}
                </p>
                <p className="text-sm text-gray-500">
                  {joursRestants > 0
                    ? 'Profitez de toutes les fonctionnalités sans engagement'
                    : 'Choisissez un plan pour continuer à recevoir des rendez-vous'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-600">{joursRestants}j</p>
              <p className="text-xs text-gray-400">restants</p>
            </div>
          </div>
        )}

        {/* PLANS */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">

          {/* PLAN ESSAI */}
          <div className={`relative bg-white rounded-2xl p-6 shadow-sm border-2 ${
            planActuel === 'essai' ? 'border-green-400' : 'border-gray-200'
          }`}>
            {planActuel === 'essai' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-green-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                  ✓ Plan actuel
                </span>
              </div>
            )}
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Essai Gratuit</h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-3xl font-bold text-gray-900">0</span>
              <span className="text-gray-400 text-sm">MRU / 30 jours</span>
            </div>
            <p className="text-xs text-gray-400 mb-6">Aucune carte bancaire requise</p>
            <ul className="space-y-3 mb-6">
              {[
                { texte: 'Accès complet 30 jours', ok: true },
                { texte: 'Gestion des créneaux', ok: true },
                { texte: 'Rendez-vous illimités', ok: true },
                { texte: 'Automatisation WhatsApp', ok: true },
                { texte: 'Support standard', ok: true },
                { texte: 'Après 30j — choix du plan', ok: false },
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  {f.ok
                    ? <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    : <ArrowRight className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  }
                  <span className={f.ok ? 'text-gray-700' : 'text-blue-500 font-medium'}>{f.texte}</span>
                </li>
              ))}
            </ul>
            <Button className="w-full bg-gray-100 text-gray-500" disabled>
              {joursRestants > 0 ? `${joursRestants} jours restants` : 'Essai terminé'}
            </Button>
          </div>

          {/* PLAN SAAS */}
          <div className={`relative bg-white rounded-2xl p-6 shadow-lg border-2 scale-105 ${
            planActuel === 'saas' ? 'border-blue-600' : 'border-blue-300'
          }`}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                {planActuel === 'saas' ? '✓ Plan actuel' : '⭐ Recommandé'}
              </span>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Abonnement SaaS</h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-3xl font-bold text-blue-600">1 500</span>
              <span className="text-gray-400 text-sm">MRU/mois</span>
            </div>
            <p className="text-xs text-gray-400 mb-6">Facturation mensuelle récurrente</p>
            <ul className="space-y-3 mb-6">
              {[
                { texte: 'Accès complet illimité', ok: true },
                { texte: 'Gestion créneaux avancée', ok: true },
                { texte: 'Rendez-vous illimités', ok: true },
                { texte: 'Automatisation WhatsApp', ok: true },
                { texte: 'Rappels SMS patients', ok: true },
                { texte: 'Statistiques et rapports', ok: true },
                { texte: 'Support prioritaire', ok: true },
                { texte: 'Badge médecin vérifié ✓', ok: true },
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{f.texte}</span>
                </li>
              ))}
            </ul>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
              onClick={() => souscrire('saas')}
              disabled={loading === 'saas' || planActuel === 'saas'}
            >
              {loading === 'saas' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : planActuel === 'saas' ? '✓ Plan actuel' : (
                <>S'abonner à 1 500 MRU/mois <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </div>

          {/* PLAN COMMISSION */}
          <div className={`relative bg-white rounded-2xl p-6 shadow-sm border-2 ${
            planActuel === 'commission' ? 'border-amber-400' : 'border-amber-200'
          }`}>
            {planActuel === 'commission' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-amber-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                  ✓ Plan actuel
                </span>
              </div>
            )}
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
              <Crown className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Commission Performance</h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-3xl font-bold text-amber-500">150</span>
              <span className="text-gray-400 text-sm">MRU / RDV honoré</span>
            </div>
            <p className="text-xs text-gray-400 mb-6">Payez uniquement quand ça marche</p>

            {/* Stats commissions si actif */}
            {planActuel === 'commission' && (
              <div className="bg-amber-50 rounded-xl p-3 mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">RDV honorés</span>
                  <span className="font-bold text-amber-600">{stats.rdvHonores}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total commissions</span>
                  <span className="font-bold text-amber-600">{stats.commissionsTotal} MRU</span>
                </div>
              </div>
            )}

            <ul className="space-y-3 mb-6">
              {[
                { texte: 'Aucun abonnement fixe', ok: true },
                { texte: 'Accès complet à la plateforme', ok: true },
                { texte: 'Gestion des créneaux', ok: true },
                { texte: '150 MRU / RDV honoré seulement', ok: true },
                { texte: 'Aucun engagement', ok: true },
                { texte: 'Facturation transparente', ok: true },
                { texte: 'Support standard', ok: true },
                { texte: 'Badge médecin vérifié ✓', ok: false },
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  {f.ok
                    ? <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    : <Lock className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  }
                  <span className={f.ok ? 'text-gray-700' : 'text-gray-400'}>{f.texte}</span>
                </li>
              ))}
            </ul>
            <Button
              className="w-full bg-amber-500 hover:bg-amber-600 text-white gap-2"
              onClick={() => souscrire('commission')}
              disabled={loading === 'commission' || planActuel === 'commission'}
            >
              {loading === 'commission' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : planActuel === 'commission' ? '✓ Plan actuel' : (
                <>Choisir ce plan <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </div>
        </div>

        {/* SIMULATION FINANCIÈRE */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-2">📊 Simulation financière MauriHealth</h2>
          <p className="text-blue-200 mb-6">Objectif : 100 professionnels de santé actifs à Nouakchott</p>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { label: 'Médecins actifs', valeur: '100', unite: 'professionnels', icon: '👨‍⚕️', bg: 'bg-blue-500' },
              { label: 'Revenus récurrents', valeur: '150 000', unite: 'MRU / mois', icon: '💰', bg: 'bg-green-500' },
              { label: 'Coûts infrastructure', valeur: '< 1 000', unite: 'MRU / mois', icon: '☁️', bg: 'bg-purple-500' },
              { label: 'Marge opérationnelle', valeur: '99.3%', unite: 'nette', icon: '📈', bg: 'bg-amber-500' },
            ].map((item, i) => (
              <div key={i} className={`${item.bg} bg-opacity-30 rounded-xl p-4 text-center`}>
                <p className="text-2xl mb-1">{item.icon}</p>
                <p className="text-2xl font-bold text-white">{item.valeur}</p>
                <p className="text-xs text-blue-200">{item.unite}</p>
                <p className="text-xs text-blue-300 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-blue-900 bg-opacity-50 rounded-xl">
            <p className="text-sm text-blue-200 text-center">
              📌 Calcul : 100 médecins × 1 500 MRU = <strong className="text-white">150 000 MRU/mois</strong> —
              Infrastructure Cloud : <strong className="text-white">&lt; 1 000 MRU/mois</strong> —
              Marge nette : <strong className="text-white">~99.3%</strong>
            </p>
          </div>
        </div>

        {/* COMPARAISON */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Quel plan vous convient ?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-5 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-6 h-6 text-blue-600" />
                <h3 className="font-bold text-gray-900">SaaS 1 500 MRU/mois</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Idéal si vous avez <strong>plus de 10 RDV/mois</strong>. Économique et prévisible.
              </p>
              <div className="text-xs text-gray-500 space-y-1">
                <p>✓ 10 RDV = 1 500 MRU vs 1 500 MRU (égal)</p>
                <p>✓ 20 RDV = 1 500 MRU vs 3 000 MRU (<strong className="text-green-600">-50%</strong>)</p>
                <p>✓ 50 RDV = 1 500 MRU vs 7 500 MRU (<strong className="text-green-600">-80%</strong>)</p>
              </div>
            </div>
            <div className="p-5 bg-amber-50 rounded-xl border border-amber-100">
              <div className="flex items-center gap-3 mb-3">
                <Crown className="w-6 h-6 text-amber-500" />
                <h3 className="font-bold text-gray-900">Commission 150 MRU/RDV</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Idéal si vous <strong>démarrez</strong> ou avez moins de 10 RDV/mois. Aucun risque.
              </p>
              <div className="text-xs text-gray-500 space-y-1">
                <p>✓ 5 RDV = 750 MRU vs 1 500 MRU (<strong className="text-green-600">-50%</strong>)</p>
                <p>✓ 10 RDV = 1 500 MRU vs 1 500 MRU (égal)</p>
                <p>⚠️ 20 RDV = 3 000 MRU vs 1 500 MRU (SaaS préférable)</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Questions fréquentes</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { q: "L'essai est-il vraiment gratuit ?", r: "Oui, 30 jours 100% gratuits. Aucune carte bancaire requise. Accès complet à toutes les fonctionnalités." },
              { q: "Puis-je changer de plan ?", r: "Oui, à tout moment. Le changement prend effet immédiatement." },
              { q: "Comment payer l'abonnement ?", r: "Via Bankily, Masrvi ou Sedad. Paiement mobile mauritanien simplifié." },
              { q: "Comment sont comptées les commissions ?", r: "Uniquement les RDV honorés (patient présent). Les annulations ne sont pas comptées." },
              { q: "Y a-t-il un engagement ?", r: "Aucun engagement. Annulez à tout moment sans frais." },
              { q: "Que se passe-t-il après l'essai ?", r: "Vous choisissez SaaS ou Commission. Sans choix, votre profil est mis en pause." },
            ].map((item, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-xl">
                <p className="font-semibold text-gray-900 text-sm mb-2">❓ {item.q}</p>
                <p className="text-gray-500 text-sm">{item.r}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}