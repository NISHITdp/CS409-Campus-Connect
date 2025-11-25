import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";


dotenv.config();    
connectDB();        

const app = express();

// app.use(cors({ origin: "http://localhost:5173" })); 
app.use(cors()); 
app.use(express.json());                            

app.get("/", (req, res) => res.send("Campus Connect API running"));
app.get("/healthz", (req, res) => res.status(200).send("OK"));
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/events", eventRoutes);


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
