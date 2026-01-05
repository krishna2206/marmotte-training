import { GoogleGenAI, Type } from "@google/genai";
import { Question, Difficulty } from "../types";

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
  // Récupération de la clé API depuis les variables d'environnement Vite
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY is missing. Please set it in your .env file.");
  }

  const ai = new GoogleGenAI({ apiKey });

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


const COURSE_SYSTEM_INSTRUCTION = `
Tu es un professeur expert en développement web qui crée des cours structurés et engageants pour "Marmotte".
Génère un cours composé de 3 modules courts mais denses sur le sujet demandé.

Structure de chaque module :
1. Titre accrocheur.
2. Contenu pédagogique (Markdown) :
   - Explique le concept clairement.
   - Utilise des analogies si possible.
   - Inclus des exemples de code (format Markdown).
   - Reste concis (environ 200 mots par module).
3. UN MINI QUIZZ (une seule question) à la fin pour valider la compréhension du module.

Format de réponse attendu : un tableau d'objets "Module".
`;

export const generateCourse = async (topic: string, difficulty: Difficulty): Promise<any[]> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("VITE_GEMINI_API_KEY is missing.");

  const ai = new GoogleGenAI({ apiKey });

  try {
    const prompt = `Crée un cours de 3 modules niveau ${difficulty} sur : ${topic}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: COURSE_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING, description: "Contenu du cours en Markdown." },
                  codeSnippet: { type: Type.STRING, description: "Snippet de code principal illustratif.", nullable: true }
                },
                required: ["text"]
              },
              quiz: {
                type: Type.OBJECT,
                description: "Question de validation pour ce module.",
                properties: {
                  text: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswerIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  topic: { type: Type.STRING }
                },
                required: ["text", "options", "correctAnswerIndex", "explanation", "topic"]
              }
            },
            required: ["title", "content", "quiz"]
          }
        }
      }
    });

    const rawData = JSON.parse(response.text || "[]");
    return rawData.map((m: any, index: number) => ({
      ...m,
      id: `mod-${Date.now()}-${index}`
    }));

  } catch (error) {
    console.error("Course generation error:", error);
    return []; // Ou retourner un cours "fallback" si nécessaire
  }
};