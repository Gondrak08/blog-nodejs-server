require("dotenv").config();

const express = require("express");
const dbConnection = require("../connection");
const jwt = require("jsonwebtoken");
const authentication = require("../middleware/auth");

const router = express.Router();

router.post("/login", (req, res) => {
  const user = req.body;
  const query = "select id, name, email, password from user where email=?";
  dbConnection.query(query, [user.email], (err, result) => {
    if (!err) {
      if (result.length <= 0 || result[0].password != user.password) {
        return res
          .status(401)
          .json({ message: "wrong password, try it again" });
      } else if (result[0].password === user.password) {
        const response = {
          userId: result[0].id,
          name: result[0].name,
          email: result[0].email,
        };
        const accessToken = jwt.sign(response, process.env.TOKEN_KEY, {
          expiresIn: process.env.TOKEN_LIFE,
        });
        const refreshToken = jwt.sign(response, process.env.TOKEN_REFRESH, {
          expiresIn: process.env.TOKEN_LIFE_REFRESH,
        });

        res.status(200).json({
          token: accessToken,
          expiresIn: process.env.TOKEN_LIFE,
          tokenRefresh: refreshToken,
          name: result[0].name,
          email: result[0].email,
          id: result[0].id,
        });
      }
    } else {
      return res.status(500).json({ message: "something went wrong", err });
    }
  });
});

router.post("/signup", (req, res) => {
  const user = req.body;
  const query = "select email, name, password from user where email=?";
  dbConnection.query(query, [user.email], (err, result) => {
    if (!err) {
      if (result.length <= 0) {
        const query = "insert into user (name,email,password) values(?,?,?)";
        dbConnection.query(
          query,
          [user.name, user.email, user.password],
          (err, results) => {
            if (!err) {
              return res
                .status(200)
                .json({ message: "You are Successfully Registrated" });
            } else {
              return res.status(500).json(err);
            }
          },
        );
      } else {
        return res.status(400).json({ message: "Email already registrated!" });
      }
    }
    return res.status(500).json(err);
  });
});

router.post("/refresh-token", (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken)
    return res.status(401).json({ message: "Refresh token missing" });

  jwt.verify(refreshToken, process.env.TOKEN_REFRESH, (err, decoded) => {
    if (!err) {
      const response = {
        userId: decoded.id,
        name: decoded.name,
        email: decoded.email,
      };
      const token = jwt.sign(response, process.env.TOKEN_KEY, {
        expiresIn: process.env.TOKEN_LIFE,
      });
      const refreshToken = jwt.sign(response, process.env.TOKEN_REFRESH, {
        expiresIn: process.env.TOKEN_LIFE_REFRESH,
      });

      res.status(200).json({
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        token: token,
        expiresIn: process.env.TOKEN_LIFE,
        tokenRefresh: refreshToken,
      });
    } else {
      res.status(500).json(err);
    }
  });
});

module.exports = router;
