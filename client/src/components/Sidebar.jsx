import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiGrid, FiBarChart2, FiTarget, FiUsers, FiSettings, FiHelpCircle, FiLogOut, FiMoon } from 'react-icons/fi';
import HelpModal from './HelpModal';

const Sidebar = ({ closeSidebar = () => {} }) => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/auth');
        } catch (error) {
            console.error("Falha ao fazer logout", error);
        }
    };

    const handleLinkClick = () => {
        closeSidebar();
    };

    const navLinkClass = ({ isActive }) => 
        `flex items-center p-3 my-1 rounded-lg transition-colors text-dark-text-secondary hover:bg-dark-bg-secondary hover:text-dark-text-primary ${isActive ? 'bg-dark-bg-secondary text-dark-text-primary font-semibold' : ''}`;

    return (
        <div className="h-full bg-dark-card flex flex-col p-4">
            <div className="p-4 mb-4 text-center">
                <h1 className="text-2xl font-bold text-dark-text-primary flex items-center justify-center gap-2">
                    <FiMoon /> FinTrack
                </h1>
            </div>

            <nav className="flex-1">
                <NavLink to="/" className={navLinkClass} onClick={handleLinkClick} end>
                    <FiGrid className="mr-3" /> Dashboard
                </NavLink>
                <NavLink to="/analysis" className={navLinkClass} onClick={handleLinkClick}>
                    <FiBarChart2 className="mr-3" /> Análise Detalhada
                </NavLink>
                <NavLink to="/goals" className={navLinkClass} onClick={handleLinkClick}>
                    <FiTarget className="mr-3" /> Metas
                </NavLink>
                <NavLink to="/manage-environment" className={navLinkClass} onClick={handleLinkClick}>
                    <FiUsers className="mr-3" /> Gerenciar Ambiente
                </NavLink>
            </nav>

            <div>
                <button onClick={() => setIsHelpModalOpen(true)} className="flex items-center p-3 my-1 rounded-lg w-full text-left text-dark-text-secondary hover:bg-dark-bg-secondary hover:text-dark-text-primary transition-colors">
                    <FiHelpCircle className="mr-3" /> Ajuda
                </button>
                <NavLink to="/settings" className={navLinkClass} onClick={handleLinkClick}>
                    <FiSettings className="mr-3" /> Configurações
                </NavLink>

                <div className="border-t border-dark-border my-4"></div>

                <div className="flex items-center p-2">
                    <img 
                        src={currentUser?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.displayName || currentUser?.email || 'U')}&background=0D8ABC&color=fff`} 
                        alt="User Avatar"
                        className="w-10 h-10 rounded-full mr-3 object-cover"
                    />
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-semibold text-dark-text-primary truncate">{currentUser?.displayName || 'Usuário'}</p>
                        <p className="text-xs text-dark-text-secondary truncate">{currentUser?.email}</p>
                    </div>
                    <button onClick={handleLogout} className="ml-2 text-dark-text-secondary hover:text-red-400 p-2 rounded-full transition-colors">
                        <FiLogOut />
                    </button>
                </div>
            </div>

            {isHelpModalOpen && <HelpModal onClose={() => setIsHelpModalOpen(false)} />}
        </div>
    );
};

export default Sidebar;