import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiLogIn, FiUserPlus, FiMail, FiLock, FiCode } from 'react-icons/fi';

const Auth = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup, login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLoginView) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      navigate('/');
    } catch (err) {
      setError('Falha na autenticação. Verifique suas credenciais.');
      console.error(err);
    }

    setLoading(false);
  };

  const activeClass = "bg-dark-text-primary text-dark-bg-secondary";
  const inactiveClass = "bg-transparent text-dark-text-primary";

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg-primary">
      <div className="bg-dark-card p-8 rounded-xl shadow-lg w-full max-w-md">

        <div className="flex justify-center bg-dark-bg-secondary rounded-lg p-1 mb-8">
          <button onClick={() => setIsLoginView(true)} className={`w-1/2 p-2 rounded-md font-bold flex items-center justify-center gap-2 transition-colors duration-300 ${isLoginView ? activeClass : inactiveClass}`}>
            <FiLogIn /> Entrar
          </button>
          <button onClick={() => setIsLoginView(false)} className={`w-1/2 p-2 rounded-md font-bold flex items-center justify-center gap-2 transition-colors duration-300 ${!isLoginView ? activeClass : inactiveClass}`}>
            <FiUserPlus /> Cadastrar
          </button>
        </div>

        <h2 className="text-2xl font-bold text-center text-dark-text-primary mb-2">
          {isLoginView ? 'Bem-vindo de volta!' : 'Crie sua conta'}
        </h2>
        <p className="text-center text-dark-text-secondary mb-8">
          {isLoginView ? 'Acesse sua conta para continuar.' : 'Preencha os dados para começar.'}
        </p>

        {error && <p className="bg-red-500 text-white text-center p-2 rounded mb-4">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-dark-text-secondary text-sm font-bold mb-2" htmlFor="email">
              E-mail
            </label>
            <div className="relative">
              <FiMail className="absolute top-1/2 left-3 -translate-y-1/2 text-dark-text-secondary" />
              <input
                className="bg-dark-bg-secondary text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-dark-border rounded w-full py-2 px-3 pl-10"
                id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-dark-text-secondary text-sm font-bold mb-2" htmlFor="password">
              Senha
            </label>
            <div className="relative">
              <FiLock className="absolute top-1/2 left-3 -translate-y-1/2 text-dark-text-secondary" />
              <input
                className="bg-dark-bg-secondary text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-dark-border rounded w-full py-2 px-3 pl-10"
                id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button disabled={loading} className="bg-dark-text-primary hover:bg-opacity-90 text-dark-bg-secondary font-bold py-2 px-4 rounded-lg focus:outline-none w-full disabled:bg-opacity-50 transition-colors duration-300" type="submit">
              {loading ? 'Aguarde...' : (isLoginView ? 'Entrar' : 'Criar Conta')}
            </button>
          </div>
        </form>

        <div className="text-center text-dark-text-secondary text-xs mt-8 flex items-center justify-center">
          <span>FinTrack © 2025</span>
          <span className="mx-2">|</span>
          <FiCode className="mr-2" />
          <span>Desenvolvido por</span>
          <a
            href="https://seulinkedin-ou-github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-blue-400 hover:underline ml-1"
          >
            Raniery Fialho
          </a>
        </div>
      </div>
    </div>
  );
};

export default Auth;