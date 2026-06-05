import Link from 'next/link'
import { Heart, Shield, Clock, Users, MapPin, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">

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
      <section className="bg-gradient-to-br from-blue-50 via-white to-green-50 py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            À propos de <span className="text-blue-600">MauriHealth</span>
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed">
            MauriHealth est la première plateforme médicale numérique de Mauritanie,
            connectant patients et médecins pour des soins de qualité accessibles à tous.
          </p>
        </div>
      </section>

      {/* MISSION */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Notre mission</h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                Rendre les soins de santé accessibles à chaque mauritanien, où qu'il soit.
                Nous croyons que la technologie peut transformer le système de santé en Mauritanie
                en facilitant l'accès aux médecins qualifiés.
              </p>
              <p className="text-gray-500 leading-relaxed">
                Fondée en 2026 à Nouakchott, MauriHealth travaille avec les meilleurs médecins
                du pays pour offrir une expérience médicale moderne et de confiance.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { valeur: '200+', label: 'Médecins certifiés' },
                { valeur: '5000+', label: 'Patients satisfaits' },
                { valeur: '15+', label: 'Spécialités' },
                { valeur: '4', label: 'Villes couvertes' },
              ].map((stat, i) => (
                <div key={i} className="bg-blue-50 rounded-2xl p-5 text-center">
                  <p className="text-3xl font-bold text-blue-600">{stat.valeur}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* VALEURS */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Nos valeurs</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Shield className="w-6 h-6 text-blue-600" />, titre: 'Confiance', desc: 'Tous nos médecins sont vérifiés et certifiés par l\'Ordre des Médecins de Mauritanie.' },
              { icon: <Clock className="w-6 h-6 text-green-600" />, titre: 'Accessibilité', desc: 'Prenez rendez-vous 24h/24 et 7j/7, depuis votre téléphone ou ordinateur.' },
              { icon: <Users className="w-6 h-6 text-purple-600" />, titre: 'Communauté', desc: 'Nous construisons un réseau de santé solidaire pour tous les mauritaniens.' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.titre}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Contactez-nous</h2>
          <p className="text-gray-500 mb-8">Une question ? Notre équipe est là pour vous aider.</p>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { icon: <Phone className="w-5 h-5 text-blue-600" />, label: 'Téléphone', valeur: '+222 XX XX XX XX' },
              { icon: <Mail className="w-5 h-5 text-blue-600" />, label: 'Email', valeur: 'contact@maurihealth.mr' },
              { icon: <MapPin className="w-5 h-5 text-blue-600" />, label: 'Adresse', valeur: 'Nouakchott, Mauritanie' },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-5">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  {item.icon}
                </div>
                <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                <p className="text-sm font-semibold text-gray-900">{item.valeur}</p>
              </div>
            ))}
          </div>
          <Link href="/register">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8">
              Rejoindre MauriHealth
            </Button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 text-center">
        <p className="text-sm">© 2026 MauriHealth. Tous droits réservés. Fait avec ❤️ en Mauritanie</p>
      </footer>

    </div>
  )
}