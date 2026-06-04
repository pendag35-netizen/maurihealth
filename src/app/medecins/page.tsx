'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { Heart, Search, MapPin, Star, Clock, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function MedecinsPage() {
  const [search, setSearch] = useState('')
  const [specialiteFilter, setSpecialiteFilter] = useState('tous')
  const [medecins, setMedecins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const specialites = ['tous', 'Cardiologie', 'Pédiatrie', 'Gynécologie', 'Dermatologie', 'Médecine Générale', 'Neurologie']

  useEffect(() => {
    chargerMedecins()
  }, [])

  const chargerMedecins = async () => {
    try {
      const { data, error } = await supabase
        .from('medecins')
        .select(`
          *,
          profiles (
            full_name,
            email,
            phone
          )
        `)
        .eq('disponible', true)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMedecins(data || [])
    } catch (err) {
      console.error('Erreur:', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = medecins.filter(m => {
    const nom = m.profiles?.full_name || ''
    const matchSearch = nom.toLowerCase().includes(search.toLowerCase()) ||
      m.specialite.toLowerCase().includes(search.toLowerCase()) ||
      m.hopital.toLowerCase().includes(search.toLowerCase())
    const matchSpec = specialiteFilter === 'tous' || m.specialite === specialiteFilter
    return matchSearch && matchSpec
  })

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
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Trouvez votre médecin</h1>
          <p className="text-blue-200 mb-8">Plus de 200 médecins certifiés en Mauritanie</p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Médecin, spécialité, hôpital..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* FILTRES */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {specialites.map((spec) => (
            <button
              key={spec}
              onClick={() => setSpecialiteFilter(spec)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                specialiteFilter === spec
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
              }`}
            >
              {spec === 'tous' ? '🏥 Tous' : spec}
            </button>
          ))}
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-14 h-14 bg-gray-200 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{filtered.length} médecin(s) trouvé(s)</p>
            <div className="grid md:grid-cols-2 gap-4">
              {filtered.map((m) => (
                <div key={m.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 font-bold text-xl">
                        {m.profiles?.full_name?.split(' ')[1]?.[0] || 'M'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{m.profiles?.full_name}</p>
                        <p className="text-sm text-blue-600">{m.specialite}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs font-semibold">4.8</span>
                          <span className="text-xs text-gray-400">(+50 avis)</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-50 text-green-600">
                      ● Disponible
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      {m.hopital} • {m.ville}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      Lun - Ven • 08:00 - 17:00
                    </div>
                  </div>

                  {m.bio && (
                    <p className="text-xs text-gray-400 mb-4 line-clamp-2">{m.bio}</p>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                      <span className="text-lg font-bold text-gray-900">{m.tarif_consultation}</span>
                      <span className="text-xs text-gray-400 ml-1">MRU / consultation</span>
                    </div>
                    <Link href={`/medecins/${m.id}`}>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1 text-xs">
                        Prendre RDV <ChevronRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">😔 Aucun médecin trouvé</p>
                <p className="text-gray-400 text-sm mt-1">Essayez une autre recherche</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}