import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, SafeAreaView,
  StatusBar, ActivityIndicator, Alert, useColorScheme
} from 'react-native'
import { supabase } from './lib/supabase'
import { enregistrerNotifications, envoyerNotificationLocale, programmerRappelRDV } from './lib/notifications'
import * as Notifications from 'expo-notifications'

// ==================== TRADUCTIONS ====================
const T = {
  fr: {
    slogan: '🇲🇷 Plateforme médicale #1 en Mauritanie',
    titre: 'Votre santé,\nnotre priorité',
    sousTitre: 'Prenez rendez-vous avec les meilleurs médecins de Mauritanie en quelques clics.',
    prendreRDV: 'Prendre rendez-vous →', voirMedecins: 'Voir les médecins',
    seConnecter: 'Se connecter', creerCompte: 'Créer un compte gratuit',
    medecins: 'Médecins', patients: 'Patients', specialites: 'Spécialités',
    pourquoi: 'Pourquoi MauriHealth ?',
    f1titre: 'Rendez-vous en ligne', f1desc: 'Réservez en 2 minutes, 24h/24 et 7j/7.',
    f2titre: 'Médecins vérifiés', f2desc: "Tous certifiés par l'Ordre des Médecins.",
    f3titre: 'Rappels automatiques', f3desc: 'Recevez des notifications avant chaque RDV.',
    bonRetour: 'Bon retour !', connectezVous: 'Connectez-vous à votre compte',
    email: 'Email', motDePasse: 'Mot de passe', connexion: 'Se connecter', retour: '← Retour',
    creerUnCompte: 'Créer un compte', rejoignez: 'Rejoignez MauriHealth gratuitement',
    nomComplet: 'Nom complet *', telephone: 'Téléphone',
    jeSuisPatient: 'Patient', jeSuisMedecin: 'Médecin', creerMonCompte: 'Créer mon compte',
    bonjour: 'Bonjour', commentVousSentez: 'Comment vous sentez-vous ?',
    rdvAvenir: 'RDV à venir', termines: 'Terminés', enAttente: 'En attente',
    prendreNouveauRDV: '+ Prendre un rendez-vous', testerNotif: '🔔 Tester notification',
    mesRDV: 'Mes rendez-vous', aucunRDV: '📅 Aucun rendez-vous pour le moment',
    confirme: '✓ Confirmé', attente: '⏳ Attente', termine: '✗ Terminé',
    nosMedecins: 'Nos médecins', chercher: '🔍 Chercher un médecin...',
    prendreRDVBtn: '📅 Prendre RDV', disponible: '● Dispo',
    tableauBord: 'Tableau de bord Admin', vueEnsemble: "Vue d'ensemble",
    totalPatients: 'Total patients', medecinActifs: 'Médecins actifs',
    rdvCeMois: 'RDV ce mois', revenus: 'Revenus (MRU)',
    activer: 'Activer', desactiver: 'Désactiver', valider: 'Valider', refuser: 'Refuser',
    gererMedecins: 'Gérer médecins', activiteRecente: 'Activité récente',
  },
  ar: {
    slogan: '🇲🇷 منصة طبية رقم 1 في موريتانيا',
    titre: 'صحتك،\nأولويتنا',
    sousTitre: 'احجز موعدًا مع أفضل أطباء موريتانيا في بضع نقرات.',
    prendreRDV: 'حجز موعد ←', voirMedecins: 'عرض الأطباء',
    seConnecter: 'تسجيل الدخول', creerCompte: 'إنشاء حساب مجاني',
    medecins: 'أطباء', patients: 'مرضى', specialites: 'تخصصات',
    pourquoi: 'لماذا موريهلث؟',
    f1titre: 'مواعيد إلكترونية', f1desc: 'احجز في دقيقتين، 24/7.',
    f2titre: 'أطباء معتمدون', f2desc: 'جميعهم معتمدون من هيئة الأطباء.',
    f3titre: 'تذكيرات تلقائية', f3desc: 'احصل على إشعارات قبل كل موعد.',
    bonRetour: 'مرحبًا بعودتك!', connectezVous: 'سجّل الدخول إلى حسابك',
    email: 'البريد الإلكتروني', motDePasse: 'كلمة المرور',
    connexion: 'تسجيل الدخول', retour: 'رجوع →',
    creerUnCompte: 'إنشاء حساب', rejoignez: 'انضم إلى موريهلث مجانًا',
    nomComplet: 'الاسم الكامل *', telephone: 'الهاتف',
    jeSuisPatient: 'مريض', jeSuisMedecin: 'طبيب', creerMonCompte: 'إنشاء حسابي',
    bonjour: 'مرحبًا', commentVousSentez: 'كيف تشعر اليوم؟',
    rdvAvenir: 'مواعيد قادمة', termines: 'منتهية', enAttente: 'في الانتظار',
    prendreNouveauRDV: '+ حجز موعد جديد', testerNotif: '🔔 اختبار إشعار',
    mesRDV: 'مواعيدي', aucunRDV: '📅 لا توجد مواعيد حاليًا',
    confirme: '✓ مؤكد', attente: '⏳ انتظار', termine: '✗ منتهي',
    nosMedecins: 'أطباؤنا', chercher: '🔍 البحث عن طبيب...',
    prendreRDVBtn: '📅 حجز موعد', disponible: '● متاح',
    tableauBord: 'لوحة تحكم المسؤول', vueEnsemble: 'نظرة عامة',
    totalPatients: 'إجمالي المرضى', medecinActifs: 'أطباء نشطون',
    rdvCeMois: 'مواعيد هذا الشهر', revenus: 'الإيرادات (MRU)',
    activer: 'تفعيل', desactiver: 'تعطيل', valider: 'قبول', refuser: 'رفض',
    gererMedecins: 'إدارة الأطباء', activiteRecente: 'النشاط الأخير',
  }
}

