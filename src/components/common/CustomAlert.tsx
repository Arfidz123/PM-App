/**
 * CustomAlert - Premium animated modal dialog
 * Replaces React Native's Alert.alert with a beautiful, themed popup
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  HelpCircle,
} from 'lucide-react-native';
import {Colors, Typography, Spacing, BorderRadius, FontFamily} from '../../theme';

// ─── Types ───────────────────────────────────────────────────
export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface AlertConfig {
  type: AlertType;
  title: string;
  message: string;
  buttons?: AlertButton[];
}

// ─── Variant Config ──────────────────────────────────────────
const VARIANT_CONFIG: Record<
  AlertType,
  {
    icon: any;
    iconColor: string;
    iconBg: string;
    gradientColors: [string, string];
    glowColor: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    iconColor: '#34D399',
    iconBg: 'rgba(16, 185, 129, 0.15)',
    gradientColors: ['#059669', '#047857'],
    glowColor: 'rgba(16, 185, 129, 0.35)',
  },
  error: {
    icon: XCircle,
    iconColor: '#F87171',
    iconBg: 'rgba(239, 68, 68, 0.15)',
    gradientColors: ['#DC2626', '#B91C1C'],
    glowColor: 'rgba(239, 68, 68, 0.35)',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: '#FBBF24',
    iconBg: 'rgba(245, 158, 11, 0.15)',
    gradientColors: ['#D97706', '#B45309'],
    glowColor: 'rgba(245, 158, 11, 0.35)',
  },
  info: {
    icon: Info,
    iconColor: '#60A5FA',
    iconBg: 'rgba(59, 130, 246, 0.15)',
    gradientColors: ['#2563EB', '#1D4ED8'],
    glowColor: 'rgba(59, 130, 246, 0.35)',
  },
  confirm: {
    icon: HelpCircle,
    iconColor: '#A78BFA',
    iconBg: 'rgba(139, 92, 246, 0.15)',
    gradientColors: ['#7C3AED', '#6D28D9'],
    glowColor: 'rgba(139, 92, 246, 0.35)',
  },
};

// ─── Context ─────────────────────────────────────────────────
type ShowAlertFn = (config: AlertConfig) => void;

const AlertContext = createContext<ShowAlertFn>(() => {});

// Global reference so showAlert can be called outside React tree
let globalShowAlert: ShowAlertFn = () => {};

export const showAlert = (config: AlertConfig) => {
  globalShowAlert(config);
};

// ─── Provider ────────────────────────────────────────────────
export const AlertProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<AlertConfig | null>(null);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const iconBounceAnim = useRef(new Animated.Value(0)).current;

  const show = useCallback((cfg: AlertConfig) => {
    setConfig(cfg);
    setVisible(true);
  }, []);

  useEffect(() => {
    globalShowAlert = show;
  }, [show]);

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0);
      overlayAnim.setValue(0);
      iconBounceAnim.setValue(0);

      Animated.parallel([
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Icon bounce after card appears
        Animated.spring(iconBounceAnim, {
          toValue: 1,
          friction: 4,
          tension: 150,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [visible]);

  const dismiss = useCallback(
    (onPress?: () => void) => {
      Animated.parallel([
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setVisible(false);
        setConfig(null);
        if (onPress) {
          // Slight delay so modal fully closes before navigation etc.
          setTimeout(onPress, 50);
        }
      });
    },
    [overlayAnim, scaleAnim],
  );

  const variant = config ? VARIANT_CONFIG[config.type] : VARIANT_CONFIG.info;
  const IconComponent = variant.icon;

  // Default buttons if none provided
  const buttons: AlertButton[] =
    config?.buttons && config.buttons.length > 0
      ? config.buttons
      : [{text: 'OK', style: 'default'}];

  return (
    <AlertContext.Provider value={show}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => dismiss()}>
        <TouchableWithoutFeedback onPress={() => dismiss()}>
          <Animated.View style={[styles.overlay, {opacity: overlayAnim}]}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <Animated.View
                style={[
                  styles.card,
                  {
                    transform: [
                      {
                        scale: scaleAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.7, 1],
                        }),
                      },
                    ],
                    opacity: scaleAnim,
                  },
                ]}>
                {/* Icon Circle */}
                <Animated.View
                  style={[
                    styles.iconOuterGlow,
                    {
                      backgroundColor: variant.glowColor,
                      transform: [
                        {
                          scale: iconBounceAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.3, 1],
                          }),
                        },
                      ],
                      opacity: iconBounceAnim,
                    },
                  ]}>
                  <View
                    style={[
                      styles.iconCircle,
                      {backgroundColor: variant.iconBg},
                    ]}>
                    <IconComponent
                      color={variant.iconColor}
                      size={32}
                      strokeWidth={2.5}
                    />
                  </View>
                </Animated.View>

                {/* Title */}
                <Text style={styles.title}>{config?.title || ''}</Text>

                {/* Message */}
                <Text style={styles.message}>{config?.message || ''}</Text>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Buttons */}
                <View
                  style={[
                    styles.buttonRow,
                    buttons.length === 1 && styles.buttonRowSingle,
                  ]}>
                  {buttons.map((btn, idx) => {
                    const isCancel = btn.style === 'cancel';
                    const isDestructive = btn.style === 'destructive';

                    if (isCancel) {
                      return (
                        <TouchableOpacity
                          key={idx}
                          style={[
                            styles.button,
                            styles.cancelButton,
                            buttons.length > 1 && {flex: 1},
                          ]}
                          activeOpacity={0.7}
                          onPress={() => dismiss(btn.onPress)}>
                          <Text style={styles.cancelButtonText}>
                            {btn.text}
                          </Text>
                        </TouchableOpacity>
                      );
                    }

                    const gradientColors = isDestructive
                      ? (['#DC2626', '#B91C1C'] as [string, string])
                      : variant.gradientColors;

                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.button,
                          buttons.length > 1 && {flex: 1},
                        ]}
                        activeOpacity={0.8}
                        onPress={() => dismiss(btn.onPress)}>
                        <LinearGradient
                          colors={gradientColors}
                          start={{x: 0, y: 0}}
                          end={{x: 1, y: 1}}
                          style={styles.gradientButton}>
                          <Text style={styles.gradientButtonText}>
                            {btn.text}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>
    </AlertContext.Provider>
  );
};

// Hook for using inside React components
export const useAlert = (): ShowAlertFn => useContext(AlertContext);

// ─── Styles ──────────────────────────────────────────────────
const {width: SCREEN_WIDTH} = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 48, 360);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    // Shadow
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 20,
  },
  iconOuterGlow: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  title: {
    ...Typography.h3,
    color: Colors.text,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: FontFamily.bold,
  },
  message: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.glassBorder,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  buttonRowSingle: {
    justifyContent: 'center',
  },
  button: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.xl,
  },
  cancelButtonText: {
    ...Typography.button,
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  gradientButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: BorderRadius.xl,
  },
  gradientButtonText: {
    ...Typography.button,
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
});
