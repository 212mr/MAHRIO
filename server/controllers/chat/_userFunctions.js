'use strict';

var async = require('async'),
    _ = require('underscore'),
    Boom = require('boom'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Conversation = mongoose.model('Conversation'),
    Message = mongoose.model('Message'),
    Notification = mongoose.model('Notification'),
    config;

function emitMessage( eventLabel ) {
  if( typeof config !== 'undefined') {
    var socket = config.getSocket();
    socket.emit( eventLabel );
    socket.broadcast.emit( eventLabel );
  }
}
function _conversationsHelper( reply, conversations) {
  if( conversations === null ) {
    return reply({conversations: []});
  }
  async.forEach(conversations ,function(conversation,callback) {
    var users;
    if( conversation.members && conversation.members.length ) {
      users = conversation.members;
      conversation.isPrivate = true;
    } else {
      conversation.isPrivate = false;
      users = Object.keys(_.indexBy( conversation.messages, '_user'));
    }
    User
      .find( {_id: {$in: users }})
      .select('email profile avatarImage')
      .populate('profile avatarImage')
      .exec( function(err, users){
        if( err ) { return reply( Boom.badRequest(err) ); }

        conversation.members = _.indexBy( users, '_id');
        callback();
      });
  }, function(){
    return reply({conversations: conversations});
  });
}
function getAllConversations( request, reply ) {
  Conversation
    .find()
    .or([{
      members: {$size: 0}
    },{
      members: {$in: [request.auth.credentials.id]}
    }])
    .populate({
      path: 'messages',
      options: {
        sort: { created: -1}
      }
    })
    .lean()
    .limit(10)
    .exec( function(err, conversations){
      if( err ) { return Boom.badRequest(err); }

      return _conversationsHelper( reply, conversations);
    });
}

function getPrivateConversations( request, reply, callback ) {
  Conversation
    .find({members: {$in: [request.auth.credentials.id]}})
    .populate([{
      path: 'messages',
      options: {
        sort: { created: -1 }
      }
    }])
    .lean()
    .exec(function (err, conversations) {
      if (err) {
        return reply(Boom.badRequest(err));
      }

      if( typeof callback === 'function'){
        callback(conversations);
      } else {
        return _conversationsHelper( reply, conversations);
      }
    });
}
// request.query.userId
function getPrivateConversation( request, reply, callback ) {
  if( typeof callback === 'undefined' && !request.query.userId ) {
    return getPrivateConversations( request, reply );
  }

  Conversation
    .findOne({
      $or: [
        { members: [request.auth.credentials.id, request.query.userId]},
        { members: [request.query.userId,request.auth.credentials.id]}]
    })
    .populate([{
      path: 'messages',
      options: {
        sort: { created: -1 }
      }
    }])
    .lean()
    .exec( function (err, conversation) {
      if (err) {
        return reply(Boom.badRequest(err));
      }

      if( typeof callback === 'function'){
        callback(conversation);
      } else {
        if( conversation === null ) {
          return reply({conversation: null});
        }
        conversation.isPrivate = true;
        User
          .find( {_id: {$in: conversation.members }})
          .select('email profile avatarImage')
          .populate('profile avatarImage')
          .exec( function(err, users){
            if( err ) { return reply( Boom.badRequest(err) ); }

            conversation.members = _.indexBy( users, '_id');
            return reply({conversation: conversation});
          });
      }
    });
}
// request.query.userId && request.payload.conversation
function postPrivateConversation( request, reply ) {
  getPrivateConversation( request, reply, function( conversation ){
    if( conversation === null ) {
      Message.create( request.payload.conversation.message, function(err, msg){
        if( err ) { return reply(Boom.badRequest(err)); }
        delete request.payload.conversation.message;
        request.payload.conversation.messages = [msg.id];
        request.payload.conversation.members = [request.query.userId, request.auth.credentials.id];
        Conversation.create( request.payload.conversation, function(err, conv){
          if( err ) { return reply( Boom.badRequest(err)); }

          msg._conversation = conv.id;
          msg._user = request.auth.credentials.id;
          msg.save( function(err, msg){
            if( err ) { return reply( Boom.badRequest(err));}
            conv.messages = [msg];

            emitMessage( 'event:notification:'+request.query.userId );
            Notification.create({
              resource: 'chat',
              id: conv.id,
              heading: 'Private Conversation',
              teaser: msg.content,
              _user: request.query.userId
            }, function() {
              return getPrivateConversation( request, reply);
            });
          });
        });
      });
    } else {
      return reply( Boom.badRequest('Conversation Exists') );
    }
  });
}
//request.query.userId && request.payload.message
function sendPrivateMessage( request, reply ){
  getPrivateConversation( request, reply, function( conversation ){
    if( conversation === null ) {
      return reply( Boom.badRequest('Conversation not found!') );
    }
    request.payload.message._user = request.auth.credentials.id;
    request.payload.message._conversation = conversation.id;
    Message.create( request.payload.message, function(err, msg){
      if( err ) { return reply(Boom.badRequest(err)); }

      Conversation
        .update({_id: conversation._id}, {$push: {messages: mongoose.Types.ObjectId(msg.id)}}, function(err){
          if( err ) { return reply(Boom.badRequest(err)); }

          emitMessage( 'event:notification:'+request.query.userId );
          emitMessage( 'event:conversation:'+conversation._id );
          Notification.create({
            resource: 'chat',
            id: conversation._id,
            heading: 'Private Conversation',
            teaser: msg.content,
            _user: request.query.userId
          }, function() {
            return reply( {message: msg} );
          });
        });
    });
  });
}
function getPublicConversations( request, reply ){
  Conversation
    .find( {} )
    .and([{
      members: {$size: 0}
    }])
    .populate([{
      path: 'messages',
      select: 'content created _user',
      options: {
        sort: { created: -1 }
      }
    }])
    .lean()
    .exec(function (err, conversations) {
      if (err) {
        return reply(Boom.badRequest(err));
      }
      return _conversationsHelper( reply, conversations);
    });
}
function getPublicConversation( request, reply, callback ){
  if( !request.query.conversationId ) {
    return getPublicConversations( request, reply );
  }
  Conversation
    .findOne( {_id: request.query.conversationId} )
    .and([{
      members: {$size: 0}
    }])
    .populate([{
      path: 'messages',
      select: 'content created _user',
      options: {
        sort: { created: -1 }
      }
    }])
    .exec(function (err, conversation) {
      if (err) {
        return reply(Boom.badRequest(err));
      }

      if( typeof callback === 'function'){
        callback(conversation);
      } else {
        var users = [];
        _.each( conversation.messages, function(item){
          users.push( item._user );
        });

        User.find( {'_id': {$in: users}})
          .select('email profile avatarImage')
          .populate('profile avatarImage')
          .exec(function(err, members) {
            if (err) { return reply( Boom.badRequest(err)); }

            conversation.members = _.indexBy( members, '_id');
            reply({conversation: conversation});
          });
      }
    });
}
// request.query.userId && request.payload.conversation
function postPublicConversation( request, reply ) {
  Message.create( request.payload.conversation.message, function(err, msg){
    if( err ) { return reply(Boom.badRequest(err)); }

    delete request.payload.conversation.message;
    request.payload.conversation.messages = [msg.id];
    delete request.payload.conversation.members;
    Conversation.create( request.payload.conversation, function(err, conv){
      if( err ) { return reply( Boom.badRequest(err)); }

      msg._conversation = conv.id;
      msg._user = request.auth.credentials.id;
      msg.save( function(err, msg){
        if( err ) { return reply( Boom.badRequest(err));}
        conv.messages = [msg];

        request.query = { conversationId: conv.id };
        return getPublicConversation( request, reply);
      });
    });
  });
}
function sendPublicMessage( request, reply ){
  getPublicConversation( request, reply, function(conversation){
    if( conversation === null ) {
      return reply( Boom.badRequest('Conversation not found!') );
    }
    request.payload.message._user = request.auth.credentials.id;
    request.payload.message._conversation = conversation.id;
    Message.create( request.payload.message, function(err, msg){
      if( err ) { return reply(Boom.badRequest(err)); }

      conversation.messages = _.map(conversation.messages, function(item){ return item.id;});
      conversation.messages.push( msg.id );
      conversation.save( function(err){
        if( err ) { return reply(Boom.badRequest(err)); }

        emitMessage( 'event:conversation:'+conversation.id );
        reply( {message: msg} );
      });
    });
  });
}
function getMessagesIn( request, reply) {
  Message
    .find( {
      _conversation: request.params.id,
      created: {
        $gte: new Date( request.query.time)
      }
    })
    .exec( function(err, messages) {
      if( err ) { return Boom.badRequest(err); }

      return reply( {messages: messages} );
    });
}
function getPublicMessagesIn( request, reply) {
  Conversation
    .findOne( {
      _id: request.params.id
    })
    .and([{
      members: {$size: 0}
    }])
    .exec( function(err, conversation){
      if( err || !conversation) { return Boom.badRequest(err); }

      return getMessagesIn( request, reply);
    });
}
function getPrivateMessagesIn( request, reply ) {
  Conversation
    .findOne( {
      members: {
        $in: [ request.auth.credentials.id ]
      },
      _id: request.params.id
    })
    .exec( function(err, conversation){
      if( err || !conversation ) { return Boom.badRequest(err); }

      return getMessagesIn( request, reply);
    });
}
function getMyLastMessages( request, reply) {
  console.log( request, reply);
}
module.exports = {
  setConfig: function( cfg ) {
    config = cfg;
  },
  getAllConversations: getAllConversations,
  getPrivateConversations: getPrivateConversations,
  getPrivateConversation: getPrivateConversation,
  postPrivateConversation: postPrivateConversation,
  sendPrivateMessage: sendPrivateMessage,
  getPublicConversations: getPublicConversations,
  getPublicConversation: getPublicConversation,
  postPublicConversation: postPublicConversation,
  sendPublicMessage: sendPublicMessage,
  getMyLastMessages: getMyLastMessages,
  getPublicMessagesIn: getPublicMessagesIn,
  getPrivateMessagesIn: getPrivateMessagesIn
};