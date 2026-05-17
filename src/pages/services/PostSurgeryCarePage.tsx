import LandingPageScaffold from '@/components/landing/LandingPageScaffold';
import { postSurgeryCare } from './servicesData';

export default function PostSurgeryCarePage() {
  return <LandingPageScaffold data={postSurgeryCare} />;
}
