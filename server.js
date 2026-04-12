const io = require('socket.io')(process.env.PORT || 3000, {
    cors: { origin: "*" } 
});

let players = {};

io.on('connection', (socket) => {
    socket.on('join', (data) => {
        players[socket.id] = { id: socket.id, name: data.name, x: 400, y: 300, health: 100, rage: 0 };
        io.emit('state', players);
    });

    socket.on('move', (pos) => {
        if (players[socket.id]) {
            players[socket.id].x = pos.x;
            players[socket.id].y = pos.y;
        }
        socket.broadcast.emit('state', players);
    });

    socket.on('smash', (data) => {
        // Simple smash logic: check distance to other players
        Object.values(players).forEach(p => {
            if (p.id !== socket.id) {
                const dx = p.x - data.x;
                const dy = p.y - data.y;
                if (Math.sqrt(dx*dx + dy*dy) < 60) {
                    p.health -= 10;
                    if (p.health <= 0) { p.health = 100; p.x = 400; p.y = 300; }
                }
            }
        });
        io.emit('state', players);
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('state', players);
    });
});

console.log("Arena Server Running...");