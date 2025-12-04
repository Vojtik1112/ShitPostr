import bcrypt from 'bcrypt';
import express from 'express';
import jwt from 'jsonwebtoken';
import { get, run } from '../database.js';

const router = express.Router();
const SECRET_KEY = "dw-its-diff-in-prod"; 

const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '7d' });
};

router.post('/register', async (req, res) => {
  const { displayName, email, password } = req.body;

  if (!displayName || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const existingUser = await get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const id = `user-${Date.now()}`;
    const avatarColor = `hsl(${Math.random() * 360} 65% 55%)`;

    await run(
      'INSERT INTO users (id, email, password_hash, display_name, avatar_color, status_message) VALUES (?, ?, ?, ?, ?, ?)',
      [id, email, passwordHash, displayName, avatarColor, 'Připraven/a spláchnout.']
    );

    const newUser = { id, email, displayName, avatarColor, statusMessage: 'Připraven/a spláchnout.' };
    const token = generateToken(newUser);

    res.status(201).json({ user: newUser, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { password_hash, password_salt, ...safeUser } = user;
    // Map snake_case to camelCase for frontend consistency if needed, or handle in frontend
    // For now, let's return what the frontend expects
    const frontendUser = {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      avatarColor: user.avatar_color,
      statusMessage: user.status_message,
    };

    const token = generateToken(frontendUser);
    res.json({ user: frontendUser, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/profile', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const userId = decoded.id;

    const { displayName, statusMessage, avatarUrl } = req.body;

    // Construct update query dynamically
    const updates = [];
    const params = [];

    if (displayName !== undefined) {
      updates.push('display_name = ?');
      params.push(displayName);
    }
    if (statusMessage !== undefined) {
      updates.push('status_message = ?');
      params.push(statusMessage);
    }
    if (avatarUrl !== undefined) {
      updates.push('avatar_url = ?');
      params.push(avatarUrl);
    }

    if (updates.length === 0) {
      return res.json({ message: 'No changes' });
    }

    params.push(userId);
    await run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);

    const updatedUser = await get('SELECT * FROM users WHERE id = ?', [userId]);
    const { password_hash, password_salt, ...safeUser } = updatedUser;

    const frontendUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      displayName: updatedUser.display_name,
      avatarUrl: updatedUser.avatar_url,
      avatarColor: updatedUser.avatar_color,
      statusMessage: updatedUser.status_message,
    };

    res.json({ user: frontendUser });

  } catch (error) {
    console.error(error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
