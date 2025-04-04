import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { AiQuery } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  BrainCircuit,
  Info,
  Send,
  MessageSquare,
  Search,
  CornerDownLeft,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AIResponse {
  answer: string;
  references: string[];
  language: 'en' | 'ar';
}

export default function AiAssistantPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const responsesEndRef = useRef<HTMLDivElement>(null);
  const [conversations, setConversations] = useState<Array<{ question: string; answer: AIResponse }>>([]);
  
  // Safely use language context
  let isRtl = false;
  try {
    const { isRtl: rtlValue } = useLanguage();
    isRtl = rtlValue;
  } catch (error) {
    console.error("Language context error:", error);
  }
  
  // Safely use auth context
  let user = null;
  try {
    const auth = useAuth();
    user = auth.user;
  } catch (error) {
    console.error("Auth context error:", error);
  }
  
  // Suggested questions (can be expanded)
  const suggestedQuestions = [
    'What are the five pillars of Islam?',
    'What is the meaning of Tawhid?',
    'How should I perform Wudu (ablution)?',
    'What are the benefits of fasting in Ramadan?',
    'What does the Quran say about patience?',
    'What are the major collections of Hadith?',
  ];
  
  // Fetch user's previous queries if logged in
  const { data: aiQueries } = useQuery<AiQuery[]>({
    queryKey: ['/api/user-ai-queries'],
    enabled: !!user,
  });
  
  // AI query mutation
  const aiMutation = useMutation<AIResponse, Error, string>({
    mutationFn: async (question: string) => {
      const res = await apiRequest('POST', '/api/ai-assistant', { query: question });
      return await res.json();
    },
    onSuccess: (data, variables) => {
      // Add to conversations
      setConversations([...conversations, { question: variables, answer: data }]);
      setQuery('');
      
      // If user is logged in, refresh their AI queries
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['/api/user-ai-queries'] });
      }
    },
  });
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      aiMutation.mutate(query);
    }
  };
  
  // Handle suggested question click
  const handleSuggestedQuestion = (question: string) => {
    setQuery(question);
    aiMutation.mutate(question);
  };
  
  // Scroll to bottom when new message arrives
  useEffect(() => {
    if (responsesEndRef.current) {
      responsesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversations]);
  
  return (
    <div className="container mx-auto px-4 py-8 mb-20">
      <div className="flex items-center justify-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mr-4">
          <BrainCircuit className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className={`text-3xl font-bold ${isRtl ? 'font-amiri' : 'font-roboto'}`}>
            {t('aiAssistant.title')}
          </h1>
          <p className="text-gray-600">
            {t('aiAssistant.subtitle')}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar with suggestions and history */}
        <div className="order-2 lg:order-1">
          <Tabs defaultValue="suggested">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="suggested">
                <Search className="h-4 w-4 mr-2" />
                {t('aiAssistant.suggestedQuestions')}
              </TabsTrigger>
              <TabsTrigger value="history">
                <MessageSquare className="h-4 w-4 mr-2" />
                {t('aiAssistant.recentQuestions')}
              </TabsTrigger>
            </TabsList>
            
            {/* Suggested Questions */}
            <TabsContent value="suggested">
              <Card>
                <CardContent className="pt-6">
                  <ul className="space-y-2">
                    {suggestedQuestions.map((question, index) => (
                      <li key={index}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-left hover:bg-primary/5"
                          onClick={() => handleSuggestedQuestion(question)}
                          disabled={aiMutation.isPending}
                        >
                          <CornerDownLeft className="h-4 w-4 mr-2 text-primary" />
                          {question}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* History */}
            <TabsContent value="history">
              <Card>
                <CardContent className="pt-6">
                  {user ? (
                    aiQueries && aiQueries.length > 0 ? (
                      <ul className="space-y-2">
                        {aiQueries.map((aiQuery) => (
                          <li key={aiQuery.id}>
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-left hover:bg-primary/5"
                              onClick={() => handleSuggestedQuestion(aiQuery.query)}
                              disabled={aiMutation.isPending}
                            >
                              <CornerDownLeft className="h-4 w-4 mr-2 text-gray-400" />
                              {aiQuery.query}
                            </Button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-center text-gray-500 py-4">
                        No recent questions
                      </p>
                    )
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500 mb-2">
                        Sign in to view your history
                      </p>
                      <Button variant="outline" asChild>
                        <a href="/auth">Sign In</a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Disclaimer */}
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="flex items-start">
                <Info className="h-5 w-5 mr-2 text-primary mt-0.5" />
                <p className="text-sm text-gray-600">
                  {t('aiAssistant.aiDisclaimer')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main conversation area */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>{t('aiAssistant.title')}</CardTitle>
              <CardDescription>
                {t('aiAssistant.subtitle')}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col">
              {/* Conversation history */}
              <ScrollArea className="flex-1 h-[50vh] mb-4 pr-4">
                {conversations.length === 0 ? (
                  <div className="text-center py-12">
                    <BrainCircuit className="h-16 w-16 mx-auto text-primary/20 mb-4" />
                    <h3 className="text-lg font-medium text-gray-500">
                      {t('aiAssistant.placeholder')}
                    </h3>
                    <p className="text-sm text-gray-400 mt-2">
                      Your conversations will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {conversations.map((item, index) => (
                      <div key={index} className="space-y-4">
                        {/* User question */}
                        <div className="flex justify-end">
                          <div className="bg-primary/10 text-primary rounded-lg rounded-tr-none p-3 max-w-[80%]">
                            <p>{item.question}</p>
                          </div>
                        </div>
                        
                        {/* AI answer */}
                        <div className="flex">
                          <div className="bg-neutral rounded-lg rounded-tl-none p-3 max-w-[80%]">
                            <div 
                              className="mb-2 whitespace-pre-line" 
                              dangerouslySetInnerHTML={{ __html: item.answer.answer.replace(/\n/g, '<br>') }}
                            />
                            
                            {item.answer.references.length > 0 && (
                              <div className="text-xs text-gray-500 mt-2 flex items-center">
                                <Info className="h-3 w-3 mr-1" />
                                <span>
                                  <strong>{t('aiAssistant.references')}:</strong> {item.answer.references.join(', ')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={responsesEndRef} />
                  </div>
                )}
              </ScrollArea>
              
              {/* Input form */}
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('aiAssistant.placeholder')}
                  className="flex-1"
                  disabled={aiMutation.isPending}
                />
                <Button 
                  type="submit" 
                  disabled={aiMutation.isPending || !query.trim()}
                >
                  {aiMutation.isPending ? t('aiAssistant.loadingAnswer') : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {t('aiAssistant.askButton')}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
