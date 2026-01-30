
import { AppState } from '../types.ts';
import { loadStateFromDB, saveStateToDB, getMonthKey } from './db.ts';

const syncChannel = new BroadcastChannel('payflow_realtime_sync');

export type StateListener = (state: AppState) => void;
const listeners: Set<StateListener> = new Set();

const INITIAL_STATE: AppState = {
  payments: [],
  completedIds: [],
  lastResetMonth: getMonthKey(),
  theme: 'light',
  user: null,
  googleClientId: '',
  savedAccounts: []
};

const checkAndPerformReset = (state: AppState): AppState | null => {
  const currentMonth = getMonthKey();
  if (state.lastResetMonth !== currentMonth) {
    return {
      ...state,
      lastResetMonth: currentMonth,
      completedIds: [] 
    };
  }
  return null;
};

export const RealtimeDB = {
  subscribe: (callback: StateListener) => {
    listeners.add(callback);
    
    loadStateFromDB().then(state => {
      const resolvedState = state || INITIAL_STATE;
      const resetState = checkAndPerformReset(resolvedState);
      if (resetState) {
        RealtimeDB.dispatch(resetState);
      } else {
        callback(resolvedState);
      }
    }).catch(err => {
      callback(INITIAL_STATE);
    });

    return () => {
      listeners.delete(callback);
    };
  },

  dispatch: async (newState: AppState) => {
    try {
      await saveStateToDB(newState);
    } catch (e) {
      console.error("Failed to save to DB:", e);
    }

    listeners.forEach(l => l(newState));
    syncChannel.postMessage(newState);
  },

  init: () => {
    syncChannel.onmessage = (event) => {
      if (event.data) {
        listeners.forEach(l => l(event.data as AppState));
      }
    };

    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible') {
        const currentState = await loadStateFromDB();
        if (currentState) {
          const resetState = checkAndPerformReset(currentState);
          if (resetState) {
            RealtimeDB.dispatch(resetState);
          }
        }
      }
    });
  }
};

RealtimeDB.init();
export { getMonthKey };
