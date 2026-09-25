import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../state/useAuth';

/** Workbench routes need a session. Signed out, the visitor is sent to
 *  the sign-in screen and returned to where they were heading. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const user = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}
