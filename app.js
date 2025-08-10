const express = require("express")
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const config = require('./config');
const path = require('path'); 

const app = express()

const db = mysql.createConnection({
  host: config.DB_HOST,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME
});

db.connect(error => {
  if (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  }

  console.log("Successfully connected to the database.");

  const courseRoutes = require("./router/course.router")
  app.use("/api/courses", courseRoutes)

  const port = config.PORT;
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}); 