import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SpecialitesPage() {
  const specialites = [
    { nom: 'Cardiologie', icon: '❤️', desc: 'Maladies du cœur et des vaisseaux sanguins', medecins: 12 },
    { nom: 'Pédiatrie', icon: '👶', desc: 'Santé des enfants de 0 à 16 ans', medecins: 8 },
    { nom: 'Gynécologie', icon: '🌸', desc: 'Santé féminine et suivi de grossesse', medecins: 10 },
    { nom: 'Dermatologie', icon: '✨', desc: 'Maladies de la peau, cheveux et ongles', medecins: 6 },
    { nom: 'Ophtalmologie', icon: '👁️', desc: 'Santé des yeux et troubles de la vision', medecins: 5 },
    { nom: 'Neurologie', icon: '🧠', desc: 'Maladies du système nerveux', medecins: 4 },
    { nom: 'Médecine Générale', icon: '🏥', desc: 'Consultation générale et suivi médical', medecins: 20 },
    { nom: 'Orthopédie', icon: '🦴', desc: 'Maladies des os, muscles et articulations', medecins: 7 },
    { nom: 'Psychiatrie', icon: '🧘', desc: 'Santé mentale et troubles psychologiques', medecins: 4 },
    { nom: 'Radiologie', icon: '🔬', desc: 'Imagerie médicale et diagnostic', medecins: 5 },
    { nom: 'ORL', icon: '👂', desc: 'Oreille, nez et gorge', medecins: 6 },
    { nom: 'Urologie', icon: '💊', desc: 'Maladies des voies urinaires', medecins: 4 },
  ]

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
            <Link href="/login">
              <Button variant="ghost" size="sm">Connexion</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-blue-600 text-white">S'inscrire</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 py-16 px-4 text-center">
        <h1 className="text-4xl font-bold text-white mb-3">Nos spécialités médicales</h1>
        <p className="text-blue-200 text-lg max-w-xl mx-auto">
          Des médecins certifiés dans toutes les spécialités pour prendre soin de votre santé
        </p>
      </div>

      {/* SPÉCIALITÉS */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          {specialites.map((s, i) => (
            <Link href={`/medecins?specialite=${s.nom}`} key={i}>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
                <span className="text-4xl mb-4 block">{s.icon}</span>
                <h3 className="font-bold text-gray-900 mb-2">{s.nom}</h3>
                <p className="text-sm text-gray-500 mb-4">{s.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-600 font-medium">{s.medecins} médecins</span>
                  <span className="text-xs text-gray-400">Voir →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}