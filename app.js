const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const chec = require("clientes-helton-email-cpf");

const cors = require("cors");

const settings = require("./config/settings");
const cliente = require("./model/cliente");
const autentica = require("./middleware/autentica");

app.get("/", (req, res) => {});

app.get("/admin", autentica, (req, res) => {});

app.get("/admin/users", autentica, (req, res) => {});

app.get("/admin/clientes", autentica, (req, res) => {});

app.post("/login", (req, res) => {});

app.post("/cadastro", (req, res) => {
  //validação de cpf e email
});

app.put("/atualizar/:id", autentica, (req, res) => {});

app.delete("/apagar/:id", autentica, (req, res) => {});

//Vamos adicionar um tratamento ao erro de requisição inexistente, ou seja, o erro 404
app.use((req, res) => {
  res.type("application/json");
  res.status(404).send({ erro: "404 - Página não encontrada" });
});

app.listen(3000);

console.log("Servidor Online... Para finalizar utilize CTRL+C");
