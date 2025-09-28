require('dotenv').config(); 
module.exports = {
  development: {
    username: process.env.USER,    
    password: process.env.PASSWORD,
    database: process.env.DB,      
    host: process.env.HOST,        
    dialect: "mysql",
    logging: console.log, 
    pool: { max: 5, min: 0, idle: 10000, acquire: 30000 }
  },
  test: {
    username: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DB + '_test',
    host: process.env.HOST,
    dialect: "mysql"
  },
  production: {
    username: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DB,
    host: process.env.HOST,
    dialect: "mysql"
  }
};