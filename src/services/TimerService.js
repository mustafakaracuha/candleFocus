import BackgroundTimer from 'react-native-background-timer';
import notifee, { TriggerType, AndroidImportance } from '@notifee/react-native';
import { AppState } from 'react-native';
import { getNotificationSettings } from './StorageService';

class TimerService {
  constructor() {
    this.intervalId = null;
    this.onTick = null;
    this.onComplete = null;
    this.timeRemaining = 0;
    this.notificationTitle = 'Süre Doldu!';
    this.notificationBody = 'Harika, mum eridi! 🎉';
  }

  async setupNotifications() {
    await notifee.requestPermission();
    await notifee.createChannel({
      id: 'focus-timer',
      name: 'Focus Timer',
      importance: AndroidImportance.HIGH,
    });
  }

  setNotificationText(title, body) {
    this.notificationTitle = title || 'Süre Doldu!';
    this.notificationBody = body || 'Harika, mum eridi!';
  }

  async start(durationInSeconds, onTickCallback, onCompleteCallback, notificationTitle, notificationBody) {
    this.timeRemaining = durationInSeconds;
    this.onTick = onTickCallback;
    this.onComplete = onCompleteCallback;
    this.notificationTitle = notificationTitle || 'Süre Doldu! 🎉';
    this.notificationBody = notificationBody || 'Harika, mum eridi!';

    const settings = await getNotificationSettings();

    // Schedule a trigger notification for the exact end time + 4 seconds (for candle extinguish animation)
    if (settings.timerNotifications) {
      try {
        const trigger = {
          type: TriggerType.TIMESTAMP,
          timestamp: Date.now() + (durationInSeconds + 4) * 1000,
        };
        
        await notifee.createTriggerNotification(
          {
            id: 'focus-timer-end',
            title: this.notificationTitle,
            body: this.notificationBody,
            android: {
              channelId: 'focus-timer',
              pressAction: { id: 'default' },
            },
          },
          trigger,
        );
      } catch (e) {
        console.log('Failed to schedule trigger notification', e);
      }
    }

    // Start background timer to update UI
    this.intervalId = BackgroundTimer.setInterval(() => {
      if (this.timeRemaining > 0) {
        this.timeRemaining -= 1;
        if (this.onTick) this.onTick(this.timeRemaining);
      }

      if (this.timeRemaining <= 0) {
        this.stop(false); // Natural completion
        if (this.onComplete) this.onComplete();
      }
    }, 1000);
  }

  async stop(isManualCancel = true) {
    if (this.intervalId) {
      BackgroundTimer.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    // We only cancel the scheduled notification if:
    // 1. The user manually clicked "Give Up" (isManualCancel = true)
    // 2. OR the timer finished naturally but the user is actively in the app (so we show in-app alert instead)
    if (isManualCancel || AppState.currentState === 'active') {
      try {
        await notifee.cancelNotification('focus-timer-end');
      } catch (e) {
        console.log('Failed to cancel trigger notification', e);
      }
    }
  }
}

export default new TimerService();
