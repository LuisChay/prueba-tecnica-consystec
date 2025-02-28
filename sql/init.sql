CREATE DATABASE tasksapp;

USE tasksapp;

CREATE TABLE user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE task (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    state BOOLEAN,
    user_id INT, -- Relaciona cada tarea con un usuario
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
