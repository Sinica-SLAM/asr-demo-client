// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require("fs");
module.exports = {
  devServer: {
    https: {
      key: fs.readFileSync(`${__dirname}/cert/server.key`),
      cert: fs.readFileSync(`${__dirname}/cert/server.crt`),
    },
  },
};
