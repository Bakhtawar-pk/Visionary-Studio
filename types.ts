declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO'
}

export enum AspectRatio {
  SQUARE = '1:1',
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16',
  FOUR_THIRDS = '4:3',
  THREE_FOURTHS = '3:4'
}

export type ImageResolution = '1K' | '2K' | '4K';

export interface PromptOptions {
  medium: string;
  style: string;
  lighting: string;
  camera: string;
  mood: string;
  aspectRatio: AspectRatio;
  imageResolution: ImageResolution;
  videoDuration: number;
}

export interface GeneratedContent {
  id: string;
  originalPrompt: string;
  enhancedPrompt: string;
  mediaType: MediaType;
  mediaUrl?: string; // Data URL for image, or Blob URL for video
  timestamp: number;
  isLoading: boolean;
  error?: string;
}

export interface PromptEnhancementResponse {
  enhancedPrompt: string;
  explanation: string;
}