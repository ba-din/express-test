import moment from "moment";
import errorConstants from "../constants/errorConstants.js";
import db from './index.js';

const EVoucher = (sequelize, Sequelize) => {
  return sequelize.define('eVoucher', {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    desc: {
      type: Sequelize.STRING,
    },
    image: { type: Sequelize.STRING },
    price: {type: Sequelize.FLOAT(11, 2), allowNull: false},
    paymentMethod: { type: Sequelize.JSON, defaultValue: [] }, // [{name, discount, discountType: ['value', 'percent']}]
    // qty: {type: Sequelize.NUMBER, defaultValue: 0}, // STOCK quantity
    status: {type:Sequelize.BOOLEAN, defaultValue: false}, // status === true -> active  
    createdAt: { type: Sequelize.DATE, defaultValue: new Date() },
    updatedAt: { type: Sequelize.DATE, defaultValue: new Date() },
  })
}

export const list = async (req, res) => {
  await db.eVoucher.findAll().then((eVouchers) => {
    if(eVouchers) res.json({status: 200, data: eVouchers || []})
  })
}



export default EVoucher;