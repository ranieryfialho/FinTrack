import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const DepositWithdrawModal = ({ type, goal, onClose, onActionCompleted }) => {
  const { currentUser, userProfile } = useAuth();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isDeposit = type === 'deposit';
  const title = isDeposit ? 'Guardar Dinheiro' : 'Resgatar Dinheiro';
  const buttonText = isDeposit ? 'Guardar' : 'Resgatar';
  const endpoint = isDeposit ? 'deposit' : 'withdraw';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = await currentUser.getIdToken();
      // LINHA ALTERADA AQUI:
      await axios.post(`/api/goals/${goal.id}/${endpoint}`, {
        amount: parseFloat(amount),
        ambienteId: userProfile.ambienteId,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onActionCompleted();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || `Falha ao ${buttonText.toLowerCase()}.`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-dark-card p-8 rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-dark-text-primary mb-2">{title}</h2>
        <p className="text-dark-text-secondary mb-6">Meta: <span className="font-semibold">{goal.name}</span></p>
        {error && <p className="bg-red-500/20 text-red-400 text-center p-3 rounded-md mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label className="block text-dark-text-secondary text-sm font-bold mb-2">Valor (R$)</label>
            <input 
              type="number" 
              step="0.01" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              required 
              placeholder="50.00" 
              className="bg-dark-bg-secondary text-dark-text-primary rounded w-full py-2 px-3" 
            />
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <button type="button" onClick={onClose} disabled={loading} className="bg-dark-bg-secondary text-dark-text-primary font-bold py-2 px-4 rounded-lg hover:bg-opacity-80">
              Cancelar
            </button>
            <button type="submit" disabled={loading || !amount} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Processando...' : buttonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepositWithdrawModal;