import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { Book, Library, Search, BookOpen, LucideMessagesSquare, BookMarked } from 'lucide-react';

// Enhanced home page with Islamic-inspired design
export default function HomePage() {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-12">
      {/* Hero Section with Islamic geometric pattern background */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary/90 to-primary text-white rounded-xl">
        {/* Islamic geometric pattern overlay */}
        <div className="absolute inset-0 opacity-15 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1NiIgaGVpZ2h0PSIxMDAiPgo8cmVjdCB3aWR0aD0iNTYiIGhlaWdodD0iMTAwIiBmaWxsPSIjZmZmZmZmIj48L3JlY3Q+CjxwYXRoIGQ9Ik0yOCA2NkwwIDUwTDAgMTZMMjggMEw1NiAxNkw1NiA1MEwyOCA2NkwyOCAxMDBMNTYgMTAwTDU2IDAgTDI4IDBMMCAwTDAgMTAwTDI4IDEwMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMjIyIiBzdHJva2Utd2lkdGg9IjIiPjwvcGF0aD4KPC9zdmc+')]"></div>
        
        <div className="container relative mx-auto px-4 py-16 text-center">
          <div className="mb-4 flex justify-center">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 font-serif">
            {t('home.hero.title', 'Al Hikmah Library')}
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            {t('home.hero.subtitle', 'Your gateway to the treasures of Islamic knowledge and wisdom')}
          </p>
          <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
            <Link href="/catalog" className="bg-white text-primary font-medium px-6 py-3 rounded-md hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
              <Library className="h-5 w-5" />
              {t('home.hero.browseButton', 'Browse Catalog')}
            </Link>
            <Link href="/ai-assistant" className="bg-primary-foreground text-white font-medium px-6 py-3 rounded-md hover:bg-primary-foreground/90 transition-colors flex items-center justify-center gap-2">
              <LucideMessagesSquare className="h-5 w-5" />
              {t('home.hero.askAiButton', 'Ask AI Assistant')}
            </Link>
          </div>
        </div>
      </section>
      
      {/* Categories Section with Decorative Borders */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold inline-block mb-2 relative font-serif">
              {t('home.categories.title', 'Explore Knowledge Categories')}
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 w-24 bg-primary rounded"></span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              {t('home.categories.subtitle', 'Discover a vast collection of Islamic literature across various fields of study')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: <Book className="h-12 w-12 text-primary" />, 
                title: t('categories.quran', 'Quran Studies'),
                titleAr: 'دراسات القرآن',
                count: 124
              },
              { 
                icon: <BookMarked className="h-12 w-12 text-primary" />, 
                title: t('categories.hadith', 'Hadith'),
                titleAr: 'الحديث',
                count: 98
              },
              { 
                icon: <Library className="h-12 w-12 text-primary" />, 
                title: t('categories.fiqh', 'Fiqh & Jurisprudence'),
                titleAr: 'الفقه',
                count: 156
              },
            ].map((category, i) => (
              <div key={i} className="border border-primary/20 rounded-lg p-6 text-center hover:shadow-md transition-shadow bg-white group hover:border-primary/50">
                <div className="flex justify-center mb-4">
                  {category.icon}
                </div>
                <h3 className="text-xl font-bold mb-1 text-gray-800">
                  {category.title}
                </h3>
                <p className="text-lg mb-2 font-medium text-primary/80 rtl">
                  {category.titleAr}
                </p>
                <p className="text-muted-foreground">
                  {t('categories.bookCount', '{{count}} books available', { count: category.count })}
                </p>
                <Link href={`/catalog?category=${category.title}`} className="mt-4 inline-block text-primary hover:underline text-sm">
                  {t('common.browseCategory', 'Browse this category')} →
                </Link>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link href="/catalog" className="text-primary hover:underline flex items-center justify-center gap-1 mx-auto w-fit">
              {t('home.categories.viewAll', 'View all categories')}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Featured Books with Decorative Elements */}
      <section className="py-12 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-block relative">
              <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-primary"></div>
              <div className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-primary"></div>
              <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-primary"></div>
              <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-primary"></div>
              <h2 className="text-3xl font-bold mb-2 px-6 py-2 font-serif">
                {t('home.featured.title', 'Featured Books')}
              </h2>
            </div>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              {t('home.featured.subtitle', 'Discover our most popular and recently added Islamic literature')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "The Noble Quran",
                titleAr: "القرآن الكريم",
                author: "Translation & Commentary",
                authorAr: "ترجمة وتفسير",
                image: "https://images.unsplash.com/photo-1594732832278-abd644401426?w=500&h=350&fit=crop",
                available: true
              },
              {
                title: "Sahih Al-Bukhari",
                titleAr: "صحيح البخاري",
                author: "Imam Bukhari",
                authorAr: "الإمام البخاري",
                image: "https://images.unsplash.com/photo-1590656872261-81a78d508292?w=500&h=350&fit=crop",
                available: true
              },
              {
                title: "Riyad as-Salihin",
                titleAr: "رياض الصالحين",
                author: "Imam An-Nawawi",
                authorAr: "الإمام النووي",
                image: "https://images.unsplash.com/photo-1565371577816-596d0f21dd6f?w=500&h=350&fit=crop",
                available: false
              }
            ].map((book, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm group hover:shadow-md transition-all duration-300 border border-gray-100">
                <div className="h-48 relative overflow-hidden">
                  <img 
                    src={book.image} 
                    alt={book.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <div>
                      <p className="text-white text-right rtl text-lg font-semibold mb-1">{book.titleAr}</p>
                      <p className="text-white/80 text-right rtl text-sm">{book.authorAr}</p>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-800">{book.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{book.author}</p>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${book.available ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                      {book.available 
                        ? t('home.featured.available', 'Available') 
                        : t('home.featured.borrowed', 'Borrowed')}
                    </span>
                    <Link href={`/books/${i+1}`} className="text-primary text-sm hover:underline flex items-center gap-1">
                      {t('common.details', 'Details')}
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link href="/catalog" className="inline-flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-6 py-2 rounded-md transition-colors">
              <Library className="h-4 w-4" />
              {t('home.featured.viewAll', 'Browse complete catalog')}
            </Link>
          </div>
        </div>
      </section>
      
      {/* AI Assistant with Islamic Pattern Background */}
      <section className="py-16 relative overflow-hidden">
        {/* Islamic pattern background */}
        <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4NiIgaGVpZ2h0PSI4NiI+CjxyZWN0IHdpZHRoPSI4NiIgaGVpZ2h0PSI4NiIgZmlsbD0id2hpdGUiPjwvcmVjdD4KPGcgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMjIyIiBzdHJva2Utd2lkdGg9IjIiPgo8cGF0aCBkPSJNNDMsMzUgTDQzLDlMNTIsOSA2MSwxNSA2MSwyOSA1MiwzNSA0MywzNSIgLz4KPHBhdGggZD0iTTQzLDM1IEw0Myw5IDM0LDkgMjUsMTUgMjUsMjkgMzQsMzUgNDMsMzUiIC8+CjxwYXRoIGQ9Ik00Myw0MyBMNDMsNjkgMzQsNjkgMjUsNjMgMjUsNDkgMzQsNDMgNDMsNDMiIC8+CjxwYXRoIGQ9Ik00Myw0MyBMNDMsNjkgNTIsNjkgNjEsNjMgNjEsNDkgNTIsNDMgNDMsNDMiIC8+Cjwvc3ZnPg==')] bg-repeat"></div>
        
        <div className="container relative mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 font-serif inline-block relative">
              {t('home.aiAssistant.title', 'Islamic Knowledge Assistant')}
              <div className="absolute left-0 right-0 h-1 -bottom-1 bg-primary"></div>
            </h2>
            <p className="text-center text-muted-foreground mt-4 max-w-3xl mx-auto">
              {t('home.aiAssistant.subtitle', 'Get instant answers to your Islamic questions with references from the Quran, Hadith, and scholarly sources, in both English and Arabic.')}
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md border border-primary/20">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <LucideMessagesSquare className="h-8 w-8 text-primary" />
              </div>
            </div>
            
            <p className="text-gray-700 mb-3 font-medium text-center">
              {t('home.aiAssistant.askQuestion', 'Ask your question about Islam:')}
            </p>
            <div className="flex mb-4">
              <input 
                type="text"
                className="flex-1 border border-gray-300 rounded-l-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={t('home.aiAssistant.placeholder', 'E.g., What does the Quran say about kindness?')}
              />
              <button className="bg-primary text-white px-5 py-3 rounded-r-md hover:bg-primary/90 transition-colors flex items-center gap-2">
                <Search className="h-4 w-4" />
                {t('aiAssistant.askButton', 'Ask')}
              </button>
            </div>
            
            <div className="text-center text-sm text-gray-500 mt-4">
              {t('home.aiAssistant.supportedLanguages', 'Supports both English and Arabic questions')} • 
              {t('home.aiAssistant.authenticSources', 'Uses authentic Islamic sources')}
            </div>
            
            <div className="border-t border-gray-100 mt-6 pt-6">
              <p className="text-sm text-gray-600 mb-3">
                {t('aiAssistant.suggestedQuestions', 'Popular questions:')}
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  t('home.aiAssistant.sampleQuestions.howToPray', 'How to perform Salah?'),
                  t('home.aiAssistant.sampleQuestions.hadithHonesty', 'Hadith about honesty'),
                  t('home.aiAssistant.sampleQuestions.ramadan', 'Significance of Ramadan'),
                ].map((question, i) => (
                  <button key={i} className="text-primary hover:bg-primary/5 border border-primary/20 rounded-full px-3 py-1 text-sm">
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <Link href="/ai-assistant" className="inline-flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-6 py-2 rounded-md transition-colors">
              <LucideMessagesSquare className="h-4 w-4" />
              {t('home.aiAssistant.learnMore', 'Explore the AI Assistant')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
