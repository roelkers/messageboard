'use strict';

var mongoose = require('mongoose');

var replySchema = mongoose.Schema({
  text : String,
  reported : Boolean,
  delete_password : String},
  { timestamps: { createdAt: 'created_on'}}
);

module.exports = replySchema;
