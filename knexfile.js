// require('dotenv').config();
const config = require('./config');

module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      host: config.DB_HOST,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      database: config.DB_NAME,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './db/migrations'
    }
  }
};
