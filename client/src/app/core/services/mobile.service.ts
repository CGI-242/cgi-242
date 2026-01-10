import { Injectable, signal } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

@Injectable({
  providedIn: 'root'
})
export class MobileService {
  private readonly _isNative = signal(Capacitor.isNativePlatform());
  private readonly _platform = signal(Capacitor.getPlatform());
  private readonly _keyboardVisible = signal(false);

  readonly isNative = this._isNative.asReadonly();
  readonly platform = this._platform.asReadonly();
  readonly keyboardVisible = this._keyboardVisible.asReadonly();

  constructor() {
    this.initializeMobile();
  }

  private async initializeMobile(): Promise<void> {
    if (!this._isNative()) return;

    // Configure Status Bar
    await this.configureStatusBar();

    // Configure Keyboard listeners
    this.setupKeyboardListeners();

    // Hide splash screen after app is ready
    setTimeout(() => {
      this.hideSplashScreen();
    }, 500);
  }

  private async configureStatusBar(): Promise<void> {
    try {
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#005A8C' });
    } catch (error) {
      console.warn('StatusBar configuration failed:', error);
    }
  }

  private setupKeyboardListeners(): void {
    Keyboard.addListener('keyboardWillShow', () => {
      this._keyboardVisible.set(true);
    });

    Keyboard.addListener('keyboardWillHide', () => {
      this._keyboardVisible.set(false);
    });
  }

  async hideSplashScreen(): Promise<void> {
    if (!this._isNative()) return;
    try {
      await SplashScreen.hide({ fadeOutDuration: 300 });
    } catch (error) {
      console.warn('SplashScreen hide failed:', error);
    }
  }

  async showSplashScreen(): Promise<void> {
    if (!this._isNative()) return;
    try {
      await SplashScreen.show({ autoHide: false });
    } catch (error) {
      console.warn('SplashScreen show failed:', error);
    }
  }

  // Haptic feedback
  async hapticImpact(style: 'light' | 'medium' | 'heavy' = 'medium'): Promise<void> {
    if (!this._isNative()) return;
    const impactStyles: Record<string, ImpactStyle> = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy,
    };
    try {
      await Haptics.impact({ style: impactStyles[style] });
    } catch (error) {
      console.warn('Haptic impact failed:', error);
    }
  }

  async hapticNotification(type: 'success' | 'warning' | 'error' = 'success'): Promise<void> {
    if (!this._isNative()) return;
    const notificationTypes: Record<string, NotificationType> = {
      success: NotificationType.Success,
      warning: NotificationType.Warning,
      error: NotificationType.Error,
    };
    try {
      await Haptics.notification({ type: notificationTypes[type] });
    } catch (error) {
      console.warn('Haptic notification failed:', error);
    }
  }

  async hapticVibrate(): Promise<void> {
    if (!this._isNative()) return;
    try {
      await Haptics.vibrate({ duration: 100 });
    } catch (error) {
      console.warn('Haptic vibrate failed:', error);
    }
  }

  // Keyboard control
  async hideKeyboard(): Promise<void> {
    if (!this._isNative()) return;
    try {
      await Keyboard.hide();
    } catch (error) {
      console.warn('Keyboard hide failed:', error);
    }
  }

  // Platform checks
  isIOS(): boolean {
    return this._platform() === 'ios';
  }

  isAndroid(): boolean {
    return this._platform() === 'android';
  }

  isWeb(): boolean {
    return this._platform() === 'web';
  }

  // Safe area insets for iOS notch
  getSafeAreaInsets(): { top: number; bottom: number; left: number; right: number } {
    if (!this._isNative() || !this.isIOS()) {
      return { top: 0, bottom: 0, left: 0, right: 0 };
    }
    // Default values for iPhone with notch
    return { top: 47, bottom: 34, left: 0, right: 0 };
  }
}
