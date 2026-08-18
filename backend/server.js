require("dotenv").config();

const app = require("./src/app");

const PORT = process.env.PORT || 8000;
const pool=require("./src/config/database.js");

const startserver= async () => {
    try{
        await pool.query("SELECT NOW()");

        console.log("DB connected Successfully");

        app.listen(PORT,()=>{
            console.log(`PocketPilot API running on port ${PORT}`);
            
        }) 
    }catch(error){
        console.error("Database connection failed:", error.message);
        process.exit(1);
    }
}

startserver();
