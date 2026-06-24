import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Path, Ellipse, Line, RadialGradient } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  useDerivedValue,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import colors from '../../theme/colors';

const MAX_HEIGHT = 200;
const BASE_Y = 280;

// Create Animated SVG Components
const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);
const AnimatedLine = Animated.createAnimatedComponent(Line);

const Candle = ({ progress = 1, isLit = false }) => {
  const flameScale = useSharedValue(0);
  const flameRotation = useSharedValue(0);
  const dropRightProgress = useSharedValue(0);
  const dropLeftProgress = useSharedValue(0);
  const smokeProgress = useSharedValue(0);
  
  // Smooth out the progress so it doesn't jump every second
  const animatedProgress = useSharedValue(progress);

  const wasLit = useSharedValue(false);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, { duration: 1000, easing: Easing.linear });
  }, [progress]);

  useEffect(() => {
    if (isLit) {
      wasLit.value = true;
      smokeProgress.value = 0;
    } else if (wasLit.value) {
      // If it was lit and now it's off (extinguished or given up)
      smokeProgress.value = 0;
      smokeProgress.value = withDelay(1000, withTiming(1, { duration: 2500, easing: Easing.out(Easing.quad) }));
      wasLit.value = false;
    }
  }, [isLit]);

  // Derived values for positions based on smooth progress
  const currentHeight = useDerivedValue(() => Math.max(MAX_HEIGHT * animatedProgress.value, 20));
  const topY = useDerivedValue(() => BASE_Y - currentHeight.value);

  // Flame flickering animation
  useEffect(() => {
    flameScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.95, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    flameRotation.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(-1.5, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    
    // Right drop falling
    dropRightProgress.value = withRepeat(
      withTiming(1, { duration: 3200, easing: Easing.in(Easing.quad) }),
      -1,
      false
    );

    // Left drop falling (start with delay)
    setTimeout(() => {
      dropLeftProgress.value = withRepeat(
        withTiming(1, { duration: 4500, easing: Easing.in(Easing.quad) }),
        -1,
        false
      );
    }, 1500);
  }, []);

  const flameAnimatedStyle = useAnimatedStyle(() => {
    let scale = 0;
    let flameOpacity = 0;

    if (isLit) {
      scale = flameScale.value;
      flameOpacity = withTiming(1, { duration: 500 });
    } else {
      scale = withTiming(0, { duration: 1000 });
      flameOpacity = withTiming(0, { duration: 1000 });
    }

    return {
      transform: [
        { translateY: topY.value - 55 },
        { scale },
        { rotate: `${flameRotation.value}deg` }
      ],
      opacity: flameOpacity,
    };
  });

  // A glowing aura around the flame that pulses with the flame's scale
  const glowAnimatedStyle = useAnimatedStyle(() => {
    let scale = 0;
    let glowOpacity = 0;

    if (isLit) {
      scale = flameScale.value * 1.2;
      glowOpacity = withTiming(0.6, { duration: 500 });
    } else {
      scale = withTiming(0, { duration: 1000 });
      glowOpacity = withTiming(0, { duration: 1000 });
    }

    return {
      transform: [
        { translateY: topY.value - 65 },
        { scale }
      ],
      opacity: glowOpacity,
    };
  });

  const dropRightStyle = useAnimatedStyle(() => {
    const isFalling = dropRightProgress.value > 0.05 && dropRightProgress.value < 0.95;
    return {
      transform: [
        { translateX: 32 },
        { translateY: topY.value + (currentHeight.value * dropRightProgress.value) },
        { scaleY: 1 + dropRightProgress.value * 0.5 }
      ],
      opacity: (isFalling && isLit) ? 1 : withTiming(0, {duration: 500}),
    };
  });

  const dropLeftStyle = useAnimatedStyle(() => {
    const isFalling = dropLeftProgress.value > 0.05 && dropLeftProgress.value < 0.95;
    return {
      transform: [
        { translateX: -40 },
        { translateY: topY.value + (currentHeight.value * dropLeftProgress.value) },
        { scaleY: 1 + dropLeftProgress.value * 0.5 }
      ],
      opacity: (isFalling && isLit) ? 1 : withTiming(0, {duration: 500}),
    };
  });

  const puddleProps = useAnimatedProps(() => {
    const puddleScale = 1 - animatedProgress.value; // 0 at start, 1 at finish
    return {
      rx: 35 + (30 * puddleScale),
      ry: 10 + (15 * puddleScale),
      opacity: puddleScale * 1.5, // Invisible at start, fades in as it melts
    };
  });

  // Smoke rising animation when candle extinguishes
  const smokeAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: smokeProgress.value > 0 && smokeProgress.value < 1 ? (1 - smokeProgress.value) * 0.9 : 0,
      transform: [
        { translateY: topY.value - 110 - (smokeProgress.value * 70) }, // smoke rises from the wick
        { scale: 1 + (smokeProgress.value * 1.8) } // smoke expands outwards softly
      ]
    };
  });

  // Animated Props for the SVG elements so they render on the UI thread smoothly
  const bodyProps = useAnimatedProps(() => ({
    y: topY.value,
    height: currentHeight.value,
  }));

  const topProps = useAnimatedProps(() => ({
    cy: topY.value,
  }));

  const wickProps = useAnimatedProps(() => ({
    y1: topY.value,
    y2: topY.value - (8 + 7 * animatedProgress.value), // length 15 at start, 8 at end
    opacity: 1,
  }));

  return (
    <View style={styles.container}>
      {/* Background SVG for the Candle Body */}
      <Svg width="150" height="350" viewBox="0 0 150 350" style={styles.svg}>
        <Defs>
          <LinearGradient id="candleGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#DBC3A3" stopOpacity="1" />
            <Stop offset="0.5" stopColor={colors.secondary} stopOpacity="1" />
            <Stop offset="1" stopColor="#BFA582" stopOpacity="1" />
          </LinearGradient>
          <RadialGradient id="glowGrad" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0" stopColor="#FFA500" stopOpacity="1" />
            <Stop offset="1" stopColor="#FFA500" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Plate / Candle Holder */}
        <Ellipse
          cx="75"
          cy={BASE_Y + 8}
          rx="65"
          ry="20"
          fill="#111" // Plate depth/shadow
        />
        <Ellipse
          cx="75"
          cy={BASE_Y + 5}
          rx="65"
          ry="20"
          fill="#2C2C2E" // Plate top surface
        />
        <Ellipse
          cx="75"
          cy={BASE_Y + 5}
          rx="50"
          ry="14"
          fill="#1C1C1E" // Plate inner indentation
        />

        {/* Wax Puddle at the base */}
        <AnimatedEllipse
          cx="75"
          cy={BASE_Y + 3}
          fill="url(#candleGrad)"
          animatedProps={puddleProps}
        />

        {/* Candle Bottom Cap (3D cylinder base resting on plate) */}
        <Ellipse
          cx="75"
          cy={BASE_Y}
          rx="40"
          ry="15"
          fill="url(#candleGrad)"
        />

        {/* Main Candle Body */}
        <AnimatedRect
          x="35"
          width="80"
          fill="url(#candleGrad)"
          animatedProps={bodyProps}
        />

        {/* Candle Top (gives 3D cylinder illusion) */}
        <AnimatedEllipse
          cx="75"
          rx="40"
          ry="15"
          fill="#EEDAC0"
          animatedProps={topProps}
        />
        
        {/* Wick */}
        <AnimatedLine
          x1="75"
          x2="75"
          stroke="#333"
          strokeWidth="3"
          strokeLinecap="round"
          animatedProps={wickProps}
        />
      </Svg>

      {/* Pulsing Light Glow Effect */}
      <Animated.View style={[styles.glowContainer, glowAnimatedStyle]}>
        <Svg width="120" height="120" viewBox="0 0 120 120">
          <Ellipse cx="60" cy="60" rx="60" ry="60" fill="url(#glowGrad)" />
        </Svg>
      </Animated.View>

      {/* Flame */}
      <Animated.View style={[styles.flameContainer, flameAnimatedStyle]}>
        <Svg width="40" height="60" viewBox="0 0 40 60">
          <Defs>
            <LinearGradient id="flameGrad" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" />
              <Stop offset="0.4" stopColor="#F5A623" stopOpacity="0.9" />
              <Stop offset="1" stopColor="#FF4B2B" stopOpacity="0.7" />
            </LinearGradient>
          </Defs>
          <Path
            d="M20 0 C20 0, 40 30, 20 50 C0 30, 20 0, 20 0 Z"
            fill="url(#flameGrad)"
          />
        </Svg>
      </Animated.View>

      {/* Smoke Extinguish Effect */}
      <Animated.View style={[styles.smokeContainer, smokeAnimatedStyle]}>
        <Svg width="80" height="100" viewBox="0 0 80 100">
          {/* Main thick wisp */}
          <Path
            d="M40 100 Q 20 60 50 40 T 30 0"
            stroke="rgba(220, 220, 220, 0.7)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          {/* Smaller left wisp */}
          <Path
            d="M40 100 Q 10 70 30 50 T 15 20"
            stroke="rgba(200, 200, 200, 0.4)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Taller, thinner right wisp */}
          <Path
            d="M40 100 Q 65 55 45 35 T 60 -5"
            stroke="rgba(240, 240, 240, 0.5)"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
      </Animated.View>

      {/* Wax Drop Right */}
      <Animated.View style={[styles.dropContainer, dropRightStyle]}>
        <Svg width="10" height="20" viewBox="0 0 10 20">
          <Path d="M5 0 Q10 10 5 20 Q0 10 5 0 Z" fill="#DBC3A3" />
        </Svg>
      </Animated.View>

      {/* Wax Drop Left */}
      <Animated.View style={[styles.dropContainer, dropLeftStyle]}>
        <Svg width="10" height="20" viewBox="0 0 10 20">
          <Path d="M5 0 Q10 10 5 20 Q0 10 5 0 Z" fill="#DBC3A3" />
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 350,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  glowContainer: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flameContainer: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
  },
  smokeContainer: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
  },
  dropContainer: {
    position: 'absolute',
    top: 0,
    left: '50%',
  }
});

export default Candle;
