const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

// Lắng nghe kết nối (Placeholder)
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
});

// Khởi động server tại port 3000
http.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});