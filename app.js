// importação do módulo do express para o node
const express = require("express");

// importação do módulo do body-parser para realizar o trabalho com o json que será enviado pelo cliente
const bodyParser = require("body-parser");

//importação do mongoose para realizar a persistência com mongodb
const mongoose = require("mongoose");

// importação do módulo bcrypt para encriptografar senhas
const bcrypt = require("bcrypt");

//importação do módulo do jsonwebtoken
const jwt = require("jsonwebtoken");

//importação do módulo de verificação de cpf e email
const cce = require("clientes-helton-email-cpf");

//importação do módulo local de configurações. Aqui temos o caminho do banco e dados do jwt
const settings = require("./config/settings");

//importação do módulo local com as configurações do modelo de dados de clientes
const cliente = require("./model/cliente");

//importação do modulo de autenticação com as informações de verificação do token
const autentica = require("./middleware/autentica");

// importação do módulo do CORS para nossa aplicação
const cors = require("cors");

// utilizar o express na nossa aplicação
const app = express();

// utilizando o body-parser em nossa aplicação para realizar o parse para json
// de dados enviados pelo front a nossa aplicação
app.use(bodyParser.json());

//configuração do cors para aceitar a solicitação de diversas origins e
//status code 200 para dispositivos antigos e smarttv
const optionsConfig = {
  origin: "*",
  optionsSuccessStatus: 200,
};

//Gerar token ao usuario
const createUserToken = (id, usuario, nome) => {
  return jwt.sign({ id: id, usuario: usuario, nome: nome }, settings.jwt_key, {
    expiresIn: settings.jwt_expires,
  });
};

//vamos estabelecer a connexao com o banco de dados mongodb
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
          .send({ rs: `Erro ao tentar listar os cliente ${erro}` });
        return;
      }
      res.status(200).send({ rs: dados });
    })
    .select("-senha");
});

app.get("/admin", cors(optionsConfig), autentica, (req, res) => {
  res.send(req.content);
});

app.get("/admin/users", cors(optionsConfig), autentica, (req, res) => {
  if (req.content.usuario != "veronica") {
    res
      .status(403)
      .send({ rs: "Você não está autorizado a ver o conteúdo desta página" });
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
    .select(["-cpf", "-telefone", "-idade", "-senha", "-datacadastro", "-__v"]);
});

app.get("/admin/clientes", cors(optionsConfig), autentica, (req, res) => {});

app.post("/login", (req, res) => {
  const usuario = req.body.usuario;
  const senha = req.body.senha;
  cliente.findOne({ usuario: usuario }, (err, data) => {
    if (err) res.send({ erro: "Erro ao buscar usuário" });
    if (!data) return res.send({ erro: "Usuario nao cadastrado" });
    bcrypt.compare(senha, data.senha, (err, mesma) => {
      if (!mesma) return res.send({ erro: "Erro ao autenticar o usuário" });
      const token = createUserToken(data._id, data.usuario, data.nome);
      res.status(200).send({ rs: "Usuário Autenticado", token: token });
    });
  });
});

app.post("/cadastro", (req, res) => {
  //validação de cpf e email
  const vc = new cce.Cliente(req.body.email, req.body.cpf);
  if (!cce.validaEmail(vc)) {
    res.status(400).send({ rs: "E-Mail inválido" });
    return;
  }
  if (!cce.validaCPF(vc)) {
    res.status(400).send({ rs: "CPF Inválido" });
    return;
  }
  const dados = new cliente(req.body);
  dados
    .save()
    .then(() => {
      res.status(201).send({ rs: "Dados cadastrados" });
    })
    .catch((erro) => {
      if (erro.code === 11000) {
        res
          .status(400)
          .send({ rs: `Usuário existente. Por favor tente outro.` });
      }
      res.status(400).send({ rs: `Erro ao tentar cadastrar ${erro}` });
    });
});

app.put("/atualizar/:id", cors(optionsConfig), autentica, (req, res) => {
  cliente.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
    (erro, dados) => {
      if (erro) {
        res.status(400).send({ rs: `Erro ao atualizar ${erro}` });
        return;
      }
      res.status(200).send({ rs: dados });
    }
  );
});

app.delete("/apagar/:id", cors(optionsConfig), autentica, (req, res) => {
  cliente.findByIdAndDelete(req.params.id, (erro, dados) => {
    if (erro) {
      res.status(400).send({ rs: `Erro ao tentar apagar o cliente ${erro}` });
      return;
    }
    res.status(204).send({ rs: "apagado" });
  });
});

//Vamos adicionar um tratamento ao erro de requisição inexistente, ou seja, o erro 404
app.use((req, res) => {
  res.type("application/json");
  res.status(404).send({ erro: "404 - Página não encontrada" });
});

app.listen(3000);

console.log("Servidor Online... Para finalizar utilize CTRL+C");
