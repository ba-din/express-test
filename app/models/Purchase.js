const Purchase = (sequelize, Sequelize) => {
  return sequelize.define('purchase', {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    eVoucherId: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    paymentMethod: {type: Sequelize.ENUM('master_card, visa_card'), allowNull: false},
    qty: {type: Sequelize.BIGINT, defaultValue: 1},
    buyType: {type: Sequilize.JSONB, allowNull: false}, // {type: [self, gift], receiver: [name, phoneNumber, giftLimit]} 
    totalAmount: {type: Sequelize.FLOAT(11, 2), allowNull: false},
    discountAmount:   {type: Sequelize.FLOAT(11, 2), allowNull: false}
  })
}

export default User;