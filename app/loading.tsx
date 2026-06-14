import InstantLoader from './components/InstantLoader';

// Instant Suspense fallback for the landing route - shown while the server
// resolves the auth cookie (getUser) and decides whether to redirect a returning
// user to /app, so the first paint is the brand rather than a white page.
export default function Loading() {
  return <InstantLoader />;
}
