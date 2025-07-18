require("dotenv").config()
const express = require("express")
const cors = require("cors")
const admin = require("firebase-admin")

const serviceAccount = require("./serviceAccountKey.json")
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})
const db = admin.firestore()

const verifyAuthToken = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Acesso não autorizado." })
  }
  const idToken = authHeader.split("Bearer ")[1]
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken)
    req.user = decodedToken
    next()
  } catch (error) {
    console.error("Erro na verificação do token:", error)
    return res.status(401).json({ error: "Token inválido." })
  }
}

const app = express()
const PORT = process.env.PORT || 5000
app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body)
  next()
})

app.get("/api/user/me", verifyAuthToken, async (req, res) => {
  try {
    const { uid, email, name, picture } = req.user
    const userRef = db.collection("users").doc(uid)
    let userDoc = await userRef.get()

    if (!userDoc.exists) {
      await userRef.set({
        displayName: name || "Novo Usuário",
        email: email,
        photoURL: picture || null,
        ambienteId: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      })
      userDoc = await userRef.get()
    }

    const userData = userDoc.data()
    if (picture && picture !== userData.photoURL) {
      await userRef.update({ photoURL: picture })
      userData.photoURL = picture
    }

    if (userData.ambienteId) {
      const ambienteDoc = await db.collection("ambientes").doc(userData.ambienteId).get()
      if (!ambienteDoc.exists) {
        await userRef.update({ ambienteId: null })
        userData.ambienteId = null
        return res.status(200).json({
          ...userData,
          uid,
          needsSetup: true,
        })
      }
      return res.status(200).json({
        ...userData,
        uid,
        needsSetup: false,
        ambiente: { id: ambienteDoc.id, ...ambienteDoc.data() },
      })
    } else {
      return res.status(200).json({
        ...userData,
        uid,
        needsSetup: true,
      })
    }
  } catch (error) {
    console.error("Erro ao buscar perfil do usuário:", error)
    res.status(500).json({ error: "Erro interno do servidor." })
  }
})

app.put("/api/user/profile", verifyAuthToken, async (req, res) => {
  try {
    const { uid } = req.user
    const { displayName, photoURL } = req.body

    const userRef = db.collection("users").doc(uid)
    const dataToUpdate = {}

    if (displayName) dataToUpdate.displayName = displayName
    if (photoURL) dataToUpdate.photoURL = photoURL

    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).send("Nenhum dado para atualizar foi fornecido.")
    }

    await userRef.update(dataToUpdate)
    res.status(200).send("Perfil atualizado com sucesso!")
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error)
    res.status(500).send("Erro interno do servidor.")
  }
})

app.post("/api/ambientes", verifyAuthToken, async (req, res) => {
  try {
    const { name } = req.body
    const { uid } = req.user

    console.log("Criando ambiente:", { name, uid })

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "O nome do ambiente é obrigatório." })
    }

    const userDoc = await db.collection("users").doc(uid).get()
    if (userDoc.exists && userDoc.data().ambienteId) {
      return res.status(400).json({ error: "Usuário já pertence a um ambiente." })
    }

    const ambienteRef = await db.collection("ambientes").add({
      name: name.trim(),
      ownerId: uid,
      members: [uid],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    console.log("Ambiente criado com ID:", ambienteRef.id)

    await db.collection("users").doc(uid).set(
      {
        ambienteId: ambienteRef.id,
        needsSetup: false,
      },
      { merge: true },
    )

    console.log("Usuário atualizado com ambienteId:", ambienteRef.id)

    res.status(201).json({
      id: ambienteRef.id,
      name: name.trim(),
      message: "Ambiente criado com sucesso!",
    })
  } catch (error) {
    console.error("Erro ao criar ambiente:", error)
    res.status(500).json({ error: "Erro interno do servidor." })
  }
})

