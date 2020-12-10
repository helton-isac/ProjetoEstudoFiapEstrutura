app.get("/",(req,res)=>{
    
});

app.get("/admin", autentica,(req,res)=>{
    
})

app.get("/admin/users",autentica,(req,res)=>{
    
})

app.get("/admin/clientes",autentica,(req,res)=>{

})

app.post("/login",(req,res)=>{

})

app.post("/cadastro",(req,res)=>{
    //validação de cpf e email

});

app.put("/atualizar/:id",autentica,(req,res)=>{


});

app.delete("/apagar/:id",autentica,(req,res)=>{

});

//Vamos adicionar um tratamento ao erro de requisição inexistente, ou seja, o erro 404
app.use((req,res)=>{
    res.type("application/json");
    res.status(404).send({erro:"404 - Página não encontrada"});
});

app.listen(3000);

console.log("Servidor Online... Para finalizar utilize CTRL+C");