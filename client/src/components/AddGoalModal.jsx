import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AddGoalModal = ({ onClose, onGoalAdded }) => {
  const { currentUser, userProfile } = useAuth();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userProfile?.ambienteId) {
        setError("Não foi possível identificar o ambiente. Tente recarregar a página.");
        return;
    }

    setLoading(true);
    setError('');
    try {
      const token = await currentUser.getIdToken();
      await axios.post('/api/goals', {
        name,
        targetAmount: parseFloat(targetAmount),
        ambienteId: userProfile.ambienteId,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onGoalAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Falha ao criar a meta.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-dark-card p-8 rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-dark-text-primary mb-6">Criar Nova Meta</h2>
        {error && <p className="bg-red-500/20 text-red-400 text-center p-3 rounded-md mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-dark-text-secondary text-sm font-bold mb-2">Nome da Meta</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ex: Viagem para a praia" className="bg-dark-bg-secondary text-dark-text-primary rounded w-full py-2 px-3" />
            </div>
            <div>
              <label className="block text-dark-text-secondary text-sm font-bold mb-2">Valor Total (R$)</label>
              <input type="number" step="0.01" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} required placeholder="1000.00" className="bg-dark-bg-secondary text-dark-text-primary rounded w-full py-2 px-3" />
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <button type="button" onClick={onClose} disabled={loading} className="bg-dark-bg-secondary text-dark-text-primary font-bold py-2 px-4 rounded-lg hover:bg-opacity-80">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Salvando...' : 'Salvar Meta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGoalModal;