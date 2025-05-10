'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react'; // Added useState for mobile menu and useEffect for scroll
import { useRouter, usePathname } from 'next/navigation'; // Added usePathname

const Header = () => {
  const router = useRouter();
  const pathname = usePathname(); // Get current path
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) { // Adjust 50 to your desired scroll threshold
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  // Search related state and functions are removed as the search bar is removed from header.
  // Search functionality will be handled by the search icon navigating to the search page.


  return (
    // Using custom TMDB colors defined in tailwind.config.ts
    <header className={`text-white p-4 fixed w-full top-0 z-50 transition-colors duration-300 ease-in-out ${isScrolled ? 'bg-black/50 backdrop-blur-sm' : 'bg-tmdb-dark-blue'}`}> {/* Updated background color and added scroll effect */}
      <div className="container mx-auto flex items-center justify-between">
        {/* Left Section: Logo and Title (TMDB style is more compact, often just logo) */}
        <Link href="/" className="flex items-center transition-all duration-300 ease-in-out hover:opacity-80 hover:scale-105">
          {/* Using existing logo for now, TMDB logo is different */}
          <Image src="/logo64x64.png" alt="Movies Library Logo" width={36} height={36} className="mr-2" /> {/* Slightly smaller logo */}
          {/* TMDB doesn't usually have text title next to logo in main nav */}
          {/* <h1 className="text-xl font-bold">TMDB CLONE</h1> */}
        </Link>

        {/* Middle Section: Navigation - TMDB Style (Desktop) */}
        <nav className="hidden md:flex space-x-4 items-center"> {/* Reduced space-x for more compact look */}
          <Link href="/movies" className={`nav-link hover:text-tmdb-accent font-semibold ${pathname === '/movies' ? 'nav-link-active text-tmdb-accent' : ''}`}>
            Movies
          </Link>
          <Link href="/series" className={`nav-link hover:text-tmdb-accent font-semibold ${pathname === '/series' ? 'nav-link-active text-tmdb-accent' : ''}`}>
            TV Shows
          </Link>
          <Link href="/people" className={`nav-link hover:text-tmdb-accent font-semibold ${pathname === '/people' ? 'nav-link-active text-tmdb-accent' : ''}`}>
            People
          </Link>
          {/* Placeholder for "More" dropdown */}
          <div className="relative group">
            {/* Note: Active state for "More" is more complex as it's not a direct page link */}
            <button className="nav-link hover:text-tmdb-accent font-semibold">
              More
            </button>
            {/* Basic dropdown structure - will need styling and JS for interactivity */}
            <div className="absolute left-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 hidden group-hover:block">
              {/* Add dropdown items here, e.g., Discussions, Leaderboard, Support, API */}
              <Link href="#" className="block px-4 py-2 text-sm hover:bg-gray-100">Discussions</Link>
              <Link href="#" className="block px-4 py-2 text-sm hover:bg-gray-100">Leaderboard</Link>
            </div>
          </div>
        </nav>

        {/* Right Section: TMDB Style Icons & Mobile Menu Toggle */}
        <div className="flex items-center space-x-4">
          {/* Hamburger Menu Icon - Visible on small screens */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
              className="text-white focus:outline-none hover:text-tmdb-accent"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> // X icon
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" /> // Hamburger icon
                )}
              </svg>
            </button>
          </div>

          {/* Icons - Visible on medium and larger screens as part of the flex row */}
          {/* Heart Icon linking to Wishlist */}
          <Link href="/wishlist" aria-label="View Wishlist" className="hidden md:block hover:text-tmdb-accent transition-colors duration-300 ease-in-out">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </Link>
          {/* Placeholder for Language (EN) */}
          <button aria-label="Change language" className="hidden md:block border border-white rounded px-2 py-0.5 text-sm font-semibold hover:bg-white hover:text-slate-800 transition-colors duration-300 ease-in-out">
            EN
          </button>
          {/* Login & Join TMDB links removed as per user request */}
          {/* Placeholder for Search Icon */}
          {/* Search icon visible on all screen sizes for consistency, or could be md:block if preferred in mobile menu */}
          <button aria-label="Search" onClick={() => router.push('/search')} className="hover:text-tmdb-accent transition-colors duration-300 ease-in-out">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-tmdb-dark-blue/95 backdrop-blur-sm absolute top-full left-0 w-full pb-4"> {/* Added some styling for backdrop */}
          <nav className="flex flex-col items-center space-y-2 pt-2">
            <Link href="/movies" className="hover:text-tmdb-accent transition-colors duration-300 ease-in-out font-semibold py-2" onClick={toggleMobileMenu}>
              Movies
            </Link>
            <Link href="/series" className="hover:text-tmdb-accent transition-colors duration-300 ease-in-out font-semibold py-2" onClick={toggleMobileMenu}>
              TV Shows
            </Link>
            <Link href="/people" className="hover:text-tmdb-accent transition-colors duration-300 ease-in-out font-semibold py-2" onClick={toggleMobileMenu}>
              People
            </Link>
            {/* Mobile "More" - simplified for now, can be expanded */}
            {/* For simplicity, not including the dropdown within mobile menu directly, but can list items */}
            <Link href="#" className="hover:text-tmdb-accent transition-colors duration-300 ease-in-out font-semibold py-2" onClick={toggleMobileMenu}>Discussions</Link>
            <Link href="#" className="hover:text-tmdb-accent transition-colors duration-300 ease-in-out font-semibold py-2" onClick={toggleMobileMenu}>Leaderboard</Link>
            
            {/* Mobile specific icons/buttons if needed */}
            <div className="flex space-x-4 pt-2">
                <Link href="/wishlist" aria-label="View Wishlist" className="hover:text-tmdb-accent transition-colors duration-300 ease-in-out" onClick={toggleMobileMenu}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>
                </Link>
                <button aria-label="Change language" className="border border-white rounded px-2 py-0.5 text-sm font-semibold hover:bg-white hover:text-slate-800 transition-colors duration-300 ease-in-out">
                    EN
                </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
