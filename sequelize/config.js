const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.production') });

console.log('POSTGRES_HOST:', process.env.POSTGRES_HOST);

module.exports = {
  production: {
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    dialect: 'postgres',
    logging: false
  }
};
