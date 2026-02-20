import React, { useState, useEffect } from 'react';
import { Mic2, StickyNote, Plus, Trash2, PenTool, Layout, Save, FolderOpen, X } from 'lucide-react';
import MediaManager from './components/MediaManager';
import Composer from './components/Composer';
import { Note, MediaState, Project } from './types';

const App = () => {
  // Global Notes
  const [notes, setNotes] = useState<Note[]>([]);
  
  // Projects Management
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);

  // Current Working State
  const [title, setTitle] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [media, setMedia] = useState<MediaState>({ type: null, url: null });

  // Initialize with a default project if none exist
  useEffect(() => {
    if (projects.length === 0 && !currentProjectId) {
      const defaultProject: Project = {
        id: 'default-1',
        title: 'Nova Música',
        lyrics: '',
        media: { type: null, url: null },
        updatedAt: Date.now()
      };
      setProjects([defaultProject]);
      setCurrentProjectId(defaultProject.id);
      loadProjectIntoState(defaultProject);
    }
  }, []);

  // Auto-save current state to current project object
  useEffect(() => {
    if (!currentProjectId) return;

    setProjects(prevProjects => prevProjects.map(p => {
      if (p.id === currentProjectId) {
        return {
          ...p,
          title,
          lyrics,
          media,
          updatedAt: Date.now()
        };
      }
      return p;
    }));
  }, [title, lyrics, media, currentProjectId]);

  const loadProjectIntoState = (project: Project) => {
    setTitle(project.title);
    setLyrics(project.lyrics);
    setMedia(project.media);
  };

  const createNewProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: 'Projeto Sem Título',
      lyrics: '',
      media: { type: null, url: null },
      updatedAt: Date.now()
    };
    setProjects([newProject, ...projects]);
    setCurrentProjectId(newProject.id);
    loadProjectIntoState(newProject);
    setShowProjectModal(false);
  };

  const switchProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      setCurrentProjectId(id);
      loadProjectIntoState(project);
      setShowProjectModal(false);
    }
  };

  const deleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newProjects = projects.filter(p => p.id !== id);
    setProjects(newProjects);
    
    if (id === currentProjectId) {
      if (newProjects.length > 0) {
        switchProject(newProjects[0].id);
      } else {
        createNewProject();
      }
    }
  };

  // Note Handlers
  const addNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      content: '',
      createdAt: Date.now()
    };
    setNotes([newNote, ...notes]);
  };

  const updateNote = (id: string, content: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, content } : n));
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-200 overflow-hidden font-sans">
      
      {/* Sidebar (Global Notes) */}
      <div className="md:w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-[40vh] md:h-screen shrink-0 order-2 md:order-1">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 backdrop-blur z-10 sticky top-0">
          <h2 className="text-lg font-bold flex items-center gap-2 text-brand-400">
            <StickyNote className="w-5 h-5" /> Notas Globais
          </h2>
          <button 
            onClick={addNote}
            className="p-2 bg-brand-600 hover:bg-brand-500 rounded-lg text-white transition-all shadow-lg shadow-brand-900/20 active:scale-95"
            aria-label="Criar nota"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {notes.length === 0 ? (
            <div className="text-center text-slate-600 mt-10">
              <p className="text-sm">Nenhuma nota criada.</p>
              <button onClick={addNote} className="text-brand-400 text-sm hover:underline mt-2">Criar nova nota</button>
            </div>
          ) : (
            notes.map(note => (
              <div key={note.id} className="group bg-yellow-200/5 hover:bg-yellow-200/10 border border-yellow-500/20 rounded-lg p-3 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] text-yellow-500/50 font-mono">
                    {new Date(note.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  <button 
                    onClick={() => deleteNote(note.id)}
                    className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <textarea
                  value={note.content}
                  onChange={(e) => updateNote(note.id, e.target.value)}
                  placeholder="Ideia rápida..."
                  className="w-full bg-transparent border-none resize-none text-sm text-slate-300 focus:outline-none focus:text-white h-24 placeholder-slate-600"
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-[60vh] md:h-screen order-1 md:order-2 relative">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-950 flex items-center px-6 gap-4 shrink-0 justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="bg-brand-500 p-2 rounded-lg shadow-lg shadow-brand-500/20">
              <Mic2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 max-w-xl">
               <input
                 type="text"
                 value={title}
                 onChange={(e) => setTitle(e.target.value)}
                 placeholder="Título da Música..."
                 className="w-full bg-transparent text-xl font-bold text-white placeholder-slate-600 focus:outline-none focus:placeholder-slate-700 truncate"
               />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowProjectModal(true)}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg text-sm border border-slate-700 transition-all"
            >
              <FolderOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Meus Projetos</span>
            </button>
          </div>
        </header>

        {/* Workspace */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gradient-to-br from-slate-950 to-slate-900">
           <div className="max-w-4xl mx-auto h-full flex flex-col">
             
             <MediaManager media={media} setMedia={setMedia} />

             <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
                <div className="bg-slate-800/50 p-2 border-b border-slate-700 flex items-center gap-2 px-4 justify-between">
                  <div className="flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Editor de Letras</span>
                  </div>
                  <span className="text-[10px] text-slate-600">Salvo automaticamente</span>
                </div>
                <div className="flex-1 relative">
                  <Composer lyrics={lyrics} setLyrics={setLyrics} />
                </div>
             </div>
           </div>
        </main>

        {/* Project Manager Modal */}
        {showProjectModal && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 w-full max-w-lg rounded-xl border border-slate-700 shadow-2xl flex flex-col max-h-[80vh]">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layout className="w-5 h-5 text-brand-400" /> Projetos
                </h3>
                <button onClick={() => setShowProjectModal(false)} className="text-slate-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                 {projects.map(proj => (
                   <div 
                    key={proj.id}
                    onClick={() => switchProject(proj.id)}
                    className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                      proj.id === currentProjectId 
                      ? 'bg-brand-900/20 border-brand-500/50' 
                      : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                   >
                     <div>
                       <h4 className={`font-semibold ${proj.id === currentProjectId ? 'text-brand-300' : 'text-slate-300'}`}>
                         {proj.title || 'Sem título'}
                       </h4>
                       <p className="text-xs text-slate-500 mt-1 truncate max-w-[250px]">
                         {proj.lyrics ? proj.lyrics.substring(0, 40) + '...' : 'Sem letra...'}
                       </p>
                     </div>
                     <div className="flex items-center gap-2">
                        {proj.id === currentProjectId && <span className="text-[10px] bg-brand-500 text-white px-2 py-0.5 rounded-full">Ativo</span>}
                        <button 
                          onClick={(e) => deleteProject(proj.id, e)}
                          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                   </div>
                 ))}
              </div>

              <div className="p-4 border-t border-slate-800">
                <button 
                  onClick={createNewProject}
                  className="w-full bg-brand-600 hover:bg-brand-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <Plus className="w-5 h-5" /> Criar Nova Música
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
