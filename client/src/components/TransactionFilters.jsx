import React from 'react';
import { FiCalendar } from 'react-icons/fi';

const TransactionFilters = ({ filters, setFilters }) => {
  const { type, startDate, endDate } = filters;

  const handleDateChange = (e) => {
    setFilters(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleTypeChange = (newType) => {
    setFilters(prev => ({ ...prev, type: newType }));
  };

  const activeClass = "bg-dark-text-primary text-dark-bg-secondary";
  const inactiveClass = "bg-dark-bg-secondary text-dark-text-secondary hover:bg-dark-border hover:text-dark-text-primary";

  const getButtonClass = (buttonType) => {
    const baseClass = "px-4 py-1 rounded-md text-sm font-semibold transition-colors";
    return `${baseClass} ${type === buttonType ? activeClass : inactiveClass}`;
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
      <div className="bg-dark-bg-secondary p-1 rounded-lg flex gap-1 w-full md:w-auto">
        <button onClick={() => handleTypeChange('all')} className={`${getButtonClass('all')} w-1/3 md:w-auto`}>Todas</button>
        <button onClick={() => handleTypeChange('income')} className={`${getButtonClass('income')} w-1/3 md:w-auto`}>Receitas</button>
        <button onClick={() => handleTypeChange('expense')} className={`${getButtonClass('expense')} w-1/3 md:w-auto`}>Despesas</button>
      </div>

      <div className="flex items-center justify-center gap-2 w-full md:w-auto flex-grow">
        <div className="relative w-1/2 md:w-auto">
          <label className="text-xs text-dark-text-secondary absolute -top-2 left-2 bg-dark-card px-1 z-10">De</label>
          {/* O padding da direita (pr-8) foi removido no mobile e adicionado apenas para desktop (md:pr-8) */}
          <input type="date" name="startDate" value={startDate} onChange={handleDateChange} className="bg-dark-bg-secondary text-dark-text-primary rounded-md py-2 px-3 md:pr-8 w-full" />
          {/* AQUI: O ícone agora fica escondido ('hidden') e só aparece em ecrãs médios ou maiores ('md:block') */}
          <FiCalendar className="hidden md:block absolute right-3 top-1/2 -translate-y-1/2 text-dark-text-primary pointer-events-none" />
        </div>
        <div className="relative w-1/2 md:w-auto">
          <label className="text-xs text-dark-text-secondary absolute -top-2 left-2 bg-dark-card px-1 z-10">Até</label>
          <input type="date" name="endDate" value={endDate} onChange={handleDateChange} className="bg-dark-bg-secondary text-dark-text-primary rounded-md py-2 px-3 md:pr-8 w-full" />
          <FiCalendar className="hidden md:block absolute right-3 top-1/2 -translate-y-1/2 text-dark-text-primary pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default TransactionFilters;