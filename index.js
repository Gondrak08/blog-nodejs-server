const express = require("express");
const cors = require("cors");
// connection to the server
const dbConnection = require("./connection");
const router = require("./routes/user");
// import routs
const user = require("./routes/user");
const article = require("./routes/article");

const app = express();

// middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use(express.json());
const upload = require("./middleware/upload");
// declare routs
app.use("/user", user);
app.use("/articles", article);

// calling server
const PORT = 8080;
app.listen(PORT, () => {
  {
    console.log(`server is running at port ${PORT} `);
  }
});
