import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Book, Borrowing, Bookmark } from '@shared/schema';
import { format, addDays } from 'date-fns';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Bookmark as BookmarkIcon, Book as BookIcon, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function BookDetailsPage() {
  const { t } = useTranslation();
  const { language, isRtl } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Fetch book details
  const { data: book, isLoading: bookLoading } = useQuery<Book>({
    queryKey: [`/api/books/${id}`],
    enabled: !!id,
  });
  
  // Fetch user's borrowings if logged in
  const { data: borrowings } = useQuery<Borrowing[]>({
    queryKey: ['/api/borrowings'],
    enabled: !!user,
  });
  
  // Fetch user's bookmarks if logged in
  const { data: bookmarks } = useQuery<Bookmark[]>({
    queryKey: ['/api/bookmarks'],
    enabled: !!user,
  });
  
  // Check if user has already borrowed this book
  const hasBorrowed = borrowings?.some(
    b => b.bookId === Number(id) && (b.status === 'active' || b.status === 'overdue')
  );
  
  // Check if user has bookmarked this book
  const bookmark = bookmarks?.find(b => b.bookId === Number(id));
  
  // Borrow book mutation
  const borrowMutation = useMutation({
    mutationFn: async () => {
      // Set due date to 14 days from now
      const dueDate = addDays(new Date(), 14);
      
      const res = await apiRequest('POST', '/api/borrowings', {
        bookId: Number(id),
        dueDate,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/borrowings'] });
      queryClient.invalidateQueries({ queryKey: [`/api/books/${id}`] });
      toast({
        title: t('book.borrowButton'),
        description: 'Book has been successfully borrowed.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Return book mutation
  const returnMutation = useMutation({
    mutationFn: async () => {
      // Find the borrowing ID
      const borrowingId = borrowings?.find(
        b => b.bookId === Number(id) && (b.status === 'active' || b.status === 'overdue')
      )?.id;
      
      if (!borrowingId) throw new Error('Borrowing record not found');
      
      const res = await apiRequest('PATCH', `/api/borrowings/${borrowingId}/return`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/borrowings'] });
      queryClient.invalidateQueries({ queryKey: [`/api/books/${id}`] });
      toast({
        title: t('book.returnButton'),
        description: 'Book has been successfully returned.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Bookmark book mutation
  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/bookmarks', {
        bookId: Number(id),
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookmarks'] });
      toast({
        title: t('book.bookmarkButton'),
        description: 'Book has been added to your bookmarks.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Remove bookmark mutation
  const removeBookmarkMutation = useMutation({
    mutationFn: async () => {
      if (!bookmark) throw new Error('Bookmark not found');
      
      const res = await apiRequest('DELETE', `/api/bookmarks/${bookmark.id}`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookmarks'] });
      toast({
        title: t('book.removeBookmarkButton'),
        description: 'Book has been removed from your bookmarks.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Handle back button
  const handleBack = () => {
    navigate(-1);
  };
  
  // Handle borrow button
  const handleBorrow = () => {
    if (!user) {
      // Redirect to login page
      navigate('/auth');
      return;
    }
    
    borrowMutation.mutate();
  };
  
  // Handle return button
  const handleReturn = () => {
    returnMutation.mutate();
  };
  
  // Handle bookmark button
  const handleBookmark = () => {
    if (!user) {
      // Redirect to login page
      navigate('/auth');
      return;
    }
    
    if (bookmark) {
      removeBookmarkMutation.mutate();
    } else {
      bookmarkMutation.mutate();
    }
  };
  
  if (bookLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-4" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.cancel')}
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Skeleton className="aspect-[2/3] w-full rounded-lg" />
          </div>
          
          <div className="md:col-span-2">
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-6" />
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Skeleton className="h-20 rounded-lg" />
              <Skeleton className="h-20 rounded-lg" />
            </div>
            
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-10 w-full mb-4" />
            
            <Skeleton className="h-32 w-full mt-8" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!book) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">{t('common.notFound')}</h1>
        <p className="mb-6">The requested book could not be found.</p>
        <Button onClick={handleBack}>{t('common.cancel')}</Button>
      </div>
    );
  }
  
  // Set title and content based on language
  const title = language === 'ar' ? book.titleAr : book.title;
  const author = language === 'ar' ? book.authorAr : book.author;
  const category = language === 'ar' ? book.categoryAr : book.category;
  const description = language === 'ar' 
    ? book.descriptionAr || book.description 
    : book.description || book.descriptionAr;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-4" onClick={handleBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t('common.cancel')}
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Book Cover */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="aspect-[2/3] relative overflow-hidden rounded-md">
              {book.coverImage ? (
                <img 
                  src={book.coverImage} 
                  alt={title} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x600?text=Book+Cover';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                  <BookIcon className="h-20 w-20" />
                </div>
              )}
              
              <div className={`absolute top-2 right-2 ${book.available ? 'bg-secondary' : 'bg-error'} text-white text-xs py-1 px-2 rounded`}>
                {book.available ? t('book.available') : t('book.borrowed')}
              </div>
            </div>
            
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">{t('book.bookId')}:</span>
                <span>{book.inventoryId}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">{t('book.published')}:</span>
                <span>{book.publicationYear || 'N/A'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">ISBN:</span>
                <span>{book.isbn || 'N/A'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">{t('catalog.filters.categories')}:</span>
                <span>{category}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Book Details */}
        <div className="md:col-span-2">
          <h1 className={`text-3xl font-bold mb-2 ${isRtl ? 'font-amiri' : ''}`}>{title}</h1>
          <h2 className="text-xl text-gray-600 mb-6 flex items-center">
            <User className="h-5 w-5 mr-2" />
            {author}
          </h2>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            {book.available && !hasBorrowed ? (
              <Button 
                className="bg-primary hover:bg-accent text-white"
                onClick={handleBorrow}
                disabled={borrowMutation.isPending}
              >
                <BookIcon className="h-4 w-4 mr-2" />
                {t('book.borrowButton')}
              </Button>
            ) : hasBorrowed ? (
              <Button 
                className="bg-secondary hover:bg-accent text-white"
                onClick={handleReturn}
                disabled={returnMutation.isPending}
              >
                <BookIcon className="h-4 w-4 mr-2" />
                {t('book.returnButton')}
              </Button>
            ) : (
              <Button disabled className="bg-gray-400 text-white cursor-not-allowed">
                <BookIcon className="h-4 w-4 mr-2" />
                {t('book.unavailable')}
              </Button>
            )}
            
            <Button 
              variant={bookmark ? "default" : "outline"}
              className={bookmark ? "bg-secondary hover:bg-accent text-white" : ""}
              onClick={handleBookmark}
              disabled={bookmarkMutation.isPending || removeBookmarkMutation.isPending}
            >
              <BookmarkIcon className="h-4 w-4 mr-2" />
              {bookmark ? t('book.removeBookmarkButton') : t('book.bookmarkButton')}
            </Button>
          </div>
          
          {/* Book Content */}
          <Tabs defaultValue="about">
            <TabsList>
              <TabsTrigger value="about">{t('book.aboutBook')}</TabsTrigger>
              <TabsTrigger value="author">{t('book.aboutAuthor')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-gray-700 whitespace-pre-line">{description}</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="author" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-medium mb-2">{author}</h3>
                  <Separator className="my-4" />
                  <p className="text-gray-700">
                    {/* In a real application, this would come from the API */}
                    Information about {author} would be displayed here.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
