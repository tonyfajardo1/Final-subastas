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
//const MANEJADOR_URL = "http://localhost:8080"; // El manejador corre en el 8080 de manera local
const MANEJADOR_URL = "http://manejador:8080"; //Link para docker


// Registrar postor
app.post("/registrar-postor", async (req, res) => {
    const { nombre, subastaId } = req.body; // 🔥 Recibimos subastaId

    try {
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

// Realizar oferta
app.post("/ofertar", async (req, res) => {
    const { nombre, monto, subastaId } = req.body; // 🔥 Recibimos subastaId

    try {
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

// Estado de la subasta
app.get("/estado-subasta/:id", async (req, res) => { // 🔥 Estado por id
    const { id } = req.params;

    try {
        const respuesta = await fetch(`${MANEJADOR_URL}/estado-subasta/${id}`);
        const datos = await respuesta.json();
        res.json(datos);
    } catch (error) {
        res.status(500).json({ error: "Error obteniendo estado de subasta" });
    }
});

// Página principal (sirve el HTML)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Levantar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servicio de postores corriendo en puerto ${PORT}`);
});
