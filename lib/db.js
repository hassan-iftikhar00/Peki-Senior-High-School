import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

export async function connectToDatabase() {
  try {
    const connection = await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
    return connection;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

// import mongoose from "mongoose";

// const MONGODB_URI = process.env.MONGODB_URI;

// if (!MONGODB_URI) {
//   throw new Error(
//     "Please define the MONGODB_URI environment variable inside .env.local"
//   );
// }

// let cachedConnection = null;

// export async function connectToDatabase() {
//   if (cachedConnection) {
//     return cachedConnection;
//   }

//   try {
//     const connection = await mongoose.connect(MONGODB_URI, {
//       useUnifiedTopology: true,
//       bufferCommands: false,
//     });

//     cachedConnection = connection;
//     console.log("Connected to MongoDB");
//     return connection;
//   } catch (error) {
//     console.error("Error connecting to MongoDB:", error);
//     throw error;
//   }
// }

// // Graceful shutdown
// process.on("SIGINT", async () => {
//   try {
//     await mongoose.connection.close();
//     console.log("MongoDB connection closed through app termination");
//     process.exit(0);
//   } catch (err) {
//     console.error("Error during MongoDB connection closure:", err);
//     process.exit(1);
//   }
// });
