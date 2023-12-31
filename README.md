# Servidor para Blog - Node.js & Mysql.

- [Tutorial em texto]();

## Ingredientes

- [bcryptjs](https://www.npmjs.com/package/bcryptjs) - uma biblioteca de criptografia para senhas.
- [cors](https://www.npmjs.com/package/cors) - uma middleware que nos permite lidar com `Cross-Origin Resource Sharing (CORS)`.
- [dotenv](https://www.npmjs.com/package/dotenv) - um módulo que nos possibilita acessar variáveis em arquivos '.env'.
- [express](https://www.npmjs.com/package/express) - uma biblioteca que nos permite criar APIs RESTful.
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) - uma biblioteca para a criação dos nossos _tokens_ de autenticação.
- [multer](https://www.npmjs.com/package/multer) - o Multer é uma biblioteca que nos permitirá salvar imagens em nosso servidor.
- [mysql](https://www.npmjs.com/package/mysql) - uma biblioteca de conexão com o banco de dados MySQL.

## Como usar

### Instalando aplicação.

```
npm i
```

### Conectando ao Banco de dados

Lembre-se de configurar a sua conexão ao banco de dados Mysql.
Em `connection.js`

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

### Iniciando servidor

```
node index.js
```

## Frontend

Você pode encontrar o frontend desta aplicação no [repositório](https://github.com/Gondrak08/blog-platform)
