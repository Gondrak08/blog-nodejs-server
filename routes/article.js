const express = require("express");
const dbConnection = require("../connection");
const fs = require("fs");
const path = require("path");
//middleware
const upload = require("../middleware/upload");
const authentication = require("../middleware/auth");
// utils
const trucanteText = require("../utils/trucanteText");

const router = express.Router();

router.post(
  "/add",
  upload.single("thumb"),
  authentication,
  (req, res, next) => {
    const { userId, title, content } = req.body;

    const image = req.file.path;

    const query =
      "insert into articles (userId, title, image, content) values(?,?,?,?)";

    dbConnection.query(
      query,
      [userId, title, image, content],
      (err, result) => {
        if (!err) {
          return res.status(200).json({ message: "article has been added" });
        } else {
          return res.status(500).json(err);
        }
      },
    );
  },
);

router.delete("/delete/:id", authentication, (req, res) => {
  const id = req.params.id;
  const query = "delete from articles where id=?";
  dbConnection.query(query, [id], (err, result) => {
    if (!err) {
      if (result.affectedRows == 0) {
        return res.status(404).json({ message: "article id does not found" });
      } else {
        return res.status(200).json({ message: "article deleted" });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

router.patch("/edit/:id", authentication, (req, res) => {
  const id = req.params.id;
  const article = req.body;
  const query = "update articles set title=?, content=? where id=?";
  dbConnection.query(
    query,
    [article.title, article.content, id],
    (err, result) => {
      if (!err) {
        if (result.affectedRows == 0) {
          return res.status(404).json({ message: "article id does not found" });
        } else {
          return res
            .status(200)
            .json({ message: "article updated succesfullt" });
        }
      } else {
        return res.status(500).send({ message: "something went wrong" }, err);
      }
    },
  );
});

router.patch("/updateImage", authentication, (req, res) => {
  const image = req.file.path;
  const id = req.body.id;
  const query = "update articles set image=? where id=?";

  dbConnection.query(query, [image, id], (err, result) => {
    if (!err) {
      return res.status(200).json({ message: "image changed succesfully" });
    } else {
      return res.status(500).send({ message: "something went wrong" }, err);
    }
  });
});

router.get("/getAll", (req, res) => {
  const query = "SELECT * FROM articles";
  dbConnection.query(query, (err, results) => {
    if (err) {
      res.status(500).send({ message: "could not get articles" });
    } else {
      const processedResults = results.map((article) => {
        const { content, ...rest } = article;
        const resumedContent = trucanteText(content, 5);
        return { content: resumedContent, ...rest };
      });
      res.json(processedResults);
    }
  });
});

router.get("/getById/:id", (req, res) => {
  const id = req.params.id;
  const query = "SELECT * FROM articles WHERE id=?";
  dbConnection.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).send({ message: "something whent wrong" }, err);
    } else if (results.length === 0) {
      res.status(404).send({ message: "article not found" });
    } else {
      res.json(results[0]);
    }
  });
});

router.get("/getMarkdownById/:id/markdown", (req, res) => {
  const id = req.params.id;
  const query = "select * from articles where id=?";

  dbConnection.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).send({ message: "something whent wrong", err });
    } else if (results.length === 0) {
      res.status(404).send({ message: "article not found" });
    } else {
      const { title, image, content } = results[0];
      const markdown = `# ${title}\n\n${content}`;

      // save content as a markdown file
      const filename = `${title}.md`;
      const filePath = path.join(__dirname, "articles", filename);
      fs.writeFile(filePath, markdown, (err) => {
        if (err) {
          res.status(500).send({
            message:
              "something went wrong while trying to save the file as a markdown file",
            err,
          });
        } else res.sendFile(filePath);
      });
    }
  });
});

module.exports = router;
