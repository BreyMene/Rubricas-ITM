const express = require('express');
const cors = require('cors')
const mongoose = require('mongoose');

const authRoute = require('./routes/auth')

const app = express();
const port = 8000;
const mongoURI = "mongodb://mongo:pass1234@db:27017/RubrITM?authSource=admin";

app.use(cors());
app.use(express.json());

mongoose.connect(mongoURI)
.then(() => console.log('connected'))
.catch((err) => console.error('failed to connect', err));

app.use("/", authRoute);

app.listen(port, () => {
  console.log(`listening in port ${port}`);
});