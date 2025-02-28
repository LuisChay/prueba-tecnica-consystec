const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const key = process.env.AES_KEY;  // Clave de 32 bytes
const jwt = require('jsonwebtoken');
const jwtsecret = process.env.JWT_SECRET;
const jwtexpire = process.env.JWT_EXPIRES_IN;  
const jwtmaxage = process.env.JWT_MAX_AGE;      
const jwtRenewalWindow = process.env.JWT_RENEWAL_WINDOW; 

const express = require('express');
const crypto = require('crypto');
const router = express.Router();



module.exports = (connection) => {
  // Ruta para crear un task
  router.post('/create', (req, res) => {
    const {title, description, user_id} = req.body;
    if (!title || !description || !user_id) {
      return res.status(400).json({ error: 'Se requieren titulo y descripcion' });
    }
    connection.query(
      'INSERT INTO task (title, description, state, user_id) VALUES (?, ?, ?, ?)',
      [title, description, false , user_id],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Error en la base de datos' });
        }
        res.status(200).json({ success: 'Tarea creada' });
      }
    );
  });

  // Ruta para obtener todas las tareas de un usuario
  router.get('/get_tasks/:user_id', (req, res) => {
    const { user_id } = req.params;
    connection.query(
      'SELECT * FROM task WHERE user_id = ?',
      [user_id],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Error en la base de datos' });
        }
        res.status(200).json(result);
      }
    );
  });

    // Ruta para obtener una tarea
    router.get('/get_task/:id', (req, res) => {
        const { id } = req.params;
        connection.query(
        'SELECT * FROM task WHERE id = ?',
        [id],
        (err, result) => {
            if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error en la base de datos' });
            }
            res.status(200).json(result[0]);
        }
        );
    });


  // Ruta para editar una tarea
    router.put('/update/:id', (req, res) => {
        const { title, description } = req.body;
        const { id } = req.params;
        if (!title || !description) {
        return res.status(400).json({ error: 'Se requieren titulo y description' });
        }
        connection.query(
        'UPDATE task SET title = ?, description = ? WHERE id = ?',
        [title, description, state, id],
        (err, result) => {
            if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error en la base de datos' });
            }
            res.status(200).json({ success: 'Tarea editada' });
        }
        );
    });

    // Ruta para eliminar una tarea
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