// --- ROTA DE BUSCA DE TRANSAÇÕES ---
app.get("/api/transactions", verifyAuthToken, async (req, res) => {
  try {
    const { ambienteId, pageSize = 1000, type, startDate, endDate } = req.query
    if (!ambienteId) {
      return res.status(400).send("ID do Ambiente é obrigatório.")
    }

    let query = db.collection("transactions").where("ambienteId", "==", ambienteId)

    if (type && type !== "all") {
      query = query.where("type", "==", type)
    }
    if (startDate) {
      query = query.where("date", ">=", admin.firestore.Timestamp.fromDate(new Date(startDate + "T00:00:00.000Z")))
    }
    if (endDate) {
      query = query.where("date", "<=", admin.firestore.Timestamp.fromDate(new Date(endDate + "T23:59:59.999Z")))
    }

    const snapshot = await query.orderBy("date", "desc").limit(Number(pageSize)).get()

    const userIds = [...new Set(snapshot.docs.map((doc) => doc.data().addedBy).filter(Boolean))]

    const userMap = {}
    if (userIds.length > 0) {
      const userRefs = userIds.map((id) => db.collection("users").doc(id))
      const userDocs = await db.getAll(...userRefs)
      userDocs.forEach((doc) => {
        if (doc.exists) {
          userMap[doc.id] = doc.data().displayName || "Usuário Desconhecido"
        }
      })
    }

    const transactions = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        date: data.date.toDate().toISOString().split("T")[0],
        addedByName: userMap[data.addedBy] || "Usuário Desconhecido",
      }
    })

    return res.status(200).json({ transactions })
  } catch (error) {
    console.error("================ ERRO DETALHADO AO BUSCAR TRANSAÇÕES ================")
    console.error("Um erro ocorreu na rota GET /api/transactions.")
    console.error("Código do Erro:", error.code)
    console.error("Mensagem do Erro:", error.message)
    console.error("Stack Trace Completo:", error)
    console.error("===================================================================")
    res.status(500).json({ error: "Erro interno do servidor ao buscar transações." })
  }
})

app.delete("/api/transactions/:id", verifyAuthToken, async (req, res) => {
  try {
    const userId = req.user.uid
    const transactionId = req.params.id
    const docRef = db.collection("transactions").doc(transactionId)
    const doc = await docRef.get()
    if (!doc.exists) {
      return res.status(404).send("Transação não encontrada.")
    }

    const userDoc = await db.collection("users").doc(userId).get()
    if (doc.data().ambienteId !== userDoc.data().ambienteId) {
      return res.status(403).send("Acesso negado: você não pertence ao ambiente desta transação.")
    }

    await docRef.delete()
    res.status(200).send({ message: "Transação excluída com sucesso." })
  } catch (error) {
    console.error("Erro ao excluir transação:", error)
    res.status(500).send("Erro interno do servidor.")
  }
})

app.put("/api/transactions/:id", verifyAuthToken, async (req, res) => {
  try {
    const userId = req.user.uid
    const transactionId = req.params.id
    const updatedData = req.body
    const docRef = db.collection("transactions").doc(transactionId)
    const doc = await docRef.get()
    if (!doc.exists) {
      return res.status(404).send("Transação não encontrada.")
    }

    const userDoc = await db.collection("users").doc(userId).get()
    if (doc.data().ambienteId !== userDoc.data().ambienteId) {
      return res.status(403).send("Acesso negado: você não pertence ao ambiente desta transação.")
    }

    // Se a data for atualizada, converta para Timestamp
    if (updatedData.date && typeof updatedData.date === "string") {
      updatedData.date = admin.firestore.Timestamp.fromDate(new Date(updatedData.date + "T12:00:00.000Z"))
    }

    await docRef.update(updatedData)
    res.status(200).send({ id: transactionId, ...updatedData })
  } catch (error) {
    console.error("Erro ao atualizar transação:", error)
    res.status(500).send("Erro interno do servidor.")
  }
})

