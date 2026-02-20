import React, { useState, useRef } from 'react';
import { Music, Youtube, Upload, X, Link as LinkIcon, PlayCircle } from 'lucide-react';
import { MediaState } from '../types';

interface MediaManagerProps {
  media: MediaState;
  setMedia: (media: MediaState) => void;
}

const MediaManager: React.FC<MediaManagerProps> = ({ media, setMedia }) => {
  const [youtubeInput, setYoutubeInput] = useState('');
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleYoutubeSubmit = () => {
    // Basic regex to extract ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = youtubeInput.match(regExp);

    if (match && match[2].length === 11) {
      setMedia({
        type: 'youtube',
        url: match[2], // Store ID
      });
      setYoutubeInput('');
      setShowYoutubeInput(false);
    } else {
      alert("Link do YouTube inválido.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMedia({
        type: 'local',
        url: url,
        fileName: file.name
      });
    }
  };

  const clearMedia = () => {
    if (media.type === 'local' && media.url) {
      URL.revokeObjectURL(media.url);
    }
    setMedia({ type: null, url: null });
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 mb-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Music className="w-4 h-4 text-brand-400" />
          Acompanhamento Musical
        </h3>
        
        {media.type && (
          <button 
            onClick={clearMedia}
            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-400/10 px-2 py-1 rounded transition-colors"
          >
            <X className="w-3 h-3" /> Remover
          </button>
        )}
      </div>

      {!media.type ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* YouTube Option */}
          <div className="space-y-2">
             {!showYoutubeInput ? (
                <button 
                  onClick={() => setShowYoutubeInput(true)}
                  className="w-full flex items-center justify-center gap-2 bg-slate-700/50 hover:bg-red-900/20 hover:border-red-500/50 border border-slate-600 border-dashed rounded-lg p-6 transition-all group"
                >
                  <Youtube className="w-8 h-8 text-slate-400 group-hover:text-red-500 transition-colors" />
                  <span className="text-slate-400 group-hover:text-slate-200">YouTube Link</span>
                </button>
             ) : (
               <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                 <div className="flex gap-2">
                   <div className="relative flex-1">
                     <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                     <input 
                        type="text"
                        value={youtubeInput}
                        onChange={(e) => setYoutubeInput(e.target.value)}
                        placeholder="Cole o link do YouTube..."
                        className="w-full bg-slate-800 border border-slate-600 rounded-md pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 placeholder-slate-500"
                     />
                   </div>
                   <button 
                    onClick={handleYoutubeSubmit}
                    className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                   >
                     Carregar
                   </button>
                 </div>
                 <button 
                   onClick={() => setShowYoutubeInput(false)}
                   className="text-xs text-slate-500 mt-2 hover:text-slate-300"
                 >
                   Cancelar
                 </button>
               </div>
             )}
          </div>

          {/* Local File Option */}
          <div>
            <input 
              type="file" 
              accept="audio/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 bg-slate-700/50 hover:bg-brand-900/20 hover:border-brand-500/50 border border-slate-600 border-dashed rounded-lg p-6 transition-all group"
            >
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-brand-500 transition-colors" />
              <span className="text-slate-400 group-hover:text-slate-200">Arquivo de Áudio</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-black/40 rounded-lg overflow-hidden border border-slate-700">
          {media.type === 'youtube' && media.url && (
            <div className="aspect-video w-full">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${media.url}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}

          {media.type === 'local' && media.url && (
            <div className="p-4 flex flex-col items-center justify-center gap-3">
               <div className="flex items-center gap-3 text-brand-300 mb-2">
                 <PlayCircle className="w-6 h-6" />
                 <span className="font-medium truncate max-w-[200px]">{media.fileName || 'Audio Local'}</span>
               </div>
               <audio controls src={media.url} className="w-full h-8" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaManager;
