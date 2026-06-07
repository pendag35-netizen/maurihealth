import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { Platform } from 'react-native'
import { supabase } from './supabase'

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

// Demander la permission et obtenir le token
export async function enregistrerNotifications(userId: string) {
  if (!Device.isDevice) {
    console.log('Les notifications ne marchent que sur un vrai téléphone')
    return null
  }

  // Demander la permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    console.log('Permission refusée pour les notifications')
    return null
  }

  // Obtenir le token push
  const projectId = Constants.expoConfig?.extra?.eas?.projectId
  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data

  console.log('Token push:', token)

  // Sauvegarder le token dans Supabase
  if (token && userId) {
    await supabase
      .from('profiles')
      .update({ push_token: token })
      .eq('id', userId)
  }

  // Config spéciale Android
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('maurihealth', {
      name: 'MauriHealth',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2563eb',
      sound: 'default',
    })
  }

  return token
}

// Envoyer une notification locale
export async function envoyerNotificationLocale(
  titre: string,
  corps: string,
  delaiSecondes: number = 0
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: titre,
      body: corps,
      sound: 'default',
      data: { app: 'maurihealth' },
    },
    trigger: delaiSecondes > 0
      ? { seconds: delaiSecondes }
      : null,
  })
}

// Programmer un rappel de RDV
export async function programmerRappelRDV(
  nomMedecin: string,
  dateRDV: Date
) {
  const maintenant = new Date()
  const unJourAvant = new Date(dateRDV.getTime() - 24 * 60 * 60 * 1000)
  const uneHeureAvant = new Date(dateRDV.getTime() - 60 * 60 * 1000)

  // Rappel 24h avant
  if (unJourAvant > maintenant) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📅 Rappel rendez-vous demain',
        body: `Vous avez un RDV avec ${nomMedecin} demain à ${dateRDV.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
        sound: 'default',
      },
      trigger: { date: unJourAvant },
    })
  }

  // Rappel 1h avant
  if (uneHeureAvant > maintenant) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ RDV dans 1 heure !',
        body: `Votre rendez-vous avec ${nomMedecin} commence dans 1 heure`,
        sound: 'default',
      },
      trigger: { date: uneHeureAvant },
    })
  }
}

// Annuler toutes les notifications
export async function annulerToutesNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync()
}