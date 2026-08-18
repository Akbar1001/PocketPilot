const express=require("express");
const cors=require("cors");
const helmet=require("helmet");

const app=express();

app.use(cors());  //Allows frontend to communicate with backend
app.use(helmet()); //Helmet adds security-related HTTP headers.
app.use(express.json());  //express.json() cuz -> Express needs to parse that JSON request body

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "PocketPilot API is running"
    });
});


module.exports = app;
