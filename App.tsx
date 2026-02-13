import React, { useState, useEffect } from 'react';
import { PromptEditor } from './components/PromptEditor';
import { GeneratedResult } from './components/GeneratedResult';
import { enhancePromptWithGemini, generateImageWithGemini, generateVideoWithVeo } from './services/geminiService';
import { PromptOptions, MediaType, GeneratedContent, AspectRatio } from './types';

const App: React.FC = () => {
  // Application State
  const [basePrompt, setBasePrompt] = useState<string>("");
  const [options, setOptions] = useState<PromptOptions>({
    medium: "",
    style: "",
    lighting: "",
    camera: "",
    mood: "",
    aspectRatio: AspectRatio.SQUARE,
    imageResolution: "1K",
    videoDuration: 8 // Default video duration
  });
  const [mediaType, setMediaType] = useState<MediaType>(MediaType.IMAGE);
  
  // Generation State
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentResult, setCurrentResult] = useState<GeneratedContent | null>(null);
  
  // API Key State (required for Video and High-Res Images)
  const [hasPaidKey, setHasPaidKey] = useState(false);

  // Check for Paid Key availability on mount and when window focus returns
  const checkPaidKey = async () => {
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setHasPaidKey(hasKey);
    }
  };

  useEffect(() => {
    checkPaidKey();
    window.addEventListener('focus', checkPaidKey);
    return () => window.removeEventListener('focus', checkPaidKey);
  }, []);

  const handleRequestPaidKey = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      await window.aistudio.openSelectKey();
      // Assume success immediately to avoid race condition delays as per instructions
      setHasPaidKey(true); 
    } else {
      console.warn("AI Studio API not available in window");
    }
  };

  const handleEnhance = async () => {
    setIsEnhancing(true);
    try {
      const result = await enhancePromptWithGemini(basePrompt, options);
      // We update the prompt in the result view, but maybe we should also allow editing it?
      // For this UI, let's keep the base prompt as is, but store the enhanced version in a "staging" area 
      // or directly use it for generation.
      
      // Let's create a temporary result object to show the text enhancement even before media generation
      const tempId = Date.now().toString();
      setCurrentResult({
        id: tempId,
        originalPrompt: basePrompt,
        enhancedPrompt: result.enhancedPrompt,
        mediaType: mediaType,
        timestamp: Date.now(),
        isLoading: false
      });
    } catch (error) {
      console.error(error);
      alert("Failed to enhance prompt.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    if (!basePrompt) return;
    
    setIsGenerating(true);
    
    // 1. If we don't have an enhanced prompt yet (or user changed base), enhance first automatically?
    // Let's check if currentResult matches basePrompt. If not, re-enhance.
    let promptToUse = currentResult?.enhancedPrompt;
    let isFreshEnhancement = false;

    if (!currentResult || currentResult.originalPrompt !== basePrompt) {
       try {
         const enhancement = await enhancePromptWithGemini(basePrompt, options);
         promptToUse = enhancement.enhancedPrompt;
         isFreshEnhancement = true;
       } catch (e) {
         promptToUse = basePrompt; // Fallback
       }
    }

    if (!promptToUse) promptToUse = basePrompt;

    // Create a loading state object
    const newId = Date.now().toString();
    setCurrentResult({
      id: newId,
      originalPrompt: basePrompt,
      enhancedPrompt: promptToUse,
      mediaType: mediaType,
      timestamp: Date.now(),
      isLoading: true
    });

    try {
      let mediaUrl = "";
      if (mediaType === MediaType.IMAGE) {
        mediaUrl = await generateImageWithGemini(promptToUse, options.aspectRatio, options.imageResolution);
      } else {
        mediaUrl = await generateVideoWithVeo(promptToUse, options.aspectRatio, options.videoDuration);
      }

      setCurrentResult(prev => prev ? { ...prev, mediaUrl, isLoading: false } : null);

    } catch (error: any) {
      console.error(error);
      // Handle "Requested entity was not found" specifically for Video/Pro-Image Key issues
      if (error.toString().includes("Requested entity was not found")) {
         setHasPaidKey(false);
         alert("API Key session expired or invalid. Please select your key again.");
         handleRequestPaidKey();
      }
      
      setCurrentResult(prev => prev ? { 
        ...prev, 
        isLoading: false, 
        error: "Generation failed. Please try again." 
      } : null);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-950 overflow-hidden">
      {/* Sidebar / Editor */}
      <div className="w-full md:w-[400px] flex-shrink-0 h-full z-20 shadow-xl">
        <PromptEditor 
          basePrompt={basePrompt}
          setBasePrompt={setBasePrompt}
          options={options}
          setOptions={setOptions}
          mediaType={mediaType}
          setMediaType={setMediaType}
          onEnhance={handleEnhance}
          onGenerate={handleGenerate}
          isEnhancing={isEnhancing}
          isGenerating={isGenerating}
          hasPaidKey={hasPaidKey}
          onRequestPaidKey={handleRequestPaidKey}
        />
      </div>

      {/* Main Content / Preview */}
      <div className="flex-1 h-full relative z-10">
        <GeneratedResult 
          content={currentResult}
          isGenerating={isGenerating}
        />
      </div>
    </div>
  );
};

export default App;