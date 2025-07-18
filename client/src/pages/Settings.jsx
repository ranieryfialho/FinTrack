import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { FiUser, FiX } from "react-icons/fi"

const DeleteAccountModal = ({ isOpen, onClose, onDelete }) => {
  const [password, setPassword] = useState("")
  const [confirmText, setConfirmText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const CONFIRMATION_PHRASE = "deletar minha conta"

  const handleDelete = async () => {
    setLoading(true)
    setError("")
    try {
      await onDelete(password)
    } catch (err) {
      console.error(err)
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("Senha incorreta. Por favor, tente novamente.")
      } else {
        setError(err.response?.data || "Ocorreu um erro ao deletar a conta.")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isOpen) {
      setPassword("")
      setConfirmText("")
      setError("")
      setLoading(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-dark-card rounded-xl p-8 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-red-500">Deletar Conta</h2>
          <button onClick={onClose} className="text-dark-text-secondary hover:text-white">
            <FiX size={24} />
          </button>
        </div>
        <p className="text-dark-text-secondary text-sm mb-4">
          Esta ação é irreversível. Todas as suas transações e dados serão permanentemente removidos.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-dark-text-secondary text-sm font-bold mb-2">Digite sua senha para confirmar</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-dark-bg-secondary text-dark-text-primary rounded w-full py-2 px-3"
            />
          </div>
          <div>
            <label className="block text-dark-text-secondary text-sm font-bold mb-2">
              Para confirmar, digite: <span className="font-mono text-red-400">{CONFIRMATION_PHRASE}</span>
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              required
              className="bg-dark-bg-secondary text-dark-text-primary rounded w-full py-2 px-3"
            />
          </div>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
        <button
          onClick={handleDelete}
          disabled={loading || confirmText !== CONFIRMATION_PHRASE || !password}
          className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Deletando..." : "Eu entendo, deletar minha conta"}
        </button>
      </div>
    </div>
  )
}

const Settings = () => {
  const {
    currentUser,
    userProfile,
    updateUserDisplayName,
    updateUserPhoto,
    updateUserPassword,
    deleteUserAccount,
    forceProfileReload,
  } = useAuth()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState("")
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState("")
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileMessage, setProfileMessage] = useState("")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState("")

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || "")
      setPhotoPreview(userProfile.photoURL || "")
    }
  }, [userProfile])

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileMessage("")

    try {
      let photoURL = userProfile.photoURL

      // Primeiro, fazer upload da foto se houver uma nova
      if (photo) {
        console.log("Fazendo upload da nova foto...")
        photoURL = await updateUserPhoto(photo)
        console.log("Upload concluído, URL:", photoURL)
      }

      // Depois, atualizar o perfil no backend
      const token = await currentUser.getIdToken()
      
      const updateData = {}
      if (displayName !== userProfile.displayName) {
        updateData.displayName = displayName
      }
      if (photoURL !== userProfile.photoURL) {
        updateData.photoURL = photoURL
      }

      if (Object.keys(updateData).length > 0) {
        await axios.put(
          "/api/user/profile",
          updateData,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }

      setProfileMessage("Perfil atualizado com sucesso!")
      await forceProfileReload(currentUser)
      setPhoto(null)
      
      // Atualizar o preview com a nova URL
      if (photoURL) {
        setPhotoPreview(photoURL)
      }
      
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
      setProfileMessage("Falha ao atualizar o perfil. Verifique sua conexão e tente novamente.")
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setPasswordMessage("As novas senhas não coincidem.")
      return
    }
    setPasswordLoading(true)
    setPasswordMessage("")
    try {
      await updateUserPassword(currentPassword, newPassword)
      setPasswordMessage("Senha alterada com sucesso!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      setPasswordMessage("Falha ao alterar a senha. Verifique sua senha atual.")
      console.error(error)
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleDeleteAccount = async (password) => {
    try {
      await deleteUserAccount(password)
      setIsDeleteModalOpen(false)
      navigate("/auth")
    } catch (err) {
      console.error("Catch no componente Settings:", err)
      throw err
    }
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validações do arquivo
      const maxSize = 5 * 1024 * 1024 // 5MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      
      if (file.size > maxSize) {
        setProfileMessage("A imagem deve ter no máximo 5MB.")
        return
      }
      
      if (!allowedTypes.includes(file.type)) {
        setProfileMessage("Por favor, selecione uma imagem válida (JPEG, PNG, GIF ou WebP).")
        return
      }

      setPhoto(file)
      setPhotoPreview(URL.createObjectURL(file))
      setProfileMessage("") // Limpar mensagens de erro
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-dark-text-primary">Configurações</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 bg-dark-card rounded-xl p-8">
          <h2 className="text-lg font-semibold text-dark-text-primary border-b border-dark-border pb-2 mb-4">Perfil</h2>
          <form onSubmit={handleProfileSubmit}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-dark-bg-secondary flex items-center justify-center overflow-hidden">
                {photoPreview ? (
                  <img src={photoPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <FiUser size={32} className="text-dark-text-secondary" />
                )}
              </div>
              <div>
                <input 
                  type="file" 
                  id="photo" 
                  onChange={handlePhotoChange} 
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden" 
                />
                <label htmlFor="photo" className="cursor-pointer bg-dark-bg-secondary text-dark-text-primary font-bold py-2 px-4 rounded-lg hover:bg-dark-border transition-colors">
                  Alterar Foto
                </label>
                <p className="text-xs text-dark-text-secondary mt-1">JPEG, PNG, GIF ou WebP (máx. 5MB)</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-dark-text-secondary text-sm font-bold mb-2">Nome de Exibição</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-dark-bg-secondary text-dark-text-primary rounded w-full py-2 px-3"
                />
              </div>
              <div>
                <label className="block text-dark-text-secondary text-sm font-bold mb-2">Email</label>
                <input
                  type="email"
                  value={currentUser?.email || ""}
                  disabled
                  className="bg-dark-bg-secondary text-dark-text-secondary rounded w-full py-2 px-3 opacity-50 cursor-not-allowed"
                />
              </div>
            </div>

            {profileMessage && (
              <p className={`text-sm mt-4 ${profileMessage.includes('sucesso') ? 'text-green-400' : 'text-red-400'}`}>
                {profileMessage}
              </p>
            )}
            <button
              type="submit"
              disabled={profileLoading}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 transition-colors"
            >
              {profileLoading ? "Salvando..." : "Salvar Alterações"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-dark-card rounded-xl p-8">
            <h2 className="text-lg font-semibold text-dark-text-primary border-b border-dark-border pb-2 mb-4">Alterar Senha</h2>
            <form onSubmit={handlePasswordSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-dark-text-secondary text-sm font-bold mb-2">Senha Atual</label>
                  <input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="bg-dark-bg-secondary text-dark-text-primary rounded w-full py-2 px-3"
                  />
                </div>
                <div>
                  <label className="block text-dark-text-secondary text-sm font-bold mb-2">Nova Senha</label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="bg-dark-bg-secondary text-dark-text-primary rounded w-full py-2 px-3"
                  />
                </div>
                <div>
                  <label className="block text-dark-text-secondary text-sm font-bold mb-2">Confirmar Nova Senha</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-dark-bg-secondary text-dark-text-primary rounded w-full py-2 px-3"
                  />
                </div>
              </div>
              {passwordMessage && (
                <p className={`text-sm mt-4 ${passwordMessage.includes('sucesso') ? 'text-green-400' : 'text-red-400'}`}>
                  {passwordMessage}
                </p>
              )}
              <button
                type="submit"
                disabled={passwordLoading}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 transition-colors"
              >
                {passwordLoading ? "Alterando..." : "Alterar Senha"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-dark-card rounded-xl p-8 border border-red-500/30">
            <h2 className="text-lg font-semibold text-red-500 border-b border-dark-border pb-2 mb-4">Zona de Perigo</h2>
            <p className="text-dark-text-secondary text-sm mb-4">
              Ações irreversíveis. Tenha certeza absoluta antes de prosseguir.
            </p>
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Deletar minha conta
            </button>
          </div>
        </div>
      </div>

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDeleteAccount}
      />
    </div>
  )
}

export default Settings;