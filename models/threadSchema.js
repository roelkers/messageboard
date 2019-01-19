'use strict';

var mongoose = require('mongoose');
var Reply = require('./replySchema');

var threadSchema = mongoose.Schema({
  board : String,
  text : String,
  replies : [Reply],
  reported : Boolean,
  delete_password : String},
  { timestamps: { createdAt: 'created_on', updatedAt : 'bumped_on' }}
);

module.exports = threadSchema;
