require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });

module.exports = {
  [process.env.NODE_ENV]: {
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    dialect: 'postgres',
  }
};