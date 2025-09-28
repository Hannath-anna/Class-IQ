const express = require("express")
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const config = require('./config');
const path = require('path'); 

const app = express()

app.use(cors());
// to convert fornt end form values into readble object format
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

  const courseRoutes = require("./router/course.router")
  app.use("/api/courses", courseRoutes)

  const authRoutes = require("./router/auth.router");
  app.use("/api/auth", authRoutes);

  const userRoutes = require("./router/user.router");
  app.use("/api/users", userRoutes);

  const profileRoutes = require("./router/profile.router");
  app.use("/api/profile", profileRoutes);

  const adminRoutes = require("./router/admin.router");
  app.use("/api/admin", adminRoutes);

  const port = config.PORT;
  app.listen(port, () => console.log(`Server is running at http://localhost:${port}`));
}); 