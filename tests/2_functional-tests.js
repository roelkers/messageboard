/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {

    suite('POST', function() {
      test('POST /api/threads/:board with text and delete_password', function(done){
        chai.request(server)
        .post('/api/threads/test2')
        .send({
          text : 'new thread',
          delete_password : 'very_secure_password'
        })
        .end(function(err,res){
          //console.log(res);
          assert.equal(res.body.text,'new thread');
          assert.equal(res.body.reported,false);
          assert.equal(res.body.delete_password,'very_secure_password');
          assert.isString(res.body.created_on);
          assert.isString(res.body.bumped_on);
          assert.isArray(res.body.replies);
          assert.isString(res.body._id);
          done();
        })
      });

      test('POST /api/threads/:board without text and delete_password', function(done){
        chai.request(server)
        .post('/api/threads/test2')
        .send({
        })
        .end(function(req,res){
          assert.equal(res.status,400);
          assert.equal(res.text,'incomplete data');
          done();No
        })
      })
    });

    suite('GET', function() {

      var thread_id;

      before(function(done){
        chai.request(server)
        .post('/api/threads/test2')
        .send({
          text : 'bBulletin thread',
          delete_password : 'some_password'
        })
        .end(function(err,res){
          assert.isString(res.body._id);
          thread_id = res.body._id;
          done();
        })
      });

      test('GET /api/threads/:board without thread_id', function(done){
        chai.request(server)
        .get('/api/threads/test2')
        .end(function(req,res){
          //console.log(res);
          assert.isArray(res.body);
          assert.isAtMost(res.body.length,10);
          done();
        })
      })

      test('GET /api/threads/:board with thread_id', function(done){
        chai.request(server)
        .get('/api/threads/test2')
        .query({
          thread_id : thread_id
        })
        .end(function(err,res){
          //console.log(res);
          assert.equal(res.body._id, thread_id);
          assert.equal(res.body.text,'bBulletin thread');
          assert.isString(res.body.created_on);
          assert.isString(res.body.bumped_on);
          assert.isArray(res.body.replies);
          done();
        })
      })

    });

    suite('DELETE', function() {

      var thread_id;

      before(function(done){
        chai.request(server)
        .post('/api/threads/test2')
        .send({
          text : 'delete thread',
          delete_password : 'a_password'
        })
        .end(function(err,res){
          assert.isString(res.body._id);
          thread_id = res.body._id;
          done();
        })
      });

      test('DELETE /api/threads/:board with incorrect password and thread_id', function(done){
        chai.request(server)
        .delete('/api/threads/test2')
        .send({
          thread_id : thread_id,
          delete_password : 'incorrect_password',
          text : 'some text'
        })
        .end(function(err,res){
          //if(err) console.log(err)
          assert.equal(res.status,400);
          assert.equal(res.text,'incorrect password');
          done();
        })
      });

      var incorrect_thread_id = '1234';

      test('DELETE /api/threads/:board with password and incorrect thread_id', function(done){
        chai.request(server)
        .delete('/api/threads/test2')
        .send({
          thread_id : incorrect_thread_id,
          delete_password : 'a_password',
          text : 'some text'
        })
        .end(function(err,res){
          //if(err) console.log(err)
          assert.equal(res.status, 400);
          assert.equal(res.text,'could not find thread');
          done();
        })
      });

      test('DELETE /api/threads/:board with correct password and thread_id', function(done){
        chai.request(server)
        .delete('/api/threads/test2')
        .send({
          thread_id : thread_id,
          delete_password : 'a_password',
          text : 'some text'
        })
        .end(function(err,res){
          if(err) console.log(err)
          assert.equal(res.text,'success');
          done();
        })
      });
    });

    suite('PUT', function() {

      var thread_id;

      before(function(done){
        chai.request(server)
        .post('/api/threads/test2')
        .send({
          text : 'put thread',
          delete_password : 'a_password'
        })
        .end(function(err,res){
          assert.isString(res.body._id);
          thread_id = res.body._id;
          done();
        })
      });


      test('PUT /api/threads/:board with thread_id', function(done){

        chai.request(server)
        .put('/api/threads/test2')
        .send({
          thread_id : '1234'
        })
        .end(function(err,res){
          //if(err) console.log(err);
          assert.equal(res.text, 'could not find thread');
          assert.equal(res.status,400);
          done();
        })
      });

      test('PUT /api/threads/:board with thread_id', function(done){

        chai.request(server)
        .put('/api/threads/test2')
        .send({
          thread_id : thread_id
        })
        .end(function(err,res){
          if(err) console.log(err);
          assert.equal(res.text, 'success');
          assert.equal(res.status,200);
          done();
        })
      });
    });


  });

  suite('API ROUTING FOR /api/replies/:board', function() {

    suite('POST', function() {

      var thread_id ;
      var board = 'test2';

      before(function(done){
        chai.request(server)
        .post('/api/threads/'+board)
        .send({
          text : 'Github thread',
          delete_password : 'secure_password'
        })
        .end(function(err,res){
          assert.isString(res.body._id);
          thread_id = res.body._id;

          done();
        })
      });

      test('POST /api/replies/:board with thread_id, text and delete_password', function(done){
        chai.request(server)
        .post('/api/replies/'+board)
        .send({
          thread_id : thread_id,
          text : 'new reply',
          delete_password : 'new_password'
        })
        .end(function(req,res){
          //console.log(res);
          assert.equal(res.body.replies[0].text,'new reply');
          assert.equal(res.body.replies[0].reported,false);
          assert.equal(res.body.replies[0].delete_password,'new_password');
          assert.isString(res.body.created_on);
          assert.isString(res.body.bumped_on);
          assert.isArray(res.body.replies);
          assert.isString(res.body._id);
          done();
        })
      })

      test('POST /api/replies/:board without thread_id', function(done){
        chai.request(server)
        .post('/api/replies/'+board)
        .send({
          text : 'new reply',
          delete_password : 'new_password'
        })
        .end(function(err,res){
          //console.log(res);
          assert.equal(res.status,400);
          assert.equal(res.text,'incomplete data');
          done();
        })
      })
    });

    suite('GET', function() {
      var thread_id;
      var reply_id;

      before(function(done){
        chai.request(server)
        .post('/api/threads/test2')
        .send({
          text : 'get thread',
          delete_password : 'thread_password'
        })
        .end(function(err,res){
          assert.isString(res.body._id);
          thread_id = res.body._id;
          chai.request(server)
          .post('/api/replies/test2')
          .send({
            thread_id : thread_id,
            text : 'get reply',
            delete_password : 'reply_password'
          })
          .end(function(err,res){
            reply_id = res.body.replies[0]._id;
            //console.log(reply_id);
            done();
          })
        });
      });

      test('GET /api/replies/:board with thread_id and reply_id', function(done){
        chai.request(server)
        .get('/api/replies/test2')
        .send({
          thread_id : thread_id,
          reply_id : reply_id
        })
        .end(function(err,res){
          if(err) console.log(err);
          assert.equal(res.body._id,thread_id);
          assert.isString(res.body.created_on);
          assert.isString(res.body.bumped_on);
          assert.isArray(res.body.replies);
          assert.equal(res.body.replies[0]._id,reply_id);
          assert.equal(res.body.replies[0].text, 'get reply');
          done();
        })
      })


    });

    suite('PUT', function() {
      var thread_id;
      var reply_id;

      before(function(done){
        chai.request(server)
        .post('/api/threads/test2')
        .send({
          text : 'put thread',
          delete_password : 'thread_password'
        })
        .end(function(err,res){
          assert.isString(res.body._id);
          thread_id = res.body._id;
          chai.request(server)
          .post('/api/replies/test2')
          .send({
            thread_id : thread_id,
            text : 'reply to delete thread',
            delete_password : 'reply_password'
          })
          .end(function(err,res){
            reply_id = res.body.replies[0]._id;
            //console.log(reply_id);
            done();
          })
        })

      });

      test('PUT /api/replies/:board with thread_id and invalid reply_id', function(done){
        chai.request(server)
        .put('/api/replies/test2')
        .send({
          thread_id : thread_id,
          reply_id : '1234'
        })
        .end(function(err,res){
          assert.equal(res.status,400);
          assert.equal(res.text,'could not find thread or reply');
          done();
        });
      });

      test('PUT /api/replies/:board with thread_id and reply_id', function(done){
        chai.request(server)
        .put('/api/replies/test2')
        .send({
          thread_id : thread_id,
          reply_id : reply_id
        })
        .end(function(err,res){
          assert.equal(res.status,200);
          assert.equal(res.text,'success');
          done();
        });
      });

    });

    suite('DELETE', function() {
      var thread_id;
      var reply_id;

      before(function(done){
        chai.request(server)
        .post('/api/threads/test2')
        .send({
          text : 'delete thread',
          delete_password : 'thread_password'
        })
        .end(function(err,res){
          assert.isString(res.body._id);
          thread_id = res.body._id;
          chai.request(server)
          .post('/api/replies/test2')
          .send({
            thread_id : thread_id,
            text : 'reply to delete thread',
            delete_password : 'reply_password'
          })
          .end(function(err,res){
            reply_id = res.body.replies[0]._id;
            done();
          })
        })

      });


      test('DELETE /api/replies/:board with incorrect password and thread_id', function(done){
        chai.request(server)
        .delete('/api/replies/test2')
        .send({
          thread_id : thread_id,
          reply_id : reply_id,
          delete_password : 'incorrect_password'
        })
        .end(function(err,res){

          assert.equal(res.status, 400);
          assert.equal(res.text,'incorrect password');
          done();
        })
      });

      test('DELETE /api/replies/:board with correct password, reply_id and thread_id', function(done){
        chai.request(server)
        .delete('/api/replies/test2')
        .send({
          thread_id : thread_id,
          reply_id : reply_id,
          delete_password : 'reply_password'
        })
        .end(function(err,res){
          assert.equal(res.text,'success');
          /*chai.request(server)
          .get('/api/replies/test2')
          .query({
            thread_id : thread_id
          })
          .end(function(err,res){
            if(err) console.log(err)
            console.log(res);
            assert.equal(res.body._id, thread_id);
            assert.isArray(res.body.replies);
            assert.equal(res.body.replies[0].text,'deleted');
            done();
          })*/
          done();
        })
      })

    });

  });

});
