import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FiPlus, FiTarget } from 'react-icons/fi';
import AddGoalModal from '../components/AddGoalModal';
import GoalCard from '../components/GoalCard';

const GoalsPage = () => {
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  
  const [goals, setGoals] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchGoals = useCallback(async () => {
    if (!currentUser || !userProfile?.ambienteId) return;
    
    setDataLoading(true);
    try {
      const token = await currentUser.getIdToken();
      const params = new URLSearchParams({ ambienteId: userProfile.ambienteId });
      const { data } = await axios.get(`/api/goals`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setGoals(data);
    } catch (error) {
      console.error("Erro ao buscar metas", error);
    } finally {
      setDataLoading(false);
    }
  }, [currentUser, userProfile]);

  useEffect(() => {
    if (!authLoading) {
      fetchGoals();
    }
  }, [authLoading, fetchGoals]);

  if (authLoading) {
    return <div className="flex items-center justify-center h-full"><div className="loader"></div></div>;
  }

  if (!userProfile?.ambienteId) {
    return (
      <div className="p-4 md:p-8 text-center">
        <h1 className="text-xl font-bold text-dark-text-primary">Ambiente não encontrado</h1>
        <p className="text-dark-text-secondary mt-2">
          Parece que você não está em um ambiente. Crie ou aceite um convite para usar esta funcionalidade.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-dark-text-primary flex items-center gap-3">
            <FiTarget />
            Metas Financeiras
          </h1>
          <p className="text-dark-text-secondary mt-1">Defina seus objetivos e acompanhe o progresso.</p>
        </div>
        <div className="w-full md:w-auto">
            <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full md:w-auto bg-dark-text-primary hover:bg-opacity-90 text-dark-bg-secondary font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
            <FiPlus />
            Criar Nova Meta
            </button>
        </div>
      </header>
      
      {dataLoading ? (
        <div className="flex items-center justify-center h-64"><div className="loader"></div></div>
      ) : (
        <>
          {goals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} onActionCompleted={fetchGoals} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-dark-card rounded-xl">
              <FiTarget className="mx-auto text-5xl text-dark-text-secondary mb-4" />
              <h3 className="text-xl font-semibold text-dark-text-primary">Nenhuma meta definida</h3>
              <p className="text-dark-text-secondary mt-2">Comece a planejar seu futuro. Crie sua primeira meta!</p>
            </div>
          )}
        </>
      )}


      {isAddModalOpen && (
        <AddGoalModal 
          onClose={() => setIsAddModalOpen(false)}
          onGoalAdded={() => {
            setIsAddModalOpen(false);
            fetchGoals();
          }}
        />
      )}
    </div>
  );
};

export default GoalsPage;