import AppShell from '../components/AppShell';

// Auth guard is handled client-side by AppShell's onAuthStateChange:
// unauthenticated users are redirected to '/' unless __trippyTestMode__ is set.
// Removing the server-side redirect allows Playwright tests to mount AppShell
// without a real Supabase session.
export default function AppPage() {
  return <AppShell />;
}
