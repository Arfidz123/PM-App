/**
 * Animation Utilities
 * Reusable animation helpers for consistent motion design
 */

import { Animated, Easing } from 'react-native';

// ─── Entrance Animations ─────────────────────────────────────────────────────

export const fadeInUp = (
  anim: Animated.Value,
  config?: { duration?: number; delay?: number; distance?: number }
) => {
  const { duration = 500, delay = 0, distance = 30 } = config || {};
  anim.setValue(0);
  return Animated.timing(anim, {
    toValue: 1,
    duration,
    delay,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  });
};

export const fadeInDown = (
  anim: Animated.Value,
  config?: { duration?: number; delay?: number }
) => {
  const { duration = 400, delay = 0 } = config || {};
  anim.setValue(0);
  return Animated.timing(anim, {
    toValue: 1,
    duration,
    delay,
    easing: Easing.out(Easing.back(1.2)),
    useNativeDriver: true,
  });
};

export const springIn = (
  anim: Animated.Value,
  config?: { friction?: number; tension?: number; delay?: number }
) => {
  const { friction = 6, tension = 60, delay = 0 } = config || {};
  anim.setValue(0);
  return Animated.spring(anim, {
    toValue: 1,
    friction,
    tension,
    delay,
    useNativeDriver: true,
  });
};

// ─── Stagger Animation ───────────────────────────────────────────────────────

export const staggerEntrance = (
  anims: Animated.Value[],
  staggerDelay = 50,
  config?: { friction?: number; tension?: number }
) => {
  const { friction = 6, tension = 60 } = config || {};
  anims.forEach(a => a.setValue(0));
  return Animated.stagger(
    staggerDelay,
    anims.map(anim =>
      Animated.spring(anim, {
        toValue: 1,
        friction,
        tension,
        useNativeDriver: true,
      })
    )
  );
};

// ─── Continuous Animations ───────────────────────────────────────────────────

export const pulseLoop = (
  anim: Animated.Value,
  config?: { minScale?: number; maxScale?: number; duration?: number }
) => {
  const { minScale = 1, maxScale = 1.06, duration = 1000 } = config || {};
  return Animated.loop(
    Animated.sequence([
      Animated.timing(anim, {
        toValue: maxScale,
        duration,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: minScale,
        duration,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
    ])
  );
};

export const shimmerLoop = (
  anim: Animated.Value,
  config?: { duration?: number }
) => {
  const { duration = 1500 } = config || {};
  anim.setValue(0);
  return Animated.loop(
    Animated.timing(anim, {
      toValue: 1,
      duration,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  );
};

export const breatheLoop = (
  anim: Animated.Value,
  config?: { duration?: number }
) => {
  const { duration = 2000 } = config || {};
  return Animated.loop(
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 1,
        duration,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 0,
        duration,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
    ])
  );
};

// ─── Press Feedback ───────────────────────────────────────────────────────────

export const pressIn = (anim: Animated.Value) =>
  Animated.spring(anim, {
    toValue: 0.95,
    friction: 5,
    tension: 200,
    useNativeDriver: true,
  });

export const pressOut = (anim: Animated.Value) =>
  Animated.spring(anim, {
    toValue: 1,
    friction: 4,
    tension: 150,
    useNativeDriver: true,
  });

// ─── Interpolation Helpers ────────────────────────────────────────────────────

export const slideUpInterpolate = (
  anim: Animated.Value,
  distance = 30
) => ({
  opacity: anim,
  transform: [
    {
      translateY: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [distance, 0],
      }),
    },
  ],
});

export const scaleInInterpolate = (anim: Animated.Value) => ({
  opacity: anim,
  transform: [
    {
      scale: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.8, 1],
      }),
    },
  ],
});

export const slideInRightInterpolate = (
  anim: Animated.Value,
  distance = 40
) => ({
  opacity: anim,
  transform: [
    {
      translateX: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [distance, 0],
      }),
    },
  ],
});
