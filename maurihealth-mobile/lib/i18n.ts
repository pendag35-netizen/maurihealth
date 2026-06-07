import { useState } from 'react'

type Langue = 'fr' | 'ar'

export const traductions = {
  fr: {
    // HOME
    slogan: 'Plateforme médicale #1 en Mauritanie',
    titre: 'Votre santé,\nnotre priorité',
    sousTitre: 'Prenez rendez-vous avec les meilleurs médecins de Mauritanie en quelques clics.',
    prendreRDV: 'Prendre rendez-vous →',
    voirMedecins: 'Voir les médecins',
    seConnecter: 'Se connecter',
    creerCompte: 'Créer un compte gratuit',
    medecins: 'Médecins',
    patients: 'Patients',
    specialites: 'Spécialités',
    pourquoi: 'Pourquoi MauriHealth ?',
    rdvEnLigne: 'Rendez-vous en ligne',
    rdvDesc: 'Réservez en 2 minutes, 24h/24 et 7j/7.',
    medecinVerifies: 'Médecins vérifiés',
    medecinVerifiesDesc: "Tous certifiés par l'Ordre des Médecins.",
    rappels: 'Rappels automatiques',
    rappelsDesc: 'Recevez des notifications avant chaque RDV.',

    // LOGIN
    bonRetour: 'Bon retour !',
    connectezVous: 'Connectez-vous à votre compte',
    email: 'Email',
    motDePasse: 'Mot de passe',
    connexion: 'Se connecter',
    retour: '← Retour',

    // REGISTER
    creerUnCompte: 'Créer un compte',
    rejoignez: 'Rejoignez MauriHealth gratuitement',
    nomComplet: 'Nom complet *',
    telephone: 'Téléphone',
    jeSuisPatient: 'Je suis patient',
    jeSuisMedecin: 'Je suis médecin',
    creerMonCompte: 'Créer mon compte',

    // DASHBOARD
    bonjour: 'Bonjour',
    commentVousSentez: 'Comment vous sentez-vous ?',
    rdvAvenir: 'RDV à venir',
    termines: 'Terminés',
    enAttente: 'En attente',
    prendreNouveauRDV: '+ Prendre un rendez-vous',
    testerNotification: '🔔 Tester une notification',
    mesRendezVous: 'Mes rendez-vous',
    aucunRDV: '📅 Aucun rendez-vous pour le moment',
    confirme: '✓ Confirmé',
    attente: '⏳ Attente',
    termine: '✗ Terminé',

    // MÉDECINS
    nosMedecins: 'Nos médecins',
    chercher: '🔍 Chercher un médecin...',
    prendreRDVBtn: '📅 Prendre RDV',
    disponible: '● Dispo',
  },

  ar: {
    // HOME
    slogan: 'منصة طبية رقم 1 في موريتانيا',
    titre: 'صحتك،\nأولويتنا',
    sousTitre: 'احجز موعدًا مع أفضل أطباء موريتانيا في بضع نقرات.',
    prendreRDV: 'حجز موعد ←',
    voirMedecins: 'عرض الأطباء',
    seConnecter: 'تسجيل الدخول',
    creerCompte: 'إنشاء حساب مجاني',
    medecins: 'أطباء',
    patients: 'مرضى',
    specialites: 'تخصصات',
    pourquoi: 'لماذا موريهلث؟',
    rdvEnLigne: 'مواعيد إلكترونية',
    rdvDesc: 'احجز في دقيقتين، 24/7.',
    medecinVerifies: 'أطباء معتمدون',
    medecinVerifiesDesc: 'جميعهم معتمدون من هيئة الأطباء.',
    rappels: 'تذكيرات تلقائية',
    rappelsDesc: 'احصل على إشعارات قبل كل موعد.',

    // LOGIN
    bonRetour: 'مرحبًا بعودتك!',
    connectezVous: 'سجّل الدخول إلى حسابك',
    email: 'البريد الإلكتروني',
    motDePasse: 'كلمة المرور',
    connexion: 'تسجيل الدخول',
    retour: 'رجوع →',

    // REGISTER
    creerUnCompte: 'إنشاء حساب',
    rejoignez: 'انضم إلى موريهلث مجانًا',
    nomComplet: 'الاسم الكامل *',
    telephone: 'الهاتف',
    jeSuisPatient: 'أنا مريض',
    jeSuisMedecin: 'أنا طبيب',
    creerMonCompte: 'إنشاء حسابي',

    // DASHBOARD
    bonjour: 'مرحبًا',
    commentVousSentez: 'كيف تشعر اليوم؟',
    rdvAvenir: 'مواعيد قادمة',
    termines: 'منتهية',
    enAttente: 'في الانتظار',
    prendreNouveauRDV: '+ حجز موعد جديد',
    testerNotification: '🔔 اختبار إشعار',
    mesRendezVous: 'مواعيدي',
    aucunRDV: '📅 لا توجد مواعيد حاليًا',
    confirme: '✓ مؤكد',
    attente: '⏳ انتظار',
    termine: '✗ منتهي',

    // MÉDECINS
    nosMedecins: 'أطباؤنا',
    chercher: '🔍 البحث عن طبيب...',
    prendreRDVBtn: '📅 حجز موعد',
    disponible: '● متاح',
  }
}

// Hook pour utiliser les traductions
export function useLangue() {
  const [langue, setLangue] = useState<Langue>('fr')
  const t = traductions[langue]
  const estArabe = langue === 'ar'

  const changerLangue = () => {
    setLangue(prev => prev === 'fr' ? 'ar' : 'fr')
  }

  return { langue, t, estArabe, changerLangue }
}