type Langue = 'fr' | 'ar'
type Theme = 'light' | 'dark'
type Screen = 'home' | 'login' | 'register' | 'dashboard' | 'medecins' | 'admin'

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [langue, setLangue] = useState<Langue>('fr')
  const systemTheme = useColorScheme()
  const [theme, setTheme] = useState<Theme>(systemTheme === 'dark' ? 'dark' : 'light')
  const t = T[langue]
  const isDark = theme === 'dark'
  const estArabe = langue === 'ar'

  const colors = {
    bg: isDark ? '#0f172a' : '#f9fafb',
    card: isDark ? '#1e293b' : '#ffffff',
    text: isDark ? '#f1f5f9' : '#111827',
    subtext: isDark ? '#94a3b8' : '#6b7280',
    border: isDark ? '#334155' : '#f3f4f6',
    input: isDark ? '#1e293b' : '#f9fafb',
    inputBorder: isDark ? '#475569' : '#e5e7eb',
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user) {
        enregistrerNotifications(session.user.id)
        const { data: profile } = await supabase
          .from('profiles').select('role').eq('id', session.user.id).single()
        if (profile?.role === 'admin') setScreen('admin')
        else if (profile?.role === 'medecin') setScreen('dashboard')
        else setScreen('dashboard')
      }
    })

    supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        enregistrerNotifications(session.user.id)
        const { data: profile } = await supabase
          .from('profiles').select('role').eq('id', session.user.id).single()
        if (profile?.role === 'admin') setScreen('admin')
        else setScreen('dashboard')
      }
    })

    const subscription = Notifications.addNotificationReceivedListener(n => console.log('Notif:', n))
    return () => subscription.remove()
  }, [])

  const toggleLangue = () => setLangue(l => l === 'fr' ? 'ar' : 'fr')
  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')
  const logout = () => { supabase.auth.signOut(); setScreen('home') }

  const commonProps = { t, estArabe, isDark, colors, langue, toggleLangue, toggleTheme }

  if (loading) return (
    <View style={[styles.loadingContainer, { backgroundColor: colors.bg }]}>
      <View style={styles.logoBox}><Text style={styles.logoIcon}>♥</Text></View>
      <Text style={[styles.loadingText, { color: colors.text }]}>MauriHealth</Text>
      <ActivityIndicator color="#2563eb" style={{ marginTop: 20 }} />
    </View>
  )

  if (screen === 'home') return <HomeScreen {...commonProps} onLogin={() => setScreen('login')} onRegister={() => setScreen('register')} onMedecins={() => setScreen('medecins')} />
  if (screen === 'login') return <LoginScreen {...commonProps} onBack={() => setScreen('home')} onSuccess={() => setScreen('dashboard')} />
  if (screen === 'register') return <RegisterScreen {...commonProps} onBack={() => setScreen('home')} onSuccess={() => setScreen('dashboard')} />
  if (screen === 'dashboard') return <DashboardScreen {...commonProps} user={user} onLogout={logout} onMedecins={() => setScreen('medecins')} />
  if (screen === 'medecins') return <MedecinsScreen {...commonProps} onBack={() => setScreen(user ? 'dashboard' : 'home')} user={user} />
  if (screen === 'admin') return <AdminScreen {...commonProps} user={user} onLogout={logout} />
  return null
}

