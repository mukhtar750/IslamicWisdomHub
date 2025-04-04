import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Book } from '@shared/schema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SearchBox() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isResultsVisible, setIsResultsVisible] = useState(false);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Search results query
  const { data: searchResults, isLoading } = useQuery<Book[]>({
    queryKey: ['/api/books', 'search', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      const res = await fetch(`/api/books?search=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error('Failed to search books');
      return await res.json();
    },
    enabled: searchQuery.length >= 2
  });
  
  // Handle clicks outside of search results to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchResultsRef.current && 
        !searchResultsRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsResultsVisible(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsResultsVisible(value.length >= 2);
  };
  
  // Handle book selection
  const handleBookSelect = () => {
    setIsResultsVisible(false);
    setSearchQuery('');
  };
  
  return (
    <div className="max-w-2xl mx-auto relative">
      <div className="flex bg-white rounded-lg shadow-lg overflow-hidden">
        <Input
          ref={inputRef}
          type="text"
          className="w-full py-4 px-6 text-lg border-none focus:ring-0"
          placeholder={t('home.hero.searchPlaceholder')}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => searchQuery.length >= 2 && setIsResultsVisible(true)}
        />
        <Button className="bg-secondary text-white px-6 rounded-none hover:bg-accent transition-colors">
          <Search className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Search Results Dropdown */}
      {isResultsVisible && (
        <div 
          ref={searchResultsRef}
          className="absolute left-0 right-0 bg-white mt-2 rounded-lg shadow-lg z-10"
        >
          <div className="p-4 border-b border-gray-200">
            <p className="text-sm text-gray-500">{t('home.hero.quickResults')}</p>
          </div>
          
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">
              {t('common.loading')}
            </div>
          ) : searchResults && searchResults.length > 0 ? (
            <div>
              {searchResults.slice(0, 5).map((book) => (
                <Link href={`/book/${book.id}`} key={book.id}>
                  <a className="p-4 hover:bg-neutral cursor-pointer flex items-center" onClick={handleBookSelect}>
                    {book.coverImage && (
                      <div className="w-10 h-14 bg-gray-200 mr-4">
                        <img 
                          src={book.coverImage} 
                          alt={book.title} 
                          className="w-10 h-14 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/60x80?text=Book';
                          }}
                        />
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium">{book.title}</h4>
                      <p className="text-sm text-gray-600">By {book.author}</p>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          ) : searchQuery.length >= 2 ? (
            <div className="p-6 text-center text-gray-500">
              {t('catalog.noResults')}
            </div>
          ) : null}
          
          {searchResults && searchResults.length > 5 && (
            <div className="p-4 border-t border-gray-200 text-center">
              <Link href={`/catalog?search=${encodeURIComponent(searchQuery)}`}>
                <a className="text-primary hover:text-accent" onClick={handleBookSelect}>
                  {t('home.hero.viewAllResults')}
                </a>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
