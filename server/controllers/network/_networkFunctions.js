'use strict';

var async = require('async'),
  _ = require('underscore'),
  Boom = require('boom'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Network = mongoose.model('Network');

function createNetwork( request, reply ) {
  if( !request.payload.network || !_.contains(request.auth.credentials.access, 'sudo') ) {
    return reply( Boom.badRequest() );
  }

  var members = request.payload.network.members;
  delete request.payload.network.members;
  request.payload.network.owner = request.auth.credentials.id;
  Network.create( request.payload.network, function(err, network){
    if( err ) { return reply( Boom.badRequest(err) ); }

    User.update( {_id: {$in: members}}, {$push: {networks: network.id}}, {multi: true},
      function(err){
        if( err ) { return Boom.badRequest(err); }

        reply({network: network});
      });
  });
}
function _getNetworkMembers( network, callback ) {
  User
    .find( {networks: {$in: [network.id]}})
    .select('email profile avatarImage')
    .populate('profile avatarImage')
    .exec( function(err, users){
      if( err ) { callback(err); }

      network._doc.members = _.indexBy( users, '_id');

      callback( false );
    });
}
function _getAllNetworks( request, reply, callback ) {
  Network
    .find( )
    .exec( function(err, networks){
      if( err ) { return reply( Boom.badRequest(err) ); }

      if( typeof callback !== 'undefined' ) {
        callback( networks );
      } else {
        return reply({networks: networks});
      }
    });
}
function getNetwork( request, reply, callback ) {
  if( !_.contains(request.auth.credentials.access, 'sudo') ) {
    return reply( Boom.badRequest() );
  }
  if( typeof request.params.id === 'undefined' ) {
    _getAllNetworks( request, reply, function(networks){
      async.each( networks, function(network, callback){
        _getNetworkMembers( network, function(err){
          if( err ) { return reply( Boom.badRequest() ); }

          callback();
        });
      }, function(){
        return reply( {networks: networks} );
      });
    });
  } else {
    Network
      .findOne( {_id: request.params.id} )
      .exec( function(err,network){
        if( err ) { return reply( Boom.badRequest(err) ); }

        _getNetworkMembers( network, function(err){
          if( err ) { return reply( Boom.badRequest() ); }

          if( typeof callback !== 'undefined' ) {
            callback( network );
          } else {
            return reply( {network: network} );
          }
        });
      });
  }
}
function updateNetwork( request, reply ) {
  if( !request.payload.network || !_.contains(request.auth.credentials.access, 'sudo') || typeof request.params.id === 'undefined') {
    return reply( Boom.badRequest() );
  } else if( typeof request.payload.networkIds !== 'undefined' && Array.isArray( request.payload.networkIds ) ) {
    // TODO: update several networks at once
  } else {
    getNetwork( request, reply, function(network){

      network.name = request.payload.network.name;
      network.isPrivate = request.payload.network.isPrivate;

      network.save( function(err, network){
        if( err ) { return reply( Boom.badRequest() ); }

        async.parallel( [function( callback ){
          var oldMembers = null;
          if( typeof network.toJSON().members !== 'undefined' && typeof request.payload.network.members !== 'undefined' ) {
            oldMembers = _.reject(Object.keys(network.toJSON().members), function (member) {
              return _.contains(Object.keys(request.payload.network.members), member);
            });
          } else if (typeof network.toJSON().members !== 'undefined') {
            oldMembers = Object.keys( network.toJSON().members );
          }
          if( oldMembers ) {
            User.update({_id: {$in: oldMembers}}, {$pull: {networks: network.id}}, {multi: true},
              function (err) {
                if (err) { return reply(Boom.badRequest(err));  }

                callback();
              });
          } else {
            callback();
          }
        }, function( callback ){
          var newMembers = null;
          if( typeof request.payload.network.members !== 'undefined' && typeof network.toJSON().members !== 'undefined' ) {
            newMembers = _.reject(Object.keys(request.payload.network.members), function (member) {
              return _.contains(Object.keys(network.toJSON().members), member);
            });
          } else if (typeof request.payload.network.members !== 'undefined' ){
            newMembers = Object.keys( request.payload.network.members );
          }

          if( newMembers ) {
            User.update({_id: {$in: newMembers}}, {$push: {networks: network.id}}, {multi: true},
              function (err) {
                if (err) { return reply(Boom.badRequest(err)); }

                callback();
              });
          } else {
            callback();
          }
        }], function(){
          return reply( {network: network} );
        });
      });
    });
  }
}
function removeNetwork( request, reply ){
  if( typeof request.params.id !== 'undefined' ) {
    getNetwork( request, reply, function(network) {
      var oldMembers = null;
      if (typeof network.toJSON().members !== 'undefined') {
        oldMembers = Object.keys( network.toJSON().members );
      }
      Network.remove({_id: request.params.id}, function (err) {
        if (err) { return reply(Boom.badRequest()); }

        if( oldMembers ) {
          User.update({_id: {$in: oldMembers}}, {$pull: {networks: request.params.id}}, {multi: true},
            function (err) {
              if (err) { return reply(Boom.badRequest(err)); }

              reply({removed: true});
            });
          // TODO: Conversations.remove( {network: network._id}, function(){ ... });
        } else {
          reply({removed: true});
        }
      });
    });
  } else {
    return reply( Boom.badRequest() );
  }
}

module.exports = {
  create: createNetwork,
  read: getNetwork,
  update: updateNetwork,
  remove: removeNetwork
};