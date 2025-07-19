import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { FiMenu, FiX } from 'react-icons/fi';

const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <div className="flex h-screen bg-dark-bg-primary text-dark-text-primary">

            <div className="hidden md:flex md:flex-shrink-0">
                <div className="w-64">
                    <Sidebar />
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">

                <header className="bg-dark-card md:hidden flex items-center justify-between p-4 shadow-md z-20">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-dark-text-primary">
                        {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                    </button>
                    <h1 className="text-xl font-bold">FinTrack</h1>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    <Outlet />
                </main>
            </div>

            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black opacity-50 z-30 md:hidden" 
                    onClick={closeSidebar}
                ></div>
            )}

            <div className={`fixed top-0 left-0 h-full w-64 bg-dark-card z-40 transform transition-transform ease-in-out duration-300 md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Sidebar closeSidebar={closeSidebar} />
            </div>
        </div>
    );
};

export default MainLayout;