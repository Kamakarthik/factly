const express = require('express');
const authController = require('../controllers/authController');
const categoryController = require('../controllers/categoryController');

const categoryRouter = express.Router();

// Public routes
categoryRouter.get('/', categoryController.getAllCategories);
categoryRouter.get('/:id', categoryController.getCategory);

// Protected routes (admin only)
categoryRouter.use(authController.protect);
categoryRouter.use(authController.restrictTo('admin'));

categoryRouter.post('/', categoryController.createCategory);
categoryRouter
  .route('/:id')
  .patch(categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

module.exports = categoryRouter;
