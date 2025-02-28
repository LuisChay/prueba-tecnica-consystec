require('dotenv').config();
const cookieParser = require('cookie-parser');

const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const app = express();
const port = process.env.PORT || 5000;

// CORS para permitir peticiones desde el frontend
app.use(cors({credentials: true, origin: ['http://localhost:4200']}));
// Middleware para manejar JSON
app.use(express.json({ limit: '2gb' }));
// Middleware para manejar cookies
app.use(cookieParser());


const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;

// Connect to MySQL
const connection = mysql.createConnection({
  host: dbHost,
  user: dbUser,
  password: dbPass,
  database: dbName,
    port: dbPort
});

connection.connect((err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Connected to MySQL');
    }
    }
);


// Importacion de rutas
const userRoutes = require('./routes/users')(connection);
const taskRoutes = require('./routes/tasks')(connection);
app.use('/users', userRoutes);
app.use('/tasks', taskRoutes);

app.listen(port, () => {
  console.log(`El servidor está corriendo en el puerto ${port}`);
});