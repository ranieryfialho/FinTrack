import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const incomeCategories = ['Salário', 'Freelance', 'Investimentos', 'Presente', 'Outras Receitas'];
const expenseCategories = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Compras', 'Educação', 'Outras Despesas'];

const EditTransactionModal = ({ transaction, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({ ...transaction });
    
    // 1. NOVOS ESTADOS para a categoria personalizada
    const [customCategory, setCustomCategory] = useState('');
    const [showCustomCategory, setShowCustomCategory] = useState(false);

    // Efeito para inicializar o estado da categoria personalizada
    useEffect(() => {
        const allCategories = [...incomeCategories, ...expenseCategories];
        // Se a categoria da transação não for uma das padrão, consideramos que é uma categoria personalizada.
        if (!allCategories.includes(transaction.category)) {
            setShowCustomCategory(true);
            setCustomCategory(transaction.category);
            // Definimos o valor do dropdown para "Outras" para que a lógica funcione corretamente
            setFormData(prev => ({
                ...prev,
                category: transaction.type === 'income' ? 'Outras Receitas' : 'Outras Despesas'
            }));
        }
    }, [transaction]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTypeChange = (e) => {
        const newType = e.target.value;
        const defaultCategory = newType === 'income' ? incomeCategories[0] : expenseCategories[0];
        setFormData(prev => ({
            ...prev,
            type: newType,
            category: defaultCategory
        }));
        // Esconde o campo personalizado ao trocar o tipo
        setShowCustomCategory(false);
        setCustomCategory('');
    };

    // 2. NOVA FUNÇÃO para lidar com a mudança de categoria
    const handleCategoryChange = (e) => {
        const selectedCategory = e.target.value;
        setFormData(prev => ({ ...prev, category: selectedCategory }));
        
        if (selectedCategory === 'Outras Receitas' || selectedCategory === 'Outras Despesas') {
            setShowCustomCategory(true);
        } else {
            setShowCustomCategory(false);
            setCustomCategory('');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // 3. LÓGICA ATUALIZADA para usar a categoria correta
        let finalCategory = formData.category;
        if (showCustomCategory && customCategory.trim() !== '') {
            finalCategory = customCategory.trim();
        }

        const updatedData = {
            ...formData,
            amount: parseFloat(formData.amount),
            category: finalCategory, // Usa a categoria final
        };
        onUpdate(updatedData);
    };

    const categoriesToShow = formData.type === 'income' ? incomeCategories : expenseCategories;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className="bg-dark-card rounded-lg shadow-xl p-6 w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-dark-text-secondary hover:text-dark-text-primary"><FiX size={24} /></button>
                <h2 className="text-2xl font-bold mb-6 text-dark-text-primary">Editar Transação</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-dark-text-secondary">Descrição</label>
                            <input type="text" name="description" value={formData.description} onChange={handleChange} required className="mt-1 block w-full bg-dark-bg-secondary border-dark-border rounded-md shadow-sm py-2 px-3" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-text-secondary">Valor (R$)</label>
                            <input type="number" name="amount" step="0.01" value={formData.amount} onChange={handleChange} required className="mt-1 block w-full bg-dark-bg-secondary border-dark-border rounded-md shadow-sm py-2 px-3" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-text-secondary">Tipo</label>
                            <select name="type" value={formData.type} onChange={handleTypeChange} className="mt-1 block w-full bg-dark-bg-secondary border-dark-border rounded-md shadow-sm py-2 px-3">
                                <option value="expense">Despesa</option>
                                <option value="income">Receita</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-text-secondary">Categoria</label>
                            <select name="category" value={formData.category} onChange={handleCategoryChange} required className="mt-1 block w-full bg-dark-bg-secondary border-dark-border rounded-md shadow-sm py-2 px-3">
                                {categoriesToShow.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>

                        {/* 4. CAMPO CONDICIONAL para a nova categoria */}
                        {showCustomCategory && (
                            <div>
                                <label className="block text-sm font-medium text-dark-text-secondary">Nome da Categoria Personalizada</label>
                                <input
                                    type="text"
                                    value={customCategory}
                                    onChange={(e) => setCustomCategory(e.target.value)}
                                    placeholder="Ex: Supermercado, Viagem"
                                    required
                                    className="mt-1 block w-full bg-dark-bg-secondary border-dark-border rounded-md shadow-sm py-2 px-3"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-dark-text-secondary">Data</label>
                            <input type="date" name="date" value={formData.date.split('T')[0]} onChange={handleChange} required className="mt-1 block w-full bg-dark-bg-secondary border-dark-border rounded-md shadow-sm py-2 px-3" />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-md text-dark-text-primary bg-dark-bg-secondary hover:bg-dark-border">Cancelar</button>
                        <button type="submit" className="py-2 px-4 rounded-md text-dark-bg-secondary bg-dark-text-primary hover:bg-opacity-90">Salvar Alterações</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTransactionModal;