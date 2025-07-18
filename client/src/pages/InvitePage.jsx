import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import axios from "axios"

const InvitePage = ({ onInviteAccepted }) => {
  const { currentUser, userProfile } = useAuth()
  const [invites, setInvites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedInvite, setSelectedInvite] = useState(null)
  const [invitePreview, setInvitePreview] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  useEffect(() => {
    const fetchInvites = async () => {
      if (!currentUser) return
      try {
        setLoading(true)
        const token = await currentUser.getIdToken()
        const response = await axios.get("/api/invites/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setInvites(response.data)
      } catch (err) {
        setError("Não foi possível buscar seus convites.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchInvites()
  }, [currentUser])

  const handlePreviewInvite = async (inviteId) => {
    try {
      setPreviewLoading(true)
      const token = await currentUser.getIdToken()
      const response = await axios.get(`/api/invites/${inviteId}/preview`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setInvitePreview(response.data)
      setSelectedInvite(inviteId)
    } catch (err) {
      setError("Não foi possível pré-visualizar o convite.")
      console.error(err)
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleAcceptInvite = async (inviteId) => {
    try {
      const token = await currentUser.getIdToken()
      await axios.post(`/api/invites/${inviteId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (onInviteAccepted) {
        onInviteAccepted()
      }
    } catch (err) {
      setError("Ocorreu um erro ao aceitar o convite.")
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-dark-bg-primary">
        <div className="loader"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg-primary text-white p-4 flex justify-center items-center">
      <div className="w-full max-w-lg bg-dark-card p-8 rounded-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Convites Pendentes</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {invites.length > 0 ? (
          <div className="space-y-4">
            {invites.map((invite) => (
              <div key={invite.id} className="bg-dark-bg-secondary p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-dark-text-primary">
                      {invite.senderName} convidou você para o ambiente:
                    </p>
                    <p className="text-lg font-bold text-blue-400">{invite.ambienteName}</p>
                  </div>
                  <button
                    onClick={() => handlePreviewInvite(invite.id)}
                    disabled={previewLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
                  >
                    {previewLoading && selectedInvite === invite.id ? "Aguarde..." : "Analisar"}
                  </button>
                </div>

                {selectedInvite === invite.id && invitePreview && (
                  <div className="mt-4 border-t border-dark-border pt-4">
                    <div className="bg-dark-bg-primary p-4 rounded-lg">
                      <h3 className="text-lg font-bold mb-2">Detalhes do Convite</h3>
                      <div className="text-left space-y-2 mb-4">
                        <p>
                          <span className="font-semibold">De:</span> {invitePreview.invite.senderName}
                        </p>
                        <p>
                          <span className="font-semibold">Para o Ambiente:</span>{" "}
                          <span className="font-bold text-blue-400">{invitePreview.invite.ambienteName}</span>
                        </p>
                        {invitePreview.willLeaveCurrentEnvironment && (
                          <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-300 p-3 rounded-lg text-sm">
                            <p className="font-bold">Atenção!</p>
                            <p>
                              Ao aceitar, você sairá do seu ambiente atual (
                              <span className="font-semibold">{invitePreview.currentEnvironment.name}</span>
                              ) para entrar no novo.
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedInvite(null)
                            setInvitePreview(null)
                          }}
                          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => {
                            setSelectedInvite(null)
                            setInvitePreview(null)
                            handleAcceptInvite(invite.id)
                          }}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
                        >
                          Confirmar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-dark-text-secondary">
            Você não tem nenhum convite pendente no momento. Você pode criar seu próprio ambiente de finanças.
          </p>
        )}
      </div>
    </div>
  )
}

export default InvitePage