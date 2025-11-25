import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";


dotenv.config();       // 1️⃣ Load environment variables first
connectDB();           // 2️⃣ Connect to MongoDB

const app = express(); // 3️⃣ Initialize app BEFORE using it

app.use(cors({ origin: "http://localhost:5173" })); // 4️⃣ Enable CORS
app.use(express.json());                            // 5️⃣ Parse JSON bodies

// 6️⃣ Routes
app.get("/", (req, res) => res.send("Campus Connect API running"));
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/events", eventRoutes);


// 7️⃣ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
