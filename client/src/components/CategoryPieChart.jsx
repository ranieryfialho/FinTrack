import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const CustomTooltip = ({ active, payload, totalExpenses }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0];
    const { name, value } = dataPoint;

    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

    const percentage = totalExpenses > 0 ? ((value / totalExpenses) * 100).toFixed(2) : '0.00';

    return (
      <div className="bg-dark-card p-4 rounded-lg shadow-lg border border-dark-border text-sm">
        <p className="font-bold text-dark-text-primary mb-1">{name}</p>
        <p className="text-dark-text-primary">{`${formattedValue} (${percentage}%)`}</p>
      </div>
    );
  }
  return null;
};

const renderLegend = (props) => {
  const { payload } = props;
  return (
    <ul className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
      {
        payload.map((entry, index) => (
          <li key={`item-${index}`} className="flex items-center text-sm text-dark-text-secondary">
            <span className="w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
            <span>{entry.value}</span>
          </li>
        ))
      }
    </ul>
  );
}

const CategoryPieChart = ({ data, totalExpenses }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Tooltip content={<CustomTooltip totalExpenses={totalExpenses} />} />
        
        <Legend
          content={renderLegend}
          layout="vertical"
          verticalAlign="middle"
          align="right"
          iconType="circle"
        />

        <Pie
          data={data}
          cx="40%"
          cy="50%"
          innerRadius="60%"
          outerRadius="80%"
          paddingAngle={5}
          dataKey="value"
          nameKey="name"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategoryPieChart;