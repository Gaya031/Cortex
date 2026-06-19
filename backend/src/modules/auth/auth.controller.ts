import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "./user.model.js";
import {env} from "../../config/env.js";

// Hardcode a default JWT secret fallback just in case it's not set
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-me-in-production";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(201).json({
      success: true,
      result: {
        token,
        user: { id: newUser._id, name: newUser.name, email: newUser.email },
      },
    });
  } catch (error: any) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(200).json({
      success: true,
      result: {
        token,
        user: { id: user._id, name: user.name, email: user.email },
      },
    });
  } catch (error: any) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findById((req as any).user.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, result: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
