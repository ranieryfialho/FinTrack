import React from 'react';
import { FiPlus, FiUpload } from 'react-icons/fi';

const DashboardActions = ({ onAddTransaction, onImportInvoice }) => {
  return (
    <div className="flex flex-col md:flex-row md:justify-end gap-4 mb-8">
      <button
        onClick={onImportInvoice}
        className="w-full md:w-auto bg-dark-text-primary hover:bg-opacity-90 text-dark-bg-secondary font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
      >
        <FiUpload />
        Importar Fatura
      </button>

      <button
        onClick={onAddTransaction}
        className="w-full md:w-auto bg-dark-text-primary hover:bg-opacity-90 text-dark-bg-secondary font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
      >
        <FiPlus />
        Adicionar Transação
      </button>
    </div>
  );
};

export default DashboardActions;