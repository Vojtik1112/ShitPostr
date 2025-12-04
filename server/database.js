import sqlite3 from 'sqlite3';

const dbPromise = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Could not connect to database', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    dbPromise.run(sql, params, function (err) {
      if (err) {
        console.log('Error running sql ' + sql);
        console.log(err);
        reject(err);
      } else {
        resolve({ id: this.lastID });
      }
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    dbPromise.get(sql, params, (err, result) => {
      if (err) {
        console.log('Error running sql: ' + sql);
        console.log(err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    dbPromise.all(sql, params, (err, rows) => {
      if (err) {
        console.log('Error running sql: ' + sql);
        console.log(err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

const initDb = async () => {
  const usersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      password_hash TEXT,
      password_salt TEXT,
      display_name TEXT,
      avatar_url TEXT,
      avatar_color TEXT,
      status_message TEXT
    )
  `;

  const conversationsTable = `
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      title TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const participantsTable = `
    CREATE TABLE IF NOT EXISTS participants (
      conversation_id TEXT,
      user_id TEXT,
      PRIMARY KEY (conversation_id, user_id),
      FOREIGN KEY (conversation_id) REFERENCES conversations(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `;

  const messagesTable = `
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT,
      author_id TEXT,
      author_name TEXT,
      body TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    )
  `;

  try {
    await run(usersTable);
    await run(conversationsTable);
    await run(participantsTable);
    await run(messagesTable);
    console.log('Database tables initialized');
  } catch (err) {
    console.error('Error initializing database tables', err);
  }
};

export { all, get, initDb, run };

