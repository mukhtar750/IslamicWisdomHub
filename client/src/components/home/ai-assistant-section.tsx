import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InfoIcon, SendIcon } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

interface AIResponse {
  answer: string;
  references: string[];
  language: 'en' | 'ar';
}

export default function AiAssistantSection() {
  const { t } = useTranslation();
  const { language, isRtl } = useLanguage();
  const [query, setQuery] = useState('');
  const [lastQuery, setLastQuery] = useState('');
  
  // AI query mutation
  const aiMutation = useMutation<AIResponse, Error, string>({
    mutationFn: async (question: string) => {
      const res = await apiRequest('POST', '/api/ai-assistant', { query: question });
      return await res.json();
    },
    onSuccess: () => {
      setQuery('');
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setLastQuery(query);
      aiMutation.mutate(query);
    }
  };
  
  const handleSampleQuestion = (question: string) => {
    setQuery(question);
    setLastQuery(question);
    aiMutation.mutate(question);
  };
  
  // Sample questions based on language
  const sampleQuestions = {
    en: [
      t('home.aiAssistant.sampleQuestions.howToPray'),
      t('home.aiAssistant.sampleQuestions.hadithHonesty'),
      t('home.aiAssistant.sampleQuestions.fastingRamadan')
    ],
    ar: [
      t('home.aiAssistant.sampleQuestions.howToPray'),
      t('home.aiAssistant.sampleQuestions.hadithHonesty'),
      t('home.aiAssistant.sampleQuestions.fastingRamadan')
    ]
  };
  
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center bg-primary/5 rounded-xl overflow-hidden">
          <div className="md:w-1/2 p-8 md:p-12">
            <h2 className={`text-2xl md:text-3xl font-bold mb-4 ${isRtl ? 'font-amiri' : 'font-roboto'}`}>
              {t('home.aiAssistant.title')}
            </h2>
            
            <p className="mb-6">
              {t('home.aiAssistant.subtitle')}
            </p>
            
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h3 className="font-medium mb-2">
                {t('home.aiAssistant.askQuestion')}
              </h3>
              
              <form onSubmit={handleSubmit} className="flex">
                <Input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('home.aiAssistant.placeholder')}
                  className="w-full rounded-l-lg border-gray-300 focus:border-primary focus:ring-primary"
                />
                <Button 
                  type="submit" 
                  className="bg-primary text-white rounded-r-lg hover:bg-accent transition-colors"
                  disabled={aiMutation.isPending}
                >
                  <SendIcon size={18} />
                </Button>
              </form>
            </div>
            
            <div className="flex flex-wrap gap-2 text-sm">
              {sampleQuestions[language === 'ar' ? 'ar' : 'en'].map((question, index) => (
                <Button
                  key={index}
                  variant="outline" 
                  size="sm"
                  className="bg-gray-200 px-3 py-1 rounded-full cursor-pointer hover:bg-gray-300 transition-colors"
                  onClick={() => handleSampleQuestion(question)}
                  disabled={aiMutation.isPending}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="md:w-1/2 bg-primary/10 p-8 md:p-12">
            <div className="bg-white rounded-lg shadow-md p-6 max-h-80 overflow-y-auto">
              {lastQuery && (
                <div className="mb-4 border-b pb-4">
                  <p className="italic text-gray-700">{lastQuery}</p>
                </div>
              )}
              
              {aiMutation.isPending ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-pulse text-primary">
                    {t('aiAssistant.loadingAnswer')}
                  </div>
                </div>
              ) : aiMutation.isError ? (
                <div className="text-error py-4">
                  {t('common.error')}: {aiMutation.error.message}
                </div>
              ) : aiMutation.data ? (
                <div>
                  <div className="mb-4" dangerouslySetInnerHTML={{ __html: aiMutation.data.answer.replace(/\n/g, '<br>') }} />
                  
                  {aiMutation.data.references.length > 0 && (
                    <div className="text-xs text-gray-500 flex items-center">
                      <InfoIcon className="h-4 w-4 mr-1" />
                      {t('aiAssistant.references')}: {aiMutation.data.references.join(', ')}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">
                  {t('aiAssistant.askButton')}
                </div>
              )}
            </div>
            
            <div className="mt-4 text-center">
              <Link href="/ai-assistant">
                <a className="text-primary hover:text-accent">
                  {t('home.aiAssistant.learnMore')}
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
