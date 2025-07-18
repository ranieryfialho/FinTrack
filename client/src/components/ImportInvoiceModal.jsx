import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FiUploadCloud, FiFileText, FiX } from 'react-icons/fi';

const ImportInvoiceModal = ({ onClose, onImportComplete }) => {
  const { currentUser, userProfile } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setError('');
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
    } else {
      setFile(null);
      setError('Por favor, selecione um arquivo no formato CSV.');
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Nenhum arquivo selecionado.');
      return;
    }
    setLoading(true);
    setError('');

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csvContent = event.target.result;
        const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');

        if (lines.length < 2) {
          throw new Error("Arquivo CSV vazio ou com dados insuficientes.");
        }

        const header = lines.shift().toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''));
        
        const dateIndex = header.indexOf('date');
        const descriptionIndex = header.indexOf('title');
        const amountIndex = header.indexOf('amount');
        const categoryIndex = header.indexOf('category');

        if (dateIndex === -1 || descriptionIndex === -1 || amountIndex === -1) {
          throw new Error("Formato de cabeçalho inválido. O arquivo precisa conter as colunas 'date', 'title', e 'amount'.");
        }

        const transactions = lines.map(line => {
          const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
          if (values.length < 3) return null;

          const date = values[dateIndex]?.trim().replace(/"/g, '');
          const description = values[descriptionIndex]?.trim().replace(/"/g, '');
          const amountStr = values[amountIndex]?.trim().replace(/"/g, '');
          const category = categoryIndex !== -1 ? (values[categoryIndex]?.trim().replace(/"/g, '') || 'Cartão de Crédito') : 'Cartão de Crédito';

          const amount = parseFloat(amountStr);

          if (date && description && !isNaN(amount)) {
            return { date, description, amount, category };
          }
          return null;
        }).filter(Boolean);

        if (transactions.length === 0) {
          throw new Error("Nenhuma transação válida foi encontrada no arquivo.");
        }

        const token = await currentUser.getIdToken();
        await axios.post('/api/transactions/batch', 
          { transactions, ambienteId: userProfile.ambienteId }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );

        onImportComplete();

      } catch (err) {
        console.error("Erro no processamento do CSV:", err);
        setError(err.response?.data?.error || err.message || 'Falha ao importar a fatura.');
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Ocorreu um erro ao tentar ler o arquivo.');
      setLoading(false);
    };

    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-dark-card p-8 rounded-lg shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-dark-text-primary mb-6">Importar Fatura do Cartão (.csv)</h2>
        
        {error && <p className="bg-red-500/20 text-red-400 text-center p-3 rounded-md mb-4 text-sm">{error}</p>}

        <div className="border-2 border-dashed border-dark-border rounded-lg p-8 text-center bg-dark-bg-secondary">
          <input type="file" id="file-upload" className="hidden" accept=".csv" onChange={handleFileChange} />
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
            <FiUploadCloud className="text-4xl text-dark-text-secondary mb-2" />
            <span className="text-blue-400 font-semibold">Clique para selecionar o arquivo</span>
            <span className="text-xs text-dark-text-secondary mt-1">Padrão Nubank .csv</span>
          </label>
        </div>

        {file && (
          <div className="mt-4 bg-dark-bg-secondary p-3 rounded-lg flex items-center justify-between">
            <div className='flex items-center gap-2'>
              <FiFileText className="text-dark-text-secondary" />
              <span className="text-sm text-dark-text-primary">{file.name}</span>
            </div>
            <button onClick={() => setFile(null)} className="text-dark-text-secondary hover:text-white">
              <FiX/>
            </button>
          </div>
        )}

        <div className="flex justify-end gap-4 mt-8">
          <button onClick={onClose} disabled={loading} className="bg-dark-bg-secondary text-dark-text-primary font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 disabled:opacity-50">
            Cancelar
          </button>
          <button onClick={handleImport} disabled={!file || loading} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Importando...' : 'Importar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportInvoiceModal;