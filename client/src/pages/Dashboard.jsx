import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiChevronLeft, FiChevronRight, FiEdit2, FiTrash2, FiPlus, FiUpload, FiLogOut } from 'react-icons/fi';
import EditTransactionModal from '../components/EditTransactionModal';
import KPICard from '../components/KPICard';
import AddTransactionModal from '../components/AddTransactionModal';
import CategoryChart from '../components/CategoryChart';
import TransactionFilters from '../components/TransactionFilters';
import ImportInvoiceModal from '../components/ImportInvoiceModal';
import axios from 'axios';

const getMonthDateRange = (date) => {
    const referenceDate = date instanceof Date && !isNaN(date) ? date : new Date();
    
    const firstDay = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
    const lastDay = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0);
    const formatDate = (d) => d.toISOString().split('T')[0];
    return { startDate: formatDate(firstDay), endDate: formatDate(lastDay) };
};

const CATEGORY_STYLES = [
  { hex: '#8884d8', tw: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { hex: '#82ca9d', tw: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { hex: '#ffc658', tw: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { hex: '#ff8042', tw: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { hex: '#0088FE', tw: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { hex: '#00C49F', tw: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
  { hex: '#FF4560', tw: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { hex: '#775DD0', tw: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
];

const TransactionsTable = ({ transactions, onEdit, onDelete, onSort, sortConfig, getCategoryStyle }) => {
    const getSortIndicator = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? '▲' : '▼';
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-dark-text-secondary">
                <thead className="border-b border-dark-border">
                    <tr>
                        <th scope="col" className="px-6 py-4 cursor-pointer" onClick={() => onSort('description')}>Descrição <span className="ml-1">{getSortIndicator('description')}</span></th>
                        <th scope="col" className="px-6 py-4 cursor-pointer" onClick={() => onSort('amount')}>Valor <span className="ml-1">{getSortIndicator('amount')}</span></th>
                        <th scope="col" className="px-6 py-4 cursor-pointer" onClick={() => onSort('category')}>Categoria <span className="ml-1">{getSortIndicator('category')}</span></th>
                        <th scope="col" className="px-6 py-4 cursor-pointer" onClick={() => onSort('date')}>Data <span className="ml-1">{getSortIndicator('date')}</span></th>
                        <th scope="col" className="px-6 py-4 cursor-pointer" onClick={() => onSort('addedByName')}>Adicionado Por <span className="ml-1">{getSortIndicator('addedByName')}</span></th>
                        <th scope="col" className="px-6 py-4">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((t) => (
                        <tr key={t.id} className="border-b border-dark-border hover:bg-dark-bg-secondary">
                            <td className="px-6 py-4 font-medium text-dark-text-primary">{t.description}</td>
                            <td className={`px-6 py-4 font-semibold ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                {t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-md text-xs border ${getCategoryStyle(t.category)?.tw || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                                    {t.category || 'Sem Categoria'}
                                </span>
                            </td>
                            <td className="px-6 py-4">{new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                            <td className="px-6 py-4">{t.addedByName || 'Desconhecido'}</td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => onEdit(t)} className="text-blue-400 hover:text-blue-300"><FiEdit2 size={16} /></button>
                                    <button onClick={() => onDelete(t.id)} className="text-red-400 hover:text-red-300"><FiTrash2 size={16} /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const Dashboard = () => {
    const { currentUser, userProfile, loading: authLoading, logout } = useAuth();
    const navigate = useNavigate();
    
    const [transactions, setTransactions] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const [filters, setFilters] = useState({ type: 'all', startDate: '', endDate: '' });

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'descending' });

    useEffect(() => {
        const initializeFiltersAndFetch = async () => {
            if (!currentUser || !userProfile?.ambienteId) return;

            setDataLoading(true);
            try {
                const token = await currentUser.getIdToken();
                const params = new URLSearchParams({ ambienteId: userProfile.ambienteId, pageSize: 1 });
                const { data } = await axios.get(`/api/transactions`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params
                });

                let initialFilters;
                if (data.transactions && data.transactions.length > 0) {
                    const latestDate = new Date(data.transactions[0].date);
                    initialFilters = { type: 'all', ...getMonthDateRange(latestDate) };
                } else {
                    initialFilters = { type: 'all', ...getMonthDateRange() };
                }
                setFilters(initialFilters);

            } catch (err) {
                setError("Falha ao definir período inicial.");
                setFilters({ type: 'all', ...getMonthDateRange() });
            }
        };

        initializeFiltersAndFetch();
    }, [currentUser, userProfile]);

    useEffect(() => {
        if (!filters.startDate || !currentUser || !userProfile?.ambienteId) return;

        const fetchTransactions = async () => {
            setDataLoading(true);
            setError('');
            try {
                const token = await currentUser.getIdToken();
                const params = new URLSearchParams({ 
                    ambienteId: userProfile.ambienteId,
                    ...filters 
                });

                const { data } = await axios.get(`/api/transactions`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params
                });
                setTransactions(data.transactions || []);
                setCurrentPage(1);
            } catch (err) {
                setError("Falha ao carregar transações.");
            } finally {
                setDataLoading(false);
            }
        };

        fetchTransactions();
    }, [filters, currentUser, userProfile]);

    const forceDataRefetch = () => setFilters(currentFilters => ({...currentFilters}));

    const handleUpdate = async (updatedTransaction) => {
        try {
            const token = await currentUser.getIdToken();
            await axios.put(`/api/transactions/${updatedTransaction.id}`, updatedTransaction, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setEditingTransaction(null);
            forceDataRefetch();
        } catch (err) {
            setError("Falha ao atualizar transação.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza?')) {
            try {
                const token = await currentUser.getIdToken();
                await axios.delete(`/api/transactions/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                forceDataRefetch();
            } catch (err) {
                setError("Falha ao deletar transação.");
            }
        }
    };

    const handleSort = (key) => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'ascending' ? 'descending' : 'ascending'
        }));
    };

    const handleLogout = async () => {
        try {
          await logout();
          navigate('/auth');
        } catch (error) {
          console.error("Falha ao fazer logout", error);
        }
    };

    const sortedTransactions = useMemo(() => {
        let sortableItems = [...transactions];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [transactions, sortConfig]);

    const paginatedTransactions = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return sortedTransactions.slice(startIndex, startIndex + pageSize);
    }, [currentPage, pageSize, sortedTransactions]);

    const { totalIncome, totalExpense, balance } = useMemo(() => {
        return transactions.reduce((acc, t) => {
            if (t.type === 'income') acc.totalIncome += t.amount;
            else acc.totalExpense += t.amount;
            acc.balance = acc.totalIncome - acc.totalExpense;
            return acc;
        }, { totalIncome: 0, totalExpense: 0, balance: 0 });
    }, [transactions]);

    const { incomeChartData, expenseChartData, getCategoryStyle } = useMemo(() => {
        const categoryMap = new Map();
        transactions.forEach(t => {
            const category = t.category || 'Sem Categoria';
            if (!categoryMap.has(category)) {
                categoryMap.set(category, {
                    style: CATEGORY_STYLES[categoryMap.size % CATEGORY_STYLES.length],
                    income: 0,
                    expense: 0,
                });
            }
            const data = categoryMap.get(category);
            if (t.type === 'income') data.income += t.amount;
            else data.expense += t.amount;
        });

        const incomeData = [], expenseData = [];
        for (const [name, data] of categoryMap.entries()) {
            if (data.income > 0) incomeData.push({ name, total: data.income, fill: data.style.hex });
            if (data.expense > 0) expenseData.push({ name, total: data.expense, fill: data.style.hex });
        }

        return {
            incomeChartData: incomeData.sort((a, b) => b.total - a.total),
            expenseChartData: expenseData.sort((a, b) => b.total - a.total),
            getCategoryStyle: (categoryName) => categoryMap.get(categoryName || 'Sem Categoria')?.style,
        };
    }, [transactions]);

    const totalPages = Math.ceil(sortedTransactions.length / pageSize) || 1;

    if (authLoading) {
        return <div className="flex items-center justify-center h-screen"><div className="loader"></div></div>;
    }

    return (
        <div className="p-4 md:p-8 space-y-6">
            <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-dark-text-primary">Visão Geral</h1>
                    <p className="text-dark-text-secondary mt-1">Bem-vindo(a) de volta, {currentUser?.displayName || currentUser?.email}! 👋</p>
                </div>
                <button 
                    onClick={handleLogout} 
                    className="hidden md:flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    <FiLogOut />
                    Sair
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <KPICard title="Receitas no período" value={totalIncome} colorClass="text-green-400" />
                <KPICard title="Despesas no período" value={totalExpense} colorClass="text-red-400" />
                <KPICard title="Balanço" value={balance} colorClass={balance >= 0 ? "text-dark-text-primary" : "text-red-400"} />
            </div>
            
            <div className="bg-dark-card p-6 rounded-lg">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <TransactionFilters filters={filters} setFilters={setFilters} />
                    <div className="flex items-center gap-4 w-full md:w-auto pt-4 md:pt-0">
                         <button onClick={() => setIsImportModalOpen(true)} className="w-full md:w-auto bg-dark-bg-secondary hover:bg-dark-border text-dark-text-primary font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                            <FiUpload />
                            Importar
                        </button>
                        <button onClick={() => setIsAddModalOpen(true)} className="w-full md:w-auto bg-dark-text-primary hover:bg-opacity-90 text-dark-bg-secondary font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                            <FiPlus />
                            Adicionar
                        </button>
                    </div>
                </div>
            </div>

            {dataLoading ? (
                 <div className="flex items-center justify-center h-64"><div className="loader"></div></div>
            ) : (
                <div>
                    <div className="bg-dark-card p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4 text-dark-text-primary">Histórico de Transações</h2>
                        {error && <p className="text-red-400 text-center">{error}</p>}
                        
                        {transactions.length > 0 ? (
                            <>
                                <TransactionsTable
                                    transactions={paginatedTransactions}
                                    onEdit={setEditingTransaction}
                                    onDelete={handleDelete}
                                    onSort={handleSort}
                                    sortConfig={sortConfig}
                                    getCategoryStyle={getCategoryStyle}
                                />
                                <div className="flex justify-between items-center mt-4 text-dark-text-primary">
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                                        disabled={currentPage === 1} 
                                        className="px-3 py-1 rounded bg-dark-bg-secondary disabled:opacity-50 flex items-center hover:bg-dark-border"
                                    >
                                        <FiChevronLeft className="mr-1" /> Anterior
                                    </button>
                                    <span>Página {currentPage} de {totalPages}</span>
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                                        disabled={currentPage === totalPages} 
                                        className="px-3 py-1 rounded bg-dark-bg-secondary disabled:opacity-50 flex items-center hover:bg-dark-border"
                                    >
                                        Próxima <FiChevronRight className="ml-1" />
                                    </button>
                                </div>
                            </>
                        ) : <p className="text-dark-text-secondary text-center py-8">Nenhuma transação encontrada para os filtros selecionados.</p>}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-dark-card p-6 rounded-lg flex flex-col min-h-[400px]">
                    <h2 className="text-xl font-semibold mb-4 text-dark-text-primary">Despesas por Categoria</h2>
                    <div className="flex-1">
                        {expenseChartData.length > 0 ? (
                            <CategoryChart data={expenseChartData} />
                        ) : (
                            <div className="text-dark-text-secondary text-center h-full flex items-center justify-center">
                                <p>Nenhuma despesa registrada no período selecionado.</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="bg-dark-card p-6 rounded-lg flex flex-col min-h-[400px]">
                    <h2 className="text-xl font-semibold mb-4 text-dark-text-primary">Receitas por Categoria</h2>
                    <div className="flex-1">
                        {incomeChartData.length > 0 ? (
                            <CategoryChart data={incomeChartData} />
                        ) : (
                            <div className="text-dark-text-secondary text-center h-full flex items-center justify-center">
                                <p>Nenhuma receita registrada no período selecionado.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {editingTransaction && (
                <EditTransactionModal transaction={editingTransaction} onClose={() => setEditingTransaction(null)} onUpdate={handleUpdate} />
            )}
            {isAddModalOpen && (
                <AddTransactionModal 
                    onClose={() => setIsAddModalOpen(false)} 
                    onTransactionAdded={() => {
                        setIsAddModalOpen(false);
                        forceDataRefetch();
                    }} 
                />
            )}
            {isImportModalOpen && (
                <ImportInvoiceModal
                    onClose={() => setIsImportModalOpen(false)}
                    onImportComplete={() => {
                        setIsImportModalOpen(false);
                        forceDataRefetch();
                    }}
                />
            )}
        </div>
    );
};

export default Dashboard;