import React, { useState } from 'react';
import { FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import DepositWithdrawModal from './DepositWithdrawModal';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const GoalCard = ({ goal, onActionCompleted }) => {
  const { currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('deposit');

  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const formattedCurrent = goal.currentAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formattedTarget = goal.targetAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleDelete = async () => {
    if (!window.confirm(`Tem certeza que deseja deletar a meta "${goal.name}"? Esta ação não pode ser desfeita.`)) return;

    try {
      const token = await currentUser.getIdToken();
      await axios.delete(`/api/goals/${goal.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onActionCompleted();
    } catch (error) {
      alert(error.response?.data?.error || "Não foi possível deletar a meta.");
      console.error("Erro ao deletar meta:", error);
    }
  };

  return (
    <div className="bg-dark-card rounded-xl p-6 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-dark-text-primary">{goal.name}</h3>
          <button onClick={handleDelete} className="text-dark-text-secondary hover:text-red-500">
            <FiTrash2 />
          </button>
        </div>
        <p className="text-sm text-dark-text-secondary mt-2">
          Guardado <span className="font-bold text-dark-text-primary">{formattedCurrent}</span> de {formattedTarget}
        </p>
        <div className="w-full bg-dark-bg-secondary rounded-full h-2.5 my-4">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
        </div>
        <p className="text-right text-xs text-dark-text-secondary font-mono">{progress.toFixed(1)}%</p>
      </div>

      <div className="flex gap-4 mt-6">
        <button 
          onClick={() => { setModalType('deposit'); setIsModalOpen(true); }}
          className="flex-1 bg-green-500/20 text-green-400 font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-green-500/30"
        >
          <FiPlus /> Guardar
        </button>
      </div>

      {isModalOpen && (
        <DepositWithdrawModal 
          type={modalType}
          goal={goal}
          onClose={() => setIsModalOpen(false)}
          onActionCompleted={onActionCompleted}
        />
      )}
    </div>
  );
};

export default GoalCard;