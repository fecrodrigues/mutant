const mongoose = require('mongoose');

module.exports = (app) => {
  return mongoose.model('DNA', { dna: Array, type: String });
}
