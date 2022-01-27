// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require("fs");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ThreadsPlugin = require("threads-plugin");
module.exports = {
  devServer: {
    https: {
      key: fs.readFileSync(`${__dirname}/cert/server.key`),
      cert: fs.readFileSync(`${__dirname}/cert/server.crt`),
    },
  },
  configureWebpack: {
    plugins: [new ThreadsPlugin({ globalObject: "self" })],
  },
  pages: {
    index: {
      entry: "src/main.ts",
      title: "SinicaASR",
    },
  },
};
