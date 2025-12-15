import { GoogleGenAI, Type, Schema } from "@google/genai";
import { TextbookEntry } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for the structured output
const textbookSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      chapter: {
        type: Type.STRING,
        description: "The chapter number and title (e.g., 'Chapter 1: India and the World'). If not explicitly stated, use the current ongoing chapter context.",
      },
      topic: {
        type: Type.STRING,
        description: "The specific sub-topic or section heading within the chapter.",
      },
      content: {
        type: Type.STRING,
        description: "The detailed factual content or summary of the text under this topic. Should be comprehensive.",
      },
    },
    required: ["chapter", "topic", "content"],
  },
};

export const analyzeTextBatch = async (
  text: string, 
  previousContext: string
): Promise<{ entries: TextbookEntry[], lastChapter: string }> => {
  
  try {
    const prompt = `
      You are an expert textbook analyzer and transcriber. 
      Your task is to convert raw text extracted from a textbook PDF into a structured dataset.
      
      **Context from previous pages:** "${previousContext}"
      
      **Input Text:**
      ${text}

      **Instructions:**
      1. Analyze the text to identify Chapter Titles, Section Topics, and body content.
      2. Ignore meta-data such as: Acknowledgements, Preface, Copyright info, Table of Contents, Index, Bibliography, or loose page numbers/headers.
      3. If the text starts in the middle of a chapter, continue using the context from the previous pages (if provided).
      4. Organize the output strictly into the JSON schema provided.
      5. Ensure the 'content' field captures the key information, facts, and context from the book. Do not simply summarize if the details are important; transcribe the core knowledge.
      6. If a section is purely navigational (like a list of maps), ignore it.
      
      Output MUST be a valid JSON array matching the schema.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: textbookSchema,
        // Moderate thinking budget to allow for structural reasoning without excessive delay
        thinkingConfig: { thinkingBudget: 1024 } 
      },
    });

    const resultText = response.text;
    
    if (!resultText) {
      return { entries: [], lastChapter: previousContext };
    }

    const entries: TextbookEntry[] = JSON.parse(resultText);
    
    // Determine the last known chapter to pass to the next batch
    const lastChapter = entries.length > 0 ? entries[entries.length - 1].chapter : previousContext;

    return { entries, lastChapter };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Return empty to allow process to continue with next batch if one fails
    return { entries: [], lastChapter: previousContext };
  }
};