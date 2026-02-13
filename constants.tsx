import React from 'react';
import { AspectRatio, ImageResolution } from './types';

export const MEDIA_OPTIONS = [
  "Photography", "3D Render", "Digital Illustration", "Oil Painting", "Cinematic Film", "Anime/Manga", "Concept Art", "Polaroid", "Isometric"
];

export const STYLE_OPTIONS = [
  "Cyberpunk", "Minimalist", "Surrealism", "Steampunk", "Vaporwave", "Noir", "Studio Ghibli", "Pixar Style", "Hyperrealistic", "Abstract"
];

export const LIGHTING_OPTIONS = [
  "Golden Hour", "Studio Lighting", "Neon Lights", "Cinematic Lighting", "Natural Light", "Bioluminescent", "Volumetric Fog", "Rembrandt", "Softbox"
];

export const CAMERA_OPTIONS = [
  "Wide Angle", "Telephoto", "Macro", "Drone View", "Fisheye", "Bokeh", "Top-Down", "GoPro", "First-Person"
];

export const MOOD_OPTIONS = [
  "Epic", "Melancholic", "Whimsical", "Dark", "Ethereal", "Energetic", "Peaceful", "Chaotic", "Romantic"
];

export const ASPECT_RATIOS: { value: AspectRatio; label: string; icon: React.ReactNode }[] = [
  { value: AspectRatio.SQUARE, label: "1:1 Square", icon: <div className="w-4 h-4 border-2 border-current rounded-sm" /> },
  { value: AspectRatio.LANDSCAPE, label: "16:9 Landscape", icon: <div className="w-6 h-3.5 border-2 border-current rounded-sm" /> },
  { value: AspectRatio.PORTRAIT, label: "9:16 Portrait", icon: <div className="w-3.5 h-6 border-2 border-current rounded-sm" /> },
  { value: AspectRatio.FOUR_THIRDS, label: "4:3 Classic", icon: <div className="w-5 h-4 border-2 border-current rounded-sm" /> },
  { value: AspectRatio.THREE_FOURTHS, label: "3:4 Vertical", icon: <div className="w-4 h-5 border-2 border-current rounded-sm" /> },
];

export const IMAGE_RESOLUTIONS: { value: ImageResolution; label: string }[] = [
  { value: '1K', label: 'Standard (1K)' },
  { value: '2K', label: 'High (2K)' },
  { value: '4K', label: 'Ultra (4K)' },
];