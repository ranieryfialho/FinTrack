import React from 'react';
import AddTransactionForm from './AddTransactionForm';

const AddTransactionModal = ({ onClose, onTransactionAdded }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50" 
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg" 
        onClick={(e) => e.stopPropagation()}
      >
        <AddTransactionForm
          onTransactionAdded={onTransactionAdded}
        />
      </div>
    </div>
  );
};

export default AddTransactionModal;