import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FiCalendar } from 'react-icons/fi';

const incomeCategories = ['Salário', 'Freelance', 'Investimentos', 'Presente', 'Outras Receitas'];
const expenseCategories = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Compras', 'Educação', 'Outras Despesas'];

const AddTransactionForm = ({ onTransactionAdded }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState(expenseCategories[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 1. NOVOS ESTADOS para a categoria personalizada
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  const { currentUser, userProfile } = useAuth();

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setType(newType);
    const defaultCategory = newType === 'income' ? incomeCategories[0] : expenseCategories[0];
    setCategory(defaultCategory);
    // Esconde o campo personalizado ao trocar o tipo
    setShowCustomCategory(false);
    setCustomCategory('');
  };

  // 2. NOVA FUNÇÃO para lidar com a mudança de categoria
  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setCategory(selectedCategory);
    // Mostra o campo de texto se "Outras" for selecionado
    if (selectedCategory === 'Outras Receitas' || selectedCategory === 'Outras Despesas') {
      setShowCustomCategory(true);
    } else {
      setShowCustomCategory(false);
      setCustomCategory('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
    setSuccess('');

    if (!currentUser || !userProfile?.ambienteId) {
      setError("Erro de autenticação ou ambiente não encontrado.");
      return;
    }

    // 3. LÓGICA ATUALIZADA para usar a categoria correta
    let finalCategory = category;
    if (showCustomCategory && customCategory.trim() !== '') {
      finalCategory = customCategory.trim();
    }

    try {
      const token = await currentUser.getIdToken();

      const transactionData = { 
        description, 
        amount: parseFloat(amount), 
        type, 
        date, 
        category: finalCategory, // Usa a categoria final
        ambienteId: userProfile.ambienteId 
      };

      await axios.post('/api/transactions', transactionData, { 
        headers: { Authorization: `Bearer ${token}` } 
      });

      setSuccess('Transação adicionada com sucesso!');

      setTimeout(() => {
        setDescription('');
        setAmount('');
        if (onTransactionAdded) {
          onTransactionAdded();
        }
      }, 1000);

    } catch (err) { 
      setError('Falha ao adicionar a transação.'); 
      console.error(err); 
    }
  };

  const categoriesToShow = type === 'income' ? incomeCategories : expenseCategories;

  return (
    <div className="bg-dark-card p-6 rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-dark-text-primary">Adicionar Nova Transação</h2>
      {error && <p className="bg-red-500 text-white text-center p-2 rounded mb-4">{error}</p>}
      {success && <p className="bg-green-500 text-white text-center p-2 rounded mb-4">{success}</p>}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-dark-text-secondary text-sm font-bold mb-2">Descrição</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} required className="bg-dark-bg-secondary text-dark-text-primary rounded w-full py-2 px-3" />
          </div>
          <div>
            <label className="block text-dark-text-secondary text-sm font-bold mb-2">Valor (R$)</label>
            <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required className="bg-dark-bg-secondary text-dark-text-primary rounded w-full py-2 px-3" />
          </div>
          <div>
            <label className="block text-dark-text-secondary text-sm font-bold mb-2">Tipo</label>
            <select value={type} onChange={handleTypeChange} className="bg-dark-bg-secondary text-dark-text-primary rounded w-full py-2 px-3">
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
            </select>
          </div>
          <div>
            <label className="block text-dark-text-secondary text-sm font-bold mb-2">Categoria</label>
            {/* O onChange foi atualizado para usar a nova função */}
            <select value={category} onChange={handleCategoryChange} required className="bg-dark-bg-secondary text-dark-text-primary rounded w-full py-2 px-3">
              {categoriesToShow.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          {/* 4. CAMPO CONDICIONAL para a nova categoria */}
          {showCustomCategory && (
            <div className="md:col-span-2">
              <label className="block text-dark-text-secondary text-sm font-bold mb-2">Nome da Nova Categoria</label>
              <input 
                type="text" 
                value={customCategory} 
                onChange={(e) => setCustomCategory(e.target.value)} 
                placeholder="Ex: Supermercado, Viagem"
                required 
                className="bg-dark-bg-secondary text-dark-text-primary rounded w-full py-2 px-3" 
              />
            </div>
          )}

          <div className="md:col-span-2 relative">
            <label className="block text-dark-text-secondary text-sm font-bold mb-2">Data</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="bg-dark-bg-secondary text-dark-text-primary rounded w-full py-2 px-3 md:pr-8 no-calendar-picker-icon" />
            <FiCalendar className="hidden md:block absolute right-3 top-9 text-dark-text-secondary pointer-events-none" />
          </div>
        </div>

        <button type="submit" className="mt-6 w-full bg-dark-text-primary text-dark-bg-secondary font-bold py-2 px-4 rounded-lg hover:bg-opacity-90">
          Adicionar
        </button>
      </form>
    </div>
  );
};

export default AddTransactionForm;