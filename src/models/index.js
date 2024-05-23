const EmailCode = require("./EmailCode");
const User = require("./User");

//relacion de uno a uno
EmailCode.belongsTo(User);
User.hasOne(EmailCode);
