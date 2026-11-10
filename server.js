
require("dotenv").config();

const express = require("express");
const { connectDB } = require("./db");
const path = require("path");
const lessonRoutes = require("./routes/lessonsRoute");
const orderRoutes = require("./routes/ordersRoute");
const logger = require("./middleware/logger");
const enrolmentRoute = require("./routes/enrolmentRoute");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "public", "images")));
app.use(logger); // Use the logger middleware

// Routes

app.use("/lessons", lessonRoutes);
app.use("/orders", orderRoutes);
app.use("/enrolment", enrolmentRoute);
// Start server after database connection
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
