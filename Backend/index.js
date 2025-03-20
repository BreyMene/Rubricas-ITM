const express = require('express');
const mongoose = require('mongoose');
const { Docente } = require('./types');

const app = express();
const port = 8000;
const mongoURI = "mongodb://mongo:pass1234@db:27017/RubrITM?authSource=admin";

app.use(express.json());

mongoose.connect(mongoURI)
.then(() => console.log('connected'))
.catch((err) => console.error('failed to connect', err));

app.post('/docentes', async (req, res) => {
    try{
        const {correo, contraseña} = req.body
        const docente = new Docente({correo: correo, contraseña: contraseña})
        await docente.save()
        res.status(201).json(docente)
    }catch{
        res.status(500).json({"error": "failed to create docente"})
    }
});

app.get('/docentes', async (req, res)=> {
    const docentes = await Docente.find();
    res.status(200).json(docentes)
})

app.listen(port, () => {
  console.log(`listening in port ${port}`);
});