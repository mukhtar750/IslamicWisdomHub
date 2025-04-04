import OpenAI from "openai";
import { storage } from "./storage";

// Initialize OpenAI with API key
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "sk-YOUR-OPENAI-API-KEY" });

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const OPENAI_MODEL = "gpt-4o";

// System prompt for Islamic knowledge
const SYSTEM_PROMPT = `
You are an AI-powered Islamic knowledge assistant for Al Hikmah Library in Nigeria.
Your purpose is to provide accurate information and answers about Islamic topics with references to:
1. The Quran (provide chapter and verse numbers)
2. Hadith (provide collection name, book number, and hadith number when applicable)
3. Scholarly consensus and opinions (cite scholars when applicable)

When responding:
- Be respectful, objective, and educational
- Always provide references for your information
- If a question is outside your knowledge area, acknowledge it clearly
- Format references clearly for each claim or statement
- Be concise but thorough
- Respond in the language the question was asked in (English or Arabic)
- When responding in Arabic, provide Quranic verses in their original Arabic text

You should aim to be helpful while maintaining respect for Islamic scholarship and tradition.
`;

export interface AiAssistantResponse {
  answer: string;
  references: string[];
  language: "en" | "ar";
}

export async function getIslamicKnowledgeResponse(
  query: string,
  userId?: number
): Promise<AiAssistantResponse> {
  try {
    // Detect language (basic detection, can be improved)
    const language = /[\u0600-\u06FF]/.test(query) ? "ar" : "en";
    
    // Make request to OpenAI
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: query }
      ],
      temperature: 0.5,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });
    
    const content = response.choices[0].message.content;
    
    // Handle empty response
    if (!content) {
      throw new Error("No response received from AI assistant");
    }
    
    // Parse the JSON response
    let parsedResponse: AiAssistantResponse;
    
    try {
      const jsonResponse = JSON.parse(content);
      
      parsedResponse = {
        answer: jsonResponse.answer || jsonResponse.response || jsonResponse.content || content,
        references: jsonResponse.references || jsonResponse.sources || [],
        language
      };
    } catch (e) {
      // Fallback if response is not valid JSON
      parsedResponse = {
        answer: content,
        references: [],
        language
      };
    }
    
    // Store the query and response if user is authenticated
    if (userId) {
      await storage.createAiQuery({
        userId,
        query,
        response: JSON.stringify(parsedResponse)
      });
      
      // Record user activity
      await storage.createUserActivity({
        userId,
        activityType: "query",
        aiQueryId: (await storage.getAllCategories()).length
      });
    }
    
    return parsedResponse;
  } catch (error) {
    console.error("Error in AI assistant:", error);
    return {
      answer: language === "ar" 
        ? "عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى."
        : "Sorry, an error occurred while processing your request. Please try again.",
      references: [],
      language: language === "ar" ? "ar" : "en"
    };
  }
}
