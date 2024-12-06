const express = require("express");
const multer = require("multer");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const upload = multer({ dest: "uploads/" });

let records = [];

app.get("/records", (req, res) => res.json(records));

app.post("/records", upload.single("photo"), (req, res) => {
  const { nome, idade, horario } = req.body;
  const newRecord = {
    id: records.length + 1,
    nome,
    idade,
    horario,
    photo: req.file ? req.file.path : null,
  };
  records.push(newRecord);
  res.status(201).json(newRecord);
});

app.put("/records/:id", upload.single("photo"), (req, res) => {
  const { id } = req.params;
  const { nome, idade, horario } = req.body;

  const index = records.findIndex((record) => record.id === parseInt(id));
  if (index === -1) return res.status(404).send("Registro não encontrado.");

  records[index] = {
    ...records[index],
    nome,
    idade,
    horario,
    photo: req.file ? req.file.path : records[index].photo,
  };

  res.json(records[index]);
});

app.delete("/records/:id", (req, res) => {
  const { id } = req.params;
  records = records.filter((record) => record.id !== parseInt(id));
  res.status(204).send();
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
