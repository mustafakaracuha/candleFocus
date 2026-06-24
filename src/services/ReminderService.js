import { AppState } from 'react-native';
import notifee, { TriggerType } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNotificationSettings } from './StorageService';
import { translations } from '../context/LanguageContext';

class ReminderService {
  constructor() {
    this.appState = AppState.currentState;
    this.appStateSubscription = null;
  }

  init() {
    // Listen for app state changes
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
  }

  destroy() {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
  }

  handleAppStateChange = async (nextAppState) => {
    // Transition from foreground to background
    if (this.appState === 'active' && nextAppState.match(/inactive|background/)) {
      await this.scheduleReminder();
    }
    // Transition from background to foreground
    else if (this.appState.match(/inactive|background/) && nextAppState === 'active') {
      await this.cancelReminder();
    }
    
    this.appState = nextAppState;
  };

  async scheduleReminder() {
    try {
      const settings = await getNotificationSettings();
      // If the user disabled motivational reminders, do nothing.
      if (!settings.motivationalReminders) return;

      // Determine language
      const langKey = await AsyncStorage.getItem('@CandleFocus:language') || 'tr';
      const t = translations[langKey] || translations['tr'];

      // Schedule a trigger notification for 24 hours from now
      const trigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        // timestamp: Date.now() + 10 * 1000, // For quick testing (10 secs)
      };
      
      await notifee.createTriggerNotification(
        {
          id: 'motivational-reminder',
          title: t.reminderTitle,
          body: t.reminderBody,
          android: {
            channelId: 'focus-timer',
            pressAction: { id: 'default' },
          },
        },
        trigger,
      );
    } catch (e) {
      console.log('Failed to schedule motivational reminder', e);
    }
  }

  async cancelReminder() {
    try {
      await notifee.cancelNotification('motivational-reminder');
    } catch (e) {
      console.log('Failed to cancel motivational reminder', e);
    }
  }
}

export default new ReminderService();