// ==================== HOME SCREEN ====================
function HomeScreen({ onLogin, onRegister, onMedecins, t, estArabe, isDark, colors, toggleLangue, toggleTheme }: any) {
  const rtl = estArabe ? { textAlign: 'right' as const, writingDirection: 'rtl' as const } : {}
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
      <ScrollView>
        <View style={styles.hero}>
          {/* Boutons langue et thème */}
          <View style={styles.topBtns}>
            <TouchableOpacity onPress={toggleLangue} style={styles.langBtn}>
              <Text style={styles.langBtnText}>{estArabe ? '🇫🇷 FR' : '🇲🇷 ع'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleTheme} style={styles.langBtn}>
              <Text style={styles.langBtnText}>{isDark ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.logoBox}><Text style={styles.logoIcon}>♥</Text></View>
          <Text style={styles.logoText}>Mauri<Text style={{ color: '#93c5fd' }}>Health</Text></Text>
          <View style={styles.badge}><Text style={[styles.badgeText, rtl]}>{t.slogan}</Text></View>
          <Text style={[styles.heroTitle, rtl]}>{t.titre}</Text>
          <Text style={[styles.heroSubtitle, rtl]}>{t.sousTitre}</Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={onRegister}>
            <Text style={styles.btnPrimaryText}>{t.prendreRDV}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecondary} onPress={onMedecins}>
            <Text style={styles.btnSecondaryText}>{t.voirMedecins}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.statsRow, { backgroundColor: colors.card }]}>
          {[
            { valeur: '200+', label: t.medecins },
            { valeur: '5k+', label: t.patients },
            { valeur: '15+', label: t.specialites },
          ].map((s, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={styles.statValeur}>{s.valeur}</Text>
              <Text style={[styles.statLabel, { color: colors.subtext }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: colors.bg }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }, estArabe && { textAlign: 'right' }]}>{t.pourquoi}</Text>
          {[
            { icon: '📅', titre: t.f1titre, desc: t.f1desc },
            { icon: '🛡️', titre: t.f2titre, desc: t.f2desc },
            { icon: '🔔', titre: t.f3titre, desc: t.f3desc },
          ].map((item, i) => (
            <View key={i} style={[styles.featureCard, { backgroundColor: colors.card, flexDirection: estArabe ? 'row-reverse' : 'row' }]}>
              <Text style={styles.featureIcon}>{item.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.featureTitle, { color: colors.text }, estArabe && { textAlign: 'right' }]}>{item.titre}</Text>
                <Text style={[styles.featureDesc, { color: colors.subtext }, estArabe && { textAlign: 'right' }]}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.authSection, { backgroundColor: colors.bg }]}>
          <TouchableOpacity style={styles.btnPrimary} onPress={onLogin}>
            <Text style={styles.btnPrimaryText}>{t.seConnecter}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnOutline, { borderColor: '#2563eb' }]} onPress={onRegister}>
            <Text style={styles.btnOutlineText}>{t.creerCompte}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// ==================== LOGIN SCREEN ====================
function LoginScreen({ onBack, onSuccess, t, estArabe, isDark, colors }: any) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const rtl = estArabe ? { textAlign: 'right' as const } : {}

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Erreur', 'Remplissez tous les champs'); return }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) Alert.alert('Erreur', 'Email ou mot de passe incorrect')
    else onSuccess()
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.authContainer}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>{t.retour}</Text>
        </TouchableOpacity>
        <View style={styles.logoBox}><Text style={styles.logoIcon}>♥</Text></View>
        <Text style={[styles.authTitle, { color: colors.text }, rtl]}>{t.bonRetour}</Text>
        <Text style={[styles.authSubtitle, { color: colors.subtext }, rtl]}>{t.connectezVous}</Text>
        <View style={[styles.formCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.inputLabel, { color: colors.subtext }, rtl]}>{t.email}</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }]}
            placeholder="votre@email.com" placeholderTextColor={colors.subtext}
            value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"
            textAlign={estArabe ? 'right' : 'left'}
          />
          <Text style={[styles.inputLabel, { color: colors.subtext }, rtl]}>{t.motDePasse}</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }]}
            placeholder="••••••••" placeholderTextColor={colors.subtext}
            value={password} onChangeText={setPassword} secureTextEntry
            textAlign={estArabe ? 'right' : 'left'}
          />
          <TouchableOpacity style={[styles.btnPrimary, { marginTop: 8 }]} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnPrimaryText}>{t.connexion}</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// ==================== REGISTER SCREEN ====================
