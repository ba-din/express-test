import dotenv from 'dotenv';
import db from './app/models/index.js';
import keyConstants from './app/constants/keyConstants.js';
import moment from 'moment-timezone';
import bcrypt from 'bcryptjs';
import {v4 as generateUuid} from 'uuid';

try {
  db.sequelize.authenticate();
  console.log('Connection has been established successfully.');
  db.sequelize.sync({force: true }).then(async () => {

    const user = {
      name: 'badin',
      password: bcrypt.hashSync('secret', 10),
      id: 'aaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    await db.user.create(user).catch((error) => { console.log(error) })

    const token = {
      id: 'aae91940-26d7-42d2-a095-fb1862e2a78d',
      token: 'ee04f896-fc73-4115-afe3-924f3e0e87a0',
      userId: 'aaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      expiredAt: new Date(Date.now() + keyConstants.SESSION_DURATION) // added one day interval
    }
    await db.accessToken.create(token).catch((error) => { console.log(error) })

    const evouche1 = {
      id: generateUuid(),
      title: 'iTune',
      desc: 'Apple Store',
      image: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/ITunes_12.2_logo.png',
      price: 10.00,
      paymentMethod: [
        {name: 'master_card', discount: 10, discountType: 'percent'},
        {name: 'visa_card', discount: 5, discountType: 'percent'},
      ],
      status: 1,
    }
    await db.eVoucher.create(evouche1).catch((error) => { console.log(error) })
  });
} catch (error) {
  console.error('Unable to connect to the database:', error);
}