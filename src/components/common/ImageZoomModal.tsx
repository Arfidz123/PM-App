/**
 * ImageZoomModal
 * Modal penampil gambar dengan fungsionalitas Zoom-In, Pinch-to-Zoom yang sangat responsif,
 * Double Tap to Zoom, Pan/Drag, dan kontrol tombol zoom (+, -, reset).
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  Image,
  ImageSourcePropType,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius } from '../../theme';

interface ImageZoomModalProps {
  visible: boolean;
  source: ImageSourcePropType | null;
  title?: string;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ImageZoomModal: React.FC<ImageZoomModalProps> = ({
  visible,
  source,
  title,
  onClose,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const currentScaleRef = useRef(1);
  const currentPanRef = useRef({ x: 0, y: 0 });

  const lastTouchTime = useRef(0);
  const initialDistanceRef = useRef(0);
  const initialScaleRef = useRef(1);
  const isPinchingRef = useRef(false);

  const [displayScale, setDisplayScale] = useState(1);

  // Reset posisi & skala saat modal dibuka
  useEffect(() => {
    if (visible) {
      scale.setValue(1);
      pan.setValue({ x: 0, y: 0 });
      currentScaleRef.current = 1;
      currentPanRef.current = { x: 0, y: 0 };
      initialDistanceRef.current = 0;
      isPinchingRef.current = false;
      setDisplayScale(1);
    }
  }, [visible]);

  const resetZoom = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 7,
      }),
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: true,
        friction: 7,
      }),
    ]).start(() => {
      currentScaleRef.current = 1;
      currentPanRef.current = { x: 0, y: 0 };
      initialDistanceRef.current = 0;
      isPinchingRef.current = false;
      setDisplayScale(1);
    });
  };

  const zoomTo = (targetScale: number) => {
    const clampedScale = Math.min(Math.max(targetScale, 1), 4);
    Animated.parallel([
      Animated.spring(scale, {
        toValue: clampedScale,
        useNativeDriver: true,
        friction: 7,
      }),
      ...(clampedScale === 1
        ? [
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: true,
              friction: 7,
            }),
          ]
        : []),
    ]).start(() => {
      currentScaleRef.current = clampedScale;
      if (clampedScale === 1) {
        currentPanRef.current = { x: 0, y: 0 };
      }
      setDisplayScale(clampedScale);
    });
  };

  const handleZoomIn = () => {
    zoomTo(currentScaleRef.current + 0.5);
  };

  const handleZoomOut = () => {
    zoomTo(currentScaleRef.current - 0.5);
  };

  // Batasi agar gambar tidak terlempar keluar layar saat digeser
  const clampPan = (scaleVal: number) => {
    if (scaleVal <= 1.05) {
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: true,
        friction: 7,
      }).start(() => {
        currentPanRef.current = { x: 0, y: 0 };
      });
      return;
    }

    const maxPanX = ((scaleVal - 1) * SCREEN_WIDTH) / 2;
    const maxPanY = ((scaleVal - 1) * (SCREEN_HEIGHT * 0.72)) / 2;

    const currentX = (pan.x as any)._value || 0;
    const currentY = (pan.y as any)._value || 0;

    const clampedX = Math.min(Math.max(currentX, -maxPanX), maxPanX);
    const clampedY = Math.min(Math.max(currentY, -maxPanY), maxPanY);

    if (currentX !== clampedX || currentY !== clampedY) {
      Animated.spring(pan, {
        toValue: { x: clampedX, y: clampedY },
        useNativeDriver: true,
        friction: 7,
      }).start(() => {
        currentPanRef.current = { x: clampedX, y: clampedY };
      });
    } else {
      currentPanRef.current = { x: currentX, y: currentY };
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => false,
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,

      onPanResponderGrant: evt => {
        const touches = evt.nativeEvent.touches;
        if (touches && touches.length >= 2) {
          // Cubit 2 jari langsung terdeteksi
          isPinchingRef.current = true;
          const dx = touches[0].pageX - touches[1].pageX;
          const dy = touches[0].pageY - touches[1].pageY;
          initialDistanceRef.current = Math.hypot(dx, dy);
          initialScaleRef.current = currentScaleRef.current;
        } else {
          // 1 jari untuk geser atau double tap
          isPinchingRef.current = false;
          initialDistanceRef.current = 0;
          pan.setOffset({
            x: currentPanRef.current.x,
            y: currentPanRef.current.y,
          });
          pan.setValue({ x: 0, y: 0 });
        }
      },

      onPanResponderMove: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;

        if (touches && touches.length >= 2) {
          const dx = touches[0].pageX - touches[1].pageX;
          const dy = touches[0].pageY - touches[1].pageY;
          const distance = Math.hypot(dx, dy);

          // PENTING: Jika jari kedua baru saja menyentuh layar saat onPanResponderMove berjalan
          if (!isPinchingRef.current || initialDistanceRef.current <= 0) {
            isPinchingRef.current = true;
            initialDistanceRef.current = distance;
            initialScaleRef.current = currentScaleRef.current;
            return;
          }

          // Cubit / Rentangkan 2 jari (Pinch-to-zoom)
          if (initialDistanceRef.current > 0) {
            const factor = distance / initialDistanceRef.current;
            const targetScale = Math.min(
              Math.max(initialScaleRef.current * factor, 0.8),
              5,
            );
            scale.setValue(targetScale);
            currentScaleRef.current = targetScale;
            setDisplayScale(targetScale);
          }
        } else if (touches && touches.length === 1) {
          if (isPinchingRef.current) {
            // Pengguna mengangkat salah satu jari dari cubitan
            isPinchingRef.current = false;
            initialDistanceRef.current = 0;
            pan.setOffset({
              x: currentPanRef.current.x,
              y: currentPanRef.current.y,
            });
            pan.setValue({ x: 0, y: 0 });
            return;
          }

          // Geser gambar ketika skala sedang diperbesar (> 1.05)
          if (currentScaleRef.current > 1.05) {
            pan.x.setValue(gestureState.dx);
            pan.y.setValue(gestureState.dy);
          }
        }
      },

      onPanResponderRelease: (evt, gestureState) => {
        const now = Date.now();

        // Jika selesai mencubit
        if (isPinchingRef.current) {
          isPinchingRef.current = false;
          initialDistanceRef.current = 0;

          if (currentScaleRef.current < 1) {
            resetZoom();
          } else if (currentScaleRef.current > 4) {
            zoomTo(4);
          }
          return;
        }

        // Cek double tap (ketuk 2 kali dengan cepat untuk perbesar ke 2.5x atau reset ke 1x)
        if (
          now - lastTouchTime.current < 300 &&
          Math.abs(gestureState.dx) < 15 &&
          Math.abs(gestureState.dy) < 15
        ) {
          if (currentScaleRef.current > 1.2) {
            resetZoom();
          } else {
            zoomTo(2.5);
          }
          lastTouchTime.current = 0;
          return;
        }
        lastTouchTime.current = now;

        // Lepas sentuhan 1 jari
        if (currentScaleRef.current > 1) {
          pan.flattenOffset();
          clampPan(currentScaleRef.current);
        } else {
          resetZoom();
        }
      },

      onPanResponderTerminate: () => {
        isPinchingRef.current = false;
        initialDistanceRef.current = 0;
        if (currentScaleRef.current < 1) {
          resetZoom();
        }
      },
    }),
  ).current;

  if (!visible || !source) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0A0F1D" />
      <SafeAreaView style={styles.container}>
        {/* Header bar */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText} numberOfLines={1}>
              {title || 'Pratinjau Gambar'}
            </Text>
            <Text style={styles.hintText}>
              Cubit 2 jari • Ketuk 2x • Geser untuk navigasi
            </Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <X color="#FFFFFF" size={22} />
          </TouchableOpacity>
        </View>

        {/* Area Gambar dengan PanResponder pada container terluar */}
        <View
          style={styles.imageContainer}
          {...panResponder.panHandlers}
          collapsable={false}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              styles.imageWrapper,
              {
                transform: [
                  { translateX: pan.x },
                  { translateY: pan.y },
                  { scale: scale },
                ],
              },
            ]}
          >
            <Image source={source} style={styles.image} resizeMode="contain" />
          </Animated.View>
        </View>

        {/* Floating Zoom Controls Bar di Bawah */}
        <View style={styles.controlsBar}>
          <TouchableOpacity
            style={[
              styles.controlBtn,
              displayScale <= 1 && styles.controlBtnDisabled,
            ]}
            onPress={handleZoomOut}
            disabled={displayScale <= 1}
            activeOpacity={0.7}
          >
            <ZoomOut
              color={displayScale <= 1 ? '#64748B' : '#FFFFFF'}
              size={18}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.scaleBadge}
            onPress={resetZoom}
            activeOpacity={0.7}
          >
            <RotateCcw color="#94A3B8" size={14} style={{ marginRight: 4 }} />
            <Text style={styles.scaleBadgeText}>
              {Math.round(displayScale * 100)}%
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.controlBtn,
              displayScale >= 4 && styles.controlBtnDisabled,
            ]}
            onPress={handleZoomIn}
            disabled={displayScale >= 4}
            activeOpacity={0.7}
          >
            <ZoomIn
              color={displayScale >= 4 ? '#64748B' : '#FFFFFF'}
              size={18}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1D',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    zIndex: 10,
  },
  titleContainer: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  titleText: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  hintText: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#0A0F1D',
  },
  imageWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  controlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    gap: 12,
  },
  controlBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  controlBtnDisabled: {
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
    opacity: 0.5,
  },
  scaleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#334155',
  },
  scaleBadgeText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '700',
  },
});
