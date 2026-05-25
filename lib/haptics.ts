type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

const patterns: Record<HapticPattern, number[]> = {
  light:   [10],
  medium:  [20],
  heavy:   [40],
  success: [10, 50, 10],
  warning: [30, 20, 30],
  error:   [50, 30, 50, 30, 50],
};

export function haptic(type: HapticPattern = 'light') {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(patterns[type]);
  }
}
