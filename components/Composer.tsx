import React, { useState, useCallback, useRef } from 'react';
import { getRhymesForWord } from '../services/geminiService';
import { RhymeData } from '../types';
import { RefreshCw, Sparkles, ChevronRight, ChevronLeft, Search, ArrowUpFromLine, ArrowDownToLine } from 'lucide-react';

interface ComposerProps {
  lyrics: string;
  setLyrics: (l: string) => void;
}

const Composer: React.FC<ComposerProps> = ({ lyrics, setLyrics }) => {
  const [rhymeData, setRhymeData] = useState<RhymeData | null>(null);
  
  // Pagination states for both boxes
  const [perfectIndex, setPerfectIndex] = useState(0);
  const [phoneticIndex, setPhoneticIndex] = useState(0);
  
  const [loadingRhymes, setLoadingRhymes] = useState(false);
  const [manualSearchTerm, setManualSearchTerm] = useState('');
  const [targetMode, setTargetMode] = useState<'last' | 'penultimate'>('last');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastAnalyzedWordRef = useRef<string>("");

  const fetchRhymes = async (word: string) => {
    if (!word) return;
    if (word === lastAnalyzedWordRef.current && !manualSearchTerm) return; // Avoid refetch unless manual
    
    lastAnalyzedWordRef.current = word;
    setLoadingRhymes(true);
    
    const data = await getRhymesForWord(word);
    
    setRhymeData({ 
      targetWord: word, 
      perfect: data.perfect || [], 
      phonetic: data.phonetic || [] 
    });
    setPerfectIndex(0);
    setPhoneticIndex(0);
    setLoadingRhymes(false);
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualSearchTerm.trim()) {
      fetchRhymes(manualSearchTerm.trim().toLowerCase());
    }
  };

  // Analyze text based on cursor position and target mode
  const checkContextForRhyme = useCallback((text: string, cursorPosition: number) => {
    const textUpToCursor = text.slice(0, cursorPosition);
    const lines = textUpToCursor.split('\n');
    
    // Logic to find the target line
    // If just hit enter, last line is empty.
    let searchIndex = lines.length - 2; // Default to line before cursor (Last completed line)
    
    if (targetMode === 'penultimate') {
      searchIndex = lines.length - 3; // Line before the last completed line
    }

    // Backtrack to find non-empty line
    while (searchIndex >= 0 && lines[searchIndex].trim() === '') {
      searchIndex--;
    }

    if (searchIndex < 0) return;

    const targetLine = lines[searchIndex].trim();
    if (!targetLine) return;

    // Extract last word
    const match = targetLine.match(/([a-zA-Z\u00C0-\u00FF\-]+)[^a-zA-Z\u00C0-\u00FF]*$/);
    
    if (match && match[1]) {
      fetchRhymes(match[1].toLowerCase());
    }
  }, [targetMode]);

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLTextAreaElement;
      checkContextForRhyme(target.value, target.selectionStart);
    }
  };

  // Helper for pagination
  const getVisible = (list: string[], index: number) => list.slice(index, index + 3);
  
  const insertRhyme = (rhyme: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const textBefore = lyrics.substring(0, start);
    const needsSpace = textBefore.length > 0 && !textBefore.endsWith(' ') && !textBefore.endsWith('\n');
    const insertText = (needsSpace ? ' ' : '') + rhyme;

    const newText = lyrics.substring(0, start) + insertText + lyrics.substring(end);
    setLyrics(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + insertText.length, start + insertText.length);
    }, 0);
  };

  return (
    <div className="relative flex flex-col h-full">
      {/* Rhyme Assistant Panel */}
      <div className="bg-slate-900 border-b border-slate-700 flex flex-col transition-all duration-300">
        
        {/* Controls Bar */}
        <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-900/50">
           <form onSubmit={handleManualSearch} className="flex items-center gap-2 flex-1 max-w-sm">
             <div className="relative flex-1">
               <Search className="absolute left-2 top-2 w-3 h-3 text-slate-500" />
               <input 
                  type="text" 
                  value={manualSearchTerm}
                  onChange={(e) => setManualSearchTerm(e.target.value)}
                  placeholder="Rimar palavra específica..."
                  className="w-full bg-slate-800 text-xs text-white rounded border border-slate-700 pl-7 pr-2 py-1.5 focus:border-brand-500 focus:outline-none"
               />
             </div>
             <button type="submit" className="bg-brand-600 hover:bg-brand-500 text-xs px-3 py-1.5 rounded text-white transition-colors">
               Buscar
             </button>
           </form>

           <div className="flex items-center gap-2 ml-4">
             <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider hidden sm:inline">Contexto:</span>
             <div className="flex bg-slate-800 rounded p-0.5 border border-slate-700">
                <button 
                  onClick={() => setTargetMode('last')}
                  className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${targetMode === 'last' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  title="Rimar com a última linha (AABB)"
                >
                  <ArrowDownToLine className="w-3 h-3" /> <span className="hidden sm:inline">Última</span>
                </button>
                <button 
                  onClick={() => setTargetMode('penultimate')}
                  className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${targetMode === 'penultimate' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  title="Rimar com a penúltima linha (ABAB)"
                >
                  <ArrowUpFromLine className="w-3 h-3" /> <span className="hidden sm:inline">Penúltima</span>
                </button>
             </div>
           </div>
        </div>

        {/* Suggestions Area */}
        {(rhymeData || loadingRhymes) && (
          <div className="p-3 bg-slate-950/30">
             <div className="flex items-center gap-2 mb-3">
                <Sparkles className={`w-4 h-4 text-brand-400 ${loadingRhymes ? 'animate-pulse' : ''}`} />
                <span className="text-sm font-medium text-slate-300">
                  {loadingRhymes 
                    ? 'Analisando fonética...' 
                    : <span className="flex items-center gap-2">Rimas para <span className="text-brand-300 font-bold">"{rhymeData?.targetWord}"</span></span>}
                </span>
             </div>

             {!loadingRhymes && rhymeData && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Perfect Rhymes Box */}
                  <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700/50">
                     <div className="flex justify-between items-center mb-2 px-1">
                       <span className="text-[10px] uppercase text-emerald-400 font-bold">Perfeitas</span>
                       <div className="flex gap-1">
                         <button onClick={() => setPerfectIndex(Math.max(0, perfectIndex - 3))} disabled={perfectIndex === 0} className="p-0.5 hover:text-white text-slate-500 disabled:opacity-20"><ChevronLeft className="w-3 h-3"/></button>
                         <button onClick={() => setPerfectIndex(perfectIndex + 3 < rhymeData.perfect.length ? perfectIndex + 3 : perfectIndex)} disabled={perfectIndex + 3 >= rhymeData.perfect.length} className="p-0.5 hover:text-white text-slate-500 disabled:opacity-20"><ChevronRight className="w-3 h-3"/></button>
                       </div>
                     </div>
                     <div className="flex gap-2 flex-wrap min-h-[32px]">
                        {getVisible(rhymeData.perfect, perfectIndex).map((r, i) => (
                          <button key={i} onClick={() => insertRhyme(r)} className="text-xs bg-slate-700 hover:bg-emerald-900/30 hover:text-emerald-300 hover:border-emerald-500/50 border border-transparent text-slate-300 px-2 py-1 rounded transition-colors">
                            {r}
                          </button>
                        ))}
                        {rhymeData.perfect.length === 0 && <span className="text-xs text-slate-600 italic px-1">Nenhuma encontrada</span>}
                     </div>
                  </div>

                  {/* Phonetic Rhymes Box */}
                  <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700/50">
                     <div className="flex justify-between items-center mb-2 px-1">
                       <span className="text-[10px] uppercase text-purple-400 font-bold">Fonéticas / Flow</span>
                       <div className="flex gap-1">
                         <button onClick={() => setPhoneticIndex(Math.max(0, phoneticIndex - 3))} disabled={phoneticIndex === 0} className="p-0.5 hover:text-white text-slate-500 disabled:opacity-20"><ChevronLeft className="w-3 h-3"/></button>
                         <button onClick={() => setPhoneticIndex(phoneticIndex + 3 < rhymeData.phonetic.length ? phoneticIndex + 3 : phoneticIndex)} disabled={phoneticIndex + 3 >= rhymeData.phonetic.length} className="p-0.5 hover:text-white text-slate-500 disabled:opacity-20"><ChevronRight className="w-3 h-3"/></button>
                       </div>
                     </div>
                     <div className="flex gap-2 flex-wrap min-h-[32px]">
                        {getVisible(rhymeData.phonetic, phoneticIndex).map((r, i) => (
                          <button key={i} onClick={() => insertRhyme(r)} className="text-xs bg-slate-700 hover:bg-purple-900/30 hover:text-purple-300 hover:border-purple-500/50 border border-transparent text-slate-300 px-2 py-1 rounded transition-colors">
                            {r}
                          </button>
                        ))}
                         {rhymeData.phonetic.length === 0 && <span className="text-xs text-slate-600 italic px-1">Nenhuma encontrada</span>}
                     </div>
                  </div>
               </div>
             )}
          </div>
        )}
      </div>

      {/* Main Text Area */}
      <textarea
        ref={textareaRef}
        value={lyrics}
        onChange={(e) => setLyrics(e.target.value)}
        onKeyUp={handleKeyUp}
        placeholder="Escreva sua letra aqui..."
        className="flex-1 w-full bg-slate-900/50 p-6 text-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-0 font-mono leading-relaxed resize-none scroll-smooth"
        spellCheck={false}
      />
    </div>
  );
};

export default Composer;