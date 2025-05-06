const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { WebSocketServer } = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

const PORT = 8080;

// Subastas iniciales
let subastas = [
    {
        id: 1,
        titulo: "The Mona Lisa",
        artista: "Leonardo da Vinci",
        imagen: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Mona_Lisa.jpg",
        año: 1503,
        precioBase: 200000000,
        precioFinal: 200000000,
        incrementoMinimo: 1000000,
        duracion: 30,
        activa: false,
        ofertas: [],
        postores: [],
        inicio: null,
        orden: 1
    },
    {
        id: 2,
        titulo: "The Dance Class",
        artista: "Edgar Degas",
        imagen: "https://upload.wikimedia.org/wikipedia/commons/8/81/Edgar_Degas_-_The_Ballet_Class_-_Google_Art_Project.jpg",
        año: 1874,
        precioBase: 10000000,
        precioFinal: 10000000,
        incrementoMinimo: 500000,
        duracion: 30,
        activa: false,
        ofertas: [],
        postores: [],
        inicio: null,
        orden: 2
    },
    {
        id: 3,
        titulo: "L'Absinthe",
        artista: "Edgar Degas",
        imagen: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Edgar_Degas_-_In_a_Caf%C3%A9_-_Google_Art_Project_2.jpg",
        año: 1876,
        precioBase: 19000000,
        precioFinal: 19000000,
        incrementoMinimo: 500000,
        duracion: 30,
        activa: false,
        ofertas: [],
        postores: [],
        inicio: null,
        orden: 3
    },
    {
        id: 4,
        titulo: "Portrait of a Woman in a Hat",
        artista: "Amedeo Modigliani",
        imagen: "https://upload.wikimedia.org/wikipedia/commons/7/71/Amedeo-modigliani-jeanne-hebuterne-with-hat-and-necklace.jpg",
        año: 1918,
        precioBase: 67000000,
        precioFinal: 67000000,
        incrementoMinimo: 1000000,
        duracion: 30,
        activa: false,
        ofertas: [],
        postores: [],
        inicio: null,
        orden: 4
    },
    {
        id: 5,
        titulo: "Woman with Red Hair",
        artista: "Amedeo Modigliani",
        imagen: "https://upload.wikimedia.org/wikipedia/commons/8/8e/Amedeo_Modigliani_-_Woman_with_Red_Hair_%281917%29.jpg",
        año: 1919,
        precioBase: 120000000,
        precioFinal: 120000000,
        incrementoMinimo: 1000000,
        duracion: 30,
        activa: false,
        ofertas: [],
        postores: [],
        inicio: null,
        orden: 5
    },
    {
        id: 6,
        titulo: "Portrait of Dora Maar",
        artista: "Pablo Picasso",
        imagen: "https://upload.wikimedia.org/wikipedia/en/d/d4/Portrait_of_Dora_Maar.jpg",
        año: 1937,
        precioBase: 90000000,
        precioFinal: 90000000,
        incrementoMinimo: 1000000,
        duracion: 30,
        activa: false,
        ofertas: [],
        postores: [],
        inicio: null,
        orden: 6
    },
    {
        id: 7,
        titulo: "Self-Portrait",
        artista: "Vincent Van Gogh",
        imagen: "https://upload.wikimedia.org/wikipedia/commons/b/b2/Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project.jpg",
        año: 1889,
        precioBase: 100000000,
        precioFinal: 100000000,
        incrementoMinimo: 1000000,
        duracion: 30,
        activa: false,
        ofertas: [],
        postores: [],
        inicio: null,
        orden: 7
    },
    {
        id: 8,
        titulo: "Subasta Sin Configurar",
        artista: "Test Artist",
        imagen: "https://via.placeholder.com/300x200?text=Sin+Configurar",
        año: 2025,
        precioBase: 0, // Precio base en 0 para que no se considere configurada
        precioFinal: 0,
        incrementoMinimo: 0, // Incremento en 0 para que no se considere configurada
        duracion: 0, // Duración en 0 para que no se considere configurada
        activa: false,
        ofertas: [],
        postores: [],
        inicio: null,
        orden: 8
    }
];


