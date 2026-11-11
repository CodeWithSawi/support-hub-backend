// import mongoose
import mongoose from "mongoose";

// create an async function to connect to the database
const connectDB = async () => {
  // get the connection string from the environment variables
  const uri = process.env.CONNECTION_STRING;

  // check if the connection string is not set, log an error and exit the process
  if (!uri) {
    console.error("CONNECTION_STRING is not set");
    process.exit(1);
  }

  // wrap the connection attempt in a try-catch block to handle errors
  try {
    // connect to the database using mongoose.connect with a server selection timeout of 5000ms
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    // log a message indicating successful connection to the database, including the host and database name
    console.log(
      `MongoDB Connected: ${conn.connection.host}, database: ${conn.connection.name} `,
    );
  } catch (error) {
    // log an error message if the connection attempt fails and exit the process
    console.error("Error connecting to MongoDB:", error.message);
    // exit the process with a failure code
    process.exit(1);
  }
};

// add event listeners to mongoose.connection to log messages when the connection is disconnected or reconnected
mongoose.connection.on("disconnected", () =>
  console.warn("MongoDB disconnected"),
);
mongoose.connection.on("reconnected", () => console.log("MongoDB reconnected"));

// export the connectDB function
export default connectDB;
