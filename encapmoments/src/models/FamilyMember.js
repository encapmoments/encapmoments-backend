// models/FamilyMember.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const FamilyMember = sequelize.define("family_member", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  member_name: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  member_image: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: "family_member",
  timestamps: false
});

module.exports = FamilyMember;
