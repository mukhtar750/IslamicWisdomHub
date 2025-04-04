import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Book, Category } from '@shared/schema';
import { useLanguage } from '@/hooks/use-language';
import BookCard from '@/components/ui/book-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { CheckIcon, FilterIcon, SearchIcon, SlidersHorizontal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CatalogPage() {
  const { t } = useTranslation();
  const { language, isRtl } = useLanguage();
  const [location] = useLocation();
  
  // Get search param from URL
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get('search') || '';
  const categoryParam = urlParams.get('category') || '';
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState('title');
  
  // Fetch all books
  const { data: books, isLoading: booksLoading } = useQuery<Book[]>({
    queryKey: ['/api/books'],
  });
  
  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Filter and sort books
  const filteredBooks = books?.filter(book => {
    // Filter by search query
    const matchesSearch = searchQuery 
      ? (book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
         book.titleAr.includes(searchQuery) ||
         book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
         book.authorAr.includes(searchQuery))
      : true;
    
    // Filter by category
    const matchesCategory = selectedCategory 
      ? book.category === selectedCategory
      : true;
    
    // Filter by availability
    const matchesAvailability = availableOnly 
      ? book.available
      : true;
    
    return matchesSearch && matchesCategory && matchesAvailability;
  }) || [];
  
  // Sort books
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return language === 'ar'
          ? a.titleAr.localeCompare(b.titleAr)
          : a.title.localeCompare(b.title);
      case 'author':
        return language === 'ar'
          ? a.authorAr.localeCompare(b.authorAr)
          : a.author.localeCompare(b.author);
      case 'year':
        return (b.publicationYear || 0) - (a.publicationYear || 0);
      default:
        return 0;
    }
  });
  
  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Update URL with search parameter
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    window.history.pushState({}, '', `${location}?${params.toString()}`);
  };
  
  // Handle category selection
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
  };
  
  // Create skeletons for loading state
  const skeletons = Array(9).fill(0).map((_, index) => (
    <div key={`skeleton-${index}`} className="h-full">
      <div className="bg-white rounded-lg overflow-hidden shadow-md h-full">
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
    </div>
  ));
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className={`text-3xl font-bold mb-8 ${isRtl ? 'font-amiri' : 'font-roboto'}`}>
        {t('catalog.title')}
      </h1>
      
      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Input
                type="text"
                placeholder={t('catalog.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <Button type="submit" className="bg-primary hover:bg-accent text-white">
            {t('common.search')}
          </Button>
        </form>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Filters */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <FilterIcon className="h-5 w-5 mr-2" />
              {t('catalog.filter')}
            </h3>
            
            <Accordion type="single" collapsible className="w-full">
              {/* Categories filter */}
              <AccordionItem value="categories">
                <AccordionTrigger>{t('catalog.filters.categories')}</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {categories?.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className={`flex justify-start items-center ${selectedCategory === category.name ? 'bg-primary/10 border-primary' : ''}`}
                          onClick={() => handleCategoryChange(category.name)}
                        >
                          {selectedCategory === category.name && <CheckIcon className="h-4 w-4 mr-2 text-primary" />}
                          <span className="material-icons text-sm mr-1">{category.icon}</span>
                          {language === 'ar' ? category.nameAr : category.name}
                        </Button>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            {/* Available only checkbox */}
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox 
                id="available-only" 
                checked={availableOnly}
                onCheckedChange={(checked) => setAvailableOnly(checked as boolean)}
              />
              <label 
                htmlFor="available-only"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t('catalog.availableOnly')}
              </label>
            </div>
          </div>
          
          {/* Sort */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <SlidersHorizontal className="h-5 w-5 mr-2" />
              {t('catalog.sort')}
            </h3>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('catalog.sort')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Title (A-Z)</SelectItem>
                <SelectItem value="author">Author (A-Z)</SelectItem>
                <SelectItem value="year">Publication Year (Newest)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Books Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {booksLoading ? (
          skeletons
        ) : sortedBooks.length > 0 ? (
          sortedBooks.map(book => (
            <BookCard key={book.id} book={book} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <h3 className="text-lg font-medium text-gray-500">{t('catalog.noResults')}</h3>
          </div>
        )}
      </div>
    </div>
  );
}
