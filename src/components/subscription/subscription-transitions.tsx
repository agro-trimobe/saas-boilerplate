'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface TransitionWrapperProps {
  children: ReactNode;
  isVisible: boolean;
}

export function TransitionWrapper({ children, isVisible }: TransitionWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 20,
        display: isVisible ? 'block' : 'none'
      }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
