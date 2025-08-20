import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState } from '../types';
import BirdIcon from './icons/BirdIcon';
import EnvelopeIcon from './icons/EnvelopeIcon';

interface SceneProps {
  gameState: GameState;
}

const Postbox = () => (
  <div
    // Positioned to overlay the mailbox in the background image.
    // Percentages are used for responsiveness.
    className="absolute top-[48%] left-[16%] w-[22%] h-[35%] focus:outline-none rounded-lg"
    aria-label="Mailbox"
  >
    {/* The Postbox is now a static element without interactions. */}
  </div>
);

const Scene: React.FC<SceneProps> = ({ gameState }) => {
  const isDelivering = gameState === GameState.DELIVERING_LETTER;

  return (
    <div className="w-full h-full">
      <Postbox />
      
      <AnimatePresence>
        {isDelivering && (
          <motion.div
            // Bird starts from the top-left, off-screen
            initial={{ x: '-20vw', y: '25vh', scale: 0.7, rotate: -20 }}
            // Bird flies to the mailbox
            animate={{ x: '25vw', y: '55vh', scale: 1, rotate: 5 }}
            transition={{ duration: 3.5, type: 'spring', stiffness: 40, damping: 15 }}
            className="absolute z-30"
          >
            <div className="relative">
              <BirdIcon className="w-24 h-24 text-gray-700" />
              <motion.div
                initial={{ opacity: 1 }}
                // Letter drops into the mailbox
                animate={{ opacity: 0, y: 50 }}
                transition={{ delay: 3, duration: 0.5 }}
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
              >
                <EnvelopeIcon className="w-8 h-8 text-yellow-100" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Scene;