import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FiUsers, FiEdit, FiTrash2, FiSend, FiSave, FiX } from 'react-icons/fi';

const LoadingSpinner = () => <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>;

const ManageEnvironment = () => {
  const { currentUser, userProfile, forceProfileReload } = useAuth();
  const [ambiente, setAmbiente] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [ambienteName, setAmbienteName] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [inviteError, setInviteError] = useState('');

  const fetchEnvironmentDetails = useCallback(async () => {
    if (!userProfile?.ambienteId) {
      setError("Você não está em um ambiente.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const token = await currentUser.getIdToken();
      const { data } = await axios.get(`/api/ambientes/${userProfile.ambienteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAmbiente(data.ambiente);
      setMembers(data.members);
      setAmbienteName(data.ambiente.name);
    } catch (err) {
      setError("Falha ao carregar os detalhes do ambiente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentUser, userProfile]);

  useEffect(() => {
    if (currentUser) {
      fetchEnvironmentDetails();
    }
  }, [currentUser, fetchEnvironmentDetails]);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const token = await currentUser.getIdToken();
      await axios.put(`/api/ambientes/${ambiente.id}`, 
        { name: ambienteName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await forceProfileReload();
    } catch (err) {
      alert("Falha ao atualizar o nome.");
      console.error(err);
    } finally {
      setEditLoading(false);
    }
  };
  
  const handleRemoveMember = async (memberIdToRemove) => {
    if (!window.confirm('Tem certeza que deseja remover este membro?')) return;
    try {
      const token = await currentUser.getIdToken();
      await axios.post(`/api/ambientes/${ambiente.id}/remove-member`, 
        { memberIdToRemove },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchEnvironmentDetails();
    } catch (err) {
      alert(err.response?.data || "Falha ao remover membro.");
      console.error(err);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteSuccess('');
    setInviteError('');
    try {
      const token = await currentUser.getIdToken();
      const response = await axios.post('/api/invites', 
        { recipientEmail: inviteEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInviteSuccess(response.data.message);
      setInviteEmail('');
    } catch (err) {
      setInviteError(err.response?.data || "Falha ao enviar convite.");
      console.error(err);
    } finally {
      setInviteLoading(false);
    }
  };
  
  const isOwner = ambiente && members[0]?.uid === currentUser.uid;

  if (loading) {
    return <div className="flex justify-center items-center h-full"><div className="loader"></div></div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-dark-text-primary">Gerenciar Ambiente</h1>
          <p className="text-dark-text-secondary mt-1">Edite o nome, convide e gerencie os membros do seu ambiente.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dark-card rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-dark-text-primary border-b border-dark-border pb-2 mb-4 flex items-center gap-2">
            <FiEdit /> Nome do Ambiente
          </h2>
          <form onSubmit={handleUpdateName} className="flex gap-2">
            <input
              type="text"
              value={ambienteName}
              onChange={(e) => setAmbienteName(e.target.value)}
              disabled={!isOwner || editLoading}
              className="bg-dark-bg-secondary text-dark-text-primary rounded w-full py-2 px-3 disabled:opacity-50"
            />
            {isOwner && (
              <button type="submit" disabled={editLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center disabled:opacity-50">
                {editLoading ? <LoadingSpinner /> : <FiSave />}
              </button>
            )}
          </form>
        </div>

        <div className="bg-dark-card rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-dark-text-primary border-b border-dark-border pb-2 mb-4 flex items-center gap-2">
            <FiSend /> Convidar Novo Membro
          </h2>
          <form onSubmit={handleInvite} className="flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="email@do.convidado"
              required
              className="bg-dark-bg-secondary text-dark-text-primary rounded w-full py-2 px-3"
            />
            <button type="submit" disabled={inviteLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center disabled:opacity-50">
              {inviteLoading ? <LoadingSpinner /> : 'Convidar'}
            </button>
          </form>
          {inviteSuccess && <p className="text-green-400 text-sm">{inviteSuccess}</p>}
          {inviteError && <p className="text-red-400 text-sm">{inviteError}</p>}
        </div>
      </div>
      
      <div className="bg-dark-card rounded-xl p-6">
          <h2 className="text-lg font-semibold text-dark-text-primary border-b border-dark-border pb-2 mb-4 flex items-center gap-2">
            <FiUsers /> Membros
          </h2>
          <ul className="space-y-3">
            {members.map((member, index) => (
              <li key={member.uid} className="flex justify-between items-center bg-dark-bg-secondary p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <img src={member.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${member.displayName}`} alt="avatar" className="w-10 h-10 rounded-full" />
                  <div>
                    <span className="text-dark-text-primary font-bold">{member.displayName}</span>
                    <span className="text-dark-text-secondary text-sm block">{member.email}</span>
                  </div>
                </div>
                
                {index === 0 && (
                  <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">Dono</span>
                )}

                {isOwner && index !== 0 && (
                  <button onClick={() => handleRemoveMember(member.uid)} className="text-red-500 hover:text-red-400 p-2 rounded-full hover:bg-red-500/10">
                    <FiTrash2 size={18} />
                  </button>
                )}
              </li>
            ))}
          </ul>
      </div>
    </div>
  );
};

export default ManageEnvironment;