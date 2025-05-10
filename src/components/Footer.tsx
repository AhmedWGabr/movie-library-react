const Footer = () => {
  return (
    <footer className="bg-tmdb-dark-blue text-gray-300 py-8 text-center">
      <div className="container mx-auto px-4">
        <div className="mb-4">
          {/* Placeholder for a logo or more prominent branding if desired */}
          {/* <img src="/path-to-your-logo.svg" alt="Logo" className="h-8 mx-auto mb-2" /> */}
        </div>
        <p className="text-sm font-montserrat mb-2">
          MOVIES LIBRARY &copy; {new Date().getFullYear()}
        </p>
        <p className="text-xs text-gray-400 font-montserrat">
          This project uses the TMDb API but is not endorsed or certified by TMDb.
        </p>
        {/* Optional: Add links here if needed in the future */}
        {/* <div className="mt-4 space-x-4">
          <Link href="/about" className="hover:text-tmdb-accent">About</Link>
          <Link href="/contact" className="hover:text-tmdb-accent">Contact</Link>
          <Link href="/terms" className="hover:text-tmdb-accent">Terms of Service</Link>
        </div> */}
      </div>
    </footer>
  );
};

export default Footer;
