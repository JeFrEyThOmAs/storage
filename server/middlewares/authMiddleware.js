import e from "express";
import User from "../models/userModel.js";
import crypto from "node:crypto";
import Session from "../models/sessionModel.js";



export default async function checkAuth(req, res, next) {
  console.log(req.signedCookies)
  console.log("_-----_")
  const { sid } = req.signedCookies;
  if (!sid) {
    res.clearCookie("sid");
    return res.status(401).json({ error: "Not logged in!" });
  }
  const session = await Session.findById(sid);
  if(!session){
    res.clearCookie("sid");
    return res.status(401).json({ error: "Not logged in!" });
  }
  const user = await User.findOne({ _id: session.userId }).lean();
  if (!user) {
    return res.status(401).json({ error: "Not logged!" });
  }
  req.user = user;
  next();
}

export const checkNotRegularUser = async (req, res, next) => {
  if (req.user.role !== "User") return next();
  res.status(403).json({ error: "You can not access this route" });
};