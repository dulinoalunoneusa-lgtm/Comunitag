import express from 'express';
import { MongoClient } from 'mongodb';
import 'dotenv/config'; // Já carrega o .env automaticamente

const app = express();

// MIDDLEWARE: Essencial para ler JSON no corpo da requisição
app.use(express.json());

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("Favor definir MONGODB_URI nas variáveis de ambiente");
}

// Singleton do MongoDB para Serverless
let client;
let clientPromise;

if (!clientPromise) {
  console.log('Connecting to database', process.env.MONGODB_URI);
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

// ROTA: Health Check
app.get('/', (req, res) => {
  res.status(200).json({ message: "Servidor Express rodando!" });
});

// ROTA: Submit
app.post('/submit', async (req, res) => {
  try {
    const dbClient = await clientPromise;
    const db = dbClient.db("ComuniTag");
    const collection = db.collection("users");

    const data = req.body;

    // Verifica se o body está vazio
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ error: "Nenhum dado enviado no corpo da requisição" });
    }

    await collection.insertOne({ ...data, timestamp: new Date() });
    return res.status(201).json({ message: "Dados salvos com sucesso!" });
  } catch (err) {
    console.error("Erro no MongoDB:", err);
    return res.status(500).json({ error: "Erro interno ao salvar dados" });
  }
});

// Inicia servidor apenas se for local
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔥 Local: http://localhost:${PORT}`)); //essa linha é ignorada pela vercel por padrão


// EXPORT para o Vercel
export default app;
