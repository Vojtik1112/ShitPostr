import { run } from './database.js';

export const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected', socket.id);

    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on('send_message', async (data) => {
      const { conversationId, authorId, authorName, body } = data;

      // Persist message
      const msgId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = new Date().toISOString();

      try {
        await run(
          'INSERT INTO messages (id, conversation_id, author_id, author_name, body, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
          [msgId, conversationId, authorId, authorName, body, timestamp]
        );

        const message = {
          id: msgId,
          conversationId,
          authorId,
          authorName,
          body,
          timestamp
        };

        // Broadcast to room
        io.to(conversationId).emit('new_message', message);

        // Helper bot logic
        if (Math.random() > 0.5) { // 50% chance
             setTimeout(async () => {
                const botResponses = [
                  'Rozumím. Přidávám k tomu šplích osvěžovače.',
                  'Legendární. Mám ti to vyrýt na dveře kabinky?',
                  'Odvážné. Mám zalarmovat úklidovou jednotku?',
                  'Voní to přesně tak, jak má. 10/10, opakoval bych.',
                  'Potřebuješ alibi? Klidně to hodím na stupačky z patra.',
                ];
                const botBody = botResponses[Math.floor(Math.random() * botResponses.length)];
                const botMsgId = `msg-${Date.now()}-bot`;
                const botTimestamp = new Date().toISOString();

                await run(
                    'INSERT INTO messages (id, conversation_id, author_id, author_name, body, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
                    [botMsgId, conversationId, 'helper-bot', 'Bot Uklízeč', botBody, botTimestamp]
                );

                io.to(conversationId).emit('new_message', {
                    id: botMsgId,
                    conversationId,
                    authorId: 'helper-bot',
                    authorName: 'Bot Uklízeč',
                    body: botBody,
                    timestamp: botTimestamp
                });

             }, 1000 + Math.random() * 2000);
        }

      } catch (error) {
        console.error('Error saving message', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected', socket.id);
    });
  });
};
