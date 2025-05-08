const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Profile = sequelize.define("profile", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  nickname: DataTypes.STRING,
  profile_image: DataTypes.STRING
}, {
  tableName: "profile",
  timestamps: false
});

module.exports = Profile;
