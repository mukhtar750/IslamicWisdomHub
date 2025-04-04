import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { Book } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import BookCard from '@/components/ui/book-card';
import { useLanguage } from '@/hooks/use-language';

export default function FeaturedBooksSection() {
  const { t } = useTranslation();
  const { isRtl } = useLanguage();
  
  // Fetch featured books
  const { data: books, isLoading, error } = useQuery<Book[]>({
    queryKey: ['/api/books'],
  });
  
  // Create skeleton placeholders for loading state
  const skeletons = Array(5).fill(0).map((_, index) => (
    <div key={`skeleton-${index}`} className="bg-white rounded-lg overflow-hidden shadow-md">
      <div className="aspect-[2/3] bg-gray-200">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
      </div>
    </div>
  ));
  
  return (
    <section className="py-12 bg-neutral">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className={`text-2xl font-bold ${isRtl ? 'font-amiri' : 'font-roboto'}`}>
            {t('home.featured.title')}
          </h2>
          
          <Link href="/catalog">
            <a className="text-primary hover:text-accent flex items-center gap-1">
              <span>{t('home.featured.viewAll')}</span>
              <ArrowRight className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
            </a>
          </Link>
        </div>
        
        {error ? (
          <div className="text-center text-error p-4">
            {t('common.error')}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {isLoading ? (
              skeletons
            ) : (
              books?.slice(0, 5).map((book) => (
                <BookCard key={book.id} book={book} isFeatured />
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
}
