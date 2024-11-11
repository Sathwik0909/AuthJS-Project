import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { connectDB } from "./db/connectDB.js";
import authRoutes from "./routes/auth.route.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(express.json()); //allows sus to parse incoing request: req.bpdy
app.use(cookieParser()); //allows us to parse incoming cookies

app.use("/api/auth", authRoutes);

// if (Process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "/frontend/dist")));

//   app.get("*", (req, res) => {
//     res.sendFile(path.resolve(__dirname,"frontend","dist","index.html"))
//   });
// }

//JOEY2478UIGHN6Jb
//sathwik992004
app.listen(PORT, () => {
  connectDB();
  console.log("Server is running at ", PORT);
});
