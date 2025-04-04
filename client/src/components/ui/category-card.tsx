import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Category } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  
  const name = language === "ar" ? category.nameAr : category.name;
  
  return (
    <Link href={`/catalog?category=${encodeURIComponent(category.name)}`}>
      <a className="block">
        <Card className="bg-neutral rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-0">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-icons text-primary">{category.icon}</span>
            </div>
            <h3 className="font-medium">{name}</h3>
            <p className="text-sm text-gray-600 mt-2">
              {category.bookCount} {t('home.categories.books')}
            </p>
          </CardContent>
        </Card>
      </a>
    </Link>
  );
}
