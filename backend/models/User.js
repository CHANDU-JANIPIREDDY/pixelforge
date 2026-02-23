import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Exclude password from queries by default
    },
    role: {
      type: String,
      enum: ['Admin', 'ProjectLead', 'Developer'],
      default: 'Developer',
    },
    mfaSecret: {
      type: String,
      default: null,
      select: false, // Exclude from queries by default
    },
  },
  {
    timestamps: true, // Creates createdAt and updatedAt
  }
);

/**
 * Pre-save hook to hash password before storing
 * Only hashes if password is new or modified
 */
userSchema.pre('save', async function () {
  // Skip hashing if password is not modified
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Method to compare entered password with hashed password
 * @param {string} enteredPassword - Plain text password to compare
 * @returns {Promise<boolean>} - True if passwords match
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
