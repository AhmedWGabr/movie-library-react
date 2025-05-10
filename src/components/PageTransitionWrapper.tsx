'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation'; // To get a unique key for transitions

interface PageTransitionWrapperProps {
  children: React.ReactNode;
}

const PageTransitionWrapper: React.FC<PageTransitionWrapperProps> = ({ children }) => {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={pathname} // Use pathname for a reliable key
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="pt-20 min-h-screen" // Ensure this class matches your original main element
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
};

export default PageTransitionWrapper;
