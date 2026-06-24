import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Alert } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import colors from '../../theme/colors';
import Candle from '../../components/Candle';
import TimerDisplay from '../../components/TimerDisplay';
import { BarChart2, Settings, CloudRain, TreePine, Moon, Waves, VolumeX } from 'lucide-react-native';
import TimerService from '../../services/TimerService';
import { saveSession } from '../../services/StorageService';
import { useLanguage } from '../../context/LanguageContext';
import Video from 'react-native-video';

const SOUND_SOURCES = {
  rain: require('../../assets/rain.mp3'),
  forest: require('../../assets/forest.mp3'),
  ocean: require('../../assets/ocean.mp3'),
  night: require('../../assets/night.mp3'),
};

const { width } = Dimensions.get('window');
const DURATIONS = [10, 25, 45, 60]; // 10 is seconds for testing, rest are minutes

const HomeScreen = ({ navigation }) => {
  const [selectedDuration, setSelectedDuration] = useState(10); // Start with 10s test
  const [timeRemaining, setTimeRemaining] = useState(10);
  const [isActive, setIsActive] = useState(false);
  const [isTimerHidden, setIsTimerHidden] = useState(false);
  const [selectedAtmosphere, setSelectedAtmosphere] = useState('silence');
  const [lighterPlaying, setLighterPlaying] = useState(false);
  const [atmospherePlaying, setAtmospherePlaying] = useState(false);
  
  const { t } = useLanguage();

  const opacity = useSharedValue(1);

  useEffect(() => {
    TimerService.setupNotifications();
    return () => TimerService.stop(); // Cleanup on unmount
  }, []);

  const handleStart = () => {
    setIsActive(true);
    setLighterPlaying(true);
    
    // Play atmosphere after lighter sound finishes
    setTimeout(() => {
      setAtmospherePlaying(true);
    }, 2000);
    
    // Automatically hide lighter component after 2 seconds to prevent re-play on re-renders
    setTimeout(() => {
      setLighterPlaying(false);
    }, 2000);

    opacity.value = withTiming(0, { duration: 2000 }); // Fade out controls
    
    TimerService.start(
      timeRemaining,
      (newTime) => setTimeRemaining(newTime),
      async () => {
        setIsActive(false);
        setAtmospherePlaying(false);
        opacity.value = withTiming(1, { duration: 1000 });
        await saveSession(selectedDuration);
        
        // Wait 4 seconds for the extinguish and smoke animations to finish completely
        setTimeout(() => {
          Alert.alert(
            t('sessionComplete'), 
            t('greatJob'),
            [{ text: t('ok'), onPress: () => setTimeRemaining(selectedDuration) }]
          );
        }, 4000);
      },
      t('sessionComplete'),
      t('greatJob')
    );
  };

  const handleStop = () => {
    setIsActive(false);
    TimerService.stop();
    setAtmospherePlaying(false);
    setTimeRemaining(selectedDuration);
    opacity.value = withTiming(1, { duration: 1000 }); // Fade in controls
  };

  const handleDurationSelect = (mins) => {
    const secs = mins === 10 ? 10 : mins * 60; // 10 is seconds for testing
    setSelectedDuration(secs);
    setTimeRemaining(secs);
  };

  const animatedControlsStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    pointerEvents: opacity.value === 0 ? 'none' : 'auto',
  }));

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const atmosphereSource = useMemo(() => {
    return selectedAtmosphere !== 'silence' && SOUND_SOURCES[selectedAtmosphere] 
      ? SOUND_SOURCES[selectedAtmosphere] 
      : null;
  }, [selectedAtmosphere]);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, animatedControlsStyle]}>
        <TouchableOpacity onPress={() => navigation.navigate('Stats')}>
          <BarChart2 size={26} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.title}>CandleFocus</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Settings size={26} color={colors.textSecondary} />
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.mainArea}>
        <Candle progress={selectedDuration > 0 ? timeRemaining / selectedDuration : 1} isLit={isActive} />
        <View style={styles.timerContainer}>
          <TimerDisplay 
            timeRemaining={timeRemaining} 
            isHidden={isTimerHidden}
            onPress={() => setIsTimerHidden(!isTimerHidden)}
          />
        </View>
      </View>

      {lighterPlaying && (
        <Video
          source={require('../../assets/lighter.mp3')}
          audioOnly={true}
          paused={false}
          repeat={false}
          playInBackground={true}
          playWhenInactive={true}
          ignoreSilentSwitch={"ignore"}
          style={styles.hiddenVideo}
        />
      )}
      
      {atmospherePlaying && atmosphereSource && (
        <Video
          source={atmosphereSource}
          audioOnly={true}
          paused={false}
          repeat={true}
          playInBackground={true}
          playWhenInactive={true}
          ignoreSilentSwitch={"ignore"}
          style={styles.hiddenVideo}
        />
      )}

      <Animated.View style={[styles.controls, animatedControlsStyle]}>
        {!isActive ? (
          <>
            <View style={styles.durations}>
              {DURATIONS.map(val => {
                const isTest = val === 10;
                const secs = isTest ? 10 : val * 60;
                const isSelected = selectedDuration === secs;
                
                return (
                <TouchableOpacity 
                  key={val} 
                  style={[
                    styles.durationBtn, 
                    isSelected && styles.durationBtnActive
                  ]}
                  onPress={() => handleDurationSelect(val)}
                >
                  <Text style={[
                    styles.durationText,
                    isSelected && styles.durationTextActive
                  ]}>{isTest ? `10${t('secShort')}` : `${val}${t('minShort')}`}</Text>
                </TouchableOpacity>
              )})}
            </View>
            
            <View style={styles.atmosphereContainer}>
              {[
                { id: 'silence', icon: VolumeX },
                { id: 'rain', icon: CloudRain },
                { id: 'forest', icon: TreePine },
                { id: 'ocean', icon: Waves },
                { id: 'night', icon: Moon }
              ].map(item => {
                const isSelected = selectedAtmosphere === item.id;
                const Icon = item.icon;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.atmosphereBtn,
                      isSelected && styles.atmosphereBtnActive
                    ]}
                    onPress={() => setSelectedAtmosphere(item.id)}
                  >
                    <Icon size={24} color={isSelected ? colors.background : colors.textPrimary} />
                  </TouchableOpacity>
                );
              })}
            </View>
            
            <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
              <Text style={styles.startBtnText}>{t('focus')}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity 
            style={[styles.startBtn, styles.stopBtn]} 
            onPress={handleStop}
            disabled={opacity.value < 0.1} // Prevent accidental taps when invisible
          >
            <Text style={styles.startBtnText}>{t('giveUp')}</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hiddenVideo: {
    width: 0,
    height: 0,
    opacity: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    zIndex: 10,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 1,
  },
  headerIcon: {
    fontSize: 24,
  },
  mainArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerContainer: {
    marginTop: 40,
  },
  controls: {
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  durations: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 30,
  },
  durationBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  durationBtnActive: {
    backgroundColor: colors.primary,
  },
  durationText: {
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  durationTextActive: {
    color: colors.background,
  },
  atmosphereContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 40,
  },
  atmosphereBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  atmosphereBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  startBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 30,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  stopBtn: {
    backgroundColor: '#3A332B',
    shadowColor: '#000',
    opacity: 0.8,
  },
  startBtnText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
});

export default HomeScreen;
