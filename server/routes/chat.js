import express from 'express';
import jwt from 'jsonwebtoken';
import { all, run } from '../database.js';

const router = express.Router();
const SECRET_KEY = 'your-secret-key-should-be-in-env';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

router.use(authenticateToken);

// Get all conversations for the user
router.get('/conversations', async (req, res) => {
  try {
    // For now, return all conversations. In a real app, we might filter by participation.
    const conversations = await all('SELECT * FROM conversations ORDER BY created_at DESC');

    // Fetch participants and last message for each conversation
    const enrichedConversations = await Promise.all(conversations.map(async (conv) => {
      const participants = await all('SELECT user_id FROM participants WHERE conversation_id = ?', [conv.id]);
      const messages = await all('SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC', [conv.id]);

      return {
        id: conv.id,
        title: conv.title,
        description: conv.description,
        participants: participants.map(p => p.user_id),
        messages: messages.map(m => ({
          id: m.id,
          authorId: m.author_id,
          authorName: m.author_name,
          body: m.body,
          timestamp: m.timestamp
        }))
      };
    }));

    res.json(enrichedConversations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new conversation
router.post('/conversations', async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user.id;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const conversationId = `room-${Date.now()}`;

  try {
    await run('INSERT INTO conversations (id, title, description) VALUES (?, ?, ?)', [conversationId, title, description]);
    await run('INSERT INTO participants (conversation_id, user_id) VALUES (?, ?)', [conversationId, userId]);

    // Add helper bot
    await run('INSERT INTO participants (conversation_id, user_id) VALUES (?, ?)', [conversationId, 'helper-bot']);

    // Initial message
    const msgId = `msg-${Date.now()}`;
    const initialMsg = `Čerstvě naleštěný porcelán hlásí: ${title} je otevřená všem přiznáním.`;

    await run(
      'INSERT INTO messages (id, conversation_id, author_id, author_name, body) VALUES (?, ?, ?, ?, ?)',
      [msgId, conversationId, 'helper-bot', 'Bot Uklízeč', initialMsg]
    );

    const newConversation = {
      id: conversationId,
      title,
      description,
      participants: [userId, 'helper-bot'],
      messages: [{
        id: msgId,
        authorId: 'helper-bot',
        authorName: 'Bot Uklízeč',
        body: initialMsg,
        timestamp: new Date().toISOString()
      }]
    };

    res.status(201).json(newConversation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
