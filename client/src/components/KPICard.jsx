import React from 'react';

const KPICard = ({ title, value, colorClass = 'text-dark-text-primary' }) => {
  
  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

  return (
    <div className="p-6 bg-dark-bg-secondary rounded-lg">
      <p className="text-sm text-dark-text-secondary mb-2">{title}</p>
      <h3 className={`text-3xl font-bold ${colorClass}`}>
        {formattedValue}
      </h3>
    </div>
  );
};

export default KPICard;