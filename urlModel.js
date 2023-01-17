const { Schema, model } = require('mongoose');

const urlsSchema = new Schema({
  original_url: {
    type: String,
    required: true,
    trim: true
  },
  short_url: {
    type: Number,
    required: true
  }
});

urlsSchema.pre(/^find/, function() {
  this.find().select('-_id -__v')
})

const Url = model('Url', urlsSchema);

module.exports = Url;