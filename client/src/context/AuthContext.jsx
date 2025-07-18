import { createContext, useContext, useState, useEffect, useCallback } from "react"
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import axios from "axios"
import app, { storage } from "/firebaseConfig"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pendingInvites, setPendingInvites] = useState([])

  const auth = getAuth(app)

  const signup = (email, password) => createUserWithEmailAndPassword(auth, email, password)
  const login = (email, password) => signInWithEmailAndPassword(auth, email, password)
  const logout = () => {
    setUserProfile(null)
    setPendingInvites([])
    return signOut(auth)
  }

  const updateUserDisplayName = async (displayName) => {
    if (!currentUser) throw new Error("Utilizador não autenticado.")
    await updateProfile(currentUser, { displayName })
  }

  const updateUserPhoto = async (photoFile) => {
    if (!currentUser) throw new Error("Utilizador não autenticado.")
    
    try {
      console.log("Iniciando upload da foto para:", `avatars/${currentUser.uid}`)
      
      const storageRef = ref(storage, `avatars/${currentUser.uid}`)
      const snapshot = await uploadBytes(storageRef, photoFile)
      
      console.log("Upload concluído, obtendo URL...")
      const photoURL = await getDownloadURL(snapshot.ref)
      
      console.log("URL obtida:", photoURL)
      await updateProfile(currentUser, { photoURL })
      
      return photoURL
    } catch (error) {
      console.error("Erro detalhado no upload:", error)
      throw new Error(`Falha no upload da foto: ${error.message}`)
    }
  }

  const updateUserPassword = (currentPassword, newPassword) => {
    if (!currentUser) throw new Error("Utilizador não autenticado.")
    const credential = EmailAuthProvider.credential(currentUser.email, currentPassword)
    return reauthenticateWithCredential(currentUser, credential).then(() => {
      return updatePassword(currentUser, newPassword)
    })
  }

  const forceProfileReload = useCallback(
    async (user) => {
      if (!user) return;
      
      try {
        const token = await user.getIdToken(true)
        const response = await axios.get("/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setUserProfile(response.data)
        
        const invitesResponse = await axios.get("/api/invites/me", {
            headers: { Authorization: `Bearer ${token}` },
        });
        setPendingInvites(invitesResponse.data);

      } catch (error) {
        console.error("Falha ao recarregar perfil:", error)
        if (error.response?.status === 401) {
          await logout();
        }
      }
    },
    [],
  )

  const deleteUserAccount = async (password) => {
    if (!currentUser) throw new Error("Utilizador não autenticado.")

    try {
      const credential = EmailAuthProvider.credential(currentUser.email, password)
      await reauthenticateWithCredential(currentUser, credential)

      const token = await currentUser.getIdToken()
      await axios.delete("/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      })
      await logout()

      return { success: true, message: "Conta deletada com sucesso!" }
    } catch (error) {
      console.error("Erro ao deletar conta:", error)
      throw error
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      
      if (user) {
        await forceProfileReload(user)
      } else {
        setUserProfile(null)
        setPendingInvites([])
      }

      setLoading(false)
    })
    return unsubscribe
  }, [forceProfileReload])

  const value = {
    currentUser,
    userProfile,
    loading,
    pendingInvites,
    signup,
    login,
    logout,
    updateUserDisplayName,
    updateUserPhoto,
    updateUserPassword,
    deleteUserAccount,
    forceProfileReload,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}