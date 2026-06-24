import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const translations = {
  tr: {
    focus: 'Mumu Yak',
    giveUp: 'Mumu Söndür',
    sessionComplete: 'Harikasın',
    greatJob: 'Zamanın nasıl geçtiğini anlamadık bile. Mumun çok güzel eridi, tebrikler!',
    ok: 'Harika',
    yourJourney: 'Yolculuğun',
    currentStreak: 'Yanma Serisi',
    days: 'Gün',
    keepFlameAlive: 'İçindeki alevi hep böyle canlı tut!',
    sessions: 'Tamamlanan Seans',
    focusTime: 'Toplam Odaklanma',
    recentActivity: 'Odaklanma Geçmişi',
    noSessions: 'Henüz bir başlangıç yapmadın, mumu yakmaya ne dersin?',
    settings: 'Ayarlar',
    language: 'Uygulama Dili',
    turkish: 'Türkçe',
    english: 'İngilizce',
    rain: 'Yağmur',
    forest: 'Orman',
    night: 'Gece',
    ocean: 'Deniz',
    silence: 'Sessizlik',
    onboarding1Title: 'İçindeki Alevi Yak',
    onboarding1Desc: 'Sadece sana ait bir zaman dilimi. Telefonu bırak, mumu yak ve erimesini izlerken hedeflerine odaklan.',
    onboarding2Title: 'Atmosferini Seç',
    onboarding2Desc: 'Gece sessizliği, yağmur sesleri veya okyanus dalgaları... Sana en uygun arka plan sesini seç.',
    onboarding3Title: 'Odaklanma Serini Koru',
    onboarding3Desc: 'Her gün mumu yakarak zinciri kırma, kendi istatistiklerini takip et.',
    startJourney: 'İlk Mumu Yak',
    next: 'İleri',
    resetOnboarding: 'Tanıtımı Tekrar Göster',
    secShort: 'sn',
    minShort: 'dk',
    hourShort: 'sa',
    notifications: 'Bildirimler',
    timerNotifications: 'Zamanlayıcı Bildirimleri',
    motivationalReminders: 'Motivasyon Hatırlatıcıları',
    reminderTitle: 'İçindeki Alevi Yak 🔥',
    reminderBody: 'Bugün mumu henüz yakmadın. Hedeflerine odaklanmak için kendine biraz zaman ayır!'
  },
  en: {
    focus: 'Light the Candle',
    giveUp: 'Blow it Out',
    sessionComplete: 'You Did It!',
    greatJob: 'Time flew by! Your candle melted beautifully, well done!',
    ok: 'Awesome',
    yourJourney: 'Your Journey 🌟',
    currentStreak: 'Burning Streak',
    days: 'Days',
    keepFlameAlive: 'Keep that inner fire burning!',
    sessions: 'Completed Sessions',
    focusTime: 'Total Focus Time',
    recentActivity: 'Focus History',
    noSessions: 'You haven\'t lit a candle yet. Ready to start?',
    settings: 'Settings',
    language: 'App Language',
    turkish: 'Turkish',
    english: 'English',
    rain: 'Rain',
    forest: 'Forest',
    night: 'Night',
    ocean: 'Ocean',
    silence: 'Silence',
    onboarding1Title: 'Light Your Inner Flame',
    onboarding1Desc: 'Time just for you. Put down the phone, light the candle, and focus on your goals while watching it melt.',
    onboarding2Title: 'Choose Your Atmosphere',
    onboarding2Desc: 'Night silence, rain drops, or ocean waves... Choose the background sound that fits you best.',
    onboarding3Title: 'Keep Your Streak Alive',
    onboarding3Desc: 'Don\'t break the chain. Light the candle every day and track your personal statistics.',
    startJourney: 'Start Your Journey',
    next: 'Next',
    resetOnboarding: 'Show Onboarding Again',
    secShort: 's',
    minShort: 'm',
    hourShort: 'h',
    notifications: 'Notifications',
    timerNotifications: 'Timer Notifications',
    motivationalReminders: 'Motivational Reminders',
    reminderTitle: 'Light Your Inner Flame 🔥',
    reminderBody: 'You haven\'t lit the candle today. Take some time for yourself to focus on your goals!'
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('tr'); // Default is TR
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadLang = async () => {
      try {
        const savedLang = await AsyncStorage.getItem('@language');
        if (savedLang) {
          setLanguage(savedLang);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsReady(true);
      }
    };
    loadLang();
  }, []);

  const changeLanguage = async (lang) => {
    setLanguage(lang);
    await AsyncStorage.setItem('@language', lang);
  };

  const t = (key) => translations[language][key] || key;

  if (!isReady) return null; // Wait for initial load

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
