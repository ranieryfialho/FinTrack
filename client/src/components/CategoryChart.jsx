import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';


const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(payload[0].value);

    return (
      <div className="bg-dark-card p-4 rounded-lg shadow-lg border border-dark-border">
        <p className="text-dark-text-primary font-bold">{label}</p>
        <p className="text-dark-text-primary">{`Total: ${formattedValue}`}</p>
      </div>
    );
  }

  return null;
};


const CategoryChart = ({ data }) => {
  const DataFormatter = (number) => {
    if (number > 1000) {
      return (number / 1000).toString() + 'k';
    } else {
      return number.toString();
    }
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <XAxis dataKey="name" tick={{ fill: '#878787' }} tickLine={false} axisLine={false} />
        <YAxis tickFormatter={DataFormatter} tick={{ fill: '#878787' }} tickLine={false} axisLine={false} />
        
        <Tooltip 
          cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
          content={<CustomTooltip />}
        />
        
        <Bar dataKey="total" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CategoryChart;