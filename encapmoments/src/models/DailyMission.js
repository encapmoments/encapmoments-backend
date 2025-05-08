const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const DailyMission = sequelize.define("daily_mission", {
  daily_mission_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  mission_image: DataTypes.STRING,
  mission_title: DataTypes.STRING,
  mission_description: DataTypes.STRING,
  reward: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    validate: {
      min: 0,
    },
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  expires_at: {
    type: DataTypes.VIRTUAL,
    get() {
      return new Date(this.created_at.getTime() + 24 * 60 * 60 * 1000);
    },
  },
}, {
  tableName: "daily_mission",
  timestamps: false,
});

module.exports = DailyMission;