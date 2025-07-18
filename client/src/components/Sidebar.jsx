import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiUser, FiHelpCircle, FiSettings, FiLogOut, FiUsers, FiBarChart2, FiTarget } from 'react-icons/fi';

import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen, onOpenHelpModal }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error("Falha ao fazer logout", error);
    }
  };

  const baseLinkClass = "flex items-center gap-3 p-3 rounded-lg transition-colors w-full";
  const activeLinkClass = "bg-dark-bg-secondary text-dark-text-primary font-bold";
  const inactiveLinkClass = "text-dark-text-secondary hover:bg-dark-bg-secondary hover:text-dark-text-primary";

  return (
    <aside className={`w-64 bg-dark-card text-dark-text-primary flex flex-col fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:rounded-xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-4 border-b border-dark-border">
        <h1 className="text-xl font-bold text-center">FinTrack</h1>
      </div>

      <nav className="flex-grow p-4">
        <ul className="space-y-2">
          <li>
            <NavLink to="/" className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
              <FiHome size={20} />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/analysis" className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
              <FiBarChart2 size={20} />
              <span>Análise Detalhada</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/goals" className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
              <FiTarget size={20} />
              <span>Metas</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/manage-environment" className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
              <FiUsers size={20} />
              <span>Gerenciar Ambiente</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="p-4">
        <ul>
          <li>
            <button onClick={onOpenHelpModal} className={`${baseLinkClass} ${inactiveLinkClass}`}>
              <FiHelpCircle size={20} />
              <span>Ajuda</span>
            </button>
          </li>
          <li>
            <NavLink to="/settings" className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
              <FiSettings size={20} />
              <span>Configurações</span>
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="p-4 border-t border-dark-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-dark-bg-secondary flex items-center justify-center overflow-hidden">
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <FiUser size={20} className="text-dark-text-secondary" />
            )}
          </div>
          <div>
            <p className="font-semibold text-sm text-dark-text-primary truncate">
              {currentUser?.displayName || currentUser?.email}
            </p>
            <p className="text-xs text-dark-text-secondary truncate">{currentUser?.email}</p>
          </div>
        </div>

        <button onClick={handleLogout} className="w-full bg-red-500/20 hover:bg-red-500/40 text-red-400 font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors md:hidden">
          <FiLogOut />
          Sair
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;