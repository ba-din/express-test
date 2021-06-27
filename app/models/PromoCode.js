import errorConstants from '../constants/errorConstants.js';
import db from './index.js';
import voucherCodes from 'voucher-code-generator';
import { v4 as generateUuid } from 'uuid';
import Sqelz from 'sequelize';

const PromoCode = (sequelize, Sequelize) => {
  return sequelize.define('promoCode', {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    eVoucherId: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    code: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    receiverName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    phoneNo: {
      type: Sequelize.STRING,
      allowNull: false
    },
    usable: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    buyFor: {
      type: Sequelize.STRING,
      defaultValue: 'self'
    },
    createBy: {
      type: Sequelize.STRING,
      allowNull: false
    },
    createdAt: { type: Sequelize.DATE, defaultValue: new Date() },
    updatedAt: { type: Sequelize.DATE, defaultValue: new Date() },
  })
}

export const purchase = async (req, res) => {
  const { userUuid, giftLimit, eVoucherId, receiverName, phoneNo, buyFor = 'self' } = { ...req.body }
  const Op = Sqelz.Op;
  if (
    !userUuid || !eVoucherId || !receiverName || !phoneNo
    || !['self', 'others'].includes(buyFor) ||
    (buyFor === 'others' && !giftLimit)
  )
    res.json({ status: 400, message: errorConstants.BAD_REQUEST })

  if (!Number(phoneNo))
    res.json({ status: 400, message: errorConstants.INVALID_PHONE_NO })


  await db.eVoucher.findByPk(eVoucherId)
    .then(async (eVoucher) => {
      if (!eVoucher)
        res.json({ status: 404, message: errorConstants.NOT_FOUND })

      if (eVoucher.qty < 1)
        res.json({ status: 410, message: errorConstants.LIMIT_REACH_VOUCER })

        const createPromoCode = async () => {
          await db.promoCode.create({
            receiverName,
            eVoucherId,
            phoneNo,
            buyFor,
            createBy: userUuid,
            id: generateUuid(),
            code: voucherCodes.generate({ length: 8 })[0],
          }).then((promo) => {
            eVoucher.update({ qty: eVoucher.qty - 1 })
      
            res.json({ status: 200, data: promo, message: "Successful Created Promocode" })
          })
        }

      if (buyFor === 'others') {
        await db.promoCode.findAll({
          [Op.and]: [
            { createBy: userUuid },
            { buyFor: 'others' }
          ]
        }).then(async (promoCodes) => {
          if (giftLimit <= promoCodes.length) {
            res.json({ status: 400, message: errorConstants.LIMIT_REACH_GIFT })
          } else {
            createPromoCode()
          }
        })
      } else {
        createPromoCode()
      }

    })
}
export default PromoCode;