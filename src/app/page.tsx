import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Shield, Clock, MapPin, Star, ArrowRight, Phone, Heart } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function HomePage() {
  const specialites = [
    { nom: 'Cardiologie', icon: '❤️', medecins: 12 },
    { nom: 'Pédiatrie', icon: '👶', medecins: 8 },
    { nom: 'Gynécologie', icon: '🌸', medecins: 10 },
    { nom: 'Dermatologie', icon: '✨', medecins: 6 },
    { nom: 'Ophtalmologie', icon: '👁️', medecins: 5 },
    { nom: 'Neurologie', icon: '🧠', medecins: 4 },
  ]

  const medecins = [
    { nom: 'Dr. Fatima Mint Ahmed', specialite: 'Cardiologue', hopital: 'CHN Nouakchott', note: 4.9, avis: 124 },
    { nom: 'Dr. Mohamed Ould Salem', specialite: 'Pédiatre', hopital: 'Clinique El Wafa', note: 4.8, avis: 98 },
    { nom: 'Dr. Mariem Bint Cheikh', specialite: 'Gynécologue', hopital: 'Polyclinique Capitale', note: 4.7, avis: 87 },
  ]

  return (
    <main className="min-h-screen bg-white">

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Mauri<span className="text-blue-600">Health</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/medecins" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">Médecins</Link>
            <Link href="/specialites" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">Spécialités</Link>
            <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">À propos</Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm">Connexion</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">S'inscrire</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-green-50 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-700 border-0 px-4 py-1">
            🇲🇷 Plateforme médicale #1 en Mauritanie
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Votre santé,<br />
            <span className="text-blue-600">notre priorité</span>
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
            Prenez rendez-vous avec les meilleurs médecins de Mauritanie en quelques clics. Rapide, simple et sécurisé.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 gap-2">
                Prendre rendez-vous <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/medecins">
              <Button size="lg" variant="outline" className="px-8">Voir les médecins</Button>
            </Link>
          </div>
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div>
              <p className="text-3xl font-bold text-blue-600">200+</p>
              <p className="text-sm text-gray-500 mt-1">Médecins</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600">5k+</p>
              <p className="text-sm text-gray-500 mt-1">Patients</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600">15+</p>
              <p className="text-sm text-gray-500 mt-1">Spécialités</p>
            </div>
          </div>
        </div>
      </section>

      {/* POURQUOI MAURIHEALTH */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Pourquoi MauriHealth ?</h2>
          <p className="text-center text-gray-500 mb-12">La façon la plus simple de gérer votre santé</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Calendar className="w-6 h-6 text-blue-600" />, titre: 'Rendez-vous en ligne', desc: 'Réservez en 2 minutes, 24h/24 et 7j/7, sans attente.' },
              { icon: <Shield className="w-6 h-6 text-green-600" />, titre: 'Médecins vérifiés', desc: "Tous nos médecins sont certifiés par l'Ordre des Médecins de Mauritanie." },
              { icon: <Clock className="w-6 h-6 text-purple-600" />, titre: 'Rappels automatiques', desc: 'Recevez des SMS de rappel avant chaque rendez-vous.' },
            ].map((item, i) => (
              <Card key={i} className="border-0 shadow-sm hover:shadow-md transition-shadow p-2">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.titre}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SPÉCIALITÉS */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Nos spécialités</h2>
          <p className="text-center text-gray-500 mb-12">Trouvez le bon spécialiste pour votre besoin</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {specialites.map((s, i) => (
              <Link href="/medecins" key={i}>
                <Card className="border-0 shadow-sm hover:shadow-md hover:border-blue-200 border transition-all cursor-pointer">
                  <CardContent className="pt-6 flex items-center gap-4">
                    <span className="text-3xl">{s.icon}</span>
                    <div>
                      <p className="font-semibold dark:text-gray-900 text-sm">{s.nom}</p>
                      <p className="text-xs text-gray-400">{s.medecins} médecins</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* MÉDECINS */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Médecins populaires</h2>
          <p className="text-center text-gray-500 mb-12">Les mieux notés par nos patients</p>
          <div className="grid md:grid-cols-3 gap-6">
            {medecins.map((m, i) => (
              <Card key={i} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl font-bold text-blue-600">
                      {m.nom.split(' ')[1][0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{m.nom}</p>
                      <p className="text-xs text-blue-600">{m.specialite}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-400">{m.hopital}</span>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-semibold">{m.note}</span>
                      <span className="text-xs text-gray-400">({m.avis} avis)</span>
                    </div>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                      Réserver
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Prêt à prendre soin de vous ?</h2>
          <p className="text-blue-100 mb-8">Inscrivez-vous gratuitement et prenez votre premier rendez-vous aujourd'hui.</p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-8">
              Commencer gratuitement
            </Button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold">MauriHealth</span>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <p className="text-white font-semibold mb-3 text-sm">Plateforme</p>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Médecins</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Spécialités</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Rendez-vous</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold mb-3 text-sm">Légal</p>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Confidentialité</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Conditions</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold mb-3 text-sm">Contact</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><Phone className="w-3 h-3" /> +222 XX XX XX XX</li>
                <li>contact@maurihealth.mr</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-xs">
            <p>© 2026 MauriHealth. Tous droits réservés. Fait avec ❤️ en Mauritanie</p>
          </div>
        </div>
      </footer>

    </main>
  )
}