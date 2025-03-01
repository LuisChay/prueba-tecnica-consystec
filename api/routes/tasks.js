const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const router = express.Router();

module.exports = (connection) => {
  // Crear tarea (por defecto no terminada)
  router.post('/create', (req, res) => {
    const { name, description, user_id } = req.body;
    if (!name || !description || !user_id) {
      return res.status(400).json({ error: 'Se requieren título y descripción' });
    }
    connection.query(
      'INSERT INTO task (name, description, finished, user_id) VALUES (?, ?, ?, ?)',
      [name, description, 0, user_id], // Se inserta como no terminado (0)
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Error en la base de datos' });
        }
        res.status(200).json({ success: 'Tarea creada' });
      }
    );
  });

  // Obtener todas las tareas de un usuario
  router.get('/get_tasks/:user_id', (req, res) => {
    const { user_id } = req.params;
    connection.query(
      'SELECT id, name, description, finished FROM task WHERE user_id = ?',
      [user_id],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Error en la base de datos' });
        }
        // Convertimos el campo finished de 0/1 a false/true
        const tasks = result.map(task => ({
          ...task,
          finished: task.finished === 1
        }));
        res.status(200).json(tasks);
      }
    );
  });
  

  // Obtener una tarea por ID
  router.get('/get_task/:id', (req, res) => {
    const { id } = req.params;
    connection.query(
      'SELECT id, name, description, finished FROM task WHERE id = ?',
      [id],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Error en la base de datos' });
        }
        if (result.length === 0) {
          return res.status(404).json({ error: 'Tarea no encontrada' });
        }
        res.status(200).json({
          ...result[0],
          finished: result[0].finished === 1 // Convertimos 0/1 a false/true
        });
      }
    );
  });

  // Editar una tarea (sin modificar su estado)
  router.put('/update/:id', (req, res) => {
    const { name, description } = req.body;
    const { id } = req.params;
    if (!name || !description) {
      return res.status(400).json({ error: 'Se requieren título y descripción' });
    }
    connection.query(
      'UPDATE task SET name = ?, description = ? WHERE id = ?',
      [name, description, id],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Error en la base de datos' });
        }
        res.status(200).json({ success: 'Tarea editada' });
      }
    );
  });

  // Cambiar el estado de una tarea
  router.put('/toggle_finished/:id', (req, res) => {
    const { id } = req.params;
  
    // Obtener el estado actual de la tarea
    connection.query('SELECT finished FROM task WHERE id = ?', [id], (err, rows) => {
      if (err) {
        console.error('Error al obtener la tarea:', err);
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
  
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
      }
  
      // Cambiar manualmente el estado entre 0 y 1
      const newState = rows[0].finished === 1 ? 0 : 1;
  
      // Actualizar la tarea en la base de datos
      connection.query('UPDATE task SET finished = ? WHERE id = ?', [newState, id], (err) => {
        if (err) {
          console.error('Error al actualizar la tarea:', err);
          return res.status(500).json({ error: 'Error al actualizar el estado' });
        }
  
        res.status(200).json({ success: 'Estado actualizado', finished: newState === 1 });
      });
    });
  });
  

  // Eliminar una tarea
  router.delete('/delete/:id', (req, res) => {
    const { id } = req.params;
    connection.query(
      'DELETE FROM task WHERE id = ?',
      [id],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Error en la base de datos' });
        }
        res.status(200).json({ success: 'Tarea eliminada' });
      }
    );
  });

  return router;
};