app.post("/api/invites", verifyAuthToken, async (req, res) => {
  try {
    const { recipientEmail } = req.body
    const senderId = req.user.uid

    if (!recipientEmail) {
      return res.status(400).send("O email do destinatário é obrigatório.")
    }

    const senderDoc = await db.collection("users").doc(senderId).get()
    const { ambienteId, displayName: senderName } = senderDoc.data()

    if (!ambienteId) {
      return res.status(400).send("Você precisa estar em um ambiente para convidar alguém.")
    }

    const ambienteDoc = await db.collection("ambientes").doc(ambienteId).get()
    if (!ambienteDoc.exists) {
      return res.status(404).send("Ambiente não encontrado.")
    }
    const ambienteName = ambienteDoc.data().name

    const inviteRef = await db.collection("invites").add({
      senderId,
      senderName,
      recipientEmail: recipientEmail.toLowerCase(),
      ambienteId,
      ambienteName,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    res.status(201).json({ id: inviteRef.id, message: "Convite enviado com sucesso!" })
  } catch (error) {
    console.error("Erro ao enviar convite:", error)
    res.status(500).send("Erro interno do servidor.")
  }
})

app.get("/api/invites/me", verifyAuthToken, async (req, res) => {
  try {
    const userEmail = req.user.email
    const snapshot = await db
      .collection("invites")
      .where("recipientEmail", "==", userEmail.toLowerCase())
      .where("status", "==", "pending")
      .get()

    if (snapshot.empty) {
      return res.status(200).json([])
    }

    const invites = []
    snapshot.forEach((doc) => invites.push({ id: doc.id, ...doc.data() }))
    res.status(200).json(invites)
  } catch (error) {
    console.error("Erro ao buscar convites:", error)
    res.status(500).send("Erro interno do servidor.")
  }
})

app.get("/api/invites/:inviteId/preview", verifyAuthToken, async (req, res) => {
  try {
    const userId = req.user.uid
    const userEmail = req.user.email
    const inviteId = req.params.inviteId

    const inviteRef = db.collection("invites").doc(inviteId)
    const inviteDoc = await inviteRef.get()

    if (!inviteDoc.exists || inviteDoc.data().recipientEmail.toLowerCase() !== userEmail.toLowerCase()) {
      return res.status(404).send("Convite não encontrado.")
    }

    const inviteData = inviteDoc.data()

    const userDoc = await db.collection("users").doc(userId).get()
    const currentAmbienteId = userDoc.data()?.ambienteId

    let currentAmbiente = null
    if (currentAmbienteId) {
      const currentAmbienteDoc = await db.collection("ambientes").doc(currentAmbienteId).get()
      if (currentAmbienteDoc.exists) {
        currentAmbiente = {
          id: currentAmbienteId,
          name: currentAmbienteDoc.data().name,
        }
      }
    }

    res.status(200).json({
      invite: {
        id: inviteId,
        senderName: inviteData.senderName,
        ambienteName: inviteData.ambienteName,
        ambienteId: inviteData.ambienteId,
      },
      currentEnvironment: currentAmbiente,
      willLeaveCurrentEnvironment: !!currentAmbiente,
    })
  } catch (error) {
    console.error("Erro ao visualizar convite:", error)
    res.status(500).send("Erro interno do servidor.")
  }
})

app.post("/api/invites/:inviteId/accept", verifyAuthToken, async (req, res) => {
  try {
    const userId = req.user.uid
    const userEmail = req.user.email
    const inviteId = req.params.inviteId

    const inviteRef = db.collection("invites").doc(inviteId)
    const inviteDoc = await inviteRef.get()

    if (!inviteDoc.exists || inviteDoc.data().recipientEmail.toLowerCase() !== userEmail.toLowerCase()) {
      return res.status(404).send("Convite não encontrado ou não pertence a você.")
    }

    if (inviteDoc.data().status === "accepted") {
      return res.status(400).send("Este convite já foi aceito.")
    }

    const { ambienteId: newAmbienteId } = inviteDoc.data()

    const userRef = db.collection("users").doc(userId)
    const userDoc = await userRef.get()
    const currentAmbienteId = userDoc.data()?.ambienteId

    if (currentAmbienteId && currentAmbienteId !== newAmbienteId) {
      console.log(`Usuário ${userId} já pertence ao ambiente ${currentAmbienteId}, movendo para ${newAmbienteId}`)

      const oldAmbienteRef = db.collection("ambientes").doc(currentAmbienteId)
      const oldAmbienteDoc = await oldAmbienteRef.get()

      if (oldAmbienteDoc.exists) {
        await oldAmbienteRef.update({
          members: admin.firestore.FieldValue.arrayRemove(userId),
        })
        console.log(`Usuário ${userId} removido do ambiente anterior ${currentAmbienteId}`)
      }
    }

    const newAmbienteRef = db.collection("ambientes").doc(newAmbienteId)
    const newAmbienteDoc = await newAmbienteRef.get()

    if (!newAmbienteDoc.exists) {
      return res.status(404).send("Ambiente do convite não encontrado.")
    }

    const currentMembers = newAmbienteDoc.data().members || []
    if (!currentMembers.includes(userId)) {
      await newAmbienteRef.update({
        members: admin.firestore.FieldValue.arrayUnion(userId),
      })
    }

    await userRef.set(
      {
        ambienteId: newAmbienteId,
        needsSetup: false,
      },
      { merge: true },
    )

    await inviteRef.update({
      status: "accepted",
      acceptedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    const ambienteData = newAmbienteDoc.data()

    res.status(200).json({
      message: "Convite aceito com sucesso!",
      ambiente: {
        id: newAmbienteId,
        name: ambienteData.name,
      },
      previousEnvironment: currentAmbienteId
        ? {
            id: currentAmbienteId,
            message: "Você foi removido do ambiente anterior",
          }
        : null,
    })
  } catch (error) {
    console.error("Erro ao aceitar convite:", error)
    res.status(500).send("Erro interno do servidor.")
  }
})

app.get("/api/ambientes/:ambienteId", verifyAuthToken, async (req, res) => {
  try {
    const { uid } = req.user
    const { ambienteId } = req.params

    const ambienteRef = db.collection("ambientes").doc(ambienteId)
    const ambienteDoc = await ambienteRef.get()

    if (!ambienteDoc.exists) {
      return res.status(404).send("Ambiente não encontrado.")
    }

    const ambienteData = ambienteDoc.data()

    if (!ambienteData.members.includes(uid)) {
      return res.status(403).send("Você não tem permissão para ver este ambiente.")
    }

    const memberPromises = ambienteData.members.map((memberId) => db.collection("users").doc(memberId).get())
    const memberDocs = await Promise.all(memberPromises)

    const membersDetails = memberDocs
      .map((doc) => {
        if (doc.exists) {
          const { displayName, email, photoURL } = doc.data()
          return {
            uid: doc.id,
            displayName,
            email,
            photoURL,
          }
        }
        return null
      })
      .filter(Boolean)

    res.status(200).json({
      ambiente: { id: ambienteDoc.id, ...ambienteData },
      members: membersDetails,
    })
  } catch (error) {
    console.error("Erro ao buscar detalhes do ambiente:", error)
    res.status(500).send("Erro interno do servidor.")
  }
})

app.put("/api/ambientes/:ambienteId", verifyAuthToken, async (req, res) => {
  try {
    const { uid } = req.user
    const { ambienteId } = req.params
    const { name } = req.body

    if (!name) {
      return res.status(400).send("O nome do ambiente é obrigatório.")
    }

    const ambienteRef = db.collection("ambientes").doc(ambienteId)
    const ambienteDoc = await ambienteRef.get()

    if (!ambienteDoc.exists) {
      return res.status(404).send("Ambiente não encontrado.")
    }

    if (ambienteDoc.data().members[0] !== uid) {
      return res.status(403).send("Você não tem permissão para editar este ambiente.")
    }

    await ambienteRef.update({ name })

    res.status(200).json({ message: "Ambiente atualizado com sucesso!", name })
  } catch (error) {
    console.error("Erro ao atualizar ambiente:", error)
    res.status(500).send("Erro interno do servidor.")
  }
})

app.post("/api/ambientes/:ambienteId/remove-member", verifyAuthToken, async (req, res) => {
  try {
    const { uid: removerUid } = req.user
    const { ambienteId } = req.params
    const { memberIdToRemove } = req.body

    if (!memberIdToRemove) {
      return res.status(400).send("O ID do membro a ser removido é obrigatório.")
    }

    if (removerUid === memberIdToRemove) {
      return res.status(400).send("Você não pode remover a si mesmo.")
    }

    const ambienteRef = db.collection("ambientes").doc(ambienteId)
    const ambienteDoc = await ambienteRef.get()

    if (!ambienteDoc.exists) {
      return res.status(404).send("Ambiente não encontrado.")
    }

    if (ambienteDoc.data().members[0] !== removerUid) {
      return res.status(403).send("Você não tem permissão para remover membros.")
    }

    await ambienteRef.update({
      members: admin.firestore.FieldValue.arrayRemove(memberIdToRemove),
    })

    const userToRemoveRef = db.collection("users").doc(memberIdToRemove)
    await userToRemoveRef.update({
      ambienteId: null,
    })

    res.status(200).send("Membro removido com sucesso.")
  } catch (error) {
    console.error("Erro ao remover membro:", error)
    res.status(500).send("Erro interno do servidor.")
  }
})

app.delete("/api/user", verifyAuthToken, async (req, res) => {
  try {
    const { uid } = req.user

    const userRef = db.collection("users").doc(uid)
    const userDoc = await userRef.get()

    if (userDoc.exists) {
      const { ambienteId } = userDoc.data()

      if (ambienteId) {
        const ambienteRef = db.collection("ambientes").doc(ambienteId)
        const ambienteDoc = await ambienteRef.get()

        if (ambienteDoc.exists) {
          const ambienteData = ambienteDoc.data()
          const isOwner = ambienteData.ownerId === uid || ambienteData.members[0] === uid

          if (isOwner && ambienteData.members.length > 1) {
            return res
              .status(400)
              .send(
                "Ação proibida: Você é o dono de um ambiente compartilhado. Por favor, remova todos os outros membros antes de deletar sua conta.",
              )
          }

          if (isOwner && ambienteData.members.length === 1) {
            await ambienteRef.delete()
          }

          if (!isOwner) {
            await ambienteRef.update({
              members: admin.firestore.FieldValue.arrayRemove(uid),
            })
          }
        }
      }
    }

    await admin.auth().deleteUser(uid)

    if (userDoc.exists) {
      await userRef.delete()
    }

    res.status(200).send({ message: "Conta deletada com sucesso." })
  } catch (error) {
    console.error("Erro ao deletar conta:", error)
    res.status(500).send("Erro interno ao tentar deletar a conta.")
  }
})

// --- ROTA DE CRIAÇÃO DE TRANSAÇÃO ---
app.post("/api/transactions", verifyAuthToken, async (req, res) => {
  try {
    const userId = req.user.uid
    const { description, amount, type, category, date, ambienteId } = req.body

    if (!description || !amount || !type || !date || !ambienteId) {
      return res.status(400).send("Todos os campos obrigatórios devem ser preenchidos.")
    }

    const userDoc = await db.collection("users").doc(userId).get()
    if (!userDoc.exists || userDoc.data().ambienteId !== ambienteId) {
      return res.status(403).send("Acesso negado: você não pertence a este ambiente.")
    }

    const transactionData = {
      description,
      amount: Number.parseFloat(amount),
      type,
      category: category || null,
      date: admin.firestore.Timestamp.fromDate(new Date(date + "T12:00:00.000Z")),
      ambienteId,
      addedBy: userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }

    const docRef = await db.collection("transactions").add(transactionData)

    res.status(201).json({
      id: docRef.id,
      ...transactionData,
      message: "Transação criada com sucesso!",
    })
  } catch (error) {
    console.error("Erro ao criar transação:", error)
    res.status(500).send("Erro interno do servidor.")
  }
})

// --- ROTA DE IMPORTAÇÃO EM LOTE---
app.post("/api/transactions/batch", verifyAuthToken, async (req, res) => {
  try {
    const userId = req.user.uid
    const { transactions, ambienteId } = req.body

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0 || !ambienteId) {
      return res.status(400).json({ error: "Dados inválidos. Forneça um array de transações e o ID do ambiente." })
    }

    const userDoc = await db.collection("users").doc(userId).get()
    if (!userDoc.exists || userDoc.data().ambienteId !== ambienteId) {
      return res.status(403).json({ error: "Acesso negado: você não pertence a este ambiente." })
    }

    const batch = db.batch()

    transactions.forEach((transaction) => {
      if (!transaction.date || !transaction.description || isNaN(Number.parseFloat(transaction.amount))) {
        console.warn("Transação ignorada por dados inválidos:", transaction)
        return
      }

      const docRef = db.collection("transactions").doc()
      const transactionData = {
        description: transaction.description,
        amount: Math.abs(Number.parseFloat(transaction.amount)),
        type: "expense",
        category: transaction.category || "Cartão de Crédito",
        date: admin.firestore.Timestamp.fromDate(new Date(transaction.date + "T12:00:00.000Z")),
        ambienteId,
        addedBy: userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      }
      batch.set(docRef, transactionData)
    })

    await batch.commit()

    res.status(201).json({ message: "Transações importadas com sucesso!" })
  } catch (error) {
    console.error("Erro ao importar transações em lote:", error)
    res.status(500).json({ error: "Erro interno do servidor ao importar transações." })
  }
})

// ========================================================
// --- ROTAS PARA METAS FINANCEIRAS                     ---
// ========================================================

// BUSCAR TODAS AS METAS DE UM AMBIENTE
app.get("/api/goals", verifyAuthToken, async (req, res) => {
  try {
    const { ambienteId } = req.query
    if (!ambienteId) {
      return res.status(400).json({ error: "ID do Ambiente é obrigatório para buscar metas." })
    }

    const snapshot = await db
      .collection("goals")
      .where("ambienteId", "==", ambienteId)
      .orderBy("createdAt", "desc") // Ordena por data de criação, os mais novos primeiro
      .get()

    const goals = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt ? doc.data().createdAt.toDate().toISOString() : null, // Converte timestamp para string ISO
    }))

    res.status(200).json(goals)
  } catch (error) {
    console.error("Erro ao buscar metas:", error)
    res.status(500).json({ error: "Erro interno do servidor ao buscar metas." })
  }
})

