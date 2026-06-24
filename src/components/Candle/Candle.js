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
  cancelAnimation,
} from 'react-native-reanimated';
import colors from '../../theme/colors';

const MAX_HEIGHT = 200;
const BASE_Y = 280;

// Create Animated SVG Components
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);
const AnimatedLine = Animated.createAnimatedComponent(Line);

const Candle = ({ progress = 1, isLit = false }) => {
  const flameScale = useSharedValue(0);
  const flameRotation = useSharedValue(0);
  const dropRightProgress = useSharedValue(0);
  const dropLeftProgress = useSharedValue(0);
  const smokeProgress = useSharedValue(0);
  const wobbleTimer = useSharedValue(0);
  
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
      smokeProgress.value = 0;
      smokeProgress.value = withDelay(1000, withTiming(1, { duration: 2500, easing: Easing.out(Easing.quad) }));
      wasLit.value = false;
    }
  }, [isLit]);

  const currentHeight = useDerivedValue(() => Math.max(MAX_HEIGHT * animatedProgress.value, 20));
  const topY = useDerivedValue(() => BASE_Y - currentHeight.value);

  useEffect(() => {
    if (isLit) {
      wobbleTimer.value = withRepeat(
        withTiming(wobbleTimer.value + Math.PI * 2, { duration: 8000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      cancelAnimation(wobbleTimer);
    }
  }, [isLit]);

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
      withTiming(1, { duration: 5500, easing: Easing.in(Easing.quad) }),
      -1,
      false
    );

    // Left drop falling
    setTimeout(() => {
      dropLeftProgress.value = withRepeat(
        withTiming(1, { duration: 7000, easing: Easing.in(Easing.quad) }),
        -1,
        false
      );
    }, 2500);
  }, []);

  const meltFactor = useDerivedValue(() => 1 - animatedProgress.value);
  
  const topDistortion = useDerivedValue(() => {
    const w1 = Math.sin(wobbleTimer.value) * 3 * meltFactor.value;
    const w2 = Math.cos(wobbleTimer.value * 1.5) * 3 * meltFactor.value;
    const yOffset = Math.sin(wobbleTimer.value * 2) * 1 * meltFactor.value;
    
    return {
      topLeftX: 35 + w1,
      topRightX: 115 + w2,
      yOffset: yOffset
    };
  });

  const topCx = useDerivedValue(() => (topDistortion.value.topLeftX + topDistortion.value.topRightX) / 2);
  const topCy = useDerivedValue(() => topY.value + topDistortion.value.yOffset);

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
        { translateX: topCx.value - 75 },
        { translateY: topCy.value - 55 },
        { scale },
        { rotate: `${flameRotation.value}deg` }
      ],
      opacity: flameOpacity,
    };
  });

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
        { translateX: topCx.value - 75 },
        { translateY: topCy.value - 65 },
        { scale }
      ],
      opacity: glowOpacity,
    };
  });

  const dropRightStyle = useAnimatedStyle(() => {
    const isFalling = dropRightProgress.value > 0.05 && dropRightProgress.value < 0.95;
    const fallProgress = Math.min(dropRightProgress.value / 0.85, 1);
    const splashProgress = Math.max(0, (dropRightProgress.value - 0.85) / 0.15);
    
    return {
      transform: [
        { translateX: topDistortion.value.topRightX - 75 - 5 },
        { translateY: topCy.value + (currentHeight.value * fallProgress) },
        { scaleY: 1 + (fallProgress * 0.5) - (splashProgress * 0.8) },
        { scaleX: 1 + (splashProgress * 2) }
      ],
      opacity: (isFalling && isLit) ? 1 - splashProgress : withTiming(0, {duration: 500}),
    };
  });

  const dropLeftStyle = useAnimatedStyle(() => {
    const isFalling = dropLeftProgress.value > 0.05 && dropLeftProgress.value < 0.95;
    const fallProgress = Math.min(dropLeftProgress.value / 0.85, 1);
    const splashProgress = Math.max(0, (dropLeftProgress.value - 0.85) / 0.15);
    
    return {
      transform: [
        { translateX: topDistortion.value.topLeftX - 75 + 5 },
        { translateY: topCy.value + (currentHeight.value * fallProgress) },
        { scaleY: 1 + (fallProgress * 0.5) - (splashProgress * 0.8) },
        { scaleX: 1 + (splashProgress * 2) }
      ],
      opacity: (isFalling && isLit) ? 1 - splashProgress : withTiming(0, {duration: 500}),
    };
  });

  const puddleProps = useAnimatedProps(() => {
    const puddleScale = 1 - animatedProgress.value;
    return {
      rx: 35 + (30 * puddleScale),
      ry: 10 + (15 * puddleScale),
      opacity: puddleScale * 1.5,
    };
  });

  const accumulatedPropsEarly = useAnimatedProps(() => {
    const meltAmount = 1 - animatedProgress.value;
    // Appears after 40% of the candle is melted
    const p = Math.max(0, (meltAmount - 0.4) * 2.5);
    return {
      opacity: Math.min(1, p),
    };
  });

  const accumulatedPropsLate = useAnimatedProps(() => {
    const meltAmount = 1 - animatedProgress.value;
    // Appears after 70% of the candle is melted
    const p = Math.max(0, (meltAmount - 0.7) * 3);
    return {
      opacity: Math.min(1, p),
    };
  });

  const smokeAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: smokeProgress.value > 0 && smokeProgress.value < 1 ? (1 - smokeProgress.value) * 0.9 : 0,
      transform: [
        { translateX: topCx.value - 75 },
        { translateY: topCy.value - 110 - (smokeProgress.value * 70) },
        { scale: 1 + (smokeProgress.value * 1.8) }
      ]
    };
  });

  const bodyProps = useAnimatedProps(() => {
    const y = topCy.value;
    const h = currentHeight.value;
    const { topLeftX, topRightX } = topDistortion.value;
    
    const path = `
      M 35 ${BASE_Y}
      C 35 ${BASE_Y - h*0.3}, ${topLeftX} ${y + h*0.2}, ${topLeftX} ${y}
      L ${topRightX} ${y}
      C ${topRightX} ${y + h*0.2}, 115 ${BASE_Y - h*0.3}, 115 ${BASE_Y}
      Z
    `;
    
    return {
      d: path,
    };
  });

  const topProps = useAnimatedProps(() => {
    const { topLeftX, topRightX } = topDistortion.value;
    const width = topRightX - topLeftX;
    
    return {
      cx: topCx.value,
      cy: topCy.value,
      rx: width / 2,
    };
  });

  const wickProps = useAnimatedProps(() => {
    return {
      x1: topCx.value,
      x2: topCx.value + Math.sin(wobbleTimer.value) * 3,
      y1: topCy.value,
      y2: topCy.value - (8 + 7 * animatedProgress.value),
      opacity: 1,
    };
  });

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
        <Ellipse cx="75" cy={BASE_Y + 8} rx="65" ry="20" fill="#111" />
        <Ellipse cx="75" cy={BASE_Y + 5} rx="65" ry="20" fill="#2C2C2E" />
        <Ellipse cx="75" cy={BASE_Y + 5} rx="50" ry="14" fill="#1C1C1E" />

        {/* Wax Puddle at the base */}
        <AnimatedEllipse cx="75" cy={BASE_Y + 3} fill="url(#candleGrad)" animatedProps={puddleProps} />

        {/* Accumulated Overflow Drops & Splatters */}
        <AnimatedPath d="M 18 288 C 23 288, 23 300, 18 305 C 13 300, 13 288, 18 288 Z" fill="url(#candleGrad)" animatedProps={accumulatedPropsEarly} />
        <AnimatedPath d="M 132 288 C 137 288, 137 298, 132 303 C 127 298, 127 288, 132 288 Z" fill="url(#candleGrad)" animatedProps={accumulatedPropsLate} />
        <AnimatedEllipse cx="40" cy="292" rx="7" ry="3" fill="url(#candleGrad)" animatedProps={accumulatedPropsLate} />
        <AnimatedEllipse cx="110" cy="295" rx="5" ry="2" fill="url(#candleGrad)" animatedProps={accumulatedPropsEarly} />

        {/* Candle Bottom Cap */}
        <Ellipse cx="75" cy={BASE_Y} rx="40" ry="15" fill="url(#candleGrad)" />

        {/* Main Candle Body (Organic Path) */}
        <AnimatedPath fill="url(#candleGrad)" animatedProps={bodyProps} />

        {/* Candle Top (Organic Ellipse) */}
        <AnimatedEllipse ry="15" fill="#EEDAC0" animatedProps={topProps} />
        
        {/* Wick */}
        <AnimatedLine stroke="#333" strokeWidth="3" strokeLinecap="round" animatedProps={wickProps} />
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
          <Path d="M20 0 C20 0, 40 30, 20 50 C0 30, 20 0, 20 0 Z" fill="url(#flameGrad)" />
        </Svg>
      </Animated.View>

      {/* Smoke Extinguish Effect */}
      <Animated.View style={[styles.smokeContainer, smokeAnimatedStyle]}>
        <Svg width="80" height="100" viewBox="0 0 80 100">
          <Path d="M40 100 Q 20 60 50 40 T 30 0" stroke="rgba(220, 220, 220, 0.7)" strokeWidth="3" strokeLinecap="round" fill="none" />
          <Path d="M40 100 Q 10 70 30 50 T 15 20" stroke="rgba(200, 200, 200, 0.4)" strokeWidth="2" strokeLinecap="round" fill="none" />
          <Path d="M40 100 Q 65 55 45 35 T 60 -5" stroke="rgba(240, 240, 240, 0.5)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
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