// Estado de la secuencia
let estadoSecuencia = {
    enCurso: false,
    indiceActual: 0
};

function obtenerGanador(subasta) {
    if (!subasta.ofertas.length) return null;
    return subasta.ofertas.reduce((max, oferta) => oferta.monto > max.monto ? oferta : max, subasta.ofertas[0]);
}

function broadcast(tipo, payload) {
    const mensaje = { tipo, payload };
    wss.clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(JSON.stringify(mensaje));
        }
    });
}

// WebSocket conexión
wss.on("connection", (ws) => {
    console.log("🔵 Cliente conectado a WebSocket");
});

// Endpoints

app.get("/subastas", (req, res) => res.json(subastas));

app.get("/subastas/activas", (req, res) => res.json(subastas.filter(s => s.activa)));

app.post("/editar-precio", (req, res) => {
    const { subastaId, nuevoPrecio, nuevoIncremento, nuevaDuracion } = req.body;
    const subasta = subastas.find(s => s.id === subastaId);
    if (!subasta) return res.status(404).json({ error: "Subasta no encontrada" });

    subasta.precioBase = nuevoPrecio;
    subasta.precioFinal = nuevoPrecio;

    if (nuevoIncremento !== undefined) subasta.incrementoMinimo = nuevoIncremento;
    if (nuevaDuracion !== undefined) subasta.duracion = nuevaDuracion;

    res.json({ message: "Datos actualizados", subasta });
});

app.post("/cambiar-orden", (req, res) => {
    const { subastaId, orden } = req.body;
    const subasta = subastas.find(s => s.id === subastaId);
    if (!subasta) return res.status(404).json({ error: "Subasta no encontrada" });

    subasta.orden = parseInt(orden);
    res.json({ message: "Orden actualizado", subasta });
});

app.post("/actualizar-postores", (req, res) => {
    const { subastaId, nombre } = req.body;
    const subasta = subastas.find(s => s.id === subastaId);
    if (!subasta) return res.status(400).json({ error: "Subasta no encontrada" });

    if (!subasta.postores.includes(nombre)) {
        subasta.postores.push(nombre);
        broadcast("postoresUpdate", {
            subastaId: subasta.id,
            postores: subasta.postores
        });
    }

    res.json({ message: "Postor registrado", subasta });
});

app.post("/ofertar", (req, res) => {
    const { subastaId, nombre, monto } = req.body;
    const subasta = subastas.find(s => s.id === subastaId);
    if (!subasta || !subasta.activa) {
        return res.status(400).json({ error: "Subasta no activa" });
    }

    const ultimaOferta = subasta.ofertas.at(-1);
    const minimo = subasta.incrementoMinimo || 1;
    const base = ultimaOferta ? ultimaOferta.monto : subasta.precioBase;

    if (monto - base < minimo) {
        return res.status(400).json({
            error: `Oferta muy baja. Debe aumentar al menos $${minimo} desde el valor actual de $${base}`
        });
    }

    subasta.ofertas.push({ nombre, monto });
    subasta.precioFinal = monto;
    broadcast("ofertaNueva", { subastaId, nombre, monto });

    res.json({ message: "Oferta aceptada", subasta });
});

// Secuencia persistente
let ordenadasGlobal = [];

app.post("/iniciar-subastas-secuencialmente", async (req, res) => {
    if (estadoSecuencia.enCurso) {
        return res.status(400).json({ error: "La secuencia ya está en curso." });
    }

    estadoSecuencia.enCurso = true;
    estadoSecuencia.indiceActual = 0;
    ordenadasGlobal = [...subastas].sort((a, b) => a.orden - b.orden);

    iniciarSecuencial(); // sin await para que se mantenga en ejecución
    res.json({ message: "Secuencia de subastas iniciada." });
});

