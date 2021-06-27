const User = (sequelize, Sequelize) => {
  return sequelize.define('user', {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    buyLimt: {type: Sequelize.INTEGER, defaultValue: 10},
    createdAt: { type: Sequelize.DATE },
    updatedAt: { type: Sequelize.DATE },
  })
}

export default User;