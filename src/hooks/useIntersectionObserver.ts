'use client';

import { useEffect, useState, useRef, RefObject } from 'react';

interface IntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  once?: boolean; // Custom option to unobserve after first intersection
}

function useIntersectionObserver(
  options?: IntersectionObserverOptions
): [RefObject<HTMLDivElement | null>, boolean] { // Allow null in RefObject generic
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef<HTMLDivElement | null>(null); // Match ref type with initialization

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && options?.once) {
          observer.unobserve(element);
        }
      },
      {
        threshold: options?.threshold || 0.1,
        root: options?.root || null,
        rootMargin: options?.rootMargin || '0px',
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [options?.threshold, options?.root, options?.rootMargin, options?.once]); // Effect dependencies

  return [elementRef, isIntersecting];
}

export default useIntersectionObserver;