function RegisterScreen({ onBack, onSuccess, t, estArabe, isDark, colors }: any) {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' })
  const [role, setRole] = useState<'patient' | 'medecin'>('patient')
  const [loading, setLoading] = useState(false)
  const rtl = estArabe ? { textAlign: 'right' as const } : {}

  const handleRegister = async () => {
    if (!form.fullName || !form.email || !form.password) {
      Alert.alert('Erreur', 'Remplissez tous les champs obligatoires'); return
    }
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { data: { full_name: form.fullName, phone: form.phone, role } }
    })
    if (error) { Alert.alert('Erreur', error.message); setLoading(false); return }
    if (data.user) {
      await supabase.from('profiles').insert({ id: data.user.id, email: form.email, full_name: form.fullName, phone: form.phone, role })
      if (role === 'patient') await supabase.from('patients').insert({ profile_id: data.user.id })
    }
    setLoading(false)
    await envoyerNotificationLocale('🎉 Bienvenue sur MauriHealth !', 'Votre compte a été créé avec succès.', 2)
    onSuccess()
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.authContainer}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>{t.retour}</Text>
        </TouchableOpacity>
        <View style={styles.logoBox}><Text style={styles.logoIcon}>♥</Text></View>
        <Text style={[styles.authTitle, { color: colors.text }, rtl]}>{t.creerUnCompte}</Text>
        <Text style={[styles.authSubtitle, { color: colors.subtext }, rtl]}>{t.rejoignez}</Text>
        <View style={[styles.formCard, { backgroundColor: colors.card }]}>
          <View style={styles.roleRow}>
            {(['patient', 'medecin'] as const).map(r => (
              <TouchableOpacity key={r} style={[styles.roleBtn, { borderColor: colors.inputBorder }, role === r && styles.roleBtnActive]} onPress={() => setRole(r)}>
                <Text style={styles.roleIcon}>{r === 'patient' ? '👤' : '👨‍⚕️'}</Text>
                <Text style={[styles.roleBtnText, { color: colors.subtext }, role === r && { color: '#2563eb' }]}>
                  {r === 'patient' ? t.jeSuisPatient : t.jeSuisMedecin}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {[
            { label: t.nomComplet, key: 'fullName', placeholder: 'Mohamed Ould Ahmed', kb: 'default' },
            { label: t.email, key: 'email', placeholder: 'votre@email.com', kb: 'email-address' },
            { label: t.telephone, key: 'phone', placeholder: '+222 XX XX XX XX', kb: 'phone-pad' },
            { label: t.motDePasse, key: 'password', placeholder: '••••••••', kb: 'default', secure: true },
          ].map((field: any) => (
            <View key={field.key}>
              <Text style={[styles.inputLabel, { color: colors.subtext }, rtl]}>{field.label}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }]}
                placeholder={field.placeholder} placeholderTextColor={colors.subtext}
                value={form[field.key as keyof typeof form]}
                onChangeText={v => setForm({ ...form, [field.key]: v })}
                keyboardType={field.kb} secureTextEntry={field.secure}
                autoCapitalize="none" textAlign={estArabe ? 'right' : 'left'}
              />
            </View>
          ))}
          <TouchableOpacity style={[styles.btnPrimary, { marginTop: 8 }]} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnPrimaryText}>{t.creerMonCompte}</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// ==================== DASHBOARD SCREEN ====================
