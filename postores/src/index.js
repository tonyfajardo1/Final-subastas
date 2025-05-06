import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json());

// Corre el frontend desde la carpeta public
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../public")));

const PORT = 8081;
//const MANEJADOR_URL = "http://localhost:8080"; // Para uso local
const MANEJADOR_URL = "http://manejador:8080"; // Para uso en Docker

// Registrar postor
app.post("/registrar-postor", async (req, res) => {
    const { nombre, subastaId } = req.body;

    try {
        // Primero verificamos si la subasta está configurada y activa
        const estadoRes = await fetch(`${MANEJADOR_URL}/estado-subasta/${subastaId}`);
        const estado = await estadoRes.json();

        if (!estado.configurada) {
            return res.status(400).json({ error: "Esta subasta aún no ha sido configurada por el manejador" });
        }

        if (!estado.activa) {
            return res.status(400).json({ error: "La subasta no está activa" });
        }

        const respuesta = await fetch(`${MANEJADOR_URL}/actualizar-postores`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, subastaId })
        });

        const datos = await respuesta.json();
        res.json(datos);
    } catch (error) {
        res.status(500).json({ error: "Error registrando postor" });
    }
});

// Realizar oferta (validando mínimo incremento)
app.post("/ofertar", async (req, res) => {
    const { nombre, monto, subastaId } = req.body;

    try {
        // Obtener estado actual para validar incremento
        const estadoRes = await fetch(`${MANEJADOR_URL}/estado-subasta/${subastaId}`);
        const estado = await estadoRes.json();

        if (!estado.activa) {
            return res.status(400).json({ error: "La subasta no está activa" });
        }

        let precioActual = estado.precioBase;
        if (estado.ofertas && estado.ofertas.length > 0) {
            const ultima = estado.ofertas[estado.ofertas.length - 1];
            precioActual = ultima.monto;
        }

        if (monto <= precioActual) {
            return res.status(400).json({ error: `Tu oferta debe ser mayor a $${precioActual}` });
        }

        if (estado.incrementoMinimo && (monto - precioActual) < estado.incrementoMinimo) {
            return res.status(400).json({ error: `La oferta debe aumentar al menos $${estado.incrementoMinimo}` });
        }

        const respuesta = await fetch(`${MANEJADOR_URL}/ofertar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, monto, subastaId })
        });

        const datos = await respuesta.json();
        res.json(datos);
    } catch (error) {
        res.status(500).json({ error: "Error realizando oferta" });
    }
});

// Estado de subasta por ID
app.get("/estado-subasta/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const respuesta = await fetch(`${MANEJADOR_URL}/estado-subasta/${id}`);
        const datos = await respuesta.json();
        res.json(datos);
    } catch (error) {
        res.status(500).json({ error: "Error obteniendo estado de subasta" });
    }
});

// Obtener todas las subastas
app.get("/subastas", async (req, res) => {
    try {
        const respuesta = await fetch(`${MANEJADOR_URL}/subastas`);
        const datos = await respuesta.json();
        res.json(datos);
    } catch (error) {
        console.error("Error obteniendo todas las subastas:", error);
        res.status(500).json({ error: "Error obteniendo todas las subastas" });
    }
});

// Obtener subastas activas
app.get("/subastas/activas", async (req, res) => {
    try {
        const respuesta = await fetch(`${MANEJADOR_URL}/subastas/activas`);
        const datos = await respuesta.json();
        res.json(datos);
    } catch (error) {
        console.error("Error obteniendo subastas activas:", error);
        res.status(500).json({ error: "Error obteniendo subastas activas" });
    }
});

// Página principal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Levantar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servicio de postores corriendo en puerto ${PORT}`);
});
