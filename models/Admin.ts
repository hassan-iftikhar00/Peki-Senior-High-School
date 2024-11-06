import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcrypt";

export interface IAdmin {
  name: string;
  email: string;
  password: string;
  role: "admin" | "superadmin";
  lastLogin?: Date;
}

export interface IAdminDocument extends IAdmin, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

interface IAdminModel extends Model<IAdminDocument> {
  findByEmail(email: string): Promise<IAdminDocument | null>;
}

const AdminSchema: Schema<IAdminDocument> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
    },
    role: {
      type: String,
      enum: ["admin", "superadmin"],
      default: "admin",
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error) {
    return next(error as Error);
  }
});

// Method to compare password
AdminSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Static method to find admin by email
AdminSchema.statics.findByEmail = function (
  email: string
): Promise<IAdminDocument | null> {
  return this.findOne({ email });
};

const Admin =
  mongoose.models.Admin ||
  mongoose.model<IAdminDocument, IAdminModel>("Admin", AdminSchema);

export default Admin;
