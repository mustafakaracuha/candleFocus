import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, TouchableOpacity, FlatList } from 'react-native';
import colors from '../../theme/colors';
import { Flame, Headphones, CalendarCheck } from 'lucide-react-native';
import { useLanguage } from '../../context/LanguageContext';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { setHasSeenOnboarding } from '../../services/StorageService';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: Flame,
    titleKey: 'onboarding1Title',
    descKey: 'onboarding1Desc',
  },
  {
    id: '2',
    icon: Headphones,
    titleKey: 'onboarding2Title',
    descKey: 'onboarding2Desc',
  },
  {
    id: '3',
    icon: CalendarCheck,
    titleKey: 'onboarding3Title',
    descKey: 'onboarding3Desc',
  }
];

const OnboardingScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const handleStart = async () => {
    await setHasSeenOnboarding();
    // Use reset to avoid going back to onboarding
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  const renderItem = ({ item, index }) => {
    const Icon = item.icon;
    const isCurrent = currentIndex === index;

    return (
      <View style={styles.slide}>
        {isCurrent && (
          <Animated.View entering={FadeInDown.duration(800).springify()} style={styles.iconContainer}>
            <View style={styles.iconGlow}>
              <Icon size={80} color={colors.primary} strokeWidth={1.5} />
            </View>
          </Animated.View>
        )}
        
        {isCurrent && (
          <Animated.View entering={FadeInDown.delay(200).duration(800).springify()} style={styles.textContainer}>
            <Text style={styles.title}>{t(item.titleKey)}</Text>
            <Text style={styles.description}>{t(item.descKey)}</Text>
          </Animated.View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfig}
      />
      
      <View style={styles.bottomContainer}>
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                currentIndex === index ? styles.activeDot : styles.inactiveDot
              ]}
            />
          ))}
        </View>

        {currentIndex === SLIDES.length - 1 ? (
          <Animated.View entering={FadeIn.delay(300).duration(600)}>
            <TouchableOpacity style={styles.button} onPress={handleStart}>
              <Text style={styles.buttonText}>{t('startJourney')}</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <TouchableOpacity style={styles.buttonSecondary} onPress={handleNext}>
            <Text style={styles.buttonTextSecondary}>{t('next')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
  },
  iconGlow: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(245, 166, 35, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.15)',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 10,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: 30,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: colors.primary,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '100%',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  buttonSecondary: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  buttonTextSecondary: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default OnboardingScreen;
