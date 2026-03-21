import Directory from "../models/directoryModel.js";
import User from "../models/userModel.js";
import mongoose, { Types } from "mongoose";
import crypto, { sign } from "node:crypto";
import bcrypt from "bcrypt"
import Session from "../models/sessionModel.js";
import OTP from "../models/otpModel.js";
import File from "../models/fileModel.js";
import { error } from "node:console";
import redisClient from "../config/redis.mjs";
import { loginSchema, registerSchema } from "../validators/authSchema.js";
import z from "zod";



// const secret = process.env.SECRET

export const register = async (req, res, next) => {

  const {success , data , error} = registerSchema.safeParse(req.body)

  if(!success){
    console.log(error.issues)
    return res.status(400).json({error : "Invalid input, please enter valid details"})
  }

  const { name, email, password, otp} = data;

  const otpRecord = await OTP.findOne({ email, otp });

  if (!otpRecord) {
    return res.status(400).json({ error: "Invalid or Expired OTP!" });
  }

  await otpRecord.deleteOne();


  const session = await mongoose.startSession();

  try {
    const rootDirId = new Types.ObjectId();
    const userId = new Types.ObjectId();

    session.startTransaction();

    await Directory.insertOne(
      {
        _id: rootDirId,
        name: `root-${email}`,
        parentDirId: null,
        userId,
      },
      { session }
    );

    await User.insertOne(
      {
        _id: userId,
        name,
        email,
        password,
        rootDirId,
      },
      { session }
    );

    session.commitTransaction();

    res.status(201).json({ message: "User Registered" });
  } catch (err) {
    session.abortTransaction();
    if (err.code === 121) {
      res
        .status(400)
        .json({ error: "Invalid input, please enter valid details" });
    } else if(err.code === 11000 ){
      if(err.keyValue.email){
        return res.status(409).json({
          error: "This email already exists",     // better performance using index
          message:
            "A user with this email address already exists. Please try logging in or use a different email.",
        });
      }
    }
     else {
      next(err);
    }
  }
};

