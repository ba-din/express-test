import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './app/models/index.js';
import bcrypt from 'bcryptjs';
import verifyToken from './app/util/verifyToken.js';
import {
  getAccessToken
} from './app/models/AccessToken.js';
import User from './app/models/User.js';
import {
  list as getEVoucherList,
  updateStatus as updateEVoucherStatus,
  create as createEVoucher,
  update as updateEVoucher,
  detail as getDetailEVoucher
} from './app/models/EVoucher.js';
import errorConstants from './app/constants/errorConstants.js';

const app = express()
dotenv.config()

const PORT = process.env.PORT || 8080;

try {
  db.sequelize.authenticate();
  console.log('Connection has been established successfully.');
  db.sequelize.sync({}).then(() => {
    app.use(cors({
      origin: process.env.CLIENT_HOST
    }));

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.get("/", (req, res) => {
      res.json({ message: "Welcome to express test application." });
    });

    app.post("/api/login", (req, res) => {
      const { username, password } = { ...req.body }
      if (!username || !password) res.json({ status: 400, message: errorConstants.BAD_REQUEST })

      db.user.findOne({ name: username })
        .then((user) => {
          const verified = bcrypt.compareSync(password, user.password);
          if (verified) {
            delete user.password;
            res.json({
              status: 200,
              data: { id: user.id, name: user.name }
            })
          }
          throw new Error
        }).catch((error) => {
          res.json({
            status: 403,
            message: errorConstants.LOGIN_FAIL
          })
        })
    });

    app.post("/api/getAccessToken", (req, res) => {
      getAccessToken(req, res)
    });


    app.get("/api/e-vouchers", verifyToken, (req, res) => {
      getEVoucherList(req, res)
    })

    app.post("/api/e-voucher/detail", verifyToken, (req, res) => {
      getDetailEVoucher(req, res)
    })

    app.post("/api/e-voucher/create", verifyToken, (req, res) => {
      createEVoucher(req, res)
    })

    app.post("/api/e-voucher/update", verifyToken, (req, res) => {
      updateEVoucher(req, res)
    })

    app.post("/api/e-voucher/updateStatus", verifyToken, (req, res) => {
      updateEVoucherStatus(req, res)
    })
  });
} catch (error) {
  console.error('Unable to connect to the database:', error);
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});