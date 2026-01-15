import bcrypt from 'bcryptjs';
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  accessibilityLevel: 'no-visual-impairment' | 'partial' | 'total';
  audioMode: boolean;
  role: 'student' | 'admin';
  isVerified: boolean;
  verificationToken?: string;
  subscriptionStatus: 'free' | 'premium';
  subscriptionExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, 'Veuillez fournir votre prénom'],
      trim: true,
      maxlength: [50, 'Le prénom ne doit pas dépasser 50 caractères']
    },
    lastName: {
      type: String,
      required: [true, 'Veuillez fournir votre nom'],
      trim: true,
      maxlength: [50, 'Le nom ne doit pas dépasser 50 caractères']
    },
    email: {
      type: String,
      required: [true, 'Veuillez fournir une adresse email'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez fournir une adresse email valide']
    },
    password: {
      type: String,
      required: [true, 'Veuillez fournir un mot de passe'],
      minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
      select: false
    },
    phoneNumber: {
      type: String,
      unique: true,
      sparse: true
    },
    accessibilityLevel: {
      type: String,
      enum: ['no-visual-impairment', 'partial', 'total'],
      default: 'no-visual-impairment',
      required: true
    },
    audioMode: {
      type: Boolean,
      default: false
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student'
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationToken: {
      type: String,
      select: false
    },
    subscriptionStatus: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free'
    },
    subscriptionExpiresAt: {
      type: Date
    }
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