function DashboardScreen({ user, onLogout, onMedecins, t, estArabe, isDark, colors, toggleLangue, toggleTheme }: any) {
  const [profile, setProfile] = useState<any>(null)
  const [rendezvous, setRendezvous] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) chargerDonnees() }, [user])

  const chargerDonnees = async () => {
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfile(profileData)
    const { data: patientData } = await supabase.from('patients').select('id').eq('profile_id', user.id).single()
    if (patientData) {
      const { data: rdvData } = await supabase.from('appointments')
        .select('*, medecins(specialite, hopital, profiles(full_name))')
        .eq('patient_id', patientData.id).order('date_heure', { ascending: true })
      setRendezvous(rdvData || [])
    }
    setLoading(false)
  }

  const testerNotif = async () => {
    await envoyerNotificationLocale('🏥 MauriHealth', "Votre rendez-vous de demain approche !", 3)
    Alert.alert('✅', 'Notification dans 3 secondes !')
  }

  const prenom = profile?.full_name?.split(' ')[0] || 'vous'
  const rtl = estArabe ? { textAlign: 'right' as const } : {}

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView>
        <View style={[styles.dashHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View>
            <Text style={[styles.dashGreeting, { color: colors.text }, rtl]}>{t.bonjour}, {prenom} 👋</Text>
            <Text style={[styles.dashSubtitle, { color: colors.subtext }, rtl]}>{t.commentVousSentez}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={toggleLangue} style={[styles.iconBtn, { backgroundColor: isDark ? '#334155' : '#f1f5f9' }]}>
              <Text style={{ fontSize: 14 }}>{estArabe ? '🇫🇷' : '🇲🇷'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleTheme} style={[styles.iconBtn, { backgroundColor: isDark ? '#334155' : '#f1f5f9' }]}>
              <Text style={{ fontSize: 14 }}>{isDark ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>⏻</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsRowDash}>
          {[
            { label: t.rdvAvenir, valeur: rendezvous.filter(r => r.statut !== 'termine').length.toString(), bg: '#eff6ff', color: '#2563eb' },
            { label: t.termines, valeur: rendezvous.filter(r => r.statut === 'termine').length.toString(), bg: '#f0fdf4', color: '#16a34a' },
            { label: t.enAttente, valeur: rendezvous.filter(r => r.statut === 'en_attente').length.toString(), bg: '#fff7ed', color: '#ea580c' },
          ].map((s, i) => (
            <View key={i} style={[styles.statCardDash, { backgroundColor: s.bg }]}>
              <Text style={[styles.statValeurDash, { color: s.color }]}>{s.valeur}</Text>
              <Text style={[styles.statLabelDash, rtl]}>{s.label}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={[styles.btnPrimary, { margin: 16, marginBottom: 8 }]} onPress={onMedecins}>
          <Text style={styles.btnPrimaryText}>{t.prendreNouveauRDV}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btnPrimary, { marginHorizontal: 16, marginBottom: 16, backgroundColor: '#16a34a' }]} onPress={testerNotif}>
          <Text style={styles.btnPrimaryText}>{t.testerNotif}</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }, rtl]}>{t.mesRDV}</Text>
          {loading ? <ActivityIndicator color="#2563eb" /> :
            rendezvous.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.emptyText, { color: colors.subtext }]}>{t.aucunRDV}</Text>
              </View>
            ) : rendezvous.map((rdv) => (
              <View key={rdv.id} style={[styles.rdvCard, { backgroundColor: colors.card, flexDirection: estArabe ? 'row-reverse' : 'row' }]}>
                <View style={styles.rdvAvatar}>
                  <Text style={styles.rdvAvatarText}>{rdv.medecins?.profiles?.full_name?.[0] || 'M'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rdvMedecin, { color: colors.text }, rtl]}>{rdv.medecins?.profiles?.full_name || 'Médecin'}</Text>
                  <Text style={[styles.rdvSpec, rtl]}>{rdv.medecins?.specialite}</Text>
                  <Text style={[styles.rdvDate, { color: colors.subtext }, rtl]}>
                    📅 {new Date(rdv.date_heure).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </Text>
                  <Text style={[styles.rdvHeure, { color: colors.subtext }, rtl]}>
                    🕐 {new Date(rdv.date_heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <View style={[styles.statutBadge, {
                  backgroundColor: rdv.statut === 'confirme' ? '#f0fdf4' : rdv.statut === 'en_attente' ? '#fff7ed' : '#f9fafb'
                }]}>
                  <Text style={[styles.statutText, {
                    color: rdv.statut === 'confirme' ? '#16a34a' : rdv.statut === 'en_attente' ? '#ea580c' : '#6b7280'
                  }]}>
                    {rdv.statut === 'confirme' ? t.confirme : rdv.statut === 'en_attente' ? t.attente : t.termine}
                  </Text>
                </View>
              </View>
            ))
          }
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// ==================== MEDECINS SCREEN ====================
function MedecinsScreen({ onBack, user, t, estArabe, isDark, colors }: any) {
  const [medecins, setMedecins] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [rdvLoading, setRdvLoading] = useState<string | null>(null)

  useEffect(() => { chargerMedecins() }, [])

  const chargerMedecins = async () => {
    const { data } = await supabase.from('medecins').select('*, profiles(full_name, phone)').eq('disponible', true)
    setMedecins(data || [])
    setLoading(false)
  }

  const prendreRDV = async (medecin: any) => {
    if (!user) { Alert.alert('Connexion requise', 'Connectez-vous pour prendre un rendez-vous'); return }
    setRdvLoading(medecin.id)
    try {
      const { data: patientData } = await supabase.from('patients').select('id').eq('profile_id', user.id).single()
      let patientId = patientData?.id
      if (!patientId) {
        const { data: newPatient } = await supabase.from('patients').insert({ profile_id: user.id }).select('id').single()
        patientId = newPatient?.id
      }
      const dateRDV = new Date()
      dateRDV.setDate(dateRDV.getDate() + 3)
      dateRDV.setHours(9, 0, 0, 0)
      await supabase.from('appointments').insert({
        patient_id: patientId, medecin_id: medecin.id,
        date_heure: dateRDV.toISOString(), motif: 'Consultation générale', statut: 'en_attente',
      })
      await envoyerNotificationLocale('✅ RDV confirmé !', `Votre rendez-vous avec ${medecin.profiles?.full_name} a été enregistré`, 1)
      await programmerRappelRDV(medecin.profiles?.full_name || 'votre médecin', dateRDV)
      Alert.alert('✅ Rendez-vous enregistré !', `RDV avec ${medecin.profiles?.full_name}\nDans 3 jours à 09:00`, [{ text: 'OK' }])
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de créer le rendez-vous')
    } finally { setRdvLoading(null) }
  }

  const filtered = medecins.filter(m =>
    m.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.specialite?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.medHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack}><Text style={styles.backBtnText}>{t.retour}</Text></TouchableOpacity>
        <Text style={[styles.medHeaderTitle, { color: colors.text }]}>{t.nosMedecins}</Text>
        <View style={{ width: 60 }} />
      </View>
      <TextInput
        style={[styles.searchInput, { backgroundColor: colors.card, borderColor: colors.inputBorder, color: colors.text }]}
        placeholder={t.chercher} placeholderTextColor={colors.subtext}
        value={search} onChangeText={setSearch}
        textAlign={estArabe ? 'right' : 'left'}
      />
      <ScrollView>
        {loading ? <ActivityIndicator color="#2563eb" style={{ marginTop: 40 }} /> :
          filtered.map((m) => (
            <View key={m.id} style={[styles.medecinCard, { backgroundColor: colors.card, flexDirection: estArabe ? 'row-reverse' : 'row' }]}>
              <View style={styles.medecinAvatar}>
                <Text style={styles.medecinAvatarText}>{m.profiles?.full_name?.split(' ')[1]?.[0] || 'M'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.medecinNom, { color: colors.text }]}>{m.profiles?.full_name}</Text>
                <Text style={styles.medecinSpec}>{m.specialite}</Text>
                <Text style={[styles.medecinHopital, { color: colors.subtext }]}>🏥 {m.hopital}</Text>
                <Text style={[styles.medecinVille, { color: colors.subtext }]}>📍 {m.ville}</Text>
                <Text style={[styles.medecinTarif, { color: colors.text }]}>💰 {m.tarif_consultation} MRU</Text>
                <TouchableOpacity
                  style={[styles.btnRDV, rdvLoading === m.id && { opacity: 0.6 }]}
                  onPress={() => prendreRDV(m)} disabled={rdvLoading === m.id}
                >
                  {rdvLoading === m.id ? <ActivityIndicator color="white" size="small" /> :
                    <Text style={styles.btnRDVText}>{t.prendreRDVBtn}</Text>}
                </TouchableOpacity>
              </View>
              <View style={styles.dispoBadge}><Text style={styles.dispoText}>{t.disponible}</Text></View>
            </View>
          ))
        }
      </ScrollView>
    </SafeAreaView>
  )
}

