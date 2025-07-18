import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const EditTransactionModal = ({ transaction, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({ ...transaction });
  const { currentUser } = useAuth();

  useEffect(() => {
    setFormData({ ...transaction });
  }, [transaction]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToUpdate = { ...formData, amount: parseFloat(formData.amount) };
    
    try {
      const token = await currentUser.getIdToken();
      await axios.put(`/api/transactions/${dataToUpdate.id}`, dataToUpdate, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      onUpdate(dataToUpdate);
    } catch (error) {
      console.error("Falha ao atualizar a transação", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-dark-card p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-dark-text-primary mb-6">Editar Transação</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-dark-text-secondary text-sm font-bold mb-2">Descrição</label>
              <input type="text" name="description" value={formData.description} onChange={handleChange} required className="bg-dark-bg-secondary text-dark-text-primary rounded w-full py-2 px-3" />
            </div>
            <div>
              <label className="block text-dark-text-secondary text-sm font-bold mb-2">Valor (R$)</label>
              <input type="number" name="amount" value={formData.amount} onChange={handleChange} required className="bg-dark-bg-secondary text-dark-text-primary rounded w-full py-2 px-3" />
            </div>
            <div>
              <label className="block text-dark-text-secondary text-sm font-bold mb-2">Data</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} required className="bg-dark-bg-secondary text-dark-text-primary rounded w-full py-2 px-3" />
            </div>
            <div>
              <label className="block text-dark-text-secondary text-sm font-bold mb-2">Tipo</label>
              <select name="type" value={formData.type} onChange={handleChange} className="bg-dark-bg-secondary text-dark-text-primary rounded w-full py-2 px-3">
                <option value="expense">Despesa</option>
                <option value="income">Receita</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button type="button" onClick={onClose} className="bg-dark-bg-secondary text-dark-text-primary font-bold py-2 px-4 rounded-lg hover:bg-opacity-80">
              Cancelar
            </button>
            <button type="submit" className="bg-dark-text-primary text-dark-bg-secondary font-bold py-2 px-4 rounded-lg hover:bg-opacity-90">
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTransactionModal;