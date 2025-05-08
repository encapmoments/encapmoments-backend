// models/index.js
const User = require("./User");
const Profile = require("./Profile");
const FamilyMember = require("./FamilyMember");
const DailyMission = require("./DailyMission");
const WeeklyMission = require("./WeeklyMission");

// 관계 설정
User.hasOne(Profile, { foreignKey: "id", as: "profile" });
Profile.belongsTo(User, { foreignKey: "id" });

User.hasMany(FamilyMember, { foreignKey: "user_id", as: "members" });
FamilyMember.belongsTo(User, { foreignKey: "user_id" });

DailyMission.belongsTo(User, { foreignKey: "id" });
User.hasMany(DailyMission, { foreignKey: "id" });

WeeklyMission.belongsTo(User, { foreignKey: "id" });
User.hasMany(WeeklyMission, { foreignKey: "id" });

module.exports = { User, Profile, FamilyMember, DailyMission, WeeklyMission };
