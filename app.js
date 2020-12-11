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

app.get("/admin/users", cors(optionsConfig), autentica, (req, res) => {
  if (req.content.usuario != "veronica") {
    res
      .status(403)
      .send({ rs: "Você não está autorizado a ver o conteudo desta página" });
    return;
  }
  cliente
    .find((err, dados) => {
      if (err) {
        res.status(400).send({ rs: "Não há usuários" });
        return;
      }
      res.status(200).send({ rs: dados });
    })
    .select([
      "-cpf",
      "-telefone",
      "-idade",
      "-senha",
      "-datacadastro",
      "-___v",
    ]);
});

app.get("/admin/clientes", cors(optionsConfig), autentica, (req, res) => {});

app.post("/login", cors(optionsConfig), (req, res) => {
  const usuario = req.body.usuario;
  const senha = req.body.senha;
  cliente.findOne({ usuario: usuario }, (err, data) => {
    if (err) {
      res.status(400).send({ rs: `Erro ao buscar o usuário: ${err}` });
      return;
    }
    if (!dados) {
      res.status(400).send({ rs: `Não há usuários cadastrados` });
      return;
    }
    bcrypt.compare(senha, data.senha, (err, mesma) => {
      if (!mesma) {
        res.send({ erro: "Erro ao autenticar o usuário" });
        return;
      }
      const token = createUserToken(data._id, data.usuario, data.nome);
      res.status(200).send({ rs: "Usuário Autenticado", token: token });
    });
  });
});

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
