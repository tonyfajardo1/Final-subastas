Proyecto Subastas - Instrucciones de Uso

Este proyecto contiene dos servicios:

- manejador (puerto 8080): Servicio que gestiona las subastas
- postores (puerto 8081): Servicio que permite a los usuarios registrarse y ofertar

Requisitos:
- Tener instalado Docker y Docker Compose en el sistema.

Pasos para ejecutar:

1. Clona o descarga el proyecto con las carpetas manejador/ y postores/ organizadas.

2. Dentro de la raíz del proyecto (donde está el archivo docker-compose.yml), abre una terminal.

3. Ejecuta el siguiente comando para construir y levantar los contenedores:

   docker-compose up --build

4. El sistema levantará automáticamente dos contenedores:
   - http://localhost:8080 → Manejador de subastas
   - http://localhost:8081 → Portal de postores

Notas importantes:
- Ambos servicios están conectados en una red privada de Docker.
- El servicio de postores se conecta al manejador usando http://manejador:8080.
- Los servicios actualizarán el estado en tiempo real usando WebSocket.
- El puerto 8080 y 8081 deben estar libres antes de levantar el proyecto.

Comandos útiles:

- Para parar todo:
  docker-compose down

- Para ver los contenedores corriendo:
  docker ps

✅ Organización de Integrantes del Grupo:

- Anthony Fajardo
  - Contribución: Desarrollo de la lógica principal en Node.js para la creación y gestión de subastas, comunicación entre servicios y configuración inicial del Dockerfile.
  - Realización de pruebas locales para asegurar la comunicación mediante WebSocket.

- Rony Salgado
  - Contribución: Configuración de Docker Compose para levantar ambos servicios y conexión entre contenedores.
  - Definición de la estructura del proyecto, organización de carpetas y coordinación de despliegue.

- Andrés Herrera
  - Contribución: Apoyo en la documentación, redacción de este README y guías de ejecución.
  - Pruebas manuales de la funcionalidad en la aplicación para garantizar el correcto flujo entre el manejador y los postores.
