/**
 * Push Notification & Sound Chime Service for EV Road Trips
 */

class NotificationService {
  private hasPermission = false;
  private audioCtx: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.hasPermission = Notification.permission === 'granted';
    }
  }

  public async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
      return this.hasPermission;
    } catch {
      return false;
    }
  }

  public isPermissionGranted(): boolean {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    return Notification.permission === 'granted';
  }

  public async sendNotification(title: string, options?: NotificationOptions): Promise<void> {
    // 1. Trigger haptic vibration on Android / mobile
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      try {
        navigator.vibrate([100, 50, 150, 50, 200]);
      } catch {
        // Ignore vibration errors
      }
    }

    // 2. Play acoustic chime
    this.playChime();

    // 3. Send system notification if permitted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        // Try via service worker registration if available
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.getRegistration();
          if (reg && 'showNotification' in reg) {
            await reg.showNotification(title, {
              icon: '/icon.svg',
              badge: '/icon.svg',
              ...options,
            });
            return;
          }
        }

        // Direct fallback
        new Notification(title, {
          icon: '/icon.svg',
          ...options,
        });
      } catch (err) {
        console.warn('Notification error:', err);
      }
    }
  }

  /**
   * Generates a sleek, pleasant EV chime using Web Audio API
   */
  public playChime(): void {
    if (typeof window === 'undefined') return;

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;

      // Chord: C5, E5, G5, B5 (Ascending futuristic harp)
      const freqs = [523.25, 659.25, 783.99, 987.77];
      freqs.forEach((freq, index) => {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);

        gain.gain.setValueAtTime(0, now + index * 0.08);
        gain.gain.linearRampToValueAtTime(0.18, now + index * 0.08 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.7);
      });
    } catch {
      // Audio autoplay policy might prevent playback without user interaction
    }
  }
}

export const notificationService = new NotificationService();
