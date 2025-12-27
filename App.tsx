
import React, { useState, useEffect } from 'react';
import { analyzeTypographyStyle, generateClonedTypography } from './services/geminiService';
import { StyleAnalysis, GenerationSettings, AppState } from './types';
import { ControlSlider } from './components/ControlSlider';

const TEXTURES = [
  { id: '', label: 'Default (Auto)', icon: '✨' },
  { id: 'Liquid Chrome', label: 'Chrome', icon: '💿' },
  { id: 'Frosted Glass', label: 'Glass', icon: '🧊' },
  { id: 'Brushed Gold Metal', label: 'Gold', icon: '📀' },
  { id: 'Neon Plasma', label: 'Neon', icon: '🌈' },
  { id: 'Polished Dark Wood', label: 'Wood', icon: '🪵' },
  { id: 'Iridescent Liquid', label: 'Liquid', icon: '💧' },
  { id: 'Soft Velvet Fabric', label: 'Velvet', icon: '🧶' }
];

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    sourceImage: null,
    analysis: null,
    resultImage: null,
    isAnalyzing: false,
    isGenerating: false,
    error: null
  });

  const [settings, setSettings] = useState<GenerationSettings>({
    newWord: '',
    intensity3D: 75,
    brightness: 80,
    outlineThickness: 30,
    isTransparent: true,
    customPrimaryColor: '',
    customSecondaryColor: '',
    customTexture: ''
  });

  // Sync settings when analysis changes
  useEffect(() => {
    if (state.analysis) {
      setSettings(prev => ({
        ...prev,
        customPrimaryColor: state.analysis?.primaryColor || '',
        customSecondaryColor: state.analysis?.secondaryColor || '',
        customTexture: '' // Reset to auto when new image is uploaded
      }));
    }
  }, [state.analysis]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        setState(prev => ({ ...prev, sourceImage: base64, analysis: null, resultImage: null, error: null }));
        
        try {
          setState(prev => ({ ...prev, isAnalyzing: true }));
          const analysis = await analyzeTypographyStyle(base64);
          setState(prev => ({ ...prev, analysis, isAnalyzing: false }));
        } catch (err) {
          setState(prev => ({ ...prev, error: "Style analysis failed. Try another image.", isAnalyzing: false }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!state.sourceImage || !state.analysis || !settings.newWord) {
      setState(prev => ({ ...prev, error: "Please upload a sample and enter a new word." }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isGenerating: true, error: null }));
      const result = await generateClonedTypography(state.sourceImage, state.analysis, settings);
      setState(prev => ({ ...prev, resultImage: result, isGenerating: false }));
    } catch (err) {
      setState(prev => ({ ...prev, error: "Generation failed. Please try again.", isGenerating: false }));
    }
  };

  const resetColors = () => {
    if (state.analysis) {
      setSettings(prev => ({
        ...prev,
        customPrimaryColor: state.analysis?.primaryColor || '',
        customSecondaryColor: state.analysis?.secondaryColor || ''
      }));
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      <header className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold font-heading mb-3">
          TypoClone <span className="gradient-text">3D</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Neural 3D typography engine. Upload any artistic text image to extract its style DNA and apply it to your own words.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Panel 1: Template */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-effect rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="bg-indigo-500/20 text-indigo-400 p-1 rounded">01</span>
              Source Template
            </h2>
            
            <div className="relative group aspect-square rounded-xl overflow-hidden bg-slate-800 border-2 border-dashed border-slate-700 hover:border-indigo-500/50 transition-colors">
              {state.sourceImage ? (
                <img src={state.sourceImage} className="w-full h-full object-contain" alt="Source" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 px-4 text-center">
                  <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">Click or drag an image of 3D text to analyze style</p>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            {state.isAnalyzing && (
              <div className="mt-4 flex items-center gap-3 text-sm text-indigo-400 animate-pulse">
                <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                Analyzing Style DNA...
              </div>
            )}

            {state.analysis && !state.isAnalyzing && (
              <div className="mt-6 space-y-3 p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 uppercase tracking-wider">Font Family</span>
                  <span className="text-slate-200 font-semibold">{state.analysis.fontFamily}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 uppercase tracking-wider">Original Texture</span>
                  <span className="text-slate-200 font-semibold truncate ml-2">{state.analysis.textureDetails}</span>
                </div>
                <div className="flex justify-between text-xs items-center">
                  <span className="text-slate-500 uppercase tracking-wider">Detected Color</span>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: state.analysis.primaryColor }}></div>
                    <span className="text-slate-200 font-mono">{state.analysis.primaryColor}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel 2: Personalization & Overrides */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-effect rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="bg-purple-500/20 text-purple-400 p-1 rounded">02</span>
              Personalization
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">New Word / Name</label>
                <input
                  type="text"
                  placeholder="Type your word..."
                  value={settings.newWord}
                  onChange={(e) => setSettings({ ...settings, newWord: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-lg font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-600"
                />
              </div>

              {/* Texture Override Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Material / Texture Override</h3>
                <div className="grid grid-cols-4 gap-2">
                  {TEXTURES.map((tex) => (
                    <button
                      key={tex.id}
                      onClick={() => setSettings({ ...settings, customTexture: tex.id })}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                        settings.customTexture === tex.id
                          ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                          : 'bg-slate-900/50 border-slate-700 text-slate-500 hover:border-slate-500'
                      }`}
                    >
                      <span className="text-lg mb-1">{tex.icon}</span>
                      <span className="text-[9px] font-medium leading-tight text-center">{tex.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Override Section */}
              <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/20 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wide">Color Overrides</h3>
                  <button 
                    onClick={resetColors}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-400 px-2 py-1 rounded transition-colors"
                  >
                    Reset Colors
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 uppercase">Primary</label>
                    <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-lg border border-slate-700">
                      <input 
                        type="color" 
                        value={settings.customPrimaryColor}
                        onChange={(e) => setSettings({...settings, customPrimaryColor: e.target.value})}
                        className="w-5 h-5 rounded border-none bg-transparent cursor-pointer"
                      />
                      <span className="text-[10px] font-mono text-slate-300">{settings.customPrimaryColor}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 uppercase">Accent</label>
                    <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-lg border border-slate-700">
                      <input 
                        type="color" 
                        value={settings.customSecondaryColor}
                        onChange={(e) => setSettings({...settings, customSecondaryColor: e.target.value})}
                        className="w-5 h-5 rounded border-none bg-transparent cursor-pointer"
                      />
                      <span className="text-[10px] font-mono text-slate-300">{settings.customSecondaryColor}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-slate-700/50">
                <ControlSlider 
                  label="3D Intensity" 
                  value={settings.intensity3D} 
                  onChange={(v) => setSettings({ ...settings, intensity3D: v })}
                />
                <ControlSlider 
                  label="Lighting Brightness" 
                  value={settings.brightness} 
                  onChange={(v) => setSettings({ ...settings, brightness: v })}
                />
                
                <label className="flex items-center gap-3 cursor-pointer group mt-4">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={settings.isTransparent}
                      onChange={(e) => setSettings({ ...settings, isTransparent: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-700 rounded-full peer peer-checked:bg-indigo-500 transition-colors"></div>
                    <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full peer-checked:translate-x-5 transition-transform"></div>
                  </div>
                  <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Transparent BG</span>
                </label>
              </div>

              <button
                onClick={handleGenerate}
                disabled={state.isGenerating || !state.sourceImage || !settings.newWord}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-white shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
              >
                {state.isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Synthesizing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Cloned Typography
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Panel 3: Result */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-effect rounded-2xl p-6 h-full flex flex-col">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-400 p-1 rounded">03</span>
              Final Output
            </h2>

            <div className="flex-1 relative rounded-xl overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-slate-900 border border-slate-700 flex items-center justify-center min-h-[300px]">
              {state.resultImage ? (
                <>
                  <img src={state.resultImage} className="w-full h-full object-contain" alt="Result" />
                  <a 
                    href={state.resultImage} 
                    download={`TypoClone-${settings.newWord}.png`}
                    className="absolute bottom-4 right-4 p-3 bg-slate-800/80 backdrop-blur hover:bg-slate-700 text-white rounded-full transition-all"
                    title="Download High-Res"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </a>
                </>
              ) : (
                <div className="text-slate-600 text-center px-8">
                  {state.isGenerating ? (
                    <div className="space-y-4">
                      <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                      <p className="text-sm italic">Mastering the lighting and extrusions...</p>
                    </div>
                  ) : (
                    <p className="text-sm">Your artistic typography will appear here after synthesis.</p>
                  )}
                </div>
              )}
            </div>

            {state.error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-xs flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {state.error}
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="mt-12 text-center text-slate-500 text-xs py-8 border-t border-slate-800">
        TypoClone 3D • Powered by Gemini Neural Models • High-Resolution 3D Synthesis
      </footer>
    </div>
  );
};

export default App;
