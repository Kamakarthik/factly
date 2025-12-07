const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const userRouter = express.Router();

// Protect all routes after this middleware
userRouter.use(authController.protect);

userRouter.get('/me', authController.getMe);
userRouter.patch('/updateMe', userController.updateMe);
userRouter.patch('/updatePassword', authController.updatePassword);
userRouter.delete('/deleteMe', userController.deleteMe);

// Admin only
userRouter.use(authController.restrictTo('admin'));
userRouter.route('/').get(userController.getAllUsers);

userRouter
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = userRouter;
