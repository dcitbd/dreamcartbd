import { authStore } from '../store/authStore.js';

export function AdminGuard(requiredRole) {
  if (!authStore.isAuthenticated() || !authStore.isAdmin()) return false;
  if (requiredRole && authStore.user?.role !== requiredRole && authStore.user?.role !== 'Full Access' && authStore.user?.role !== 'Super Admin') {
    return false;
  }
  return true;
}
