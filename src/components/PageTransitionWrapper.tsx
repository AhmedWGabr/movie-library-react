'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface PageTransitionWrapperProps {
  children: React.ReactNode;
}

const PageTransitionWrapper: React.FC<PageTransitionWrapperProps> = ({ children }) => {
  const pathname = usePathname();
  const [transitionStage, setTransitionStage] = useState('fadeIn');

  useEffect(() => {
    setTransitionStage('fadeOut');
    const timer = setTimeout(() => {
      setTransitionStage('fadeIn');
    }, 300); // Corresponds to animation duration

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <main
      key={pathname}
      className={`pt-20 min-h-screen page-transition ${transitionStage}`}
    >
      {children}
    </main>
  );
};

export default PageTransitionWrapper;
