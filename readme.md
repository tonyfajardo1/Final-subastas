# Proyecto Subastas - Instrucciones de Uso

Este proyecto implementa un sistema de subastas con dos servicios independientes:

* **manejador** (puerto **8080**): Portal de administrador para configurar y gestionar subastas.
* **postores** (puerto **8081**): Portal de usuarios para registrarse y pujar en tiempo real.

---

## Requisitos

* Tener instalado **Docker** y **Docker Compose**.
* Los puertos **8080** y **8081** deben estar libres.

---

## Arrancar la aplicación

1. Clona o descarga el repositorio, asegurándote de tener las carpetas `manejador/` y `postores/`.
2. Sitúate en la raíz del proyecto (donde está `docker-compose.yml`).
3. Ejecuta:

   ```bash
   docker-compose up --build
   ```

4. Una vez levantados los contenedores, abre en tu navegador:

   * **Administrador** → [http://localhost:8080](http://localhost:8080)
   * **Postores**    → [http://localhost:8081](http://localhost:8081)

---

## Uso del Portal de Administrador (localhost:8080)

1. **Listar subastas**
   Verás tarjetas con cada obra, artista y un badge que indica si está `ACTIVA` o `INACTIVA`.
2. **Configurar subasta** (si aparece en rojo “sin configurar”):

   * Rellena **Precio base**, **Incremento mínimo** y **Duración (s)**.
   * Haz clic en **Actualizar** junto a cada campo para guardarlo.
   * Ajusta el **Orden** si quieres cambiar la posición de la tarjeta.
3. **Iniciar subasta**

   * Una vez configurados todos los parámetros, pulsa **Iniciar**.
   * La tarjeta pasará a estado `ACTIVA`, mostrará un contador y los participantes podrán pujar.
4. **Ver detalles**

   * Con **🔍 Ver detalles** abres un modal o sección con historial de ofertas y estado actual.
5. **Detener / Reiniciar**

   * (Si tu implementación incluye botón de pausa o reinicio, aquí se documentaría.)

---

## Uso del Portal de Postores (localhost:8081)

1. **Seleccionar subasta**
   Elige una de la lista desplegable.
2. **Registrarse**
   Escribe tu nombre y pulsa **Registrarse**.
3. **Realizar oferta**
   Introduce tu monto y haz clic en **Ofertar**.
4. **Estados posibles**

   * 🛑 **Subasta sin configurar**
     La obra aparece, pero aún no tiene parámetros asignados.
   * ⏸️ **Subasta inactiva**
     Ya está configurada, pero el admin no la ha iniciado.
   * ⚠️ **No hay subastas activas**
     Ninguna subasta está activa; espera a que el admin arranque alguna.
   * ⏳ **Subasta en progreso**
     Muestra tiempo restante, precio base e incremento, y el listado de ofertas si las hay.

---

## Notas Técnicas

* Ambos servicios (`manejador` y `postores`) comparten una red interna de Docker.
* El servicio de postores se conecta a `manejador` usando el hostname `manejador:8080`.
* La comunicación en tiempo real (contador, nuevas ofertas) usa **WebSocket**.

---

## Comandos Útiles

* **Detener todo**

  ```bash
  docker-compose down
  ```

* **Ver contenedores en ejecución**

  ```bash
  docker ps
  ```

* **Reconstruir sólo un servicio**

  ```bash
  docker-compose up --build manejador
  docker-compose up --build postores
  ```

---

## Equipo

* **Anthony Fajardo**

  * Lógica de subastas en Node.js, configuración del Dockerfile y pruebas de WebSocket.
* **Rony Salgado**

  * Docker Compose, estructura de carpetas y despliegue en contenedores.
* **Andrés Herrera**

  * Documentación, redacción del README y pruebas manuales de flujo completo.
