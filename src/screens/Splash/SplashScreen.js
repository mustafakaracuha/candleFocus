import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay, 
  Easing 
} from 'react-native-reanimated';
import colors from '../../theme/colors';

const { width } = Dimensions.get('window');

const SplashScreen = () => {
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    // Fade in and scale up the logo slightly
    logoOpacity.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.ease) });
    logoScale.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.back(1.5)) });
    
    // Pulsing glow effect behind the logo
    glowOpacity.value = withDelay(800, withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) }));
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }]
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: logoScale.value * 1.5 }]
  }));

  return (
    <View style={styles.container}>
      {/* Background glow */}
      <Animated.View style={[styles.glow, glowAnimatedStyle]} />
      
      {/* App Logo */}
      <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
        <Image 
          source={require('../../assets/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: width * 0.5,
    height: width * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 40, // Optional: if the logo needs rounded corners
  },
  glow: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    backgroundColor: 'rgba(245, 166, 35, 0.15)', // Warm orange glow
    borderRadius: width * 0.3,
    zIndex: 1,
  }
});

export default SplashScreen;
