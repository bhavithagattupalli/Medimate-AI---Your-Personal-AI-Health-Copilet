/**
 * Emergency Calling & Telephony Utility for MediMate AI
 *
 * Requirements:
 * - Primary Emergency Ambulance Number: 108 (India)
 * - Opens phone dialer with 108 ready to call, or initiates direct call if platform + permissions support it
 * - Handles permission request, granted, and denied scenarios with graceful fallback to phone dialer
 * - Prevents repeated/rapid taps from triggering multiple simultaneous call intents (debounced cooldown)
 */

export const EMERGENCY_AMBULANCE_NUMBER = '108';
export const UNIFIED_EMERGENCY_NUMBER = '112';

const DEBOUNCE_COOLDOWN_MS = 3000;

export interface EmergencyCallResult {
  success: boolean;
  method: 'direct' | 'dialer' | 'throttled';
  number: string;
  message?: string;
  permissionDenied?: boolean;
}

export interface EmergencyCallOptions {
  number?: string;
  onStart?: () => void;
  onSuccess?: (result: EmergencyCallResult) => void;
  onPermissionDenied?: (notice: string) => void;
  onError?: (error: Error) => void;
}

// Module-level lock to prevent duplicate taps across entire application
let isCallInProgress = false;
let lastCallTimestamp = 0;
let permissionNoticeSubscribers: ((notice: string | null) => void)[] = [];

export function subscribeToPermissionNotice(callback: (notice: string | null) => void) {
  permissionNoticeSubscribers.push(callback);
  return () => {
    permissionNoticeSubscribers = permissionNoticeSubscribers.filter((cb) => cb !== callback);
  };
}

function broadcastPermissionNotice(notice: string | null) {
  permissionNoticeSubscribers.forEach((cb) => cb(notice));
}

/**
 * Checks whether the current environment / hybrid runtime has direct call support
 */
export function hasDirectCallSupport(): boolean {
  if (typeof window === 'undefined') return false;

  const win = window as any;
  // Cordova / PhoneGap CallNumber plugin
  if (win.plugins && win.plugins.CallNumber) return true;
  // Capacitor PhoneCall or Custom Native Bridge
  if (win.Capacitor && win.Capacitor.Plugins && win.Capacitor.Plugins.PhoneCall) return true;
  // Android Webview JavaScript Interface
  if (win.AndroidBridge && typeof win.AndroidBridge.makeCall === 'function') return true;
  if (win.Android && typeof win.Android.makeDirectCall === 'function') return true;
  // Web Telephony API (experimental or hybrid browsers)
  if (typeof (navigator as any).telephony !== 'undefined') return true;

  return false;
}

/**
 * Main function to initiate an emergency call to 108 (or specified number)
 */
