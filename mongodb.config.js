const mongoose = require('mongoose');

module.exports = (app) => {
  return mongoose.connect('mongodb+srv://felipe:!Felipe7777@cluster0-6kuqb.gcp.mongodb.net/ml-collection?retryWrites=true',  {useNewUrlParser: true});
}
