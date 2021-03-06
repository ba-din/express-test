import errorConstants from '../constants/errorConstants.js';
import db from './index.js';
import voucherCodes from 'voucher-code-generator';
import { v4 as generateUuid } from 'uuid';
import Sqelz from 'sequelize';
import qr from '../util/qr.js'

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
    },
    createdAt: { type: Sequelize.DATE, defaultValue: new Date() },
    updatedAt: { type: Sequelize.DATE, defaultValue: new Date() },
  })
}

export const createByCMS = async (req, res) => {
  const { userId, giftLimit, eVoucherId, receiverName, phoneNo, buyFor = 'self' } = { ...req.body }
  const Op = Sqelz.Op;
  if (
    !userId || !eVoucherId || !receiverName || !phoneNo
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
            createBy: userId,
            id: generateUuid(),
            code: voucherCodes.generate({ length: 11 })[0],
          }).then((promo) => {
            eVoucher.update({ qty: Math.max(eVoucher.qty - 1, 0) })
      
            res.json({ status: 200, data: promo, message: "Successful Created Promocode" })
          })
        }

      if (buyFor === 'others') {
        await db.promoCode.findAll({
          [Op.and]: [
            { createBy: userId },
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

export const verify = async (req, res) => {
  const {phoneNo, code} = {...req.body}
  if(!phoneNo || !code) res.json({ status: 400, message: errorConstants.BAD_REQUEST })

  const Op = Sqelz.Op;

  db.promoCode.findOne({
    where: [
      {phoneNo},
      {code},
      {usable: true}
    ]
  }).then((promoCode) => {
    if(!promoCode) res.json({ status: 404, message: errorConstants.INVALID_PROMO_CODE })

    promoCode.update({usable: false})
    res.json({
      satatus: 200,
      data: promoCode
    })
  })

}

export const puschaseHistory = async (req, res) => {
  db.promoCode.findAll({
    where: [
      {usable: false}
    ]
  }).then((usedPromoCodes) => {
    db.promoCode.findAll({
      where: [
        {usable: true}
      ]
    }).then((activePromoCodes) => {

      res.json({status: 200, 
        data: {
          usedPromoCodes: usedPromoCodes.map((promoCode) => {
            return {
              code: promoCode.code, 
              image: qr.getQrUrl(`${promoCode.code}:${promoCode.phoneNo}`) 
            }
          }),
          activePromoCodes: activePromoCodes.map((promoCode) => {
            return {
              code: promoCode.code, 
              // image: qr.getQrUrl(`${promoCode.code}:${promoCode.phoneNo}`) 
            }
          })
        }
      })
    })


  })
}
export default PromoCode;