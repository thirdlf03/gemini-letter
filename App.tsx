import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { GameState, Mood } from './types';
import { generateLetter } from './services/geminiService';
import { useSound } from './hooks/useSound';
import Scene from './components/Scene';
import MoodSelector from './components/MoodSelector';
import Letter from './components/Letter';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.SELECTING_MOOD);
  const [selectedMood, setSelectedMood] = useState<Mood | string | null>(null);
  const [letterContent, setLetterContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const playBGM = useSound('/sounds/meadow.mp3', { loop: true, volume: 0.3 });
  const playSelectSound = useSound('/sounds/select.mp3', { volume: 0.5 });
  const playSwooshSound = useSound('/sounds/swoosh.mp3', { volume: 0.4 });
  const playArriveSound = useSound('/sounds/arrive.mp3', { volume: 0.6 });
  const playOpenSound = useSound('/sounds/open.mp3', { volume: 0.5 });
  const playCloseSound = useSound('/sounds/close.mp3', { volume: 0.5 });

  useEffect(() => {
    // Start BGM on first load
    playBGM();
  }, [playBGM]);

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

  return (
    <div 
      className="relative w-screen h-screen overflow-hidden bg-cover bg-center font-sans"
      style={{ backgroundImage: "url('/bg1.png')" }}
    >
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
          <Letter content={letterContent} onClose={handleCloseLetter} />
        )}
      </AnimatePresence>
    </div>
  );
}