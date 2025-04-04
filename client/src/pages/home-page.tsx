import { useTranslation } from 'react-i18next';

// Simplified home page that doesn't rely on complex components or hooks
export default function HomePage() {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t('home.hero.title', 'Discover Islamic Knowledge')}
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            {t('home.hero.subtitle', 'Access the wealth of Islamic literature and wisdom from Al Hikmah Library\'s digital platform')}
          </p>
          <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
            <button className="bg-white text-primary font-medium px-6 py-3 rounded-md hover:bg-gray-100 transition-colors">
              {t('home.hero.browseButton', 'Browse Catalog')}
            </button>
            <button className="bg-secondary text-white font-medium px-6 py-3 rounded-md hover:bg-secondary-dark transition-colors">
              {t('home.hero.askAiButton', 'Ask AI Assistant')}
            </button>
          </div>
        </div>
      </section>
      
      {/* Featured Content Preview */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {t('home.featured.title', 'Featured Books')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="h-40 bg-gray-200"></div>
                <div className="p-4">
                  <h3 className="font-bold text-lg">Example Book {i}</h3>
                  <p className="text-gray-600 text-sm mb-2">Author Name</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                      {t('home.featured.available', 'Available')}
                    </span>
                    <button className="text-primary text-sm hover:underline">
                      {t('common.more', 'More')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-6">
            <button className="text-primary hover:underline">
              {t('home.featured.viewAll', 'View all')}
            </button>
          </div>
        </div>
      </section>
      
      {/* AI Assistant Preview */}
      <section className="py-8 bg-slate-50 rounded-xl">
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-2 text-center">
            {t('home.aiAssistant.title', 'Islamic Knowledge Assistant')}
          </h2>
          <p className="text-center text-gray-600 mb-8 max-w-3xl mx-auto">
            {t('home.aiAssistant.subtitle', 'Get answers to your Islamic questions with references from the Quran, Hadith, and Sunnah, in both English and Arabic.')}
          </p>
          
          <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-700 mb-2 font-medium">
              {t('home.aiAssistant.askQuestion', 'Ask your question:')}
            </p>
            <div className="flex mb-4">
              <input 
                type="text"
                className="flex-1 border rounded-l-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={t('home.aiAssistant.placeholder', 'E.g., What does the Quran say about kindness?')}
              />
              <button className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-primary-dark transition-colors">
                {t('aiAssistant.askButton', 'Ask')}
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="text-gray-500">{t('aiAssistant.suggestedQuestions', 'Suggested:')}</span>
              <button className="text-primary hover:underline">
                {t('home.aiAssistant.sampleQuestions.howToPray', 'How to pray?')}
              </button>
              <button className="text-primary hover:underline">
                {t('home.aiAssistant.sampleQuestions.hadithHonesty', 'Hadith about honesty')}
              </button>
            </div>
          </div>
          
          <div className="text-center mt-6">
            <a href="/ai-assistant" className="text-primary hover:underline">
              {t('home.aiAssistant.learnMore', 'Learn more about the AI Assistant')}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
