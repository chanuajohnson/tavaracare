import LandingPageScaffold from '@/components/landing/LandingPageScaffold';
import { dementiaCare } from './servicesData';

export default function DementiaCarePage() {
  return <LandingPageScaffold data={dementiaCare} />;
}
