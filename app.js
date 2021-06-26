import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './app/models/index.js';

const app = express()
dotenv.config()

const PORT = process.env.PORT || 8080;

try {
  db.sequelize.authenticate();
  console.log('Connection has been established successfully.');
  db.sequelize.sync({ force: true }).then(() => {
    app.use(cors({
      origin: process.env.CLIENT_HOST
    }));
    
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    app.get("/", (req, res) => {
      res.json({ message: "Welcome to express test application." });
    });
  });
} catch (error) {
  console.error('Unable to connect to the database:', error);
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});