export async function initiateEmergencyCall(
  targetNumber: string = EMERGENCY_AMBULANCE_NUMBER,
  options?: EmergencyCallOptions
): Promise<EmergencyCallResult> {
  const now = Date.now();

  // 1. Prevent repeated taps from triggering multiple calls
  if (isCallInProgress || (now - lastCallTimestamp < DEBOUNCE_COOLDOWN_MS)) {
    console.warn(`[EmergencyCall] Blocked duplicate tap. Call already in progress or cooling down.`);
    return {
      success: false,
      method: 'throttled',
      number: targetNumber,
      message: 'Call already initiated. Please check your phone dialer.',
    };
  }

  isCallInProgress = true;
  lastCallTimestamp = now;
  options?.onStart?.();
  broadcastPermissionNotice(null);

  try {
    const win = window as any;

    // 2. Direct calling flow (if platform supports direct telephony permissions)
    if (hasDirectCallSupport()) {
      // Case A: Cordova / PhoneGap CallNumber plugin
      if (win.plugins?.CallNumber) {
        return await new Promise<EmergencyCallResult>((resolve) => {
          win.plugins.CallNumber.callNumber(
            () => {
              isCallInProgress = false;
              const res: EmergencyCallResult = {
                success: true,
                method: 'direct',
                number: targetNumber,
                message: `Direct emergency call placed to ${targetNumber}`,
              };
              options?.onSuccess?.(res);
              resolve(res);
            },
            (err: any) => {
              console.warn('[EmergencyCall] Direct call permission denied or error:', err);
              const notice = 'Phone call permission was denied. Launching phone dialer with 108 ready...';
              broadcastPermissionNotice(notice);
              options?.onPermissionDenied?.(notice);

              // Fallback to dialer
              triggerPhoneDialer(targetNumber);
              isCallInProgress = false;
              const res: EmergencyCallResult = {
                success: true,
                method: 'dialer',
                number: targetNumber,
                permissionDenied: true,
                message: notice,
              };
              options?.onSuccess?.(res);
              resolve(res);
            },
            targetNumber,
            true // bypassAppChooser (direct call)
          );
        });
      }

      // Case B: Capacitor PhoneCall plugin
      if (win.Capacitor?.Plugins?.PhoneCall) {
        try {
          // Check/request permissions if plugin provides it
          if (typeof win.Capacitor.Plugins.PhoneCall.requestPermissions === 'function') {
            const perm = await win.Capacitor.Plugins.PhoneCall.requestPermissions();
            if (perm && perm.phone === 'denied') {
              throw new Error('PERMISSION_DENIED');
            }
          }
          await win.Capacitor.Plugins.PhoneCall.makeCall({ number: targetNumber });
          isCallInProgress = false;
          const res: EmergencyCallResult = {
            success: true,
            method: 'direct',
            number: targetNumber,
          };
          options?.onSuccess?.(res);
          return res;
        } catch (capErr: any) {
          console.warn('[EmergencyCall] Capacitor call error:', capErr);
          const notice = 'Telephony permission unavailable or denied. Opening dialer with 108 ready.';
          broadcastPermissionNotice(notice);
          options?.onPermissionDenied?.(notice);
          triggerPhoneDialer(targetNumber);
          isCallInProgress = false;
          const res: EmergencyCallResult = {
            success: true,
            method: 'dialer',
            number: targetNumber,
            permissionDenied: true,
          };
          options?.onSuccess?.(res);
          return res;
        }
      }

      // Case C: Android WebView Interface
      if (win.AndroidBridge?.makeCall || win.Android?.makeDirectCall) {
        try {
          const bridgeFn = win.AndroidBridge?.makeCall || win.Android?.makeDirectCall;
          const directGranted = bridgeFn(targetNumber);
          if (directGranted !== false) {
            isCallInProgress = false;
            const res: EmergencyCallResult = {
              success: true,
              method: 'direct',
              number: targetNumber,
            };
            options?.onSuccess?.(res);
            return res;
          } else {
            throw new Error('PERMISSION_DENIED');
          }
        } catch (bridgeErr) {
          const notice = 'Device permission not granted for direct dial. Opening dialer with 108 ready.';
          broadcastPermissionNotice(notice);
          options?.onPermissionDenied?.(notice);
          triggerPhoneDialer(targetNumber);
          isCallInProgress = false;
          const res: EmergencyCallResult = {
            success: true,
            method: 'dialer',
            number: targetNumber,
            permissionDenied: true,
          };
          options?.onSuccess?.(res);
          return res;
        }
      }
    }

    // 3. Web & Mobile Browser standard flow:
    // W3C web standards require opening the phone dialer via `tel:` with 108 ready,
    // protecting users while guaranteeing rapid 1-tap connection on all iOS & Android devices.
    triggerPhoneDialer(targetNumber);

    const res: EmergencyCallResult = {
      success: true,
      method: 'dialer',
      number: targetNumber,
      message: `Opened phone dialer with ${targetNumber} ready to call.`,
    };
    options?.onSuccess?.(res);

    // Release in-progress lock after cooldown so UI resets smoothly
    setTimeout(() => {
      isCallInProgress = false;
    }, DEBOUNCE_COOLDOWN_MS);

    return res;
  } catch (err: any) {
    console.error('[EmergencyCall] Failed to initiate call:', err);
    isCallInProgress = false;
    options?.onError?.(err);

    // Reliable fallback: always attempt dialer even if something unexpectedly threw
    triggerPhoneDialer(targetNumber);

    return {
      success: false,
      method: 'dialer',
      number: targetNumber,
      message: err.message,
    };
  }
}

/**
 * Triggers the device phone dialer with number ready to call
 * Uses invisible anchor click with fallback to window.location.href for maximum mobile browser compatibility
 */
function triggerPhoneDialer(number: string) {
  const dialerUri = `tel:${encodeURIComponent(number)}`;

  try {
    const link = document.createElement('a');
    link.href = dialerUri;
    link.setAttribute('rel', 'noopener noreferrer');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 1500);
  } catch (e) {
    // Fallback if DOM manipulation is constrained
    window.location.href = dialerUri;
  }
}
