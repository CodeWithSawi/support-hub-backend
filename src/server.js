// server.js
import "dotenv/config";
import app from "./app.js";
// import connectDB from "./config/dbConnect.js";

// await connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
