import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import SearchBox from '@/components/ui/search-box';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';

export default function HeroSection() {
  const { t } = useTranslation();
  const { isRtl } = useLanguage();
  
  return (
    <section className="bg-[url('/src/assets/islamic-pattern.svg')] py-16 md:py-24 relative islamic-pattern-overlay">
      <div className="container mx-auto px-4 text-center">
        <h1 className={`text-3xl md:text-4xl font-bold mb-4 text-dark ${isRtl ? 'font-amiri' : 'font-roboto'}`}>
          {t('home.hero.title')}
        </h1>
        
        <p className="text-lg mb-8 max-w-2xl mx-auto">
          {t('home.hero.subtitle')}
        </p>
        
        {/* Search Box */}
        <SearchBox />
        
        {/* Quick Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <Link href="/catalog">
            <Button variant="outline" size="lg" className="rounded-full bg-white hover:bg-secondary hover:text-white">
              {t('home.hero.browseButton')}
            </Button>
          </Link>
          
          <Link href="/ai-assistant">
            <Button size="lg" className="rounded-full bg-primary text-white hover:bg-accent">
              {t('home.hero.askAiButton')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
