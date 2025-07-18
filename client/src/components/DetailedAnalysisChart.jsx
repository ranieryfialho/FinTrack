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
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    const formattedDate = new Date(label + 'T00:00:00-03:00').toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: '2-digit' });

    return (
      <div className="bg-dark-card p-4 rounded-lg shadow-lg border border-dark-border text-sm">
        <p className="font-bold text-dark-text-primary mb-2">{`Dia: ${formattedDate}`}</p>
        <p style={{ color: '#82ca9d' }}>{`Receitas: ${payload[0].value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}</p>
        <p style={{ color: '#ff8042' }}>{`Despesas: ${payload[1].value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}</p>
        <p style={{ color: '#8884d8' }}>{`Balanço: ${payload[2].value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}</p>
      </div>
    );
  }
  return null;
};

const DetailedAnalysisChart = ({ data }) => {
  const formatYAxis = (tickItem) => {
    if (tickItem >= 1000 || tickItem <= -1000) {
      return `R$${(tickItem / 1000).toFixed(0)}k`;
    }
    return `R$${tickItem}`;
  };

  const formatDateLabel = (dateStr) => {
    return dateStr.substring(8, 10);
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
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
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ color: '#F9FAFB' }} />
        <Line type="monotone" dataKey="income" name="Receitas" stroke="#82ca9d" strokeWidth={2} />
        <Line type="monotone" dataKey="expense" name="Despesas" stroke="#ff8042" strokeWidth={2} />
        <Bar dataKey="balance" name="Balanço Diário" fill="#8884d8" />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default DetailedAnalysisChart;