// CRIAR UMA NOVA META
app.post("/api/goals", verifyAuthToken, async (req, res) => {
  try {
    const { uid } = req.user
    const { name, targetAmount, ambienteId } = req.body

    if (!name || !targetAmount || !ambienteId) {
      return res.status(400).json({ error: "Nome, valor alvo e ID do ambiente são obrigatórios." })
    }

    const newGoal = {
      name,
      targetAmount: Number(targetAmount),
      currentAmount: 0,
      ownerId: uid,
      ambienteId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }

    const docRef = await db.collection("goals").add(newGoal)
    res.status(201).json({ id: docRef.id, ...newGoal })
  } catch (error) {
    console.error("Erro ao criar meta:", error)
    res.status(500).json({ error: "Erro interno do servidor." })
  }
})

// DEPOSITAR DINHEIRO EM UMA META
app.post("/api/goals/:goalId/deposit", verifyAuthToken, async (req, res) => {
  try {
    const { uid } = req.user
    const { amount, ambienteId } = req.body
    const { goalId } = req.params

    if (!amount || amount <= 0 || !ambienteId) {
      return res.status(400).json({ error: "O valor do depósito deve ser positivo." })
    }

    const goalRef = db.collection("goals").doc(goalId)
    const transactionRef = db.collection("transactions").doc()

    await db.runTransaction(async (t) => {
      const goalDoc = await t.get(goalRef)
      if (!goalDoc.exists) throw new Error("Meta não encontrada.")

      const currentAmount = goalDoc.data().currentAmount || 0
      const newAmount = currentAmount + Number(amount)

      t.update(goalRef, { currentAmount: newAmount })

      t.set(transactionRef, {
        description: `Depósito na meta: ${goalDoc.data().name}`,
        amount: Number(amount),
        type: "expense",
        category: "Metas",
        date: admin.firestore.Timestamp.now(),
        ambienteId,
        addedBy: uid,
        relatedGoalId: goalId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      })
    })

    res.status(200).json({ message: "Depósito realizado com sucesso!" })
  } catch (error) {
    console.error("Erro ao depositar na meta:", error)
    res.status(500).json({ error: "Erro interno do servidor." })
  }
})

// DELETAR UMA META
app.delete("/api/goals/:goalId", verifyAuthToken, async (req, res) => {
  try {
    const { goalId } = req.params
    const goalRef = db.collection("goals").doc(goalId)
    const goalDoc = await goalRef.get()

    if (!goalDoc.exists) {
      return res.status(404).json({ error: "Meta não encontrada." })
    }

    if (goalDoc.data().currentAmount > 0) {
      return res.status(400).json({ error: "Você precisa resgatar o dinheiro antes de poder deletar a meta." })
    }

    await goalRef.delete()
    res.status(200).json({ message: "Meta deletada com sucesso." })
  } catch (error) {
    console.error("Erro ao deletar meta:", error)
    res.status(500).json({ error: "Erro interno do servidor." })
  }
})

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})