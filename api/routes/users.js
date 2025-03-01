const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const bcrypt = require('bcrypt'); // Nuevo: para el hash de contraseñas
const jwt = require('jsonwebtoken');
const router = express.Router();

const jwtsecret = process.env.JWT_SECRET;
const jwtexpire = process.env.JWT_EXPIRES_IN;
const jwtmaxage = process.env.JWT_MAX_AGE;
const jwtRenewalWindow = process.env.JWT_RENEWAL_WINDOW;

module.exports = (connection) => {
  // Ruta para registrar un usuario 
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
      return res.status(400).json({ error: 'Se requieren username, email y password' });
  }

  // Verificar si el correo ya está registrado
  connection.query(
      'SELECT id FROM user WHERE email = ?',
      [email],
      async (err, result) => {
          if (err) {
              console.error(err);
              return res.status(500).json({ error: 'Error en la base de datos' });
          }
          if (result.length > 0) {
              return res.status(409).json({ error: 'El correo ya está registrado' }); // Código 409: Conflicto
          }

          try {
              // Hashear la contraseña con bcrypt
              const hashedPassword = await bcrypt.hash(password, 10);

              // Insertar nuevo usuario
              connection.query(
                  'INSERT INTO user (username, email, password) VALUES (?, ?, ?)',
                  [username, email, hashedPassword],
                  (err, result) => {
                      if (err) {
                          console.error(err);
                          return res.status(500).json({ error: 'Error en la base de datos' });
                      }
                      res.json({ success: 'Usuario registrado' });
                  }
              );
          } catch (error) {
              console.error(error);
              res.status(500).json({ error: 'Error al procesar la solicitud' });
          }
      }
  );
});


// Ruta para iniciar sesión
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Se requieren email y password' });
  }

  connection.query(
    'SELECT id, username, password FROM user WHERE email = ?',
    [email],
    async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      if (result.length === 0) {
        return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
      }

      // Verificar la contraseña con bcrypt
      const isMatch = await bcrypt.compare(password, result[0].password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
      }

      // Extraer id y username
      const { id, username } = result[0];

      // Generar el token JWT con id y username
      const token = jwt.sign({ id, username }, jwtsecret, {
        expiresIn: jwtexpire,
      });

      res.cookie('token', token, { httpOnly: true, maxAge: parseInt(jwtmaxage) });
      res.json({ success: 'Usuario logueado' });
    }
  );
});


  // Ruta protegida para obtener el perfil del usuario
router.get('/profile', (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'No se proporcionó token' });
  }

  jwt.verify(token, jwtsecret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    res.json({ id: decoded.id, username: decoded.username });
  });
});

  // Ruta para el logout del usuario
  router.post('/logout', (req, res) => {
    res.clearCookie('token', { httpOnly: true });
    res.json({ success: 'Usuario ha cerrado sesión' });
  });

  // Ruta para renovar el token JWT
  router.get('/renew', (req, res) => {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: 'No hay token disponible' });
    }

    try {
      const decoded = jwt.verify(token, jwtsecret, { ignoreExpiration: true });
      const now = Math.floor(Date.now() / 1000);
      if (now < decoded.exp) {
        return res.json({ success: 'El token aún es válido' });
      }

      const renewalWindow = parseInt(jwtRenewalWindow);
      if (now - decoded.exp > renewalWindow) {
        return res.status(401).json({ error: 'Token expirado y fuera del periodo de renovación' });
      }

      // Renovar el token
      const newToken = jwt.sign({ username: decoded.username }, jwtsecret, {
        expiresIn: jwtexpire,
      });

      res.cookie('token', newToken, { httpOnly: true, maxAge: parseInt(jwtmaxage) });
      return res.json({ success: 'Token renovado', token: newToken });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al renovar el token' });
    }
  });

  return router;
};
