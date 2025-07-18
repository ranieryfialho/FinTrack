import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const OnboardingPage = () => {
  const [ambienteName, setAmbienteName] = useState('');
  const { currentUser, forceProfileReload } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateAmbiente = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = await currentUser.getIdToken();
      await axios.post('/api/ambientes', { name: ambienteName }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await forceProfileReload(currentUser);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Falha ao criar o ambiente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-dark-bg-primary text-white p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold mb-4">Bem-vindo(a)!</h1>
        <p className="text-dark-text-secondary mb-8">Para começar, crie seu ambiente financeiro compartilhado.</p>
        
        <form onSubmit={handleCreateAmbiente} className="bg-dark-card p-8 rounded-lg shadow-xl">
          <h2 className="text-xl font-semibold mb-6">Crie seu Ambiente</h2>
          {error && <p className="bg-red-500/20 text-red-400 p-3 rounded-md mb-4 text-sm">{error}</p>}
          <div>
            <label htmlFor="ambienteName" className="block text-left text-dark-text-secondary text-sm font-bold mb-2">
              Nome do Ambiente
            </label>
            <input
              id="ambienteName"
              type="text"
              value={ambienteName}
              onChange={(e) => setAmbienteName(e.target.value)}
              placeholder="Ex: Finanças da Família Silva"
              required
              className="bg-dark-bg-secondary text-dark-text-primary rounded w-full py-3 px-4"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="mt-6 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Criando...' : 'Criar Ambiente e Começar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingPage;