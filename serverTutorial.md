# Apresentação

Olá, como vai? Eu sou o Vitor e estou de volta com um novo projeto. Já se passou algum tempo desde o meu último tutorial, pois estive ocupado com outras atividades nos últimos meses. No entanto, é hora de retornarmos ao fascinante mundo do código.

Hoje, vamos criar um servidor em Node.js para uma página de blog. Nosso servidor terá a capacidade de registrar usuários e autenticá-los usando JWT. Além disso, abordaremos temas como registro, consultas, edição e remoção de dados, como texto e imagens, do banco de dados MySQL.

Com a sua API pronta, você poderá alimentar a sua aplicação frontend. Caso ainda não tenha um site, siga para o tutorial de frontend*.

Ao longo deste tutorial, vou me esforçar para ser o mais sucinto e claro possível.

Espero que você se divirta.

Bom código.


## Bibliotecas

Aqui estão as bibliotecas que utilizaremos em nossa aplicação.

- [bcryptjs](https://www.npmjs.com/package/bcryptjs) - uma biblioteca de criptografia para senhas.
- [cors](https://www.npmjs.com/package/cors) - uma middleware que nos permite lidar com `Cross-Origin Resource Sharing (CORS)`.
- [dotenv](https://www.npmjs.com/package/dotenv) - um módulo que nos possibilita acessar variáveis em arquivos '.env'.
- [express](https://www.npmjs.com/package/express) - uma biblioteca que nos permite criar APIs RESTful.
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) - uma biblioteca para a criação dos nossos _tokens_ de autenticação.
- [multer](https://www.npmjs.com/package/multer) - o Multer é uma biblioteca que nos permitirá salvar imagens em nosso servidor.
- [mysql](https://www.npmjs.com/package/mysql) - uma biblioteca de conexão com o banco de dados MySQL.

## Arquitetura

A estrutura de pastas e arquivos de nossa aplicação.

```
server
  |
  |- middleware/
  |      |- auth.js
  |      |- upload.js
  |
  |- routes/
  |      |- user.js
  |      |- article.js
  |
  |- uploads/
  |- utils/
  |      |- trucantText.js
  |
  |- connection.js
  |- server.js
  |- tables.sql
```

## Banco de dados
Antes de prosseguirmos com nossa aplicação, é necessário criar o banco de dados. Utilizaremos o banco de dados MySQL para desenvolver nosso projeto. Você pode optar pela plataforma de gerenciamento de banco de dados com a qual estiver mais familiarizado, como DBeaver, entre outras.

No meu caso, vou utilizar o terminal:

```bash
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 14
Server version: 8.0.35-0ubuntu0.22.04.1 (Ubuntu)

Copyright (c) 2000, 2023, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>

```
Uma vez dentro de sua aplicação, crie o banco de dados:
```
mysql> create database blog_db;
```

### Declaração de Tabelas
A seguir, escreveremos as tabelas que serão utilizadas em nosso banco de dados.

Caso esteja usando o terminal, acesse seu banco de dados:
```
mysql> use blog_db;
```

Uma vez dentro do seu banco de dados, copie cada tabela abaixo e cole em seu terminal.

- 1 Usuário

```sql
create table user(
    id int primary key AUTO_INCREMENT,
    name varchar(250),
    password varchar(250),
    email varchar(50),
    role varchar(50),
    UNIQUE(email)
);
```

- 2 Artigos

```sql
create table articles(
    id int NOT NULL AUTO_INCREMENT,
    userId int NOT NULL,
    title varchar(250) NOT NULL,
    image varchar(250) DEFAULT NULL,
    content varchar(250) NOT NULL,
    primary key(id)
);
```

- 3 RefreshToken

```sql
create table refreshToken(
    id int primary key AUTO_INCREMENT,
    expiresIn int,
    userName varchar(250),
    userId int NOT NULL
);
```

O resultado final de nossas tabelas será:

```bash
mysql> show tables;
+-------------------------+
| Tables_in_blog_db |
+-------------------------+
| articles                |
| refreshToken            |
| user                    |
+-------------------------+
3 rows in set (0.00 sec)

```

Por fim, vamos criar um usuário teste com o seguinte comando dentro do banco de dados:
```bash
 mysql> insert into user(name, password, email, role) values ('admin','admin','admin@admin.com','admin');
```

## Primeiros passos

### Iniciando Aplicação

Vamos começar criando o `package.json`. No terminal de sua escolha:

```bash
npm init
```

Faça a configuração de seu `npm init` como entender.

```
This utility will walk you through creating a package.json file.
It only covers the most common items, and tries to guess sensible defaults.

See `npm help init` for definitive documentation on these fields
and exactly what they do.

Use `npm install <pkg>` afterwards to install a package and
save it as a dependency in the package.json file.

Press ^C at any time to quit.
package name: (test) 
version: (1.0.0) 
description: 
entry point: (index.js) 
test command: 
git repository: 
keywords: 
author: 
license: (ISC) 
```

### Instalando dependências

Em seguida vamos instalar as bibliotecas.

```bash
npm i express multer mysql bcryptjs cors dotenv jsonwebtoken
```

### Criando o servidor

Dentro da raiz do projeto, crie o arquivo `server.js` e adicione o seguinte código:

```javascript
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
```

*Pode ser que, neste momento, alguns dos arquivos ainda não tenham sido escritos, mas não se preocupe. Mais adiante, iremos criá-los.*

Uma vez em que todos os módulos necessários forem instalados e a conexão com o banco de dados configurada corretamente antes de iniciar o servidor
- *caso queira fazer um teste, comente do código todas as rotas e conexão com banco dedados, deixando apenas o `app.listen`* 

Podemos escrever no terminal:
```bash
$ node server.js
```
E nosso servidor irá rodar na porta 8080.

### Conexão ao Banco de Dados

Fazendo uso da biblioteca `mysql`, vamos escrever o código que conectará o nosso servidor ao banco de dados.
Lembre-se de substituir os valores pelos seus exatos para conectar ao banco de dados. Você pode registrá-los em seu arquivo `.env` para uma melhor proteção.

Crie um arquivo chamado `connection.js` com o seguinte conteúdo:

```javascript
const mysql = require("mysql");
const dbConfig = {
  host: "localhost",
  user: "your db user",
  password: "your db password",
  database: "your db",
};
const dbConnection = mysql.createConnection(dbConfig);
module.exports = dbConnection;
```

## Middleware
Dentro da pasta `middleware`, iremos escrever dois arquivos.

#### Autenticação
Dentro do arquivo `middleware/auth.js`, escreveremos o sistema responsável por validar a nossa chave de autenticação. Essa função será utilizada para proteger as rotas privadas de nossa aplicação, evitando que os dados de nosso banco de dados sejam acessados por usuários indevidos.

Primeiramente, dentro de nossa pasta raiz, vamos declarar um arquivo `.env`. Em seguida, dentro desse arquivo, vamos salvar a nossa chave de autenticação.

```
TOKEN_KEY = "ColoqueAquiOSeuToken"
TOKEN_REFRESH = "InsiraAquiSeuTokenDeVaLiDaçÃo"
TOKEN_LIFE="300" // tempo de vida do token
TOKEN_LIFE_REFRESH="400" // tempo de vida do token refresh
```

Você pode utilizar o próprio terminal para gerar o seu `token`. Primeiro, entre no *node*

```bash
$ node
```

Em seguida, utilizando da biblioteca `crypto`:

```bash
> require("crypto").randomBytes(64).toString('hex')
```
O resultado será uma linha composta de números e letras. 

Caso queira saber mais sobre `jwt`, acesse sua [documentação](https://jwt.io/introduction).

Agora vamos escrever nossa função `verifyToken` dentro do arquivo `auth.js`:

```javascript
const jwt = require("jsonwebtoken");
const config = process.env;

const verifyToken = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];
  if (!token)
    return res.status(403).send("a token is required for authentication");
  try {
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send({ message: "ivalid token" });
  }
  return next();
};

module.exports = verifyToken;
```

#### Upload de arquivos
Nosso blog fará uso de imagens na publicação de nossos artigos, para isso, vamos criar um *middleware* capaz de lidar com o `path` das imagens e redirecioná-los para uma pasta específica de nossa aplicação: `uploads/`. 
- Faremos uso da biblioteca *multer*, para saber mais, acesse a sua [documentação](https://www.npmjs.com/package/multer).

Crie um arquivo chamado `uploads.js` dentro da pasta `middleware`:

```javascript
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10,
  },
});

module.exports = upload;
```

## Utilitários
Dentro de `utils/`, iremos escrever a função `truncanteText`. Seu uso é simples. A função recebe um texto e retorna dele uma parte pequena. Ela será usada para enviar um pequeno resumo do conteúdo do artigo como consulta de nossa API.

Crie um arquivo chamado `truncanteText.js` dentro da pasta `utils` com o seguinte conteúdo:

```javascript
const trucanteText = (content, limit) => {
  const filteredContent = content.replace(/#{1,3}\s|```/g, "");
  const words = filteredContent.split(" ");
  if (words.length > limit) {
    return words.slice(0, limit).join(" ") + "...";
  }
  return content;
};

module.exports = trucanteText;
```


### Rotas

#### Usuário(User)
Para escrever nossas rotas de usuário, utilizaremos as bibliotecas:
* `express` - para a criação de nossas rotas.
* `jsonwebtoken` - para a criação de nossa autenticação e sua chave de assinatura.
* `connection.js` - o nosso módulo de conexão para realizar as nossas *queries* ao banco de dados.

Em `routes/user.js`:

```js
require("dotenv").config();
const express = require("express");
const dbConnection = require("../connection");
const jwt = require("jsonwebtoken");

const router = express.Router();
```

Em seguida, escreveremos três rotas de usuário:

##### 1 - /Signup - rota para o método de registro de novos usuários em nosso banco de dados.

1.  Defina uma rota HTTP POST para `/signup`.

```javascript
router.post("/signup", (req, res) => {
...
}
```  

2. Obtemos os dados do novo usuário,"nome", "email" e "password", através do seu *request*.

```javascript  
const user = req.body
```

3. Escrita da nossa consulta *sql*,

```
const query = "select email, name, password from user where email=?";
``` 

4. Consulta ao banco de dados, resultado final do código: 

```javascript
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
```

##### 2. /Login - vamos declarar a rota para a autenticação dos usuários em nossa aplicação.

1.  Defina uma rota HTTP POST para `/Login`. 

```javascript
router.post("/login", (req, res) => {
...
}
```  

2. Obtemos os dados do usuário, "email" e "password", através do seu *request*.

```javascript  
const user = req.body
```

3. Escrita de nossa consulta *sql*,

```javascript
const query = "select id, name, email, password from user where email=?";
``` 

4. Consulta ao banco de dados, tratamento do resultado da consulta, e geração de token: 

```javascript
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
```
Se as credenciais estiverem corretas, gera dois tokens JWT: um para o acesso regular (accessToken) e outro para `refresh` (refreshToken). Os tokens contêm informações sobre o usuário, como id, nome e email. Os tokens são assinados usando chaves secretas definidas nas variáveis de ambiente.

##### 3. /Refresh-Token - Rota para a ré-autenticação de nosso usuário na aplicação.
1. Defina uma rota HTTP POST para "/refresh-token". 

```javascript
router.post("/refresh-token",  (req, res) => {...}
```

2. Obtemos o token de atualização prévio do usuário através do `request`:

```javascript
  const refreshToken = req.body.refreshToken;
```
3. Verificamos o nosso token de atualização

```javascript
if (!refreshToken)
  return res.status(401).json({ message: "Refresh token missing" });
```

4. Renovamos os token de acesso: 

```javascript
const token = jwt.sign(response, process.env.TOKEN_KEY, {
  expiresIn: process.env.TOKEN_LIFE,
});

 const refreshToken = jwt.sign(response, process.env.TOKEN_REFRESH, {
    expiresIn: process.env.TOKEN_LIFE_REFRESH,
  });
```

5. Aqui está o resultado final:

```javascript
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
})
```

#### Artigos(Articles)

Em `routes/article.js`,  vamos começar chamando as bibliotecas:
* `express` - para a criação de nossas rotas.
* `jsonwebtoken` - para a criação de nossa autenticação e sua chave de assinatura.
* `connection.js` - o nosso módulo de conexão para realizar as nossas *queries* ao banco de dados.
* `authentication.js` - nosso *middleware* de autenticação para proteção das rotas privadas. 
* `upload.js` - nosso *middleware* para o *upload* de imagens. 

```javascript
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
//routes...
module.exports = router;
```

Em seguida vamos escrever as rotas:

##### 1.`/add` - Rota para adicionar novo artigo.

1. Definimos uma rota HTTP POST para "/add", passando o middleware `authentication` e o `upload.single("thumb")`, para o upload de uma única imagem: 

```javascript
router.post("/add", upload.single("thumb"), authentication, (req, res, next) => {
...
}
```

2. Coletamos os dados do corpo da solicitação `(req.body)` relacionados ao novo artigo, como `userId`, `title`, e `content`. Além disso, obtém o caminho da imagem carregada usando o middleware multer e o nome do campo especificado ("thumb"). 

```
...
const { userId, title, content } = req.body;
const image = req.file.path;
```

3. Escrita da consulta *sql* para inserir os dados do novo artigo dentro da tablea `articles` do banco de dados.
Os valores inseridos são obtidos das variáveis userId, title, image, e content. 

```javascript
 const query ="insert into articles (userId, title, image, content) values(?,?,?,?)";
```

4. O resultado final do nosso código:

```javascript
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
```

##### 2. `/delete/:id` - Para a remoção de artigos.

1. Defina uma rota HTTP DELETE para "/delete/:id". Esta rota será usada para remover um artigo do banco de dados. A autenticação é verificada antes de permitir a execução desta rota.

```javascript
router.delete("/delete/:id", authentication, (req, res) => {
...
}
```

2. Obtém o parâmetro id da URL usando req.params. Este id é usado para identificar o artigo que será removido do banco de dados.  

```javascript
const id = req.params.id;
```

3. Escreva uma consulta *sql* para excluir um artigo da tabela "articles" do banco de dados com base no `id` fornecido.

```javascript
const query = "delete from articles where id=?";
```

4. Aqui está o resultado final do nosso código:

```javascript
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
```

##### 3. `/edit/:id` - Rota para a edição de Artigos.

1. Defina uma rota HTTP PATCH para "/edit/:id". Esta rota será usada para atualizar um artigo no banco de dados. A autenticação é verificada antes de permitir a execução desta rota.

```javascript
router.patch("/edit/:id", authentication, (req, res) => {...}
```

2. Coletamos o parâmetro `id` da URL e os dados do artigo do corpo da solicitação `(req.body).` O *id* é usado para identificar o artigo que será atualizado.

```javascript
const id = req.params.id;
const article = req.body;
```

3. Escrita da consulta *sql* para atualizar um artigo na tabela "articles" do banco de dados com base no id fornecido.

```javascript
const query = "update articles set title=?, content=? where id=?";
```

4. Aqui está o resultado final de nosso código:

```javascript
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
```

##### 4. `/getAll` - Rota de consulta para todos os Artigos

1. Defina uma rota HTTP GET para "/getAll". Essa rota será usada para obter todos os artigos registrados no banco de dados.

```javascript
router.get("/getAll", (req, res) => {}
```

2. Escreva  uma consulta *sql* para selecionar todos os campos de todos os artigos na tabela "articles" do banco de dados.

```javascript
const query = "SELECT * FROM articles";
```

3. Tratamento da consulta e resultado final:

```javascript
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
```

##### 5. `/getById/:id` - Rota para obter um Artigo com base no ID.

1. Defina uma rota HTTP GET para "/getById/:id". 

```js
router.get("/getById/:id", (req, res) => {...}
```

2. Coletamos o parâmetro `id` da URL usando `req.params`. 
```js
const id = req.params.id;v
```
3. Escreva uma consulta *sql* para selecionar todos os campos do artigo na tabela "articles" do banco de dados onde o id corresponde ao id fornecido na URL.  

```javascript
const query = "SELECT * FROM articles WHERE id=?";
```

4. Aqui temos o resultado final do nosso código:

```javascript
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
```

Com todas essas rotas escritas vamos se capazes de consultar, registrar, editar e remover os dados de nossa aplicação.

## Conclusão
Primeiramente, gostaria de agradecer por dedicar seu tempo a este tutorial, e parabéns por concluí-lo! Espero que tenha sido útil e fácil de seguir.

Sinta-se à vontade para explorar mais suas habilidades nesta aplicação. Algumas rotas foram deixadas de fora propositalmente para que você se sinta tentado a escrevê-las por si mesmo. Caso não tenha nada em mente, aqui estão algumas sugestões:

 - Rota para edição dos dados de um usuário
 - Rota para recuperação de senha de usuário via e-mail.
 - Rota para atualização de senha de usuário.
 - Rota para download de um artigo específico em formato markdown.

Este tutorial também abrange a parte `frontend` de nossa aplicação. Afinal, para que você quer uma API se não for usá-la em algum lugar, não é mesmo? Portanto, avance para a próxima etapa, acesse [aqui]('linke') e continue o nosso tutorial.

Além disso, não deixe de me seguir nas redes sociais.

Até a próxima!  o/
