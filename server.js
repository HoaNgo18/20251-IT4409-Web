const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static('public'));

// Object lưu trữ toàn bộ người chơi: { socketId: { x, y, color, ... } }
const players = {};

// Cấu hình Map
const MAP_SIZE = 2000;

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Xử lý khi người chơi bấm "Start Battle"
    socket.on('joinGame', (username) => {
        // Tạo người chơi mới tại vị trí ngẫu nhiên
        players[socket.id] = {
            x: Math.random() * 1000,
            y: Math.random() * 1000,
            radius: 20,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`, // Màu ngẫu nhiên
            username: username || "Unnamed",
            speed: 5,
            angle: 0 // Góc quay của kiếm (sẽ dùng sau)
        };
    });

    // Nhận input di chuyển từ Client
    socket.on('playerInput', (mouseData) => {
        const player = players[socket.id];
        if (!player) return;

        // Tính toán vector di chuyển phía Server (Server Authoritative)
        // Client gửi góc (angle) hoặc vị trí chuột, ở đây ta làm đơn giản là tính toán dựa trên góc
        const dx = mouseData.x - player.x;
        const dy = mouseData.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Chỉ di chuyển nếu chưa tới đích
        if (distance > 5) {
            player.x += (dx / distance) * player.speed;
            player.y += (dy / distance) * player.speed;
            player.angle = Math.atan2(dy, dx); // Lưu góc để vẽ kiếm sau này
        }
        
        // Giới hạn trong bản đồ
        player.x = Math.max(0, Math.min(MAP_SIZE, player.x));
        player.y = Math.max(0, Math.min(MAP_SIZE, player.y));
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        delete players[socket.id]; // Xóa người chơi khi ngắt kết nối
    });
});

// --- SERVER GAME LOOP (60 FPS) ---
// Gửi update trạng thái cho tất cả client 60 lần/giây
setInterval(() => {
    io.emit('stateUpdate', players);
}, 1000 / 60);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});