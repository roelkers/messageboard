/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var mongoose = require('mongoose');
var threadSchema = require('../models/threadSchema');
var Thread = mongoose.model('Thread', threadSchema);

var LIMIT_THREADS = 10;
var LIMIT_REPLIES = 3;

module.exports = function (app) {

  function getRouteWithQueryParam(req,res,next){
    if(!req.query.thread_id) return next();

    var thread_id = req.query.thread_id;
    Thread.findById(thread_id,
    {reported : 0, delete_password : 0})
    .then((thread)=>{
      res.send(thread);
    })
    .catch((error)=>{
      console.log(error);
      res.send('could not find any threads');
    })
  }

  app.route('/api/threads/:board')

  .get(getRouteWithQueryParam,function(req,res){
    var board = req.params.board;
    Thread.find({
      board : board
    },
    {replies: { $slice: [ "$replies", LIMIT_REPLIES ] }, reported : 0, delete_password : 0})
    .sort({ bumped_on : -1})
    .limit(LIMIT_THREADS)
    .then((threads)=>{
      res.send(threads);
    })
    .catch((error)=>{
      console.log(error);
      res.send('could not find any threads');
    })
  })

  .post(function(req,res){
    var board = req.params.board;
    if(req.body.text == null || req.body.delete_password == null){
      res.status(400).send('incomplete data');
    }
    else {
      Thread.create(
        {board : board,
         text : req.body.text,
         reported : false,
         delete_password : req.body.delete_password})
        .then((newThread)=>{
          res.send(newThread);
        })
      .catch((err)=>{
        console.log(err);
        res.status(404).send("could not create thread.")
      })
    }
  })

  .put(function(req,res){
    var board = req.params.board;
    if(board == null || req.body.thread_id == null){
      res.status(400).send('incomplete data');
    }
    else {

      var thread_id = req.body.thread_id;

      Thread.findByIdAndUpdate(thread_id,
      {
        $set : {reported : true}
      })
      .then((thread)=>{
        res.send('success');
      })
      .catch((error)=>{
        res.status(400).send('could not find thread');
      })
    }
  })

  .delete([checkDeletePasswordForThread,deleteRouteThread],function(req,res){

  });


  function checkDeletePasswordForThread(req,res,next){
    var board = req.params.board;
    if(board == null || req.body.thread_id == null || req.body.delete_password == null){
      res.status(400).send('incomplete data');
    }
    else{

      var delete_password = req.body.delete_password;
      var thread_id = req.body.thread_id;

      Thread.findById(thread_id)
      .then((thread)=>{
        if(thread.delete_password === delete_password){
          return next();
        }
        else{
          res.status(400).send('incorrect password')
        }
      })
      .catch((error)=>{
        //console.log(error);
        res.status(400).send("could not find thread");
      })
    }
  }

  function deleteRouteThread(req,res,next){

    var thread_id = req.body.thread_id;
    Thread.findByIdAndRemove(thread_id)
    .then(()=>{
      res.send('success');
    })
    .catch((error)=>{
      console.log(error);
      res.status(400).send('could not delete thread' +thread_id);
    })

  }

  app.route('/api/replies/:board')


  .get(function(req,res){
    var board = req.params.board;
    if(req.body.thread_id == null || req.body.reply_id == null){
      res.status(400).send('incomplete data');
    }
    else {
      var thread_id = req.body.thread_id;
      Thread.findById(thread_id)
      .then((thread)=>{
        res.send(thread);
      })
      .catch((error)=>{
        console.log(error);
        res.status(400).send('could not find thread');
      })
    }
  })

  .post(function(req,res){
    var board = req.params.board;
    if(req.body.thread_id == null || req.body.text == null || req.body.delete_password == null){
      res.status(400).send('incomplete data');
    }
    else {
      var reply = {};
      reply.text = req.body.text;
      reply.delete_password = req.body.delete_password;
      reply.reported = false;
      Thread.findByIdAndUpdate(req.body.thread_id
      ,{
        $push : {replies : reply }
      },{new : true})
     .then((thread)=>{
       res.send(thread);
     })
      .catch((err)=>{
        console.log(err);
        res.status(404).send("could not create thread.")
      })
    }
  })

  .put(function(req,res){
    if(req.params.board == null || req.body.thread_id == null || req.body.reply_id == null){
      res.status(400).send('incomplete data');
    }
    else {
      var thread_id = req.body.thread_id;
      var reply_id = req.body.reply_id;
      Thread.findOneAndUpdate(
        {
            '_id' : thread_id,
            'replies._id' : reply_id
        },
        {
              $set : {'replies.$.reported': true}
        },
        {new : true}
      )
      .then((thread)=>{
        res.send('success');
      })
      .catch((error)=>{
        res.status(400).send('could not find thread or reply');
      })
    }
  })

  .delete([checkDeletePasswordForReply, deleteRouteReply], function(req,res){

  });

  function checkDeletePasswordForReply(req,res,next){
    var delete_password = req.body.delete_password;
    var thread_id = req.body.thread_id;
    var reply_id = req.body.reply_id;

    Thread.findOne(
      {_id : thread_id},
      {replies : { $elemMatch : { _id : reply_id}}}
    )
    .then((thread)=>{
      if(thread.replies[0].delete_password === delete_password){
        return next();
      }
      else{
        res.status(400).send('incorrect password')
      }
    });
  }

  function deleteRouteReply(req,res,next){
    if(!(req.body.reply_id)) return next();

    var thread_id = req.body.thread_id;
    var reply_id = req.body.reply_id;

    Thread.findOneAndUpdate(
    {
        '_id' : thread_id,
        'replies._id' : reply_id
    },
    {
          $set : {'replies.$.text': 'deleted'}
    },
    {new : true})
    .then((thread)=>{
      res.send('success');
    })
    .catch((error)=>{
      console.log(error);
      res.send('could not delete reply ' +reply_id);
    })

  }



};
