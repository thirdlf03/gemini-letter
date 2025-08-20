import { GoogleGenAI } from "@google/genai";
import { Mood } from '../types';

// Helper to check if a value is a Mood enum member
const isMood = (value: any): value is Mood => {
  return Object.values(Mood).includes(value);
}

const getPrompt = (mood: Mood | string): string => {
  const basePrompt = "あなたは、穏やかな草原に住む、優しくて賢い心の友人です。私の今の気持ちに寄り添う、短くて温かい手紙を日本語で書いてください。あなたの言葉で、疲れた心をそっと癒してください。手紙は150字以内で、とてもパーソナルで、心に響くようなトーンでお願いします。";

  if (isMood(mood)) {
    switch (mood) {
      case Mood.WORKED_HARD:
        return `${basePrompt} 今日の私は「${Mood.WORKED_HARD}」でした。頑張りを認め、優しく労う言葉をください。「がんばったあなたへ」から書き始めてください。`;
      case Mood.GLOOMY:
        return `${basePrompt} 今日の私は「${Mood.GLOOMY}」でした。無理に元気づけるのではなく、ただ静かに気持ちを受け止めてくれるような言葉をください。「しょんぼりなあなたへ」から書き始めてください。`;
      case Mood.HAPPY:
        return `${basePrompt} 今日の私は「${Mood.HAPPY}」でした。私の喜びを分かち合い、その幸せが続くように願うような、優しく微笑むような言葉をください。「うれしい日のあなたへ」から書き始めてください。`;
      case Mood.TIRED:
        return `${basePrompt} 今日の私は「${Mood.TIRED}」でした。心と体を休めることの大切さを教えてくれるような、穏やかで安心する言葉をください。「おつかれなあなたへ」から書き始めてください。`;
      default:
        return `${basePrompt} 今日の私の気持ちに寄り添う、優しい言葉をください。「親愛なるあなたへ」から書き始めてください。`;
    }
  } else {
    // Handle custom string mood
    return `${basePrompt} 今日の私の気持ちは「${mood}」です。この気持ちに寄り添い、優しく励ましてくれるような言葉をください。「『${mood}』という気持ちのあなたへ」から書き始めてください。`;
  }
};


export const generateLetter = async (mood: Mood | string): Promise<string> => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is not set.");
    // Return a mock letter if API key is not available
    return new Promise((resolve) => {
        setTimeout(() => {
            const letterTitle = isMood(mood) ? `「${mood}」` : `「${mood}」という気持ち`;
            resolve(`${letterTitle}だったのですね。\n\nどんな一日にも、必ず意味があります。今日のあなたのがんばりを、私はちゃんと見ていましたよ。\n\nゆっくり休んで、また明日、新しい光を見つけましょう。\n\nあなたの心の友人より`);
        }, 1000)
    });
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = getPrompt(mood);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.8,
        topP: 1,
        topK: 32,
      }
    });

    const text = response.text;
    
    if (!text) {
        console.error("No text returned from Gemini API. Full response:", response);
        throw new Error("Received an empty response from the AI.");
    }

    return text.trim();
  } catch (error) {
    console.error("Error generating letter from Gemini API:", error);
    throw new Error("Failed to generate letter.");
  }
};