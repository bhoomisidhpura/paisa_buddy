import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../user/user.model.js";
console.log("JWT SECRET:", process.env.JWT_SECRET);

const SALT_ROUNDS = 10;

export const registerUser = async ({ name, email, password }) => {
  // check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return user;
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  // create JWT
  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { user, token };
};