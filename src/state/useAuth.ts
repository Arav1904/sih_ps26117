import { useSyncExternalStore } from 'react';
import { auth, type User } from '../services/auth';

/** The signed-in user, or null. Re-renders on login and logout. */
export function useAuth(): User | null {
  return useSyncExternalStore(auth.subscribe, auth.getSnapshot, auth.getSnapshot);
}
