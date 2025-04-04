import { useTranslation } from 'react-i18next';
import HeroSection from '@/components/home/hero-section';
import CategorySection from '@/components/home/category-section';
import FeaturedBooksSection from '@/components/home/featured-books-section';
import AiAssistantSection from '@/components/home/ai-assistant-section';
import UserDashboardPreview from '@/components/home/user-dashboard-preview';
import { useAuth } from '@/hooks/use-auth';

export default function HomePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  return (
    <>
      {/* Hero Section */}
      <HeroSection />
      
      {/* Category Section */}
      <CategorySection />
      
      {/* Featured Books Section */}
      <FeaturedBooksSection />
      
      {/* AI Assistant Section */}
      <AiAssistantSection />
      
      {/* User Dashboard Preview - Only shown to logged in users */}
      {user && <UserDashboardPreview />}
    </>
  );
}
