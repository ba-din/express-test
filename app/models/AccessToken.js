import errorConstants from "../constants/errorConstants.js";
import db from './index.js';
import moment from 'moment';
import { v4 as generateUuid } from 'uuid';
import keyConstants from '../constants/keyConstants.js';

const AccessToken = (sequelize, Sequelize) => {
  return sequelize.define('accessToken', {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    userId: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    token: {
      type: Sequelize.STRING,
      allowNull: false
    },
    expiredAt: { type: Sequelize.DATE, allowNull: false },
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
  })
}

export const getAccessToken = async (req, res) => {
  const { userId, enableRefresh } = { ...req.body }

  if (!userId) res.json({ status: 400, message: errorConstants.BAD_REQUEST })

  db.accessToken.findOne({ where: { userId } })
    .then((accessToken) => {
      if (!accessToken) {
        // Forbidden
        res.json({
          status: 403,
          message: errorConstants.FORBIDDEN
        });
      } else if ( //Expired Token
        new Date(accessToken.expiredAt) <= new Date(moment.utc(new Date()).format())
      ) {
        if (!enableRefresh) res.json({ status: 504, message: errorConstants.SESSION_TIME_OUT });
        // Do refresh token
        const newToken = refreshToken(accessToken.token)
        res.json({
          status: 200,
          data: newToken
        })
      }

      res.json({
        status: 200,
        data: {
          accessToken: accessToken.token,
          expiredAt: accessToken.expiredAt
        }
      });
    })
    .catch((error) => {
      console.log(error)
      res.json({
        status: 500,
        message: errorConstants.INTERNAL_SERVER_ERROR
      });
    })
}

export const refreshToken = async (token) => {
  const accessToken = {}
  const newToken = generateUuid();
  const expiredAt = new Date(Date.now() + keyConstants.SESSION_DURATION)
  Object.assign(accessToken, {
    token: newToken,
    expiredAt: expiredAt,
    updatedAt: moment.utc(new Date())
  });

  await db.accessToken.update(
    accessToken,
    { where: { token } }
  )
  return accessToken
}

export default AccessToken;