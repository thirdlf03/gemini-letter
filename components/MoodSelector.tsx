import React, { useState, useEffect } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { Mood } from '../types';
import CatIcon from './icons/CatIcon';

interface MoodSelectorProps {
  onSelect: (mood: Mood | string) => void;
  error: string | null;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.1,
      staggerDirection: -1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
  exit: { y: -20, opacity: 0 },
};

const moods = [Mood.WORKED_HARD, Mood.GLOOMY, Mood.HAPPY, Mood.TIRED];

const MoodSelector: React.FC<MoodSelectorProps> = ({ onSelect, error }) => {
  const [customMood, setCustomMood] = useState('');
  const [catSide, setCatSide] = useState<'left' | 'right'>('left');
  const [isCatVisible, setIsCatVisible] = useState(false);
  const [catKey, setCatKey] = useState(0);

  useEffect(() => {
    // Randomly choose a side for the cat to appear from on initial load
    const side = Math.random() > 0.5 ? 'left' : 'right';
    setCatSide(side);

    // Show the cat after a brief delay to let the main UI animate in
    const timer = setTimeout(() => {
      setIsCatVisible(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []); // Run only once when the component mounts

  const handleCatAnimationComplete = () => {
    // Hide the cat and wait for a few seconds
    setIsCatVisible(false);
    
    const pauseTimer = setTimeout(() => {
      // Flip the side and make the cat visible again with a new key to restart animation
      setCatSide(prevSide => (prevSide === 'left' ? 'right' : 'left'));
      setCatKey(prevKey => prevKey + 1);
      setIsCatVisible(true);
    }, 3000); // 3-second pause before reappearing

    return () => clearTimeout(pauseTimer);
  };

  const catVariants: Variants = {
    initial: {
      x: catSide === 'left' ? '-100px' : '100vw',
      // When moving L -> R (from left), flip it to face right (scaleX: -1).
      // When moving R -> L (from right), keep it facing left (scaleX: 1).
      scaleX: catSide === 'left' ? -1 : 1,
    },
    animate: {
      x: catSide === 'left' ? '100vw' : '-100px',
      scaleX: catSide === 'left' ? -1 : 1,
      transition: {
        duration: 28, // Slower speed (was 18)
        ease: 'linear',
      },
    },
  };

  const handleCustomMoodSubmit = () => {
    if (customMood.trim()) {
      onSelect(customMood.trim());
    }
  };

  return (
    <>
      <AnimatePresence>
        {isCatVisible && (
          <motion.div
            key={catKey}
            variants={catVariants}
            initial="initial"
            animate="animate"
            onAnimationComplete={handleCatAnimationComplete}
            className="absolute bottom-[7vh] z-[5] pointer-events-none"
            aria-hidden="true"
          >
            <CatIcon className="w-20 h-auto text-gray-900 opacity-50" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 text-center"
      >
        <motion.h1
          variants={itemVariants}
          className="text-3xl md:text-4xl font-semibold text-white drop-shadow-lg mb-8"
          style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.4)' }}
        >
          今のあなたの気持ちは？
        </motion.h1>
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {moods.map((mood) => (
            <motion.button
              key={mood}
              variants={itemVariants}
              onClick={() => onSelect(mood)}
              whileHover={{ scale: 1.05, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2), 0 4px 6px -2px rgba(0,0,0,0.1)' }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-white/90 text-slate-700 font-semibold rounded-lg shadow-md hover:bg-white transition-all duration-200"
            >
              {mood}
            </motion.button>
          ))}
        </motion.div>

        <motion.div variants={itemVariants} className="w-full max-w-md flex items-center space-x-2">
            <input
              type="text"
              value={customMood}
              onChange={(e) => setCustomMood(e.target.value)}
              placeholder="例：なんだかそわそわする"
              className="flex-grow px-4 py-3 bg-white/20 text-white placeholder-white/60 border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:outline-none transition-all duration-200"
              style={{ backdropFilter: 'blur(5px)' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCustomMoodSubmit();
                }
              }}
              aria-label="あなたの気持ちを言葉にしてください"
            />
            <motion.button
              onClick={handleCustomMoodSubmit}
              disabled={!customMood.trim()}
              whileHover={{ scale: 1.05, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2), 0 4px 6px -2px rgba(0,0,0,0.1)' }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 px-6 py-3 bg-white/90 text-slate-700 font-semibold rounded-lg shadow-md hover:bg-white disabled:bg-white/50 disabled:cursor-not-allowed transition-all duration-200"
            >
              手紙をもらう
            </motion.button>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-4 bg-red-100/80 text-red-800 rounded-lg max-w-md"
          >
            {error}
          </motion.div>
        )}
      </motion.div>
    </>
  );
};

export default MoodSelector;