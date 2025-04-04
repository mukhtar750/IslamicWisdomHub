import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Mail, Globe, Facebook } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

export default function Footer() {
  const { t } = useTranslation();
  const { isRtl } = useLanguage();
  
  return (
    <footer className="bg-dark text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-lg font-amiri">م</span>
              </div>
              <div>
                <h3 className={`font-bold text-xl ${isRtl ? 'font-amiri' : 'font-roboto'}`}>
                  {t('common.appName')}
                </h3>
              </div>
            </div>
            
            <p className="text-gray-400 mb-4">
              {t('footer.rights')}
            </p>
            
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-secondary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-white hover:text-secondary transition-colors">
                <Globe size={20} />
              </a>
              <a href="#" className="text-white hover:text-secondary transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-medium text-lg mb-4">
              {t('footer.quickLinks')}
            </h4>
            
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/catalog">
                  <a className="hover:text-white transition-colors">
                    {t('footer.browseCatalog')}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/ai-assistant">
                  <a className="hover:text-white transition-colors">
                    {t('footer.aiAssistant')}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/dashboard">
                  <a className="hover:text-white transition-colors">
                    {t('footer.myAccount')}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/policy">
                  <a className="hover:text-white transition-colors">
                    {t('footer.borrowingPolicy')}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="hover:text-white transition-colors">
                    {t('footer.contactUs')}
                  </a>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Library Hours */}
          <div>
            <h4 className="font-medium text-lg mb-4">
              {t('footer.libraryHours')}
            </h4>
            
            <ul className="space-y-2 text-gray-400">
              <li className="flex justify-between">
                <span>{t('footer.monday')}</span>
                <span>9:00 AM - 8:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>{t('footer.friday')}</span>
                <span>2:00 PM - 8:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>{t('footer.weekend')}</span>
                <span>10:00 AM - 6:00 PM</span>
              </li>
            </ul>
            
            <div className="mt-6">
              <h4 className="font-medium text-lg mb-2">
                {t('footer.location')}
              </h4>
              <p className="text-gray-400">
                {t('footer.address')}
              </p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-500">
          <p>{t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
}
