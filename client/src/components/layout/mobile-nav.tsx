import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'wouter';
import { Home, Search, BookOpen, User, BrainCircuit } from 'lucide-react';

export default function MobileNav() {
  const { t } = useTranslation();
  const [location] = useLocation();
  
  const navItems = [
    { 
      path: "/", 
      label: t('navigation.home'), 
      icon: <Home className="block mx-auto w-5 h-5" /> 
    },
    { 
      path: "/catalog", 
      label: t('navigation.catalog'), 
      icon: <BookOpen className="block mx-auto w-5 h-5" /> 
    },
    { 
      path: "/ai-assistant", 
      label: t('navigation.aiAssistant'), 
      icon: <BrainCircuit className="block mx-auto w-5 h-5" /> 
    },
    { 
      path: "/dashboard", 
      label: t('navigation.myAccount'), 
      icon: <User className="block mx-auto w-5 h-5" /> 
    },
  ];
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-10">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <a className={`p-3 text-center ${location === item.path ? 'text-primary' : 'text-gray-600'}`}>
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
