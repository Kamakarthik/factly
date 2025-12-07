const express = require('express');
const authController = require('../controllers/authController');
const factController = require('../controllers/factController');

const factRouter = express.Router();

// Public routes
factRouter.get('/stats', factController.getFactStats);

// Protected routes
factRouter.use(authController.protect);

factRouter.get('/', factController.getAllFacts);
factRouter.get('/category/:category', factController.getFactsByCategory);
factRouter.get('/my-facts', factController.getUserFacts);
factRouter.get('/voted-facts', factController.getVotedFacts);
factRouter.get('/user/:userId', factController.getUserFacts);
factRouter.get('/:id', authController.protect, factController.getFact);
factRouter.post('/', factController.createFact);
factRouter.patch('/:id/vote', factController.voteFact);

factRouter
  .route('/:id')
  .patch(factController.updateFact)
  .delete(factController.deleteFact);

module.exports = factRouter;
