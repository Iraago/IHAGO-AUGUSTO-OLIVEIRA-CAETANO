export interface SongState {
  title: string;
  lyrics: string;
}

export interface Project {
  id: string;
  title: string;
  lyrics: string;
  media: MediaState;
  updatedAt: number;
}

export interface Note {
  id: string;
  content: string;
  createdAt: number;
}

export interface RhymeData {
  targetWord: string;
  perfect: string[];
  phonetic: string[];
}

export interface MediaState {
  type: 'youtube' | 'local' | null;
  url: string | null;
  fileName?: string;
}
