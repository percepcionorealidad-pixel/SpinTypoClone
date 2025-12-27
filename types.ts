
export interface StyleAnalysis {
  fontFamily: string;
  extrusionDepth: string;
  lightingType: 'glossy' | 'matte' | 'neon' | 'metallic';
  primaryColor: string;
  secondaryColor: string;
  glowEffect: string;
  textureDetails: string;
  shadowAngle: string;
}

export interface GenerationSettings {
  newWord: string;
  intensity3D: number;
  brightness: number;
  outlineThickness: number;
  isTransparent: boolean;
  customPrimaryColor?: string;
  customSecondaryColor?: string;
  customTexture?: string;
}

export interface AppState {
  sourceImage: string | null;
  analysis: StyleAnalysis | null;
  resultImage: string | null;
  isAnalyzing: boolean;
  isGenerating: boolean;
  error: string | null;
}
