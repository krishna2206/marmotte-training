import { GoogleGenAI, Type } from "@google/genai";
import { Question, Difficulty } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
Tu es un expert en développement web et un créateur de quiz amusant. 
Ton utilisateur s'appelle "Marmotte". Sois encourageant et un peu drôle dans ton ton général.
Génère des questions de quiz techniques précises sur le développement (JS, React, CSS, TS, Git).
Chaque question doit avoir 4 choix.

IMPORTANT POUR LE CODE: Si tu inclus un 'codeSnippet', il ne doit JAMAIS contenir la réponse à la question. 
Remplace la partie sensible par "???" ou montre un exemple de code connexe.

IMPORTANT POUR L'EXPLICATION: L'explication technique ('explanation') sera affichée que l'utilisateur ait raison OU tort.
Par conséquent, ne commence JAMAIS par "Bravo", "Félicitations" ou "C'est juste". 
L'explication doit être factuelle, pédagogique et expliquer POURQUOI la réponse correcte est la bonne.
Exemple d'explication correcte : "Le hook useInsertionEffect est conçu pour injecter des styles avant que le DOM ne soit modifié."
`;

export const generateQuizQuestions = async (topic: string, difficulty: Difficulty): Promise<Question[]> => {
  try {
    const prompt = `Génère 5 questions de quiz niveau ${difficulty} sur le sujet : ${topic} pour Marmotte.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: "La question posée." },
              codeSnippet: { type: Type.STRING, description: "Un bout de code optionnel pour la question (SANS LA RÉPONSE).", nullable: true },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Une liste de 4 réponses possibles."
              },
              correctAnswerIndex: { type: Type.INTEGER, description: "L'index (0-3) de la bonne réponse." },
              explanation: { type: Type.STRING, description: "Une explication technique neutre et instructive (SANS FÉLICITATIONS)." },
              topic: { type: Type.STRING, description: "Le sujet technique précis." },
            },
            required: ["text", "options", "correctAnswerIndex", "explanation", "topic"]
          }
        }
      }
    });

    const rawData = JSON.parse(response.text || "[]");
    
    // Enrich with IDs
    return rawData.map((q: any, index: number) => ({
      ...q,
      id: `${Date.now()}-${index}`,
    }));

  } catch (error) {
    console.error("Gemini generation error:", error);
    return [
      {
        id: "mock-1",
        text: "Oups, Gemini est fatigué ! En attendant, quel est le type de retour de 'typeof null' ?",
        options: ["'null'", "'object'", "'undefined'", "'number'"],
        correctAnswerIndex: 1,
        explanation: "En JavaScript, typeof null renvoie 'object' en raison d'une erreur historique dans l'implémentation initiale du langage.",
        topic: "JavaScript"
      }
    ];
  }
};