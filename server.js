const express = require("express");
const PORT = process.env.PORT || 5000;
const cors = require("cors");
const connectDB = require("./config/db");
const app = express();
const Router = require("./router");

connectDB();

app.use(express.json());
app.use(cors());

app.use("/", Router);

app.listen(PORT, () => {
  console.log(`Server is Running ${PORT}`);
});
