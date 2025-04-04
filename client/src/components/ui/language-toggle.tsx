import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";

export default function LanguageToggle() {
  const { t } = useTranslation();
  const { language, toggleLanguage } = useLanguage();
  
  return (
    <Button
      id="language-toggle"
      variant="ghost"
      className="p-2 rounded-full hover:bg-primary-dark focus:outline-none transition-colors"
      onClick={toggleLanguage}
    >
      <span className={language === "en" ? "" : "hidden"}>🇳🇬 EN</span>
      <span className={language === "ar" ? "" : "hidden"}>🇳🇬 عربي</span>
    </Button>
  );
}
