const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoute = require("./routes/auth");
const coursesRoute = require("./routes/course");
const groupsRoute = require("./routes/groups");
const rubricsRoute = require("./routes/rubrics");
const notasRoutes = require('./routes/notas');

const app = express();
const port = 8000;
// const mongoURI = "mongodb://mongo:pass1234@db:27017/RubrITM?authSource=admin";
const mongoURI = "mongodb://mongo:pass1234@localhost:27017/RubrITM?authSource=admin";

app.use(cors());
app.use(express.json());

mongoose
  .connect(mongoURI)
  .then(() => console.log("connected"))
  .catch((err) => console.error("failed to connect", err));

// API Endpoints
app.use("/", authRoute);
app.use("/courses", coursesRoute);
app.use("/groups", groupsRoute);
app.use("/rubrics", rubricsRoute);
app.use("/grades", notasRoutes);

app.listen(port, '0.0.0.0', () => {
  console.log(`listening in port ${port}`);
});
