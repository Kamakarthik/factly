const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'A category must have a name'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  colour: {
    type: String,
    required: [true, 'A category must have a color'],
    validate: {
      validator: function (v) {
        return /^[0-9A-Fa-f]{6}$/.test(v);
      },
      message: 'Color must be a valid hex color (without #)',
    },
  },
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