async function iniciarSecuencial() {
    for (let i = estadoSecuencia.indiceActual; i < ordenadasGlobal.length; i++) {
        const subasta = ordenadasGlobal[i];
        estadoSecuencia.indiceActual = i;

        subasta.activa = true;
        subasta.inicio = Date.now();
        subasta.ofertas = [];
        subasta.postores = [];
        subasta.precioFinal = subasta.precioBase;

        console.log(`⏳ Subasta ${subasta.titulo} iniciada`);
        broadcast("subastaIniciada", { subastaId: subasta.id });

        await new Promise(resolve => setTimeout(() => {
            subasta.activa = false;
            const ganador = obtenerGanador(subasta);
            broadcast("subastaTerminada", {
                subastaId: subasta.id,
                ganador: ganador ? ganador.nombre : null,
                monto: ganador ? ganador.monto : null
            });
            console.log(`✅ Subasta ${subasta.titulo} finalizada`);
            resolve();
        }, subasta.duracion * 1000));
    }

    estadoSecuencia.enCurso = false;
    estadoSecuencia.indiceActual = 0;
}

app.post("/iniciar-subasta-especifica", async (req, res) => {
    const { subastaId } = req.body;
    const subasta = subastas.find(s => s.id === parseInt(subastaId));
    
    if (!subasta) {
        return res.status(404).json({ error: "Subasta no encontrada" });
    }
    
    if (subasta.activa) {
        return res.status(400).json({ error: "La subasta ya está activa" });
    }
    
    if (estadoSecuencia.enCurso) {
        return res.status(400).json({ error: "Hay una secuencia de subastas en curso" });
    }
    
    // Verificar si la subasta está configurada
    if (subasta.precioBase <= 0 || subasta.incrementoMinimo <= 0 || subasta.duracion <= 0) {
        return res.status(400).json({ error: "La subasta no está correctamente configurada" });
    }
    
    subasta.activa = true;
    subasta.inicio = Date.now();
    subasta.ofertas = [];
    subasta.postores = [];
    subasta.precioFinal = subasta.precioBase;
    
    console.log(`⏳ Subasta ${subasta.titulo} iniciada manualmente`);
    broadcast("subastaIniciada", { subastaId: subasta.id });
    
    // Programar la finalización de la subasta después de la duración especificada
    setTimeout(() => {
        subasta.activa = false;
        const ganador = obtenerGanador(subasta);
        broadcast("subastaTerminada", {
            subastaId: subasta.id,
            ganador: ganador ? ganador.nombre : null,
            monto: ganador ? ganador.monto : null
        });
        console.log(`✅ Subasta ${subasta.titulo} finalizada`);
    }, subasta.duracion * 1000);
    
    res.json({ message: "Subasta iniciada correctamente", subasta });
});

app.get("/estado-subasta/:subastaId", (req, res) => {
    const subastaId = parseInt(req.params.subastaId);
    const subasta = subastas.find(s => s.id === subastaId);
    if (!subasta) return res.status(404).json({ error: "Subasta no encontrada" });

    const ahora = Date.now();
    const restante = subasta.activa
        ? Math.max(0, Math.floor((subasta.inicio + subasta.duracion * 1000 - ahora) / 1000))
        : 0;

    const mejorOferta = subasta.ofertas.reduce((max, o) => o.monto > max.monto ? o : max, { monto: 0, nombre: null });

    // Determinamos si la subasta está configurada revisando si los valores críticos están definidos
    const configurada = subasta.precioBase > 0 && subasta.incrementoMinimo > 0 && subasta.duracion > 0;

    res.json({
        id: subasta.id,
        titulo: subasta.titulo,
        artista: subasta.artista,
        imagen: subasta.imagen,
        activa: subasta.activa,
        configurada: configurada,
        restante,
        ganador: !subasta.activa && mejorOferta.nombre ? mejorOferta.nombre : null,
        oferta: !subasta.activa ? mejorOferta.monto : null,
        postores: subasta.postores,
        ofertas: subasta.ofertas,
        precioBase: subasta.precioBase,
        incrementoMinimo: subasta.incrementoMinimo,
        duracion: subasta.duracion
    });
});

app.get("/subastas/estado-general", (req, res) => {
    res.json({
        estadoSecuencia,
        subastas
    });
});

app.get("/", (req, res) => {
    res.send("Servidor del Manejador de Subastas funcionando 🚀");
});

server.listen(PORT, () => {
    console.log(`🚀 Manejador corriendo en puerto ${PORT}`);
});
