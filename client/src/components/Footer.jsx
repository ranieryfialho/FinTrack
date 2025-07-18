import React from 'react';
import { FiCode } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="text-center text-dark-text-secondary text-xs p-4 flex-shrink-0 bg-dark-card md:bg-transparent">
      <div className="flex items-center justify-center">
        <span>FinTrack © 2025</span>
        <span className="mx-2">|</span>
        <FiCode className="mr-2" />
        <span>Desenvolvido por</span>
        <a
          href="https://www.linkedin.com/in/raniery-fialho-45698b211/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-blue-400 hover:underline ml-1"
        >
          Raniery Fialho
        </a>
      </div>
    </footer>
  );
};

export default Footer;