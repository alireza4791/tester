const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require("mongoose");

function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

mongoose.connect(
  // "mongodb+srv://mongo:Aa55892004@cluster0.bdwd9ao.mongodb.net/?retryWrites=true&w=majority"
  process.env.DATABASE_URL ||
    "mongodb+srv://mongo:Aa55892004@cluster0.bdwd9ao.mongodb.net/Cluster0?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const student = new mongoose.Schema({
  name: String,
  studentId: String,
  setDate: String,
});
const dates = new mongoose.Schema({
  data: [],
});

const STUDENT = mongoose.model("Student", student);
const DATES = mongoose.model("dates", dates);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", async (req, res) => {
  const path = __dirname + "/index.html";
  res.sendFile(path);
});

app.post("/submit", async (req, res) => {
  const { name, studentId } = req.body;
  const preStudent = await STUDENT.findOne({ name, studentId });
  if (preStudent) {
    res.status(400).send({
      message: "این اسم و شماره دانشجویی از قبل ثبت شده است.",
    });
  } else {
    const DatesModel = await DATES.findOne({
      cId: "1",
    });
    let dates = DatesModel.data;
    if (dates.length === 0) {
      res.status(400).send({
        message: "ظرفیت پر شده است",
      });
    } else {
      const studentDateIndex = randomIntFromInterval(0, dates.length);
      const studentSetDate = dates[studentDateIndex];
      const newUser = new STUDENT({
        name,
        studentId,
        setDate: studentSetDate,
      });
      await newUser.save();
      dates = dates.filter((item) => item !== studentSetDate);
      DatesModel.data = dates;
      await DatesModel.save();
      res.status(200).send({
        message: `درخواست شما با موفقیت ثبت شد
      تاریخ شما: ${studentSetDate}`,
      });
    }
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
