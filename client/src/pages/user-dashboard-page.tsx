import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Book, Borrowing, Bookmark, UserActivity } from '@shared/schema';
import { format, formatDistance } from 'date-fns';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Book as BookIcon, 
  BookmarkIcon, 
  Clock, 
  Settings, 
  User, 
  BrainCircuit,
  Calendar,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';

export default function UserDashboardPage() {
  const { t } = useTranslation();
  const { language, isRtl } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('current');
  
  // Fetch user borrowings
  const { data: borrowings, isLoading: borrowingsLoading } = useQuery<Borrowing[]>({
    queryKey: ['/api/borrowings'],
  });
  
  // Fetch user bookmarks
  const { data: bookmarks, isLoading: bookmarksLoading } = useQuery<Bookmark[]>({
    queryKey: ['/api/bookmarks'],
  });
  
  // Fetch books for reference
  const { data: books } = useQuery<Book[]>({
    queryKey: ['/api/books'],
  });
  
  // Fetch user activity
  const { data: activities, isLoading: activitiesLoading } = useQuery<UserActivity[]>({
    queryKey: ['/api/user-activity'],
  });
  
  // Return book mutation
  const returnBookMutation = useMutation({
    mutationFn: async (borrowingId: number) => {
      const res = await apiRequest('PATCH', `/api/borrowings/${borrowingId}/return`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/borrowings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      toast({
        title: 'Book Returned',
        description: 'The book has been successfully returned.',
      });
    },
  });
  
  // Remove bookmark mutation
  const removeBookmarkMutation = useMutation({
    mutationFn: async (bookmarkId: number) => {
      await apiRequest('DELETE', `/api/bookmarks/${bookmarkId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookmarks'] });
      toast({
        title: 'Bookmark Removed',
        description: 'The bookmark has been removed.',
      });
    },
  });
  
  // Renew book mutation (would need backend implementation)
  const renewBookMutation = useMutation({
    mutationFn: async (borrowingId: number) => {
      // This would extend the due date in a real implementation
      const res = await apiRequest('PATCH', `/api/borrowings/${borrowingId}/renew`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/borrowings'] });
      toast({
        title: 'Book Renewed',
        description: 'The book has been successfully renewed.',
      });
    },
  });
  
  // Filter active borrowings
  const activeBorrowings = borrowings?.filter(b => 
    b.status === 'active' || b.status === 'overdue'
  ) || [];
  
  // Filter past borrowings
  const pastBorrowings = borrowings?.filter(b => 
    b.status === 'returned'
  ) || [];
  
  // Helper to get book details
  const getBook = (bookId: number) => {
    return books?.find(book => book.id === bookId);
  };
  
  // Helper to format dates
  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMM d, yyyy');
  };
  
  // Helper to determine due date status
  const getDueStatus = (dueDate: Date) => {
    const now = new Date();
    const due = new Date(dueDate);
    if (due < now) {
      return 'overdue';
    }
    
    // If due within 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);
    if (due < threeDaysFromNow) {
      return 'soon';
    }
    
    return 'ok';
  };
  
  // Create user initials
  const userInitials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((name) => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : '';
  
  // Count statistics
  const totalBorrowed = borrowings?.length || 0;
  const currentlyBorrowed = activeBorrowings.length;
  const totalBookmarks = bookmarks?.length || 0;
  
  if (!user) {
    return null; // This should never happen due to ProtectedRoute
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
        <div className="flex items-center">
          <Avatar className="h-12 w-12 bg-primary text-white mr-4">
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className={`text-2xl font-bold ${isRtl ? 'font-amiri' : ''}`}>
              {t('dashboard.welcome')}, {user.fullName}
            </h1>
            <p className="text-gray-600">
              {t('home.dashboard.memberSince')} {format(new Date(user.createdAt), 'MMMM yyyy')}
            </p>
          </div>
        </div>
        
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Settings size={16} />
          {t('dashboard.settings')}
        </Button>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
              <BookIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">{t('dashboard.myBooks')}</p>
              <h3 className="text-2xl font-bold">{currentlyBorrowed}</h3>
              <p className="text-sm text-gray-500">
                {t('dashboard.borrowingHistory')}: {totalBorrowed}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
              <BookmarkIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">{t('dashboard.savedBooks')}</p>
              <h3 className="text-2xl font-bold">{totalBookmarks}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
              <BrainCircuit className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">{t('dashboard.aiHistory')}</p>
              <h3 className="text-2xl font-bold">
                {activities?.filter(a => a.activityType === 'query').length || 0}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Borrowings Section */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.myBooks')}</CardTitle>
            <CardDescription>
              {t('dashboard.borrowingHistory')}
            </CardDescription>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="current">
                  {t('dashboard.currentlyBorrowed')}
                  {activeBorrowings.length > 0 && (
                    <Badge className="ml-2 bg-secondary">{activeBorrowings.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="past">
                  {t('dashboard.pastBorrowings')}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <TabsContent value="current" className="mt-0">
              {borrowingsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : activeBorrowings.length > 0 ? (
                <div className="space-y-4">
                  {activeBorrowings.map((borrowing) => {
                    const book = getBook(borrowing.bookId);
                    const dueStatus = getDueStatus(borrowing.dueDate);
                    
                    if (!book) return null;
                    
                    return (
                      <Card key={borrowing.id} className="overflow-hidden">
                        <div className={`h-2 ${
                          dueStatus === 'overdue' ? 'bg-error' : 
                          dueStatus === 'soon' ? 'bg-warning' : 
                          'bg-success'
                        }`} />
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="flex items-start md:items-center mb-4 md:mb-0">
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
                              <div>
                                <h3 className="font-bold text-lg">
                                  {language === 'ar' ? book.titleAr : book.title}
                                </h3>
                                <p className="text-gray-500">
                                  {language === 'ar' ? book.authorAr : book.author}
                                </p>
                                <div className="flex items-center mt-1">
                                  <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                  <span className="text-xs text-gray-500">
                                    {t('book.borrowButton')}: {formatDate(borrowing.borrowDate)}
                                  </span>
                                </div>
                                <div className="flex items-center mt-1">
                                  <Clock className="h-4 w-4 mr-1 text-gray-400" />
                                  <span className={`text-xs ${
                                    dueStatus === 'overdue' ? 'text-error' : 
                                    dueStatus === 'soon' ? 'text-warning' : 
                                    'text-gray-500'
                                  }`}>
                                    {t('book.borrowButton')}: {formatDate(borrowing.dueDate)}
                                    {dueStatus === 'overdue' && ` (${formatDistance(new Date(borrowing.dueDate), new Date(), { addSuffix: true })})`}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline"
                                onClick={() => returnBookMutation.mutate(borrowing.id)}
                                disabled={returnBookMutation.isPending}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                {t('book.returnButton')}
                              </Button>
                              <Button 
                                onClick={() => renewBookMutation.mutate(borrowing.id)}
                                disabled={renewBookMutation.isPending || dueStatus === 'overdue'}
                              >
                                <Clock className="h-4 w-4 mr-2" />
                                {t('book.renewButton')}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <BookIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p>You don't have any books currently borrowed.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="past" className="mt-0">
              {borrowingsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : pastBorrowings.length > 0 ? (
                <div className="space-y-4">
                  {pastBorrowings.map((borrowing) => {
                    const book = getBook(borrowing.bookId);
                    if (!book) return null;
                    
                    return (
                      <Card key={borrowing.id}>
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="flex items-start md:items-center">
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
                              <div>
                                <h3 className="font-bold text-lg">
                                  {language === 'ar' ? book.titleAr : book.title}
                                </h3>
                                <p className="text-gray-500">
                                  {language === 'ar' ? book.authorAr : book.author}
                                </p>
                                <div className="grid grid-cols-2 gap-x-4 mt-2">
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                    <span className="text-xs text-gray-500">
                                      {t('book.borrowButton')}: {formatDate(borrowing.borrowDate)}
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    <CheckCircle2 className="h-4 w-4 mr-1 text-success" />
                                    <span className="text-xs text-gray-500">
                                      {t('book.returnButton')}: {borrowing.returnDate ? formatDate(borrowing.returnDate) : 'N/A'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <BookIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p>You don't have any past borrowing history.</p>
                </div>
              )}
            </TabsContent>
          </CardContent>
        </Card>
      </div>
      
      {/* Bookmarks Section */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.savedBooks')}</CardTitle>
            <CardDescription>
              Your bookmarked books for future reference
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bookmarksLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : bookmarks && bookmarks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookmarks.map((bookmark) => {
                  const book = getBook(bookmark.bookId);
                  if (!book) return null;
                  
                  return (
                    <Card key={bookmark.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex">
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
                            <h3 className="font-medium text-sm line-clamp-2">
                              {language === 'ar' ? book.titleAr : book.title}
                            </h3>
                            <p className="text-xs text-gray-500 mb-2">
                              {language === 'ar' ? book.authorAr : book.author}
                            </p>
                            <div className="flex justify-between items-center">
                              <Button 
                                size="sm" 
                                asChild
                                className="text-xs px-2 py-1 h-auto"
                              >
                                <a href={`/book/${book.id}`}>
                                  {book.available ? t('book.borrowButton') : t('book.viewButton')}
                                </a>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => removeBookmarkMutation.mutate(bookmark.id)}
                                disabled={removeBookmarkMutation.isPending}
                                className="text-xs px-2 py-1 h-auto"
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <BookmarkIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p>You haven't bookmarked any books yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
