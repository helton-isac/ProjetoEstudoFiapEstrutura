const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const chec = require("clientes-helton-email-cpf");

const cors = require("cors");

const settings = require("./config/settings");
const cliente = require("./model/cliente");
const autentica = require("./middleware/autentica");

const app = express();

app.use(bodyParser.json);

const optionsConfig = {
  origin: "*",
  optionsSuccessStatus: 200,
};

const createUserToken = (id, usuario, nome) => {
  return jwt.sign(
    {
      id: id,
      usuario: usuario,
      nome: nome,
    },
    settings.jwt_key,
    { expiresIn: settings.jwt_expires }
  );
};

mongoose.connect(settings.dbpath, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get("/", cors(optionsConfig), (req, res) => {
  cliente
    .find((erro, dados) => {
      if (erro) {
        res
          .status(404)
          .send({ rs: `Erro ao tentar listar os clientes ${erro}` });
        return;
      }
      res.status.send({ rs: dados });
    })
    .select("-senha");
});

app.get("/admin", cors(optionsConfig), (req, res) => {
  res.send(req.content);
});

app.get("/admin/users", cors(optionsConfig), autentica, (req, res) => {});

app.get("/admin/clientes", cors(optionsConfig), autentica, (req, res) => {});

app.post("/login", cors(optionsConfig), (req, res) => {});

app.post("/cadastro", cors(optionsConfig), (req, res) => {
  //validação de cpf e email
});

app.put("/atualizar/:id", cors(optionsConfig), autentica, (req, res) => {});

app.delete("/apagar/:id", cors(optionsConfig), autentica, (req, res) => {});

//Vamos adicionar um tratamento ao erro de requisição inexistente, ou seja, o erro 404
app.use((req, res) => {
  res.type("application/json");
  res.status(404).send({ erro: "404 - Página não encontrada" });
});

app.listen(3000);

console.log("Servidor Online... Para finalizar utilize CTRL+C");
