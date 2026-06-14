import InstantLoader from '../components/InstantLoader';

// Instant Suspense fallback for the /app route — paints the brand immediately
// while the client bundle loads, instead of a blank screen.
export default function Loading() {
  return <InstantLoader />;
}
