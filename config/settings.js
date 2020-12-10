const secrets = require("./secrets");

const env = process.env.NODE_ENV || "dev";

const config = () => {
  switch (env) {
    case "dev":
      return {
        dbpath: secrets.MONGO_URL,
        jwt_key: "Navegacao",
        jwt_expires: "2d",
      };
    case "prod":
      return {
        dbpath: secrets.MONGO_URL,
      };
  }
};

module.exports = config();
