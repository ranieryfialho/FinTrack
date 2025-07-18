// client/src/layouts/MainLayout.jsx

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import HelpModal from '../components/HelpModal';
import { FiMenu } from 'react-icons/fi';

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  return (
    <div className="relative h-full w-full md:flex bg-dark-bg-primary">

      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        onOpenHelpModal={() => setIsHelpModalOpen(true)} 
      />

      <div className="flex-1 flex flex-col overflow-hidden">

        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        <button 
          onClick={() => setIsSidebarOpen(true)} 
          className="md:hidden absolute top-4 left-4 z-20 text-dark-text-primary p-2"
        >
          <FiMenu size={28} />
        </button>

        <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
          {children || <Outlet />}
        </main>
        
        <Footer />
      </div>
      
      {isHelpModalOpen && <HelpModal onClose={() => setIsHelpModalOpen(false)} />}
    </div>
  );
};

export default MainLayout;