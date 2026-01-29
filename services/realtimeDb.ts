
import { AppState, PaymentItem } from '../types';
import { initDB, loadStateFromDB, saveStateToDB, getMonthKey } from './db';

// The "Sync Bus" allows different instances of the app to talk to each other in real-time
const syncChannel = new BroadcastChannel('payflow_realtime_sync');

export type StateListener = (state: AppState) => void;
const listeners: Set<StateListener> = new Set();

const INITIAL_STATE: AppState = {
  payments: [],
  completedIds: [],
  lastResetMonth: getMonthKey(),
  theme: 'light'
};

/**
 * Checks if a state needs a monthly reset and returns the new state if so
 */
const checkAndPerformReset = (state: AppState): AppState | null => {
  const currentMonth = getMonthKey();
  if (state.lastResetMonth !== currentMonth) {
    return {
      ...state,
      lastResetMonth: currentMonth,
      completedIds: [] // Clear all "Done" markers for the new month
    };
  }
  return null;
};

/**
 * The core Real-time Database Service
 */
export const RealtimeDB = {
  /**
   * Subscribe to state changes. 
   * This is what makes the app "Real-time".
   */
  subscribe: (callback: StateListener) => {
    listeners.add(callback);
    
    // Initial load from the persistent IndexedDB
    loadStateFromDB().then(state => {
      const resolvedState = state || INITIAL_STATE;
      
      // Perform reset check on load
      const resetState = checkAndPerformReset(resolvedState);
      if (resetState) {
        // If a reset was needed, dispatch it so all listeners and DB are updated
        RealtimeDB.dispatch(resetState);
      } else {
        callback(resolvedState);
      }
    }).catch(err => {
      console.error("DB Load Error, falling back to initial state", err);
      callback(INITIAL_STATE);
    });

    return () => {
      listeners.delete(callback);
    };
  },

  /**
   * Updates the state and broadcasts it to all other "real-time" clients
   */
  dispatch: async (newState: AppState) => {
    try {
      await saveStateToDB(newState);
    } catch (e) {
      console.error("Failed to save to DB:", e);
    }

    // Update local UI immediately
    listeners.forEach(l => l(newState));

    // Broadcast to other tabs/instances
    syncChannel.postMessage(newState);
  },

  /**
   * Internal initialization for system-level listeners
   */
  init: () => {
    // 1. Listen for updates from other tabs
    syncChannel.onmessage = (event) => {
      if (event.data) {
        const newState = event.data as AppState;
        listeners.forEach(l => l(newState));
      }
    };

    // 2. Handle background-to-foreground month rollover
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible') {
        const currentState = await loadStateFromDB();
        if (currentState) {
          const resetState = checkAndPerformReset(currentState);
          if (resetState) {
            console.log("Monthly reset triggered on visibility change");
            RealtimeDB.dispatch(resetState);
          }
        }
      }
    });
  }
};

// Initialize the sync listener
RealtimeDB.init();

export { getMonthKey };
