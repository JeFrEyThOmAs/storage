import OTP from "../models/otpModel.js";
import { verifyIdToken } from "../services/googleAuthService.js";
import { sendOtpService } from "../services/sendOtpService.js";
import mongoose , { Types} from "mongoose";
import User from "../models/userModel.js";
import Directory from "../models/directoryModel.js";
import Session from "../models/sessionModel.js";
import redisClient from "../config/redis.mjs";
import { otpSchema } from "../validators/authSchema.js";

export const sendOtp = async (req, res, next) => {
  const { email } = req.body;
  const resData = await sendOtpService(email);
  res.status(201).json(resData);
};

export const verifyOtp = async (req, res, next) => {
  const {success , data , error} = otpSchema.safeParse(req.body)

  if(!success){
    console.log(error.issues)
    return res.status(400).json({error : "Invalid otp"})
  }

  const { email, otp } = data;
  const otpRecord = await OTP.findOne({ email, otp });

  if (!otpRecord) {
    return res.status(400).json({ error: "Invalid or Expired OTP!" });
  }

  return res.json({ message: "OTP Verified!" });
};

export const loginWithGoogle = async (req, res, next) => {
  const { idToken } = req.body;
  console.log(idToken);
  const userData = await verifyIdToken(idToken);
  console.log(userData)
  const { name, email, picture, sub } = userData;

  const user = await User.findOne({ email }).select("-__v");
  if (user) {
    const allSessions = await Session.find({ userId: user.id });

    if(user.deleted){
      return res.status(403).json({ error: "Your account has been deleted. Contact App Admin" });
    }

    if (allSessions.length >= 2) {
      await allSessions[0].deleteOne();
    }

    if (!user.picture.includes("googleusercontent.com")) {
      user.picture = picture;
      await user.save(); 
    }

    const sessionId = crypto.randomUUID();
    const redisKey = `session:${sessionId}`
    await redisClient.json.set( redisKey ,"$" , {userId : user._id})
  
    redisClient.expire(redisKey , 60 * 60 * 24 * 7)

    res.cookie("sid", sessionId, {
      httpOnly: true,
      signed: true,
      maxAge: 60 * 1000 * 60 * 24 * 7,
    });

    return res.json({ message: "logged in" });
  }

  console.log("User does not exist");
  const mongooseSession = await mongoose.startSession();

  try {
    const rootDirId = new Types.ObjectId();
    const userId = new Types.ObjectId();

    mongooseSession.startTransaction();

    await Directory.insertOne(
      {
        _id: rootDirId,
        name: `root-${email}`,
        parentDirId: null,
        userId,
      },
      { session : mongooseSession }
    );

    await User.insertOne(
      {
        _id: userId,
        name,
        email,
        picture,
        rootDirId,
      },
      { session : mongooseSession }
    );

    const sessionId = crypto.randomUUID();
    const redisKey = `session:${sessionId}`
    await redisClient.json.set( redisKey ,"$" , {userId})
  
    await redisClient.expire(redisKey , 60 * 60 * 24 * 7)

    res.cookie("sid", sessionId, {
      httpOnly: true,
      signed: true,
      maxAge: 60 * 60 * 24 * 7,
    });

    mongooseSession.commitTransaction();
    res.status(201).json({ message: "account created and logged in" });
  } catch (err) {
    mongooseSession.abortTransaction();
    next(err);
  }
};
