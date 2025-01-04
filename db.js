import mongoose from "mongoose";

import dotenv from 'dotenv';

export default async function connectDB() {
    try {
      await mongoose.connect(process.env.MONGO_DB_URI);
      console.log('Successfully connected to MongoDB');
    } catch (err) {
      console.error('Error connecting to MongoDB', err);
      process.exit(1); // إيقاف العملية في حال فشل الاتصال
    }
  }

dotenv.config();