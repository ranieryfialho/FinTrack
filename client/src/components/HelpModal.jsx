import React from 'react';

const HelpModal = ({ onClose }) => {
  return (
    // Fundo semi-transparente que cobre a tela
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" 
      onClick={onClose}
    >
      {/* Card do modal */}
      <div 
        className="bg-dark-card text-dark-text-primary p-8 rounded-lg shadow-xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">Sobre o FinTrack</h2>
        <div className="text-dark-text-secondary space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <p>
            O FinTrack é o seu assistente pessoal de finanças, projetado para te ajudar a ter uma visão clara e objetiva de para onde seu dinheiro está indo.
          </p>
          <p>
            Com ele, você pode:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Registrar todas as suas receitas e despesas de forma categorizada.</li>
            <li>Visualizar resumos mensais e o balanço das suas contas.</li>
            <li>Analisar seus gastos com gráficos interativos.</li>
            <li>Editar ou excluir transações a qualquer momento.</li>
            <li>Compartilhar um ambiente financeiro com outras pessoas (como sua família).</li>
          </ul>
          <p>
            Mantenha o controle, alcance suas metas e construa um futuro financeiro mais sólido!
          </p>
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-dark-text-primary text-dark-bg-secondary font-bold py-2 px-4 rounded-lg hover:bg-opacity-90"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;