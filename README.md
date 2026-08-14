# Sistema de Reservas - Sazón Dúo Dinámico

Proyecto de aplicación web para registrar y gestionar reservas de mesas, desarrollado en React para el curso de Desarrollo de Interfaces 2.

## Pasos para Instalar y Ejecutar

1. Abre una terminal en esta misma carpeta.
2. Instala las dependencias ejecutando:
   ```bash
   npm install
   ```
3. Inicia el servidor local ejecutando:
   ```bash
   npm run dev
   ```
4. Abre tu navegador y dirígete al enlace que te muestra la terminal (generalmente `http://localhost:5173/`).

## Pasos para Probar la Aplicación

- **Reservar una mesa:** Ve a la pestaña "Reservas", selecciona una fecha, horario, sede y zona. Completa tus datos y da clic en "Confirmar Reserva".
- **Validación de disponibilidad:** Si intentas reservar una mesa en la misma fecha, hora y zona que otra reserva previa, el sistema te avisará que la mesa ya está ocupada y no te dejará continuar.
- **Ver el Calendario:** En la sección "Calendario" podrás ver todas las reservas creadas de forma mensual, semanal o diaria.
- **Plano de Mesas:** En la sección "Horarios" verás en tiempo real cómo cambia la ocupación según las reservas que se vayan haciendo.
