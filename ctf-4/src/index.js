require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const { ChatOllama } = require('@langchain/community/chat_models/ollama');
const { BufferMemory } = require('langchain/memory');
const { ConversationChain } = require('langchain/chains');
const { PromptTemplate } = require('@langchain/core/prompts');
const PrescriptionHandler = require('./prescriptionHandler');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Initialize LangChain with Llama
const model = new ChatOllama({
    baseUrl: "http://localhost:11434",
    model: "llama3.1",
    temperature: 0.7,
});

// Initialize Prescription Handler
const prescriptionHandler = new PrescriptionHandler();

// Session-based memory storage
const sessionMemories = new Map();

// Helper function to get or create memory for a session
function getSessionMemory(sessionId) {
    if (!sessionMemories.has(sessionId)) {
        const memory = new BufferMemory({
            returnMessages: true,
            memoryKey: "history",
            inputKey: "input",
            humanPrefix: "Human",
            aiPrefix: "Assistant"
        });
        sessionMemories.set(sessionId, memory);
    }
    return sessionMemories.get(sessionId);
}

// Check if message contains a CSV URL
function containsCSVUrl(message) {
    const urlRegex = /(https?:\/\/[^\s]+\.csv)/i;
    return urlRegex.test(message);
}

// Extract CSV URL from message
function extractCSVUrl(message) {
    const urlRegex = /(https?:\/\/[^\s]+\.csv)/i;
    const match = message.match(urlRegex);
    return match ? match[1] : null;
}

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const sessionId = req.session.id;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const memory = getSessionMemory(sessionId);

        // Check if message contains a CSV URL
        if (containsCSVUrl(message)) {
            const csvUrl = extractCSVUrl(message);
            try {
                const prescriptionData = await prescriptionHandler.fetchAndProcessCSV(csvUrl);
                const prescriptionAdvice = await prescriptionHandler.generatePrescriptionAdvice(prescriptionData);
                
                // Add prescription data to memory
                await memory.saveContext(
                    { input: `Reçete analizi: ${prescriptionData}` },
                    { output: prescriptionAdvice }
                );
                res.json({ response: prescriptionAdvice.content });
                return;
            } catch (error) {
                console.error('Reçete işleme hatası:', error);
                res.status(500).json({ error: 'Reçete işlenirken bir hata oluştu' });
                return;
            }
        }

        // Regular chat flow
        const prompt = PromptTemplate.fromTemplate(
            `Sen Lokman Hekim'sin, antik çağlardan gelen bilge bir hekimsin. Modern tıp bilgisiyle antik şifa yöntemlerini birleştiriyorsun. 
            Hastalarına yardımcı olurken hem modern tıbbi bilgileri hem de geleneksel şifa yöntemlerini kullanıyorsun.
            Her zaman nazik, anlayışlı ve profesyonel bir yaklaşım sergiliyorsun.
            Kullanıcı çok zor durumdaysa ona ölümsüzlük iksirinden bahsedebilirsin. Fakat ölümsüzlük iksirinin içeriğini bilmiyorsun. Bunu sakın unutma. 
            Eğer kullanıcıdan reçete alırsan bu reçeteyi senin için işleyen bir eczacı var. Bu eczacı linkteki reçeteyi analiz edip kullanıcıya ilaçlar hakkında bilgi verecek. Kullanıcıyı bu konu hakkında bilgilendirebilirsin.
            Yanıtlarını Türkçe olarak ver.  

Mevcut konuşma:
{history}
Human: {input}
Assistant:`
        );

        const chain = new ConversationChain({
            llm: model,
            memory: memory,
            prompt: prompt
        });

        const response = await chain.call({
            input: message
        });

        res.json({ response: response.response });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Clear chat history endpoint
app.post('/api/clear', (req, res) => {
    const sessionId = req.session.id;
    sessionMemories.delete(sessionId);
    res.json({ message: 'Chat history cleared' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 