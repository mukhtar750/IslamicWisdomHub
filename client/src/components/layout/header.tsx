import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';
import LanguageToggle from '@/components/ui/language-toggle';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';

export default function Header() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { isRtl } = useLanguage();

  const toggleMobileMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navItems = [
    { path: '/', label: t('navigation.home') },
    { path: '/catalog', label: t('navigation.catalog') },
    { path: '/ai-assistant', label: t('navigation.aiAssistant') },
    { path: '/about', label: t('navigation.about') },
  ];

  const userInitials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((name) => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : '';

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo and Title */}
        <Link href="/">
          <div className="flex items-center space-x-2 cursor-pointer">
            <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-primary font-bold text-lg font-amiri">م</span>
            </div>
            <div>
              <h1 className={`font-roboto font-bold text-xl ${isRtl ? 'font-amiri' : ''}`}>
                {t('common.appName')}
              </h1>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a
                className={`hover:text-secondary transition-colors ${
                  location === item.path ? 'text-secondary' : ''
                }`}
              >
                {item.label}
              </a>
            </Link>
          ))}
        </nav>

        {/* Language Toggle & User Menu */}
        <div className="flex items-center space-x-4">
          <LanguageToggle />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-2 rounded-full hover:bg-primary-dark focus:outline-none transition-colors">
                  <Avatar className="h-8 w-8 text-primary bg-white">
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <a className="cursor-pointer w-full">{t('navigation.dashboard')}</a>
                  </Link>
                </DropdownMenuItem>
                {(user.role === 'admin' || user.role === 'librarian') && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <a className="cursor-pointer w-full">
                        {t('admin.title')}
                      </a>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  {t('common.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth">
              <Button variant="ghost" className="text-white hover:bg-primary-dark">
                {t('common.login')}
              </Button>
            </Link>
          )}
          
          {/* Mobile Menu Toggle Button */}
          <Button 
            variant="ghost" 
            className="p-2 md:hidden rounded-full hover:bg-primary-dark focus:outline-none transition-colors"
            onClick={toggleMobileMenu}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-primary-dark text-white py-4 px-4">
          <nav className="flex flex-col space-y-3">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <a
                  className={`hover:text-secondary transition-colors ${
                    location === item.path ? 'text-secondary' : ''
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              </Link>
            ))}
            {!user && (
              <Link href="/auth">
                <a className="text-white hover:text-secondary" onClick={() => setIsOpen(false)}>
                  {t('common.login')}
                </a>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
