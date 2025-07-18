import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Bar,
  Line,
  ReferenceLine,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const formattedDate = new Date(label + 'T00:00:00-03:00').toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: '2-digit' });

    const incomeData = payload.find(p => p.dataKey === 'income');
    const expenseData = payload.find(p => p.dataKey === 'expense');
    const balanceData = payload.find(p => p.dataKey === 'balance');

    return (
      <div className="bg-dark-card p-4 rounded-lg shadow-lg border border-dark-border text-sm">
        <p className="font-bold text-dark-text-primary mb-2">{`Dia: ${formattedDate}`}</p>
        {incomeData && incomeData.value !== 0 && (
          <p style={{ color: incomeData.fill }}>
            {`Receitas: ${incomeData.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
          </p>
        )}
        {expenseData && expenseData.value !== 0 && (
          <p style={{ color: expenseData.fill }}>
            {`Despesas: ${Math.abs(expenseData.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
          </p>
        )}
        {balanceData && (
          <p style={{ color: balanceData.stroke, fontWeight: 'bold', marginTop: '4px' }}>
            {`Balanço: ${balanceData.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
          </p>
        )}
      </div>
    );
  }
  return null;
};

const IncomeExpenseBarChart = ({ data }) => {
  const formatYAxis = (tickItem) => {
    const value = Math.abs(tickItem);
    if (value >= 1000) {
      return `R$${(tickItem / 1000).toFixed(0)}k`;
    }
    return `R$${tickItem}`;
  };

  const formatDateLabel = (dateStr) => {
    return dateStr.substring(8, 10);
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={data}
        margin={{
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        }}
      >
        <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
        <XAxis dataKey="date" tickFormatter={formatDateLabel} tick={{ fill: '#9CA3AF' }} />
        <YAxis tickFormatter={formatYAxis} tick={{ fill: '#9CA3AF' }} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(107, 114, 128, 0.1)' }} />
        <Legend wrapperStyle={{ color: '#F9FAFB' }} />
        <ReferenceLine y={0} stroke="#4B5563" />
        <Bar dataKey="income" name="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" name="Despesas" fill="#ef4444" radius={[0, 0, 4, 4]} />
        <Line type="monotone" dataKey="balance" name="Balanço" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default IncomeExpenseBarChart;