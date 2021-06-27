import db from '../models/index.js';
import moment from 'moment';
import Sequlize from 'sequelize';
import keyConstants from '../constants/keyConstants.js';
import errorConstants from '../constants/errorConstants.js';

const verifyToken = async (req, res, next) => {
  const bearerHeader = req.headers['authorization'];

  if (!bearerHeader) res.json({ status: 403, message: errorConstants.FORBIDDEN });
  const bearer = bearerHeader.split(' ');
  const bearerToken = bearer[1];

  db.accessToken.findOne({
    where: { token: bearerToken }
  })
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
        res.json({ status: 504, message: errorConstants.SESSION_TIME_OUT });
      } else {
        next()
      }
    })
    .catch((error) => {
      res.json({
        status: 500,
        message: errorConstants.INTERNAL_SERVER_ERROR
      });
    })
}

export default verifyToken;