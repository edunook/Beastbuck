export function haptic(type = 'light') {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  const patterns = {
    light: 10,
    medium: 25,
    heavy: 50,
    success: [30, 50, 30],
    warning: [20, 30, 20],
    error: [40, 20, 40],
  };
  const pattern = patterns[type] || patterns.light;
  try {
    navigator.vibrate(pattern);
  } catch {
    // ignore
  }
}
