import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Category } from '@shared/schema';
import CategoryCard from '@/components/ui/category-card';
import { useLanguage } from '@/hooks/use-language';
import { Skeleton } from '@/components/ui/skeleton';

export default function CategorySection() {
  const { t } = useTranslation();
  const { isRtl } = useLanguage();
  
  // Fetch categories from API
  const { data: categories, isLoading, error } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Create skeleton placeholders for loading state
  const skeletons = Array(6).fill(0).map((_, index) => (
    <div key={`skeleton-${index}`} className="bg-neutral rounded-lg p-6 text-center shadow-sm">
      <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4">
        <Skeleton className="w-full h-full rounded-full" />
      </div>
      <Skeleton className="h-6 w-24 mx-auto mb-2" />
      <Skeleton className="h-4 w-16 mx-auto" />
    </div>
  ));
  
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className={`text-2xl font-bold mb-8 text-center ${isRtl ? 'font-amiri' : 'font-roboto'}`}>
          {t('home.categories.title')}
        </h2>
        
        {error ? (
          <div className="text-center text-error">
            {t('common.error')}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {isLoading ? (
              skeletons
            ) : (
              categories?.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
}
