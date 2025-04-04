import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Book, Borrowing, Bookmark } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings, Book as BookIcon } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';

export default function UserDashboardPreview() {
  const { t } = useTranslation();
  const { isRtl } = useLanguage();
  const { user } = useAuth();
  
  // If user isn't logged in, don't show dashboard preview
  if (!user) {
    return null;
  }
  
  // Fetch user borrowings
  const { data: borrowings, isLoading: borrowingsLoading } = useQuery<Borrowing[]>({
    queryKey: ['/api/borrowings'],
    enabled: !!user,
  });
  
  // Fetch user bookmarks
  const { data: bookmarks, isLoading: bookmarksLoading } = useQuery<Bookmark[]>({
    queryKey: ['/api/bookmarks'],
    enabled: !!user,
  });
  
  // Fetch books for the bookmarks
  const { data: books } = useQuery<Book[]>({
    queryKey: ['/api/books'],
  });
  
  // Return book mutation
  const returnBookMutation = useMutation({
    mutationFn: async (borrowingId: number) => {
      const res = await apiRequest('PATCH', `/api/borrowings/${borrowingId}/return`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/borrowings'] });
    }
  });
  
  // Renew book mutation
  const renewBookMutation = useMutation({
    mutationFn: async (borrowingId: number) => {
      // In a real app, this would extend the due date
      const res = await apiRequest('PATCH', `/api/borrowings/${borrowingId}/renew`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/borrowings'] });
    }
  });
  
  // Get books for borrowings
  const getBookForBorrowing = (bookId: number) => {
    return books?.find(book => book.id === bookId);
  };
  
  // Get books for bookmarks
  const getBookForBookmark = (bookId: number) => {
    return books?.find(book => book.id === bookId);
  };
  
  // Calculate days until due or days overdue
  const getDueDays = (dueDate: Date) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  // Format created at date
  const formatMemberSince = (date: Date) => {
    return format(new Date(date), 'MMM yyyy');
  };
  
  // Activity statistics
  const borrowedCount = borrowings?.filter(b => b.status === 'active' || b.status === 'overdue').length || 0;
  const returnedCount = borrowings?.filter(b => b.status === 'returned').length || 0;
  const bookmarksCount = bookmarks?.length || 0;
  const aiQueriesCount = 0; // Would fetch from API in a full implementation
  
  return (
    <section className="py-12 bg-neutral">
      <div className="container mx-auto px-4">
        <h2 className={`text-2xl font-bold mb-8 text-center ${isRtl ? 'font-amiri' : 'font-roboto'}`}>
          {t('home.dashboard.title')}
        </h2>
        
        <Card className="bg-white rounded-xl overflow-hidden shadow-lg">
          <div className="bg-primary text-white p-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">{t('home.dashboard.userDashboard')}</h3>
              <Button variant="ghost" size="icon" className="bg-white/20 hover:bg-white/30 rounded-full h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:space-x-6">
              {/* Left column: User info and stats */}
              <div className="md:w-1/3 mb-6 md:mb-0">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                    <span className="material-icons text-3xl text-primary">person</span>
                  </div>
                  <div>
                    <h4 className="font-medium">
                      {t('home.dashboard.welcome')}, {user.fullName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {t('home.dashboard.memberSince')} {formatMemberSince(user.createdAt)}
                    </p>
                  </div>
                </div>
                
                <div className="bg-neutral p-4 rounded-lg">
                  <h4 className="font-medium mb-3">{t('home.dashboard.activity.title')}</h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">{t('home.dashboard.activity.booksBorrowed')}</span>
                      <span className="font-medium">{borrowedCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">{t('home.dashboard.activity.booksReturned')}</span>
                      <span className="font-medium">{returnedCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">{t('home.dashboard.activity.bookmarks')}</span>
                      <span className="font-medium">{bookmarksCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">{t('home.dashboard.activity.aiQueries')}</span>
                      <span className="font-medium">{aiQueriesCount}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right column: Current books */}
              <div className="md:w-2/3">
                <h4 className="font-medium mb-4">{t('home.dashboard.currentBooks.title')}</h4>
                
                {borrowingsLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={`skeleton-${i}`} className="flex bg-neutral p-4 rounded-lg">
                        <Skeleton className="w-16 h-24 rounded mr-4" />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <Skeleton className="h-5 w-32 mb-1" />
                              <Skeleton className="h-4 w-24 mb-2" />
                            </div>
                            <Skeleton className="h-6 w-24 rounded" />
                          </div>
                          <div className="flex items-center mt-3 space-x-2">
                            <Skeleton className="h-8 w-16 rounded" />
                            <Skeleton className="h-8 w-16 rounded" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : borrowings && borrowings.filter(b => b.status === 'active' || b.status === 'overdue').length > 0 ? (
                  <div className="space-y-4">
                    {borrowings
                      .filter(b => b.status === 'active' || b.status === 'overdue')
                      .slice(0, 2)
                      .map((borrowing) => {
                        const book = getBookForBorrowing(borrowing.bookId);
                        const dueDays = getDueDays(borrowing.dueDate);
                        const isOverdue = dueDays < 0;
                        
                        return book ? (
                          <div key={borrowing.id} className="flex bg-neutral p-4 rounded-lg">
                            {book.coverImage ? (
                              <img 
                                src={book.coverImage} 
                                alt={book.title} 
                                className="w-16 h-24 object-cover rounded mr-4"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://placehold.co/100x150?text=Book';
                                }}
                              />
                            ) : (
                              <div className="w-16 h-24 bg-primary/10 flex items-center justify-center rounded mr-4">
                                <BookIcon className="h-8 w-8 text-primary" />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="font-medium">{book.title}</h5>
                                  <p className="text-sm text-gray-600">{book.author}</p>
                                </div>
                                <div className={`${isOverdue ? 'bg-error/20 text-error' : 'bg-warning/20 text-warning'} text-xs py-1 px-2 rounded`}>
                                  {isOverdue 
                                    ? t('home.dashboard.currentBooks.overdueByDays', { days: Math.abs(dueDays) }) 
                                    : t('home.dashboard.currentBooks.dueInDays', { days: dueDays })}
                                </div>
                              </div>
                              <div className="flex items-center mt-3 space-x-2">
                                <Button 
                                  size="sm" 
                                  className="bg-primary text-white hover:bg-accent transition-colors"
                                  onClick={() => renewBookMutation.mutate(borrowing.id)}
                                  disabled={renewBookMutation.isPending}
                                >
                                  {t('home.dashboard.currentBooks.renew')}
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                                  onClick={() => returnBookMutation.mutate(borrowing.id)}
                                  disabled={returnBookMutation.isPending}
                                >
                                  {t('home.dashboard.currentBooks.return')}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : null;
                      })}
                  </div>
                ) : (
                  <div className="bg-neutral p-4 rounded-lg text-center text-gray-500">
                    {t('dashboard.currentlyBorrowed')}: 0
                  </div>
                )}
                
                <div className="mt-6 flex justify-between items-center">
                  <h4 className="font-medium">{t('home.dashboard.bookmarks.title')}</h4>
                  
                  {bookmarks && bookmarks.length > 0 && (
                    <Link href="/dashboard?tab=bookmarks">
                      <a className="text-primary hover:text-accent text-sm flex items-center">
                        <span>{t('home.dashboard.bookmarks.viewAll')}</span>
                        <span className="material-icons text-sm">arrow_forward</span>
                      </a>
                    </Link>
                  )}
                </div>
                
                {bookmarksLoading ? (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {[1, 2].map((i) => (
                      <div key={`bookmark-skeleton-${i}`} className="flex bg-neutral p-3 rounded-lg">
                        <Skeleton className="w-12 h-20 rounded mr-3" />
                        <div>
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-20 mb-2" />
                          <Skeleton className="h-6 w-16 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : bookmarks && bookmarks.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {bookmarks.slice(0, 2).map((bookmark) => {
                      const book = getBookForBookmark(bookmark.bookId);
                      
                      return book ? (
                        <div key={bookmark.id} className="flex bg-neutral p-3 rounded-lg">
                          {book.coverImage ? (
                            <img 
                              src={book.coverImage} 
                              alt={book.title} 
                              className="w-12 h-20 object-cover rounded mr-3"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/80x120?text=Book';
                              }}
                            />
                          ) : (
                            <div className="w-12 h-20 bg-primary/10 flex items-center justify-center rounded mr-3">
                              <BookIcon className="h-6 w-6 text-primary" />
                            </div>
                          )}
                          <div>
                            <h5 className="font-medium text-sm">{book.title}</h5>
                            <p className="text-xs text-gray-600">{book.author}</p>
                            <Link href={`/book/${book.id}`}>
                              <Button 
                                variant="link" 
                                size="sm" 
                                className="mt-2 text-primary hover:text-accent text-xs px-0 h-auto flex items-center"
                              >
                                <BookIcon className="h-3 w-3 mr-1" />
                                {t('home.dashboard.bookmarks.borrow')}
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <div className="bg-neutral p-4 rounded-lg text-center text-gray-500 mt-4">
                    {t('dashboard.savedBooks')}: 0
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <Link href="/dashboard">
                <Button className="bg-primary text-white rounded-full hover:bg-accent transition-colors">
                  {t('home.dashboard.goToDashboard')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
