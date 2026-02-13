import { GoogleGenAI, Type } from "@google/genai";
import { MediaType, AspectRatio, PromptEnhancementResponse, ImageResolution } from "../types";

// Helper to get a fresh client, essential for when the key changes via selection
const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const enhancePromptWithGemini = async (
  basePrompt: string,
  options: { medium?: string; style?: string; lighting?: string; camera?: string; mood?: string }
): Promise<PromptEnhancementResponse> => {
  const ai = getAiClient();
  
  const systemInstruction = `You are an expert AI prompt engineer. 
  Your goal is to take a basic user idea and expand it into a detailed, high-quality prompt suitable for state-of-the-art image/video generation models (like Midjourney v6, Gemini Image, or Veo).
  
  Construct the prompt by weaving in the user's selected parameters seamlessly.
  Focus on descriptive adjectives, visual details, lighting, composition, and texture.
  
  Return the response in JSON format.
  `;

  const userContent = `
  Base Idea: "${basePrompt}"
  Parameters:
  - Medium: ${options.medium || "Auto"}
  - Style: ${options.style || "Auto"}
  - Lighting: ${options.lighting || "Auto"}
  - Camera: ${options.camera || "Auto"}
  - Mood: ${options.mood || "Auto"}

  Output a JSON object with:
  1. 'enhancedPrompt': The final detailed prompt string.
  2. 'explanation': A brief 1-sentence explanation of what you improved.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userContent,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            enhancedPrompt: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["enhancedPrompt", "explanation"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text");
    return JSON.parse(text) as PromptEnhancementResponse;
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    return {
      enhancedPrompt: basePrompt,
      explanation: "Failed to enhance prompt. Using original."
    };
  }
};

export const generateImageWithGemini = async (prompt: string, aspectRatio: AspectRatio, resolution: ImageResolution = '1K'): Promise<string> => {
  const ai = getAiClient();
  
  // Logic: 
  // '1K' -> gemini-2.5-flash-image (Fast, Standard)
  // '2K' or '4K' -> gemini-3-pro-image-preview (High Quality, requires paid key)
  
  const isHighRes = resolution === '2K' || resolution === '4K';
  const model = isHighRes ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';

  // Config mapping
  const imageConfig: any = {
    aspectRatio: aspectRatio,
    // count: 1 // Default is 1
  };

  if (isHighRes) {
    imageConfig.imageSize = resolution;
  }
  
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: imageConfig
      }
    });

    let imageUrl = "";
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!imageUrl) throw new Error("No image data returned.");
    return imageUrl;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

export const generateVideoWithVeo = async (prompt: string, aspectRatio: AspectRatio, durationSeconds: number): Promise<string> => {
  const ai = getAiClient();
  
  // Veo config:
  // Model: veo-3.1-fast-generate-preview
  // Aspect: 16:9 or 9:16 ONLY.
  // Resolution: 720p or 1080p.
  
  // Fallback for incompatible aspect ratios
  let safeAspectRatio = "16:9";
  if (aspectRatio === AspectRatio.PORTRAIT || aspectRatio === AspectRatio.THREE_FOURTHS) {
    safeAspectRatio = "9:16";
  } else {
    safeAspectRatio = "16:9";
  }

  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '1080p', // Set to 1080p as requested
        aspectRatio: safeAspectRatio as "16:9" | "9:16",
        durationSeconds: durationSeconds
      }
    });

    // Polling loop
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("No video URI returned.");
    
    // Fetch the actual video blob
    const res = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
    if (!res.ok) throw new Error(`Failed to download video: ${res.statusText}`);
    
    const blob = await res.blob();
    return URL.createObjectURL(blob);

  } catch (error) {
    console.error("Error generating video:", error);
    throw error;
  }
};