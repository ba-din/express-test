import moment from "moment";
import errorConstants from "../constants/errorConstants.js";
import db from './index.js';
import {v4 as generateUuid} from 'uuid'

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
    price: {type: Sequelize.FLOAT(11, 2), allowNull: false},
    paymentMethods: { type: Sequelize.JSON, defaultValue: [] }, // [{name, discount, discountType: ['value', 'percent']}]
    status: {type:Sequelize.BOOLEAN, defaultValue: false}, // status === true -> active 
    expiredAt: { type: Sequelize.DATE, allowNull: false }, 
    createdAt: { type: Sequelize.DATE, defaultValue: new Date() },
    updatedAt: { type: Sequelize.DATE, defaultValue: new Date() },
  })
}

export const list = async (req, res) => {
  await db.eVoucher.findAll().then((eVouchers) => {
    if(eVouchers) res.json({status: 200, data: eVouchers || []})
  })
}

export const create = async (req, res) => {
  const {
    title, desc, image, price,
    qty, paymentMethods, expiredAt
  } = {...req.body}

  if(!title || !price || !qty || !expiredAt  ) res.json({ status: 400, message: errorConstants.BAD_REQUEST })

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
    }).catch((error) => {
      console.log('EVoucher > create ',error)
      res.json({
        status: 500,
        message: errorConstants.INTERNAL_SERVER_ERROR
      })
    })
  })
}

export const updateStatus = async (req, res) => {
  const {id, status} = {...req.body}

  if(!id, !status) res.json({ status: 400, message: errorConstants.BAD_REQUEST })

  await db.eVoucher.findByPk(id)
  .then((item) => {
    if(!item) res.json({status: 404, message: errorConstants.NOT_FOUND})

    item.update({status, updatedAt: new Date()})

    res.json({status: 200, data: item, message: "Successful status update"})
  })
}



export default EVoucher;