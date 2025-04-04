import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Book, InsertBook, Category, User as SelectUser, Borrowing } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Book as BookIcon, 
  Plus, 
  Users, 
  Library, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  CheckCircle, 
  CheckSquare,
  UserCog,
  BookOpen,
  Search,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';

// Form schema for book creation/editing
const bookFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  titleAr: z.string().min(1, 'Arabic title is required'),
  author: z.string().min(1, 'Author is required'),
  authorAr: z.string().min(1, 'Arabic author is required'),
  category: z.string().min(1, 'Category is required'),
  categoryAr: z.string(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  isbn: z.string().optional(),
  publicationYear: z.coerce.number().optional(),
  coverImage: z.string().optional(),
  available: z.boolean().default(true),
  inventoryId: z.string().min(1, 'Inventory ID is required'),
});

// Form schema for category creation/editing
const categoryFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  nameAr: z.string().min(1, 'Arabic name is required'),
  icon: z.string().min(1, 'Icon is required'),
  bookCount: z.coerce.number().default(0),
});

type BookFormValues = z.infer<typeof bookFormSchema>;
type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const { isRtl } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('books');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  
  // Fetch books
  const { data: books, isLoading: booksLoading } = useQuery<Book[]>({
    queryKey: ['/api/books'],
  });
  
  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Fetch users
  const { data: users, isLoading: usersLoading } = useQuery<SelectUser[]>({
    queryKey: ['/api/users'],
  });
  
  // Fetch borrowings
  const { data: borrowings, isLoading: borrowingsLoading } = useQuery<Borrowing[]>({
    queryKey: ['/api/borrowings'],
  });
  
  // Book form
  const bookForm = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: '',
      titleAr: '',
      author: '',
      authorAr: '',
      category: '',
      categoryAr: '',
      description: '',
      descriptionAr: '',
      isbn: '',
      publicationYear: undefined,
      coverImage: '',
      available: true,
      inventoryId: '',
    },
  });
  
  // Category form
  const categoryForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      nameAr: '',
      icon: 'book',
      bookCount: 0,
    },
  });
  
  // Add book mutation
  const addBookMutation = useMutation({
    mutationFn: async (data: BookFormValues) => {
      const res = await apiRequest('POST', '/api/books', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      setIsAddBookOpen(false);
      bookForm.reset();
      toast({
        title: 'Book Added',
        description: 'The book has been successfully added.',
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
  
  // Update book mutation
  const updateBookMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: BookFormValues }) => {
      const res = await apiRequest('PUT', `/api/books/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      setEditingBook(null);
      bookForm.reset();
      toast({
        title: 'Book Updated',
        description: 'The book has been successfully updated.',
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
  
  // Delete book mutation
  const deleteBookMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/books/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      toast({
        title: 'Book Deleted',
        description: 'The book has been successfully deleted.',
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
  
  // Add category mutation
  const addCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormValues) => {
      const res = await apiRequest('POST', '/api/categories', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setIsAddCategoryOpen(false);
      categoryForm.reset();
      toast({
        title: 'Category Added',
        description: 'The category has been successfully added.',
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
  
  // Update user role mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      const res = await apiRequest('PATCH', `/api/users/${userId}/role`, { role });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: 'Role Updated',
        description: 'The user role has been successfully updated.',
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
  
  // Handle book form submission
  const onSubmitBook = (values: BookFormValues) => {
    // Find the corresponding category Arabic name
    const category = categories?.find(c => c.name === values.category);
    if (category) {
      values.categoryAr = category.nameAr;
    }
    
    if (editingBook) {
      updateBookMutation.mutate({ id: editingBook.id, data: values });
    } else {
      addBookMutation.mutate(values);
    }
  };
  
  // Handle category form submission
  const onSubmitCategory = (values: CategoryFormValues) => {
    if (editingCategory) {
      // Update category (not implemented in API yet)
      toast({
        title: 'Not Implemented',
        description: 'Category update is not implemented yet.',
      });
    } else {
      addCategoryMutation.mutate(values);
    }
  };
  
  // Open edit book dialog
  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    bookForm.reset({
      title: book.title,
      titleAr: book.titleAr,
      author: book.author,
      authorAr: book.authorAr,
      category: book.category,
      categoryAr: book.categoryAr,
      description: book.description || '',
      descriptionAr: book.descriptionAr || '',
      isbn: book.isbn || '',
      publicationYear: book.publicationYear,
      coverImage: book.coverImage || '',
      available: book.available,
      inventoryId: book.inventoryId,
    });
  };
  
  // Handle delete book
  const handleDeleteBook = (id: number) => {
    deleteBookMutation.mutate(id);
  };
  
  // Open edit category dialog
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    categoryForm.reset({
      name: category.name,
      nameAr: category.nameAr,
      icon: category.icon,
      bookCount: category.bookCount,
    });
    setIsAddCategoryOpen(true);
  };
  
  // Handle role change
  const handleRoleChange = (userId: number, role: string) => {
    updateUserRoleMutation.mutate({ userId, role });
  };
  
  // Filter books by search query
  const filteredBooks = books?.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.titleAr.includes(searchQuery) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.authorAr.includes(searchQuery) ||
    book.inventoryId.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get category name by ID
  const getCategoryName = (categoryName: string) => {
    const category = categories?.find(c => c.name === categoryName);
    return category?.name || categoryName;
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMM d, yyyy');
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isRtl ? 'font-amiri' : ''}`}>
            {t('admin.title')}
          </h1>
          <p className="text-gray-600">
            Manage books, users, and borrowings
          </p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="books" className="flex items-center gap-2">
            <BookIcon className="h-4 w-4" />
            {t('admin.books')}
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Library className="h-4 w-4" />
            {t('catalog.filters.categories')}
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t('admin.users')}
          </TabsTrigger>
          <TabsTrigger value="borrowings" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {t('admin.borrowings')}
          </TabsTrigger>
        </TabsList>
        
        {/* Books Tab */}
        <TabsContent value="books">
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={isAddBookOpen || !!editingBook} onOpenChange={(open) => {
              setIsAddBookOpen(open);
              if (!open) {
                setEditingBook(null);
                bookForm.reset();
              }
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsAddBookOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('admin.addBook')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingBook ? t('admin.editBook') : t('admin.addBook')}
                  </DialogTitle>
                  <DialogDescription>
                    {editingBook ? 'Update the book details below.' : 'Fill in the book details below.'}
                  </DialogDescription>
                </DialogHeader>
                <Form {...bookForm}>
                  <form onSubmit={bookForm.handleSubmit(onSubmitBook)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={bookForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title (English)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={bookForm.control}
                        name="titleAr"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title (Arabic)</FormLabel>
                            <FormControl>
                              <Input placeholder="أدخل العنوان" {...field} dir="rtl" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={bookForm.control}
                        name="author"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Author (English)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter author" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={bookForm.control}
                        name="authorAr"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Author (Arabic)</FormLabel>
                            <FormControl>
                              <Input placeholder="أدخل اسم المؤلف" {...field} dir="rtl" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={bookForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories?.map((category) => (
                                <SelectItem key={category.id} value={category.name}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={bookForm.control}
                        name="isbn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ISBN</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter ISBN" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={bookForm.control}
                        name="publicationYear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Publication Year</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter year"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={bookForm.control}
                        name="inventoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Inventory ID</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter inventory ID" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={bookForm.control}
                        name="coverImage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cover Image URL</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter image URL" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={bookForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (English)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter description"
                                className="min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={bookForm.control}
                        name="descriptionAr"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Arabic)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="أدخل الوصف"
                                className="min-h-[120px]"
                                {...field}
                                dir="rtl"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={bookForm.control}
                      name="available"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Available</FormLabel>
                            <FormDescription>
                              Mark if the book is available for borrowing
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsAddBookOpen(false);
                          setEditingBook(null);
                          bookForm.reset();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={addBookMutation.isPending || updateBookMutation.isPending}
                      >
                        {addBookMutation.isPending || updateBookMutation.isPending
                          ? 'Saving...'
                          : editingBook ? 'Update Book' : 'Add Book'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Book</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {booksLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading books...
                        </TableCell>
                      </TableRow>
                    ) : filteredBooks && filteredBooks.length > 0 ? (
                      filteredBooks.map((book) => (
                        <TableRow key={book.id}>
                          <TableCell className="font-medium">{book.inventoryId}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {book.coverImage ? (
                                <img
                                  src={book.coverImage}
                                  alt={book.title}
                                  className="w-10 h-14 object-cover rounded"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://placehold.co/60x80?text=Book';
                                  }}
                                />
                              ) : (
                                <div className="w-10 h-14 bg-primary/10 flex items-center justify-center rounded">
                                  <BookIcon className="h-6 w-6 text-primary" />
                                </div>
                              )}
                              <div>
                                <div className="font-medium">{book.title}</div>
                                <div className="text-sm text-gray-500 font-amiri">{book.titleAr}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>{book.author}</div>
                            <div className="text-sm text-gray-500 font-amiri">{book.authorAr}</div>
                          </TableCell>
                          <TableCell>{getCategoryName(book.category)}</TableCell>
                          <TableCell>
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              book.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {book.available ? 'Available' : 'Borrowed'}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleEditBook(book)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" className="p-0 hover:bg-transparent text-red-600">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This action cannot be undone. This will permanently delete the book
                                          "{book.title}" from the library database.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction 
                                          className="bg-red-600 hover:bg-red-700"
                                          onClick={() => handleDeleteBook(book.id)}
                                          disabled={deleteBookMutation.isPending}
                                        >
                                          {deleteBookMutation.isPending ? 'Deleting...' : 'Delete'}
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No books found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Categories Tab */}
        <TabsContent value="categories">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Categories</h2>
            <Dialog open={isAddCategoryOpen} onOpenChange={(open) => {
              setIsAddCategoryOpen(open);
              if (!open) {
                setEditingCategory(null);
                categoryForm.reset();
              }
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsAddCategoryOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('admin.addCategory')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? 'Edit Category' : 'Add Category'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCategory ? 'Update the category details below.' : 'Fill in the category details below.'}
                  </DialogDescription>
                </DialogHeader>
                <Form {...categoryForm}>
                  <form onSubmit={categoryForm.handleSubmit(onSubmitCategory)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={categoryForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name (English)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={categoryForm.control}
                        name="nameAr"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name (Arabic)</FormLabel>
                            <FormControl>
                              <Input placeholder="أدخل الاسم" {...field} dir="rtl" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={categoryForm.control}
                      name="icon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Icon (Material Icon name)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. menu_book, auto_stories, history_edu" {...field} />
                          </FormControl>
                          <FormDescription>
                            Enter a Material Icons name from <a href="https://fonts.google.com/icons" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Fonts Icons</a>
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsAddCategoryOpen(false);
                          setEditingCategory(null);
                          categoryForm.reset();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={addCategoryMutation.isPending}
                      >
                        {addCategoryMutation.isPending
                          ? 'Saving...'
                          : editingCategory ? 'Update Category' : 'Add Category'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Icon</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Arabic Name</TableHead>
                    <TableHead>Book Count</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoriesLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Loading categories...
                      </TableCell>
                    </TableRow>
                  ) : categories && categories.length > 0 ? (
                    categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="material-icons text-primary">{category.icon}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell className="font-amiri">{category.nameAr}</TableCell>
                        <TableCell>{category.bookCount}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditCategory(category)}
                          >
                            <span className="sr-only">Edit</span>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No categories found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.users')}</CardTitle>
              <CardDescription>
                Manage user accounts and roles
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading users...
                        </TableCell>
                      </TableRow>
                    ) : users && users.length > 0 ? (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 bg-primary text-white">
                                <AvatarFallback>
                                  {user.fullName
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .toUpperCase()
                                    .substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.fullName}</div>
                                <div className="text-sm text-gray-500">@{user.username}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                              user.role === 'librarian' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(user.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                                <DropdownMenuItem 
                                  disabled={user.role === 'user'}
                                  onClick={() => handleRoleChange(user.id, 'user')}
                                >
                                  <User className="h-4 w-4 mr-2" />
                                  User
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  disabled={user.role === 'librarian'}
                                  onClick={() => handleRoleChange(user.id, 'librarian')}
                                >
                                  <BookIcon className="h-4 w-4 mr-2" />
                                  Librarian
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  disabled={user.role === 'admin'}
                                  onClick={() => handleRoleChange(user.id, 'admin')}
                                >
                                  <UserCog className="h-4 w-4 mr-2" />
                                  Admin
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Borrowings Tab */}
        <TabsContent value="borrowings">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.borrowings')}</CardTitle>
              <CardDescription>
                View and manage book borrowings
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Book</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Borrow Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {borrowingsLoading || booksLoading || usersLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading borrowings...
                        </TableCell>
                      </TableRow>
                    ) : borrowings && borrowings.length > 0 ? (
                      borrowings.map((borrowing) => {
                        const book = books?.find(b => b.id === borrowing.bookId);
                        const borrower = users?.find(u => u.id === borrowing.userId);
                        const now = new Date();
                        const dueDate = new Date(borrowing.dueDate);
                        const isOverdue = borrowing.status === 'active' && dueDate < now;
                        
                        return (
                          <TableRow key={borrowing.id}>
                            <TableCell className="font-medium">{borrowing.id}</TableCell>
                            <TableCell>
                              {book ? (
                                <div className="flex items-center gap-3">
                                  {book.coverImage ? (
                                    <img
                                      src={book.coverImage}
                                      alt={book.title}
                                      className="w-10 h-14 object-cover rounded"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://placehold.co/60x80?text=Book';
                                      }}
                                    />
                                  ) : (
                                    <div className="w-10 h-14 bg-primary/10 flex items-center justify-center rounded">
                                      <BookIcon className="h-6 w-6 text-primary" />
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-medium">{book.title}</div>
                                    <div className="text-xs text-gray-500">{book.inventoryId}</div>
                                  </div>
                                </div>
                              ) : (
                                'Unknown Book'
                              )}
                            </TableCell>
                            <TableCell>
                              {borrower ? (
                                <>
                                  <div className="font-medium">{borrower.fullName}</div>
                                  <div className="text-xs text-gray-500">{borrower.email}</div>
                                </>
                              ) : (
                                'Unknown User'
                              )}
                            </TableCell>
                            <TableCell>{formatDate(borrowing.borrowDate)}</TableCell>
                            <TableCell className={isOverdue ? 'text-red-600 font-medium' : ''}>
                              {formatDate(borrowing.dueDate)}
                            </TableCell>
                            <TableCell>
                              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                borrowing.status === 'returned' ? 'bg-green-100 text-green-800' :
                                isOverdue ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {borrowing.status === 'returned' ? 'Returned' :
                                isOverdue ? 'Overdue' : 'Active'}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No borrowings found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
