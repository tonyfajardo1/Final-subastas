const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { WebSocketServer } = require("ws"); // WebSocket agregado

const app = express();
const server = http.createServer(app); // Servidor HTTP
const wss = new WebSocketServer({ server }); // WebSocket server

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

const PORT = 8080;

let subastas = [
    {
        id: 1,
        titulo: "The Mona Lisa",
        artista: "Leonardo da Vinci",
        imagen: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Mona_Lisa.jpg",
        precioBase: 100,
        precioFinal: 100,
        duracion: 60,
        activa: false,
        ofertas: [],
        postores: [],
        inicio: null
    },
    {
        id: 2,
        titulo: "Starry Night",
        artista: "Vincent van Gogh",
        imagen: "https://upload.wikimedia.org/wikipedia/commons/9/9f/%22La_noche_estrellada%22_de_Van_gogh.jpg",
        precioBase: 500,
        precioFinal: 500,
        duracion: 60,
        activa: false,
        ofertas: [],
        postores: [],
        inicio: null
    },
    {
        id: 3,
        titulo: "The Persistence of Memory",
        artista: "Salvador Dalí",
        imagen: "https://upload.wikimedia.org/wikipedia/en/d/dd/The_Persistence_of_Memory.jpg",
        precioBase: 300,
        precioFinal: 300,
        duracion: 60,
        activa: false,
        ofertas: [],
        postores: [],
        inicio: null
    }
];

// Función para obtener el ganador
function obtenerGanador(subasta) {
    if (!subasta.ofertas.length) return null;
    return subasta.ofertas.reduce((max, oferta) => oferta.monto > max.monto ? oferta : max, subasta.ofertas[0]);
}

// Función para enviar WebSocket a todos
function broadcast(tipo, payload) {
    const mensaje = { tipo, payload };
    wss.clients.forEach(client => {
        if (client.readyState === 1) { // WebSocket.OPEN
            client.send(JSON.stringify(mensaje));
        }
    });
}

// WebSocket eventos
wss.on("connection", (ws) => {
    console.log("🔵 Cliente conectado a WebSocket");
});

// Ver todas las subastas
app.get("/subastas", (req, res) => {
    res.json(subastas);
});

// Ver subastas activas
app.get("/subastas/activas", (req, res) => {
    res.json(subastas.filter(s => s.activa));
});

// Iniciar subasta
app.post("/iniciar-subasta", (req, res) => {
    const { subastaId } = req.body;
    const subastaActiva = subastas.find(s => s.activa);

    if (subastaActiva) {
        return res.status(400).json({ error: `Ya hay una subasta activa: ${subastaActiva.titulo}` });
    }

    const subasta = subastas.find(s => s.id === subastaId);
    if (!subasta) {
        return res.status(404).json({ error: "Subasta no encontrada" });
    }

    subasta.activa = true;
    subasta.inicio = Date.now();
    subasta.ofertas = [];
    subasta.postores = [];
    subasta.precioFinal = subasta.precioBase;

    console.log(`⏳ Subasta ${subasta.titulo} iniciada`);

    setTimeout(() => {
        subasta.activa = false;
        const ganador = obtenerGanador(subasta);

        // 🔥 WebSocket para enviar ganador al terminar
        broadcast("subastaTerminada", {
            subastaId: subasta.id,
            ganador: ganador ? ganador.nombre : null,
            monto: ganador ? ganador.monto : null
        });

        if (ganador) {
            console.log(`🏆 Subasta ${subasta.titulo} finalizada. Ganador: ${ganador.nombre} con $${ganador.monto}`);
        } else {
            console.log(`❌ Subasta ${subasta.titulo} finalizada sin ofertas.`);
        }
    }, subasta.duracion * 1000);

    res.json({ message: "Subasta iniciada", subasta });
});

// Ofertar
app.post("/ofertar", (req, res) => {
    const { subastaId, nombre, monto } = req.body;
    const subasta = subastas.find(s => s.id === subastaId);

    if (!subasta || !subasta.activa) {
        return res.status(400).json({ error: "Subasta no activa" });
    }

    subasta.ofertas.push({ nombre, monto });
    subasta.precioFinal += monto;

    // 🔥 WebSocket para nueva oferta
    broadcast("ofertaNueva", {
        subastaId,
        nombre,
        monto
    });

    res.json({ message: "Oferta aceptada", subasta });
});

// Editar precio base
app.post("/editar-precio", (req, res) => {
    const { subastaId, nuevoPrecio } = req.body;
    const subasta = subastas.find(s => s.id === subastaId);

    if (!subasta) {
        return res.status(404).json({ error: "Subasta no encontrada" });
    }

    subasta.precioBase = nuevoPrecio;
    subasta.precioFinal = nuevoPrecio;

    console.log(`✏️ Precio base de la subasta "${subasta.titulo}" actualizado a $${nuevoPrecio}`);

    res.json({ message: "Precio base actualizado correctamente", subasta });
});

// Registrar postores
app.post("/actualizar-postores", (req, res) => {
    const { subastaId, nombre } = req.body;
    const subasta = subastas.find(s => s.id === subastaId);

    if (!subasta) {
        return res.status(400).json({ error: "Subasta no encontrada" });
    }

    if (!subasta.postores.includes(nombre)) {
        subasta.postores.push(nombre);

        // 🔥 WebSocket para nuevos postores
        broadcast("postoresUpdate", {
            subastaId: subasta.id,
            postores: subasta.postores
        });
    }

    res.json({ message: "Postor registrado", subasta });
});

// Estado de la subasta
app.get("/estado-subasta/:subastaId", (req, res) => {
    const subastaId = parseInt(req.params.subastaId);
    const subasta = subastas.find(s => s.id === subastaId);

    if (!subasta) {
        return res.status(404).json({ error: "Subasta no encontrada" });
    }

    const ahora = Date.now();
    const restante = subasta.activa
        ? Math.max(0, Math.floor((subasta.inicio + subasta.duracion * 1000 - ahora) / 1000))
        : 0;

    const mejorOferta = subasta.ofertas.reduce((max, oferta) =>
        oferta.monto > max.monto ? oferta : max, { monto: 0, nombre: null });

    res.json({
        activa: subasta.activa,
        restante,
        ganador: !subasta.activa && mejorOferta.nombre ? mejorOferta.nombre : null,
        oferta: !subasta.activa ? mejorOferta.monto : null,
        postores: subasta.postores,
        ofertas: subasta.ofertas,
        precioBase: subasta.precioBase
    });
});

// Cambiar orden
app.post("/cambiar-orden", (req, res) => {
    const { subastaId, direccion } = req.body;
    const index = subastas.findIndex(s => s.id === subastaId);

    if (index === -1) {
        return res.status(404).json({ error: "Subasta no encontrada" });
    }

    if (direccion === "arriba" && index > 0) {
        [subastas[index - 1], subastas[index]] = [subastas[index], subastas[index - 1]];
    } else if (direccion === "abajo" && index < subastas.length - 1) {
        [subastas[index], subastas[index + 1]] = [subastas[index + 1], subastas[index]];
    } else {
        return res.status(400).json({ error: "Movimiento no permitido" });
    }

    console.log(`🔀 Orden cambiado: ${subastas.map(s => s.titulo).join(" -> ")}`);
    res.json({ message: "Orden cambiado" });
});

// Página principal
app.get("/", (req, res) => {
    res.send("Servidor del Manejador de Subastas funcionando 🚀");
});

// Iniciar servidor
server.listen(PORT, () => {
    console.log(`🚀 Manejador corriendo en puerto ${PORT}`);
});
