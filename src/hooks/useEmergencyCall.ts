import { useState, useEffect, useCallback } from 'react';
import {
  initiateEmergencyCall,
  subscribeToPermissionNotice,
  EMERGENCY_AMBULANCE_NUMBER,
  UNIFIED_EMERGENCY_NUMBER,
  EmergencyCallResult,
  hasDirectCallSupport,
} from '../utils/emergencyDialer';

export interface UseEmergencyCallReturn {
  isCalling: boolean;
  callingNumber: string | null;
  permissionNotice: string | null;
  hasDirectSupport: boolean;
  clearPermissionNotice: () => void;
  callAmbulance108: (e?: React.MouseEvent) => Promise<EmergencyCallResult>;
  callEmergency112: (e?: React.MouseEvent) => Promise<EmergencyCallResult>;
  callNumber: (number: string, e?: React.MouseEvent) => Promise<EmergencyCallResult>;
}

export function useEmergencyCall(): UseEmergencyCallReturn {
  const [isCalling, setIsCalling] = useState(false);
  const [callingNumber, setCallingNumber] = useState<string | null>(null);
  const [permissionNotice, setPermissionNotice] = useState<string | null>(null);
  const hasDirectSupport = hasDirectCallSupport();

  useEffect(() => {
    const unsubscribe = subscribeToPermissionNotice((notice) => {
      setPermissionNotice(notice);
      if (notice) {
        // Automatically dismiss notice after 6 seconds
        const timer = setTimeout(() => {
          setPermissionNotice(null);
        }, 6000);
        return () => clearTimeout(timer);
      }
    });
    return unsubscribe;
  }, []);

  const clearPermissionNotice = useCallback(() => {
    setPermissionNotice(null);
  }, []);

  const handleCall = useCallback(
    async (number: string, e?: React.MouseEvent): Promise<EmergencyCallResult> => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (isCalling) {
        return {
          success: false,
          method: 'throttled',
          number,
          message: 'Call already in progress. Check phone dialer.',
        };
      }

      setIsCalling(true);
      setCallingNumber(number);

      const result = await initiateEmergencyCall(number, {
        onStart: () => {
          setIsCalling(true);
          setCallingNumber(number);
        },
        onPermissionDenied: (notice) => {
          setPermissionNotice(notice);
        },
      });

      // Keep button in cooldown/calling state for 2.5 seconds to prevent repeated taps
      setTimeout(() => {
        setIsCalling(false);
        setCallingNumber(null);
      }, 2500);

      return result;
    },
    [isCalling]
  );

  const callAmbulance108 = useCallback(
    (e?: React.MouseEvent) => handleCall(EMERGENCY_AMBULANCE_NUMBER, e),
    [handleCall]
  );

  const callEmergency112 = useCallback(
    (e?: React.MouseEvent) => handleCall(UNIFIED_EMERGENCY_NUMBER, e),
    [handleCall]
  );

  return {
    isCalling,
    callingNumber,
    permissionNotice,
    hasDirectSupport,
    clearPermissionNotice,
    callAmbulance108,
    callEmergency112,
    callNumber: handleCall,
  };
}