// ==================== ADMIN SCREEN ====================
function AdminScreen({ user, onLogout, t, estArabe, isDark, colors, toggleLangue, toggleTheme }: any) {
  const [medecins, setMedecins] = useState<any[]>([])
  const [stats, setStats] = useState({ patients: 0, medecins: 0, rdv: 0 })
  const [loading, setLoading] = useState(true)
  const rtl = estArabe ? { textAlign: 'right' as const } : {}

  useEffect(() => { chargerDonnees() }, [])

  const chargerDonnees = async () => {
    const [{ count: pCount }, { count: mCount }, { count: rCount }, { data: medecinData }] = await Promise.all([
      supabase.from('patients').select('*', { count: 'exact', head: true }),
      supabase.from('medecins').select('*', { count: 'exact', head: true }),
      supabase.from('appointments').select('*', { count: 'exact', head: true }),
      supabase.from('medecins').select('*, profiles(full_name, email)').order('created_at', { ascending: false }),
    ])
    setStats({ patients: pCount || 0, medecins: mCount || 0, rdv: rCount || 0 })
    setMedecins(medecinData || [])
    setLoading(false)
  }

  const toggleDisponibilite = async (id: string, actuel: boolean) => {
    await supabase.from('medecins').update({ disponible: !actuel }).eq('id', id)
    chargerDonnees()
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView>
        {/* HEADER ADMIN */}
        <View style={[styles.dashHeader, { backgroundColor: '#1e40af', borderBottomColor: '#1d4ed8' }]}>
          <View>
            <Text style={[styles.dashGreeting, { color: 'white' }, rtl]}>⚙️ {t.tableauBord}</Text>
            <Text style={[styles.dashSubtitle, { color: '#bfdbfe' }, rtl]}>{t.vueEnsemble}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={toggleLangue} style={[styles.iconBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={{ fontSize: 14 }}>{estArabe ? '🇫🇷' : '🇲🇷'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleTheme} style={[styles.iconBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={{ fontSize: 14 }}>{isDark ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>⏻</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* STATS ADMIN */}
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
            <View style={[styles.adminStatCard, { backgroundColor: '#eff6ff' }]}>
              <Text style={[styles.adminStatVal, { color: '#2563eb' }]}>{stats.patients}</Text>
              <Text style={[styles.adminStatLabel, rtl]}>{t.totalPatients}</Text>
            </View>
            <View style={[styles.adminStatCard, { backgroundColor: '#f0fdf4' }]}>
              <Text style={[styles.adminStatVal, { color: '#16a34a' }]}>{stats.medecins}</Text>
              <Text style={[styles.adminStatLabel, rtl]}>{t.medecinActifs}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={[styles.adminStatCard, { backgroundColor: '#fdf4ff' }]}>
              <Text style={[styles.adminStatVal, { color: '#9333ea' }]}>{stats.rdv}</Text>
              <Text style={[styles.adminStatLabel, rtl]}>{t.rdvCeMois}</Text>
            </View>
            <View style={[styles.adminStatCard, { backgroundColor: '#fffbeb' }]}>
              <Text style={[styles.adminStatVal, { color: '#d97706' }]}>--</Text>
              <Text style={[styles.adminStatLabel, rtl]}>{t.revenus}</Text>
            </View>
          </View>
        </View>

        {/* LISTE MÉDECINS */}
        <View style={[styles.section]}>
          <Text style={[styles.sectionTitle, { color: colors.text }, rtl]}>{t.gererMedecins}</Text>
          {loading ? <ActivityIndicator color="#2563eb" /> :
            medecins.map((m) => (
              <View key={m.id} style={[styles.adminMedCard, { backgroundColor: colors.card, flexDirection: estArabe ? 'row-reverse' : 'row' }]}>
                <View style={[styles.medecinAvatar, { width: 44, height: 44 }]}>
                  <Text style={[styles.medecinAvatarText, { fontSize: 16 }]}>{m.profiles?.full_name?.split(' ')[1]?.[0] || 'M'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.medecinNom, { color: colors.text }, rtl]}>{m.profiles?.full_name}</Text>
                  <Text style={[styles.medecinSpec, rtl]}>{m.specialite}</Text>
                  <Text style={[styles.medecinHopital, { color: colors.subtext }, rtl]}>🏥 {m.hopital}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.adminToggleBtn, { backgroundColor: m.disponible ? '#f0fdf4' : '#fef2f2' }]}
                  onPress={() => toggleDisponibilite(m.id, m.disponible)}
                >
                  <Text style={[styles.adminToggleText, { color: m.disponible ? '#16a34a' : '#ef4444' }]}>
                    {m.disponible ? t.desactiver : t.activer}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          }
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 24, fontWeight: 'bold', marginTop: 12 },
  hero: { backgroundColor: '#2563eb', padding: 24, paddingTop: 48, alignItems: 'center' },
  topBtns: { flexDirection: 'row', gap: 8, marginBottom: 16, alignSelf: 'flex-end' },
  langBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16 },
  langBtnText: { color: 'white', fontSize: 13, fontWeight: '600' },
  logoBox: { width: 56, height: 56, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  logoIcon: { fontSize: 28, color: 'white' },
  logoText: { fontSize: 22, fontWeight: 'bold', color: 'white', marginBottom: 12 },
  badge: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 16 },
  badgeText: { color: 'white', fontSize: 12 },
  heroTitle: { fontSize: 32, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 12, lineHeight: 40 },
  heroSubtitle: { fontSize: 15, color: '#bfdbfe', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  btnPrimary: { backgroundColor: '#2563eb', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 24, alignItems: 'center', marginBottom: 12 },
  btnPrimaryText: { color: 'white', fontSize: 15, fontWeight: '600' },
  btnSecondary: { backgroundColor: 'white', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 24, alignItems: 'center', marginBottom: 24 },
  btnSecondaryText: { color: '#2563eb', fontSize: 15, fontWeight: '600' },
  btnOutline: { borderWidth: 1.5, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 24, alignItems: 'center', marginBottom: 12 },
  btnOutlineText: { color: '#2563eb', fontSize: 15, fontWeight: '600' },
  btnRDV: { backgroundColor: '#2563eb', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, alignItems: 'center', marginTop: 8 },
  btnRDVText: { color: 'white', fontSize: 12, fontWeight: '600' },
  statsRow: { flexDirection: 'row', paddingVertical: 20 },
  statItem: { flex: 1, alignItems: 'center' },
  statValeur: { fontSize: 24, fontWeight: 'bold', color: '#2563eb' },
  statLabel: { fontSize: 12, marginTop: 2 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  featureCard: { borderRadius: 16, padding: 16, marginBottom: 10, alignItems: 'center', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  featureIcon: { fontSize: 28 },
  featureTitle: { fontSize: 14, fontWeight: '600' },
  featureDesc: { fontSize: 12, marginTop: 2 },
  authContainer: { padding: 24, alignItems: 'center' },
  authTitle: { fontSize: 24, fontWeight: 'bold', marginTop: 12 },
  authSubtitle: { fontSize: 14, marginTop: 4, marginBottom: 24 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 16 },
  backBtnText: { color: '#2563eb', fontSize: 15 },
  formCard: { borderRadius: 20, padding: 20, width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  inputLabel: { fontSize: 13, fontWeight: '500', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  roleBtn: { flex: 1, borderWidth: 2, borderRadius: 12, padding: 12, alignItems: 'center' },
  roleBtnActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  roleIcon: { fontSize: 24, marginBottom: 4 },
  roleBtnText: { fontSize: 13, fontWeight: '500' },
  authSection: { padding: 16, paddingTop: 0 },
  dashHeader: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1 },
  dashGreeting: { fontSize: 20, fontWeight: 'bold' },
  dashSubtitle: { fontSize: 13, marginTop: 2 },
  iconBtn: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  logoutBtn: { width: 36, height: 36, backgroundColor: '#fee2e2', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  logoutText: { fontSize: 18, color: '#ef4444' },
  statsRowDash: { flexDirection: 'row', gap: 10, padding: 16 },
  statCardDash: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center' },
  statValeurDash: { fontSize: 22, fontWeight: 'bold' },
  statLabelDash: { fontSize: 11, color: '#6b7280', marginTop: 2, textAlign: 'center' },
  emptyCard: { borderRadius: 16, padding: 24, alignItems: 'center' },
  emptyText: { fontSize: 14 },
  rdvCard: { borderRadius: 16, padding: 14, marginBottom: 10, alignItems: 'flex-start', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  rdvAvatar: { width: 44, height: 44, backgroundColor: '#dbeafe', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  rdvAvatarText: { fontSize: 18, fontWeight: 'bold', color: '#2563eb' },
  rdvMedecin: { fontSize: 14, fontWeight: '600' },
  rdvSpec: { fontSize: 12, color: '#2563eb', marginTop: 1 },
  rdvDate: { fontSize: 11, marginTop: 4 },
  rdvHeure: { fontSize: 11, marginTop: 1 },
  statutBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statutText: { fontSize: 11, fontWeight: '500' },
  medHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
  medHeaderTitle: { fontSize: 16, fontWeight: 'bold' },
  searchInput: { margin: 16, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, borderWidth: 1.5 },
  medecinCard: { borderRadius: 16, padding: 14, marginHorizontal: 16, marginBottom: 10, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  medecinAvatar: { width: 52, height: 52, backgroundColor: '#dbeafe', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  medecinAvatarText: { fontSize: 22, fontWeight: 'bold', color: '#2563eb' },
  medecinNom: { fontSize: 14, fontWeight: 'bold' },
  medecinSpec: { fontSize: 12, color: '#2563eb', marginTop: 1 },
  medecinHopital: { fontSize: 11, marginTop: 3 },
  medecinVille: { fontSize: 11 },
  medecinTarif: { fontSize: 12, fontWeight: '600', marginTop: 3 },
  dispoBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  dispoText: { fontSize: 11, color: '#16a34a', fontWeight: '500' },
  adminStatCard: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center' },
  adminStatVal: { fontSize: 28, fontWeight: 'bold' },
  adminStatLabel: { fontSize: 11, color: '#6b7280', marginTop: 4, textAlign: 'center' },
  adminMedCard: { borderRadius: 16, padding: 12, marginBottom: 10, gap: 10, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  adminToggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  adminToggleText: { fontSize: 12, fontWeight: '600' },
})