import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Book } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { BookmarkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface BookCardProps {
  book: Book;
  isFeatured?: boolean;
}

export default function BookCard({ book, isFeatured = false }: BookCardProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { user } = useAuth();
  
  const title = language === "ar" ? book.titleAr : book.title;
  const author = language === "ar" ? book.authorAr : book.author;
  
  // Add to bookmarks mutation
  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/bookmarks", { bookId: book.id });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
    }
  });
  
  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) {
      bookmarkMutation.mutate();
    }
  };
  
  return (
    <Link href={`/book/${book.id}`}>
      <a className="block h-full">
        <Card className="h-full bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
          <div className="aspect-[2/3] bg-gray-200 relative">
            {book.coverImage ? (
              <img 
                src={book.coverImage} 
                alt={title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/300x450?text=Book';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                <span className="text-xl font-bold">{title.substring(0, 1)}</span>
              </div>
            )}
            <div className={`absolute top-2 right-2 ${book.available ? 'bg-secondary' : 'bg-error'} text-white text-xs py-1 px-2 rounded`}>
              {book.available ? t('book.available') : t('book.borrowed')}
            </div>
          </div>
          <CardContent className="p-4">
            <h3 className="font-medium mb-1 line-clamp-2">{title}</h3>
            <p className="text-sm text-gray-600 mb-2 line-clamp-1">{author}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">ID: {book.inventoryId}</span>
              {isFeatured && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-1 text-primary hover:text-accent"
                  onClick={handleBookmark}
                  disabled={bookmarkMutation.isPending}
                >
                  <BookmarkIcon size={16} />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </a>
    </Link>
  );
}
