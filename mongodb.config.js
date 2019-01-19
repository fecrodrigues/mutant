const mongoose = require('mongoose');

module.exports = (app) => {
  return mongoose.connect('mongodb://localhost:27017/ml-collection',  {useNewUrlParser: true});
}
