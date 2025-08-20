import React, { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { GameState, Mood, SavedLetter } from './types';
import { generateLetter } from './services/geminiService';
import { useSound } from './hooks/useSound';
import Scene from './components/Scene';
import MoodSelector from './components/MoodSelector';
import Letter from './components/Letter';
import StartScreen from './components/StartScreen';
import SavedLettersList from './components/SavedLettersList';
import BookIcon from './components/icons/BookIcon';
import SoundOnIcon from './components/icons/SoundOnIcon';
import SoundOffIcon from './components/icons/SoundOffIcon';

// This assumes Howler is loaded globally from the CDN in index.html
declare const Howler: any;

export default function App() {
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [gameState, setGameState] = useState<GameState>(GameState.SELECTING_MOOD);
  const [selectedMood, setSelectedMood] = useState<Mood | string | null>(null);
  const [letterContent, setLetterContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [savedLetters, setSavedLetters] = useState<SavedLetter[]>([]);
  const [isSavedLettersOpen, setIsSavedLettersOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const playBGM = useSound('/sounds/meadow.wav', { loop: true, volume: 0.3 });
  const playSelectSound = useSound('/sounds/select.wav', { volume: 0.5 });
  const playSwooshSound = useSound('/sounds/swoosh.mp3', { volume: 0.4 });
  const playArriveSound = useSound('/sounds/arrive.mp3', { volume: 0.6 });
  const playOpenSound = useSound('/sounds/open.mp3', { volume: 0.5 });
  const playCloseSound = useSound('/sounds/close.mp3', { volume: 0.5 });
  
  useEffect(() => {
    try {
      const storedLetters = localStorage.getItem('savedLetters');
      if (storedLetters) {
        setSavedLetters(JSON.parse(storedLetters));
      }
    } catch (error) {
      console.error("Failed to load saved letters:", error);
    }
  }, []);
  
  const handleStart = () => {
    playBGM();
    setIsStarted(true);
  };

  const handleMoodSelect = useCallback(async (mood: Mood | string) => {
    playSelectSound();
    setSelectedMood(mood);
    setIsLoading(true);
    setError(null);
    setGameState(GameState.DELIVERING_LETTER);
    playSwooshSound();

    try {
      const content = await generateLetter(mood);
      setLetterContent(content);
      // The delivery animation has a fixed duration, after which the letter opens automatically.
      setTimeout(() => {
        playArriveSound();
        playOpenSound();
        setGameState(GameState.READING_LETTER);
        setIsLoading(false);
      }, 4000); // Corresponds to animation duration in Scene.tsx
    } catch (err) {
      console.error(err);
      setError('お手紙を運ぶ途中で、小鳥さんが道に迷ってしまったようです。少し待ってから、もう一度試してみてください。');
      setIsLoading(false);
      setGameState(GameState.SELECTING_MOOD);
    }
  }, [playSelectSound, playSwooshSound, playArriveSound, playOpenSound]);

  const handleCloseLetter = () => {
    playCloseSound();
    setGameState(GameState.SELECTING_MOOD);
    setSelectedMood(null);
    setLetterContent('');
  };

  const handleSaveLetter = () => {
    if (!selectedMood || !letterContent || savedLetters.some(l => l.content === letterContent)) {
      return;
    }
    const newLetter: SavedLetter = {
      id: Date.now(),
      mood: selectedMood,
      content: letterContent,
      date: new Date().toISOString(),
    };
    const updatedLetters = [...savedLetters, newLetter];
    setSavedLetters(updatedLetters);
    localStorage.setItem('savedLetters', JSON.stringify(updatedLetters));
  };

  const handleDeleteLetter = (id: number) => {
    const updatedLetters = savedLetters.filter(letter => letter.id !== id);
    setSavedLetters(updatedLetters);
    localStorage.setItem('savedLetters', JSON.stringify(updatedLetters));
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    Howler.mute(newMutedState);
  };

  return (
    <div 
      className="relative w-screen h-screen overflow-hidden bg-cover bg-center font-sans"
      style={{ backgroundImage: "url('/bg1.png')" }}
    >
      <AnimatePresence>
        {!isStarted && <StartScreen onStart={handleStart} />}
      </AnimatePresence>

      {isStarted && (
        <>
          <div className="absolute top-4 right-4 z-50 flex space-x-3">
            <button 
              onClick={() => setIsSavedLettersOpen(true)} 
              className="p-3 bg-white/70 rounded-full text-slate-700 hover:bg-white transition shadow-md"
              aria-label="Open saved letters"
            >
              <BookIcon className="w-6 h-6" />
            </button>
            <button onClick={toggleMute} 
              className="p-3 bg-white/70 rounded-full text-slate-700 hover:bg-white transition shadow-md"
              aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
            >
              {isMuted ? <SoundOffIcon className="w-6 h-6" /> : <SoundOnIcon className="w-6 h-6" />}
            </button>
          </div>

          <Scene gameState={gameState} />

          <AnimatePresence>
            {gameState === GameState.SELECTING_MOOD && (
              <MoodSelector onSelect={handleMoodSelect} error={error} />
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {isLoading && gameState === GameState.DELIVERING_LETTER && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <div className="text-white text-lg bg-black/50 px-6 py-3 rounded-lg shadow-lg">
                  小鳥さんがお手紙を運んでいます...
                </div>
              </div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {gameState === GameState.READING_LETTER && (
              <Letter 
                content={letterContent} 
                onClose={handleCloseLetter} 
                onSave={handleSaveLetter}
                isSaved={savedLetters.some(l => l.content === letterContent)}
              />
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {isSavedLettersOpen && (
              <SavedLettersList letters={savedLetters} onClose={() => setIsSavedLettersOpen(false)} onDelete={handleDeleteLetter} />
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
