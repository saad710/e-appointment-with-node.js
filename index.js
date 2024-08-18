const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const hospitalRoute = require("./routes/hospital");
const workingDayRoute = require("./routes/workingDay");
const appointmentRoute = require("./routes/appointment");
const prescriptionRoute = require("./routes/prescription");
const path = require("path");
dotenv.config();
const app = express();

mongoose
  .connect(process.env.MONGO_URL, {})
  .then(() => {
    console.log("mongodb connected successfully");
  })
  .catch((err) => {
    console.error("Error connecting to Mongo", err);
  });

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/hospital", hospitalRoute);
app.use("/api/workingDay", workingDayRoute);
app.use("/api/appointment", appointmentRoute);
app.use("/api/prescription", prescriptionRoute);

app.listen(process.env.PORT || 8000, () => {
  console.log("Backend server is running!");
});
