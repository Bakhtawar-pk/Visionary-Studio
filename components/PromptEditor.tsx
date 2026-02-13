import React from 'react';
import { RefreshCw, Wand2, Image as ImageIcon, Video as VideoIcon, Sparkles, Clock } from 'lucide-react';
import { PromptOptions, MediaType, AspectRatio, ImageResolution } from '../types';
import { 
  MEDIA_OPTIONS, 
  STYLE_OPTIONS, 
  LIGHTING_OPTIONS, 
  CAMERA_OPTIONS, 
  MOOD_OPTIONS,
  ASPECT_RATIOS,
  IMAGE_RESOLUTIONS
} from '../constants';

interface PromptEditorProps {
  basePrompt: string;
  setBasePrompt: (s: string) => void;
  options: PromptOptions;
  setOptions: (o: PromptOptions) => void;
  mediaType: MediaType;
  setMediaType: (m: MediaType) => void;
  onEnhance: () => void;
  onGenerate: () => void;
  isEnhancing: boolean;
  isGenerating: boolean;
  hasPaidKey: boolean;
  onRequestPaidKey: () => void;
}

export const PromptEditor: React.FC<PromptEditorProps> = ({
  basePrompt,
  setBasePrompt,
  options,
  setOptions,
  mediaType,
  setMediaType,
  onEnhance,
  onGenerate,
  isEnhancing,
  isGenerating,
  hasPaidKey,
  onRequestPaidKey
}) => {

  const handleOptionChange = (key: keyof PromptOptions, value: any) => {
    setOptions({ ...options, [key]: value });
  };

  const isHighRes = options.imageResolution === '2K' || options.imageResolution === '4K';
  const needsPaidKey = mediaType === MediaType.VIDEO || (mediaType === MediaType.IMAGE && isHighRes);
  const showKeyWarning = needsPaidKey && !hasPaidKey;

  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-800 overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
          Visionary Studio
        </h1>
        <p className="text-gray-400 text-xs mt-1">AI Prompt & Media Generator</p>
      </div>

      <div className="p-6 space-y-8 pb-32">
        {/* Media Type Toggle */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-300">Output Format</label>
          <div className="grid grid-cols-2 gap-2 bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setMediaType(MediaType.IMAGE)}
              className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                mediaType === MediaType.IMAGE 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-750'
              }`}
            >
              <ImageIcon size={16} />
              Image
            </button>
            <button
              onClick={() => setMediaType(MediaType.VIDEO)}
              className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                mediaType === MediaType.VIDEO
                  ? 'bg-pink-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-750'
              }`}
            >
              <VideoIcon size={16} />
              Video
            </button>
          </div>
          
          {mediaType === MediaType.IMAGE && (
             <div className="mt-2">
                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1 block">Resolution</label>
                <div className="flex bg-gray-800 rounded-lg p-1 gap-1">
                  {IMAGE_RESOLUTIONS.map((res) => (
                    <button
                      key={res.value}
                      onClick={() => handleOptionChange('imageResolution', res.value)}
                      className={`flex-1 text-xs py-1.5 rounded transition-all ${
                        options.imageResolution === res.value
                        ? 'bg-gray-700 text-white font-medium shadow'
                        : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      {res.value}
                    </button>
                  ))}
                </div>
                {isHighRes && (
                   <div className="flex items-center gap-1.5 mt-2 text-xs text-purple-400">
                      <Sparkles size={12} />
                      <span>Pro Model (Gemini 3) active</span>
                   </div>
                )}
             </div>
          )}

          {mediaType === MediaType.VIDEO && (
            <div className="mt-3 bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1.5">
                  <Clock size={12} className="text-pink-400" />
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Duration</label>
                </div>
                <span className="text-xs text-white font-mono bg-gray-700 px-1.5 py-0.5 rounded">{options.videoDuration}s</span>
              </div>
              <input
                type="range"
                min="4"
                max="12"
                step="1"
                value={options.videoDuration}
                onChange={(e) => handleOptionChange('videoDuration', parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500 hover:accent-pink-400 transition-colors"
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                <span>4s</span>
                <span>8s</span>
                <span>12s</span>
              </div>
            </div>
          )}

          {showKeyWarning && (
            <div className="bg-yellow-900/30 border border-yellow-800 rounded-lg p-3 mt-3">
              <p className="text-xs text-yellow-500 mb-2">
                {mediaType === MediaType.VIDEO ? "Video" : "High-resolution image"} generation requires a paid API key via Google Cloud.
              </p>
              <button 
                onClick={onRequestPaidKey}
                className="w-full py-1.5 px-3 bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-semibold rounded"
              >
                Select API Key
              </button>
              <div className="mt-2 text-[10px] text-gray-400">
                See <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">billing docs</a>.
              </div>
            </div>
          )}
        </div>

        {/* Base Prompt */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-300">Concept</label>
          <textarea
            value={basePrompt}
            onChange={(e) => setBasePrompt(e.target.value)}
            placeholder="Describe your idea... (e.g., 'A cat in space')"
            className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none transition-colors"
          />
        </div>

        {/* Aspect Ratio */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-300">Aspect Ratio</label>
          <div className="flex flex-wrap gap-2">
            {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio.value}
                onClick={() => handleOptionChange('aspectRatio', ratio.value)}
                title={ratio.label}
                className={`p-2 rounded-md border transition-all ${
                  options.aspectRatio === ratio.value
                    ? 'bg-gray-700 border-purple-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
              >
                {ratio.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Modifiers Grid */}
        <div className="space-y-4">
          <label className="text-sm font-semibold text-gray-300">Enhancements</label>
          
          <div className="space-y-3">
            <SelectGroup label="Medium" value={options.medium} onChange={(v) => handleOptionChange('medium', v)} options={MEDIA_OPTIONS} />
            <SelectGroup label="Style" value={options.style} onChange={(v) => handleOptionChange('style', v)} options={STYLE_OPTIONS} />
            <SelectGroup label="Lighting" value={options.lighting} onChange={(v) => handleOptionChange('lighting', v)} options={LIGHTING_OPTIONS} />
            <SelectGroup label="Camera" value={options.camera} onChange={(v) => handleOptionChange('camera', v)} options={CAMERA_OPTIONS} />
            <SelectGroup label="Mood" value={options.mood} onChange={(v) => handleOptionChange('mood', v)} options={MOOD_OPTIONS} />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-gray-800 bg-gray-900 sticky bottom-0 z-10 flex flex-col gap-3">
        <button
          onClick={onEnhance}
          disabled={!basePrompt.trim() || isEnhancing || isGenerating}
          className="w-full py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/20 group"
        >
          {isEnhancing ? <RefreshCw className="animate-spin" size={18} /> : <Wand2 size={18} className="group-hover:text-indigo-200" />}
          Magic Enhance
        </button>

        <button
          onClick={onGenerate}
          disabled={!basePrompt.trim() || isEnhancing || isGenerating || showKeyWarning}
          className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
            mediaType === MediaType.VIDEO
             ? 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 shadow-pink-900/20'
             : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-purple-900/20'
          }`}
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              Generating {mediaType === MediaType.VIDEO ? 'Video' : 'Image'}...
            </div>
          ) : (
            <>
              {mediaType === MediaType.VIDEO ? <VideoIcon size={18} /> : <ImageIcon size={18} />}
              Generate {mediaType === MediaType.VIDEO ? 'Video' : 'Image'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const SelectGroup = ({ label, value, onChange, options }: { label: string, value: string, onChange: (v: string) => void, options: string[] }) => (
  <div className="relative">
    <label className="absolute -top-2 left-3 bg-gray-900 px-1 text-[10px] text-gray-400 font-medium uppercase tracking-wider">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none outline-none cursor-pointer"
    >
      <option value="">Auto</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);