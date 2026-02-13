import React from 'react';
import { Copy, Download, Share2, Maximize2 } from 'lucide-react';
import { GeneratedContent, MediaType } from '../types';

interface GeneratedResultProps {
  content: GeneratedContent | null;
  isGenerating: boolean;
}

export const GeneratedResult: React.FC<GeneratedResultProps> = ({ content, isGenerating }) => {
  const [copyFeedback, setCopyFeedback] = React.useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handleDownload = () => {
    if (!content?.mediaUrl) return;
    const a = document.createElement('a');
    a.href = content.mediaUrl;
    a.download = `visionary-${content.id}.${content.mediaType === MediaType.VIDEO ? 'mp4' : 'png'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!content && !isGenerating) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8 text-center bg-gray-950">
        <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mb-6 border border-gray-800">
          <Share2 size={32} className="opacity-20" />
        </div>
        <h3 className="text-xl font-medium text-gray-300 mb-2">Ready to Create</h3>
        <p className="max-w-md mx-auto">
          Start by entering a concept on the left. Use "Magic Enhance" to create a professional prompt, then generate the visual.
        </p>
      </div>
    );
  }

  if (isGenerating && !content) {
     return (
       <div className="h-full flex flex-col items-center justify-center bg-gray-950 p-8">
         <div className="relative">
           <div className="w-16 h-16 border-4 border-purple-900 border-t-purple-500 rounded-full animate-spin"></div>
           <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-b-pink-500 rounded-full animate-spin [animation-duration:1.5s]"></div>
         </div>
         <p className="mt-8 text-gray-300 animate-pulse font-mono">Dreaming up your creation...</p>
         <p className="text-xs text-gray-500 mt-2">Generating 1080p video... This may take a minute.</p>
       </div>
     );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-950 p-4 md:p-8 flex flex-col gap-6">
      {/* Media Display */}
      <div className="w-full bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 relative group min-h-[300px] flex items-center justify-center">
        {content?.isLoading ? (
          <div className="flex flex-col items-center gap-4">
             <div className="w-12 h-12 border-4 border-gray-700 border-t-white rounded-full animate-spin"></div>
             <p className="text-sm text-gray-400">Rendering high-quality output...</p>
          </div>
        ) : content?.mediaUrl ? (
          <>
            {content.mediaType === MediaType.VIDEO ? (
              <video 
                src={content.mediaUrl} 
                controls 
                autoPlay 
                loop 
                className="w-full h-full object-contain max-h-[70vh]"
              />
            ) : (
              <img 
                src={content.mediaUrl} 
                alt="Generated result" 
                className="w-full h-full object-contain max-h-[70vh]"
              />
            )}
            
            {/* Overlay Actions */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={handleDownload}
                className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
                title="Download"
              >
                <Download size={18} />
              </button>
              <button 
                onClick={() => window.open(content.mediaUrl, '_blank')}
                className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
                title="Open Fullscreen"
              >
                <Maximize2 size={18} />
              </button>
            </div>
          </>
        ) : (
           <div className="text-red-400 text-sm p-4 text-center">
             {content?.error || "Failed to load media."}
           </div>
        )}
      </div>

      {/* Prompt Details */}
      <div className="grid gap-6 max-w-4xl mx-auto w-full">
        {/* Enhanced Prompt Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 relative">
           <div className="flex justify-between items-start mb-3">
             <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider">Enhanced Prompt</h3>
             <button 
               onClick={() => handleCopy(content?.enhancedPrompt || '')}
               className="text-gray-500 hover:text-white transition-colors flex items-center gap-1.5 text-xs"
             >
               {copyFeedback ? <span className="text-green-400">Copied!</span> : <><Copy size={14} /> Copy</>}
             </button>
           </div>
           <p className="text-gray-200 text-base leading-relaxed font-light">
             {content?.enhancedPrompt}
           </p>
        </div>

        {/* Original Prompt Card (Secondary) */}
        {content?.originalPrompt && (
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4">
             <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Original Concept</h4>
             <p className="text-gray-400 text-sm italic">
               "{content.originalPrompt}"
             </p>
          </div>
        )}
      </div>
    </div>
  );
};