import express from "express";
import checkAuth, { checkNotRegularUser } from "../middlewares/authMiddleware.js";
import {
  getAllUsers,
  getCurrentUser,
  login,
  logout,
  logoutAll,
  logoutById,
  register,
} from "../controllers/userController.js";
import User from "../models/userModel.js";

const router = express.Router();

router.post("/user/register", register);

router.post("/user/login", login);

router.get("/user", checkAuth, getCurrentUser);

router.get("/users" , checkAuth , checkNotRegularUser , getAllUsers)

router.post('/users/:userId/logout' , checkAuth , checkNotRegularUser , logoutById)

router.post("/user/logout", logout);
router.post("/user/logout-all", logoutAll);

export default router;