export const login = async (req, res, next) => {

  const {success , data , error} = loginSchema.safeParse(req.body)

  if(!success){
    console.log(error.issues)
    return res.status(400).json({error : "Invalid input, please enter valid details"})
  }

  const { email, password } = data;

  
  const user = await User.findOne({ email}).lean();

  if (!user) {
    return res.status(404).json({ error: "Invalid Credentials" });
  }

  if (user.deleted) {
    return res.status(403).json({
      error: "Your account has been deleted. Contact App Admin"
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  // OR
  // const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return res.status(404).json({ error: "Invalid Credentials" });
  }

  if(user.deleted){
    return res.status(403).json({ error: "Your account has been deleted. Contact App Admin" });
  }
  
  // const allSessions = await Session.find({userId : user._id}).sort({createdAt : -1})

  // if(allSessions.length >= 2){ 
  //   await allSessions[0].deleteOne()
  // }
  const allSessions = await redisClient.ft.search(
    "userIdx",
    `@userId:{${user.id}}`,
    {
      RETURN: [],
    }
  );

  console.log(allSessions.documents);

  if (allSessions.total >= 2) {
    await redisClient.del(allSessions.documents[0].id);
  }

  const sessionId = crypto.randomUUID();
  const redisKey = `session:${sessionId}`
  await redisClient.json.set( redisKey ,"$" , {userId : user._id})

  redisClient.expire(redisKey , 60 * 60 * 24 * 7)


  res.cookie(
    "sid",
    sessionId,
    {
      httpOnly: true,
      signed: true,
      maxAge: 60 * 60 * 1000 * 24 * 7,
    }
  );
  
  res.json({ message: "logged in" });
};

export const getCurrentUser = (req, res) => {
  res.status(200).json({
    name: req.user.name,
    email: req.user.email,
    picture : req.user.picture,
    role : req.user.role
  });
};

// export const getAllUsers = async (req, res) => {
//   const allUsers = await User.find({deleted : false}).lean()
//   const allSessions = await Session.find().lean()
//   const allSessionsUserId = allSessions.map(({userId}) => userId.toString())
//   const allSessionsUserIdSet = new Set(allSessionsUserId)

//   const transformedUsers = allUsers.map(({_id , name , email}) => (
//     {id : _id , name , email , isLoggedIn : allSessionsUserIdSet.has(_id.toString())}))
//   res.status(200).json(transformedUsers);
// };

export const getAllUsers = async (req, res, next) => {
  try {
    // 1. get all users from DB
    const allUsers = await User.find({ deleted: false }).lean();

    // 2. get all sessions from redis index
    const allSessions = await redisClient.ft.search(
      "userIdx",
      "*",
      { RETURN: ["userId"] }
    );

    // 3. collect userIds that have active sessions
    const allSessionsUserId = allSessions.documents.map(
      (doc) => doc.value.userId.toString()
    );

    const allSessionsUserIdSet = new Set(allSessionsUserId);

    // 4. transform users
    const transformedUsers = allUsers.map(({ _id, name, email }) => ({
      id: _id,
      name,
      email,
      isLoggedIn: allSessionsUserIdSet.has(_id.toString())
    }));

    res.status(200).json(transformedUsers);
  } catch (err) {
    next(err);
  }
};

export const logout = async(req, res) => {
  const { sid } = req.signedCookies;

  if (sid) {
    await redisClient.del(`session:${sid}`);
  }

  res.clearCookie("sid");

  res.status(204).end();
};

// export const logoutById = async(req, res) => {
//   try {
//     await Session.deleteMany({userId : req.params.userId})
//     res.status(204).end();
//   }catch(err){
//     next(err)
//   }
// };

export const logoutById = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // find sessions for that user
    const sessions = await redisClient.ft.search(
      "userIdx",
      `@userId:{${userId}}`,
      { RETURN: [] }
    );

    // extract redis keys
    const keys = sessions.documents.map(doc => doc.id);

    // delete those keys
    if (keys.length) {
      await redisClient.del(keys);
    }

    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

// export const logoutAll = async(req, res) => {
//   const { sid } = req.signedCookies
//   const session = await Session.findById(sid)
//   await Session.deleteMany({userId : session.userId})
//   res.clearCookie("sid");
//   res.status(204).end();
// };
export const logoutAll = async (req, res) => {
  const { sid } = req.signedCookies;

  // get current session
  const session = await redisClient.json.get(`session:${sid}`);

  if (!session) {
    return res.status(401).json({ error: "Invalid session" });
  }

  // find all sessions of this user
  const allSessions = await redisClient.ft.search(
    "userIdx",
    `@userId:{${session.userId}}`,
    {
      RETURN: [],
    }
  );

  // collect redis keys
  const keys = allSessions.documents.map(doc => doc.id);

  // delete all sessions
  if (keys.length) {
    await redisClient.del(keys);
  }

  res.clearCookie("sid");
  res.status(204).end();
};

// export const deleteUser = async(req, res , next) => {
//   const {userId} = req.params
//   if(userId === req.user._id.toString()){
//     return res.status(403).json({error : "Cannot delete yourself"})
//   }
//   try {
//     await Session.deleteMany({userId : req.params.userId})
//     await User.findByIdAndUpdate(userId , {deleted : true})
//     res.status(204).end();
//   }catch(err){
//     next(err)
//   }
// };
export const deleteUser = async (req, res, next) => {
  const { userId } = req.params;

  if (userId === req.user._id.toString()) {
    return res.status(403).json({ error: "Cannot delete yourself" });
  }

  try {
    // find all sessions belonging to the user
    const sessions = await redisClient.ft.search(
      "userIdx",
      `@userId:{${userId}}`,
      { RETURN: [] }
    );

    // extract redis keys
    const keys = sessions.documents.map(doc => doc.id);

    // delete those sessions
    if (keys.length) {
      await redisClient.del(keys);
    }

    // soft delete the user
    await User.findByIdAndUpdate(userId, { deleted: true });

    res.status(204).end();
  } catch (err) {
    next(err);
  }
};