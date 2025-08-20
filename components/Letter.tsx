
import React from 'react';
import { motion, Variants } from 'framer-motion';
import { useTypewriter, Cursor } from 'react-simple-typewriter';

interface LetterProps {
  content: string;
  onClose: () => void;
}

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const letterVariants: Variants = {
  hidden: { scale: 0.5, opacity: 0, rotate: -15 },
  visible: { 
    scale: 1, 
    opacity: 1, 
    rotate: 0,
    transition: { type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }
  },
  exit: {
    scale: 0.5,
    opacity: 0,
    rotate: 15,
    transition: { duration: 0.3 }
  }
};

const Letter: React.FC<LetterProps> = ({ content, onClose }) => {
  const [text] = useTypewriter({
    words: [content],
    typeSpeed: 70,
  });

  return (
    <motion.div
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <motion.div
        variants={letterVariants}
        className="relative w-11/12 max-w-lg p-8 md:p-12 bg-[#fffcf2] rounded-lg shadow-2xl"
        style={{ fontFamily: "'Noto Serif JP', serif" }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the letter
      >
        <div className="text-slate-800 leading-loose text-lg whitespace-pre-wrap">
          <span>{text}</span>
          <Cursor cursorStyle="_" />
        </div>

        <button 
          onClick={onClose}
          className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center text-2xl text-slate-600 shadow-lg hover:bg-gray-200 transition"
          aria-label="Close letter"
        >
          &times;
        </button>
      </motion.div>
    </motion.div>
  );
};

export default Letter;
