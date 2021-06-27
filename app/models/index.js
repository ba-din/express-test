import Sequelize from 'sequelize';
import dbConfig from '../db/config.js';
import AccessToken from './AccessToken.js';
import User from './User.js';
import EVoucher from './EVoucher.js';
import PromoCode from './PromoCode.js';

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  // operatorsAliases: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.sequelize = sequelize;
db.accessToken = AccessToken(sequelize, Sequelize);
db.user = User(sequelize, Sequelize);
db.eVoucher = EVoucher(sequelize, Sequelize);
db.promoCode = PromoCode(sequelize, Sequelize);

export default db;