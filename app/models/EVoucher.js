import moment from "moment";
import errorConstants from "../constants/errorConstants.js";
import db from './index.js';
import { v4 as generateUuid } from 'uuid'
import voucherCodes from 'voucher-code-generator';

const EVoucher = (sequelize, Sequelize) => {
  return sequelize.define('eVoucher', {
    id: {
      type: Sequelize.STRING,
      defaultValue: generateUuid(),
      primaryKey: true,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    qty: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    desc: {
      type: Sequelize.STRING,
    },
    image: { type: Sequelize.STRING },
    price: { type: Sequelize.FLOAT(11, 2), allowNull: false },
    paymentMethods: { type: Sequelize.JSON, defaultValue: [] }, // [{name, discount, discountType: ['value', 'percent']}]
    status: { type: Sequelize.BOOLEAN, defaultValue: false }, // status === true -> active 
    expiredAt: { type: Sequelize.DATE, allowNull: false },
    createdAt: { type: Sequelize.DATE, defaultValue: new Date() },
    updatedAt: { type: Sequelize.DATE, defaultValue: new Date() },
  })
}

export const list = async (req, res) => {
  await db.eVoucher.findAll().then((eVouchers) => {
    if (eVouchers) res.json({ status: 200, data: eVouchers || [] })
  })
}

export const create = async (req, res) => {
  const {
    title, desc, image, price,
    qty, paymentMethods, expiredAt
  } = { ...req.body }

  if (!title || !price || !qty || !expiredAt)
    res.json({ status: 400, message: errorConstants.BAD_REQUEST })

  await db.eVoucher.create({
    id: generateUuid(),
    title,
    desc,
    image,
    price,
    qty,
    paymentMethods,
    expiredAt: expiredAt,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).then((item) => {
    res.json({
      status: 200,
      data: item,
      message: "Successful create new e-Voucher"
    })
  }).catch((error) => {
    console.log('EVoucher > create ', error)
    res.json({
      status: 500,
      message: errorConstants.INTERNAL_SERVER_ERROR
    })
  })
}

export const detail = async (req, res) => {
  const { id } = { ...req.body }
  if (!id) res.json({ status: 400, message: errorConstants.BAD_REQUEST })
  await db.eVoucher.findByPk(id)
    .then((item) => {
      if (!item) res.json({ status: 404, message: errorConstants.NOT_FOUND })

      res.json({ status: 200, data: item })
    })
    .catch((error) => {
      console.log('EVoucher > detail', error.message)
      res.json({
        status: 500,
        message: errorConstants.INTERNAL_SERVER_ERROR
      })
    })
}

export const update = async (req, res) => {
  const {
    id, title, desc, image, price,
    qty, paymentMethods, expiredAt
  } = { ...req.body }

  if (!id, !title || !price || !qty || !expiredAt) res.json({ status: 400, message: errorConstants.BAD_REQUEST })

  await db.eVoucher.findByPk(id)
    .then((item) => {
      if (!item) res.json({ status: 404, message: errorConstants.NOT_FOUND })
      const data = {
        title,
        desc,
        image,
        price,
        qty,
        paymentMethods,
        expiredAt,
        updatedAt: new Date()
      }
      item.update(data)
      res.json({ status: 200, data, message: "Successful e-voucher update" })
    }).catch((error) => {
      console.log('EVoucher > update', error.message)
      res.json({
        status: 500,
        message: errorConstants.INTERNAL_SERVER_ERROR
      })
    })
}

export const updateStatus = async (req, res) => {
  const { id, status } = { ...req.body }

  if (!id || typeof status !== 'boolean') res.json({ status: 400, message: errorConstants.BAD_REQUEST })

  await db.eVoucher.findByPk(id)
    .then((item) => {
      if (!item) res.json({ status: 404, message: errorConstants.NOT_FOUND })

      item.update({ status, updatedAt: new Date() })
      item.status = status

      res.json({ status: 200, data: item, message: "Successful status update" })
    }).catch((error) => {
      console.log('EVoucher > updateStatus', error.message)
      res.json({
        status: 500,
        message: errorConstants.INTERNAL_SERVER_ERROR
      })
    })
}

export const purchaseEVoucher = async (req, res) => {
  const { id, paymentMethod, cardNumber, cardHolderName, phoneNo } = { ...req.body }

  if (!id || !paymentMethod || !cardNumber || !cardHolderName || !phoneNo)
    res.json({ status: 400, message: errorConstants.BAD_REQUEST })

  db.eVoucher.findByPk(id)
    .then((eVoucher) => {

      if (!eVoucher) res.json({ status: 400, message: errorConstants.EVOUCHER_NOT_FOUND })

      else if (eVoucher.qty < 1)
        res.json({ status: 400, message: errorConstants.LIMIT_REACH_VOUCER })

      else if(!eVoucher.status )
        res.json({ status: 400, message: errorConstants.LUNACTIVE_EVOUCHER })

      else {
        db.promoCode.create({
          receiverName: cardHolderName,
          eVoucherId: id,
          phoneNo: phoneNo,
          id: generateUuid(),
          code: voucherCodes.generate({ length: 11 })[0],
        }).then((promo) => {
          eVoucher.update({ qty: Math.max(eVoucher.qty - 1, 0) })
  
          const payment = eVoucher.paymentMethods.filter((payment) => payment.name ===paymentMethod )[0];
          let discountPrice = eVoucher.price
          if(!payment) res.json({ status: 400, message: errorConstants.UNSUPPORTED_PAYMENT })
  
          if(payment.discountAmount) {
            discountPrice = payment.discount === 'percent' ?
            eVoucher.price -  (eVoucher.price * payment.discountAmount) /100 :
              Math.max(0, eVoucher.price - payment.discountAmount)
          }
          
          res.json({ status: 200, data: {
            promo,
            eVoucher,
            paymentMethod, cardNumber, cardHolderName,
            normalPrice: eVoucher.price,
            discountPrice: discountPrice,
          }, message: "Successful Created Promocode" })
        })

      }
    }).catch((error) => {
      console.log('EVouser > purchase', error.message)
    })
}

export default EVoucher;