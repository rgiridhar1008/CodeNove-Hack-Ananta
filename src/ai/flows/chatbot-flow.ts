'use server';

/**
 * @fileOverview An AI chatbot flow that can answer questions about a user's grievances.
 *
 * - chat - The main function that handles the chat interaction.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getFirestore } from 'firebase/firestore';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

// This is a server-side flow, so we initialize Firebase here for server-side access.
if (!getApps().length) {
    initializeApp(firebaseConfig);
}
const firestore = getFirestore();

const getUserGrievancesTool = ai.defineTool(
  {
    name: 'getUserGrievances',
    description: "Fetches a list of grievances reported by the current user from the database.",
    inputSchema: z.object({}), // Input is empty as userId is provided from context.
    outputSchema: z.array(z.object({
        id: z.string(),
        issueType: z.string(),
        description: z.string(),
        status: z.string(),
        createdAt: z.string(),
    })),
  },
  async (_, context) => {
    // The tool implementation now receives the full context.
    const userId = context?.userId;
    if (!userId) {
        console.error("[Tool] User ID not provided in tool context");
        return [];
    }
      
    if (!firestore) {
        console.error("[Tool] Firestore not available");
        return [];
    }
    
    console.log(`[Tool] Fetching grievances for userId: ${userId}`);
    const grievancesRef = collection(firestore, 'grievances');
    const q = query(grievancesRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return [];
    }
    
    const grievances: any[] = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        // Convert Firestore Timestamp to a readable date string.
        const createdAtDate = data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString() : "N/A";
            
        grievances.push({
            id: doc.id,
            issueType: data.issueType,
            description: data.description,
            status: data.status,
            createdAt: createdAtDate,
        });
    });
    return grievances;
  }
);


const ChatInputSchema = z.object({
  userId: z.string().optional(),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })),
  prompt: z.string(),
});
type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.string();

const loggedInSystemPrompt = `You are Civix AI, an assistant for a civic engagement platform.

Your goals:
1. Help users report civic issues.
2. Identify issue category (Road, Water, Sanitation, Lighting, Safety).
3. Suggest next steps politely.
4. Encourage responsible civic participation.

If a user asks about their existing issues, use the getUserGrievances tool to provide a status update. If they describe a new problem, identify the category, suggest what to do next, keep your reply under 4 sentences, and maintain a friendly, professional tone.`;

const loggedOutSystemPrompt = `You are Civix AI, a helpful assistant for a civic engagement platform called Civix. Your role is to answer general questions about what Civix is, its mission, and how it helps citizens and local authorities. Do not ask the user to log in or mention any user-specific features like reporting issues. Keep your answers concise and friendly.`;

const chatFlow = ai.defineFlow(
  {
    name: 'chatbotFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const { userId, history, prompt } = input;
    
    const llmResponse = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      tools: userId ? [getUserGrievancesTool] : [], // Only provide tool if logged in
      prompt: prompt,
      history: history,
      // Provide the userId to the tool in the context if it exists
      ...(userId && {
          toolRequest: {
              context: {
                  userId: userId
              }
          }
      }),
      system: userId ? loggedInSystemPrompt : loggedOutSystemPrompt,
    });

    return llmResponse.text;
  }
);

// Wrapper function to be called from the client - This is the only export.
export async function chat(input: ChatInput): Promise<string> {
  return await chatFlow(input);
}
