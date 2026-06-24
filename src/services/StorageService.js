import AsyncStorage from '@react-native-async-storage/async-storage';

const STATS_KEY = '@CandleFocus:stats';
const SESSIONS_KEY = '@CandleFocus:sessions';

export const getStats = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STATS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : {
      currentStreak: 0,
      totalSessions: 0,
      totalFocusTime: 0,
      lastSessionDate: null,
    };
  } catch (e) {
    console.error("Failed to load stats", e);
    return null;
  }
};

export const saveSession = async (durationInSeconds) => {
  try {
    const stats = await getStats();
    const today = new Date().toDateString();
    
    if (stats.lastSessionDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (stats.lastSessionDate === yesterday.toDateString()) {
        stats.currentStreak += 1;
      } else {
        stats.currentStreak = 1; 
      }
      stats.lastSessionDate = today;
    }

    stats.totalSessions += 1;
    stats.totalFocusTime += durationInSeconds;

    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));

    const sessionRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      duration: durationInSeconds
    };
    
    const historyJson = await AsyncStorage.getItem(SESSIONS_KEY);
    const history = historyJson ? JSON.parse(historyJson) : [];
    
    history.unshift(sessionRecord);
    if (history.length > 50) history.pop(); // Keep only 50 most recent sessions
    
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(history));
    
    return stats;
  } catch (e) {
    console.error("Failed to save session", e);
  }
};

export const getHistory = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(SESSIONS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Failed to load history", e);
    return [];
  }
};

const ONBOARDING_KEY = '@CandleFocus:onboarding';

export const getHasSeenOnboarding = async () => {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === 'true';
  } catch (e) {
    console.error("Failed to check onboarding", e);
    return false;
  }
};

export const setHasSeenOnboarding = async () => {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  } catch (e) {
    console.error("Failed to set onboarding status", e);
  }
};

export const clearOnboarding = async () => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
  } catch (e) {
    console.error("Failed to clear onboarding status", e);
  }
};

const SETTINGS_KEY = '@CandleFocus:settings';

export const getNotificationSettings = async () => {
  try {
    const value = await AsyncStorage.getItem(SETTINGS_KEY);
    if (value) {
      return JSON.parse(value);
    }
    return {
      timerNotifications: true,
      motivationalReminders: true
    };
  } catch (e) {
    console.error("Failed to get notification settings", e);
    return { timerNotifications: true, motivationalReminders: true };
  }
};

export const saveNotificationSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save notification settings", e);
  }
};
