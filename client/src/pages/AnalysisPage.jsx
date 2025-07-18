import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import KPICard from '../components/KPICard';
import { FiTrendingDown, FiTrendingUp, FiDollarSign, FiCalendar } from 'react-icons/fi';
import IncomeExpenseBarChart from '../components/IncomeExpenseBarChart';
import CategoryPieChart from '../components/CategoryPieChart';
import CategoryChart from '../components/CategoryChart';
import TransactionFilters from '../components/TransactionFilters';

const getMonthDateRange = (date = new Date()) => {
    const referenceDate = new Date(date.toISOString().slice(0, 10) + 'T12:00:00.000Z');
    const firstDay = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
    const lastDay = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0);
    const formatDate = (d) => d.toISOString().split('T')[0];
    return { startDate: formatDate(firstDay), endDate: formatDate(lastDay) };
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560', '#775DD0'];

const AnalysisPage = () => {
  const { currentUser, userProfile, loading: authLoading } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    type: 'all',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (!currentUser || !userProfile?.ambienteId) return;

    const determineInitialDateRange = async () => {
      try {
        const token = await currentUser.getIdToken();
        const params = new URLSearchParams({ ambienteId: userProfile.ambienteId, pageSize: 1 });
        const { data } = await axios.get(`/api/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });

        if (data.transactions && data.transactions.length > 0) {
          const latestDate = new Date(data.transactions[0].date);
          setFilters({ type: 'all', ...getMonthDateRange(latestDate) });
        } else {
          setFilters({ type: 'all', ...getMonthDateRange() });
        }
      } catch (err) {
        console.error("Erro ao buscar data da última transação:", err);
        setFilters({ type: 'all', ...getMonthDateRange() });
      }
    };

    determineInitialDateRange();
  }, [currentUser, userProfile]);

  useEffect(() => {
    if (!filters.startDate || !currentUser || !userProfile?.ambienteId) {
      return;
    }

    const fetchTransactions = async () => {
      setLoading(true);
      setError('');
      try {
        const token = await currentUser.getIdToken();
        const params = new URLSearchParams({
          ambienteId: userProfile.ambienteId,
          ...filters
        });

        const response = await axios.get(`/api/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });
        setTransactions(response.data.transactions || []);
      } catch (err) {
        console.error("Erro ao buscar transações:", err);
        setError('Falha ao carregar as transações. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [filters, currentUser, userProfile]);

  const kpiData = useMemo(() => {
    const data = transactions.reduce((acc, t) => {
      if (t.type === 'income') {
        acc.totalIncome += t.amount;
      } else {
        acc.totalExpense += t.amount;
      }
      return acc;
    }, { totalIncome: 0, totalExpense: 0 });
    data.balance = data.totalIncome - data.totalExpense;
    return data;
  }, [transactions]);

  const categoryData = useMemo(() => {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const categories = expenseTransactions.reduce((acc, t) => {
      const category = t.category || 'Outras Despesas';
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += t.amount;
      return acc;
    }, {});

    return Object.entries(categories)
      .map(([name, value], index) => ({
        name,
        value,
        fill: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const categoryBarData = useMemo(() => {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const categories = expenseTransactions.reduce((acc, t) => {
      const category = t.category || 'Outras Despesas';
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += t.amount;
      return acc;
    }, {});

    return Object.entries(categories)
      .map(([name, total], index) => ({
        name,
        total,
        fill: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [transactions]);

  const dailyData = useMemo(() => {
    const dailyMap = {};
    if (!transactions || transactions.length === 0) return [];

    transactions.forEach(t => {
      const day = t.date;
      if (!dailyMap[day]) {
        dailyMap[day] = { date: day, income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        dailyMap[day].income += t.amount;
      } else {
        dailyMap[day].expense -= t.amount;
      }
    });

    const result = Object.values(dailyMap).sort((a, b) => new Date(a.date) - new Date(b.date));

    result.forEach(day => {
      day.balance = day.income + day.expense;
    });

    return result;
  }, [transactions]);

  if (authLoading || (loading && transactions.length === 0)) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-400 mt-10 p-4">{error}</div>;
  }

  return (
    <div className="text-white p-4 md:p-8 space-y-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-dark-text-primary">Análise Detalhada</h1>
      </header>

      <div className="bg-dark-card p-6 rounded-lg">
        <TransactionFilters filters={filters} setFilters={setFilters} />
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard title="Receita Total" value={kpiData.totalIncome} colorClass="text-green-400" />
        <KPICard title="Despesa Total" value={kpiData.totalExpense} colorClass="text-red-400" />
        <KPICard title="Balanço Final" value={kpiData.balance} colorClass={kpiData.balance >= 0 ? "text-dark-text-primary" : "text-red-400"} />
      </section>

      {transactions.length > 0 ? (
        <>
          <section className="bg-dark-card p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-dark-text-primary mb-4">Fluxo de Caixa Diário</h2>
            <div style={{ height: '400px' }}>
              <IncomeExpenseBarChart data={dailyData} />
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 bg-dark-card p-6 rounded-xl">
              <h2 className="text-xl font-semibold text-dark-text-primary mb-4">Gastos por Categoria</h2>
              <div style={{ height: '400px' }}>
                <CategoryChart data={categoryBarData} />
              </div>
            </div>
            <div className="lg:col-span-2 bg-dark-card p-6 rounded-xl">
              <h2 className="text-xl font-semibold text-dark-text-primary mb-4">Distribuição de Despesas</h2>
              <CategoryPieChart data={categoryData} totalExpenses={kpiData.totalExpense} />
            </div>
          </section>
        </>
      ) : (
        <div className="text-center py-16 bg-dark-card rounded-xl">
          <FiCalendar className="mx-auto text-5xl text-dark-text-secondary mb-4" />
          <h3 className="text-xl font-semibold text-dark-text-primary">Nenhuma Transação Encontrada</h3>
          <p className="text-dark-text-secondary mt-2">Ajuste os filtros para visualizar a análise.</p>
        </div>
      )}
    </div>
  );
};

export default AnalysisPage;