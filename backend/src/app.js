const express=require("express");
const cors=require("cors");
const helmet=require("helmet");

const app=express();

const authRoutes = require("./routes/authRoutes");

const accountRoutes = require("./routes/accountRoutes");

const categoryRoutes = require("./routes/categoryRoutes");

const transactionRoutes = require("./routes/transactionRoutes");

const dashboardRoutes = require("./routes/dashboardRoutes");

app.use(cors());  //Allows frontend to communicate with backend
app.use(helmet()); //Helmet adds security-related HTTP headers.
app.use(express.json());  //express.json() cuz -> Express needs to parse that JSON request body

app.get("/api/health", (req, res) => {
    res.json({
        success: true, 
        message: "PocketPilot API is running"
    });
});


app.use("/api/auth", authRoutes);

app.use("/api/accounts", accountRoutes);

app.use("/api/categories", categoryRoutes);

app.use("/api/transactions", transactionRoutes);

app.use("/api/dashboard", dashboardRoutes);

module.exports = app;