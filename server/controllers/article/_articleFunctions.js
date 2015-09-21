'use strict';

var async = require('async'),
  _ = require('underscore'),
  Boom = require('boom'),
  mongoose = require('mongoose'),
  Article = mongoose.model('Article'),
  Section = mongoose.model('Section');

function getArticle( request, reply, next ) {
  var query, key;
  if( request.params.id ) {
    query = Article.findOne({_id: request.params.id});
    key = 'article';
  } else {
    query = Article.find({});
    key = 'articles';
  }

  query
    .and([{
      _removed: false
    }])
    .populate([{
      path: 'widgets'
    },{
      path: 'sections'
    }, {
      path: '_creator',
      select: 'email firstName lastName'
    }])
    .exec( function(err, article){
      if( err ) { return reply( Boom.badRequest(err) ); }

      if( typeof next === 'function' ) {
        next( article );
      } else {
        var replyObject = {};
        replyObject[ key ] = article;
        reply( replyObject );
      }
    });
}
function _removeSections( sections, next ){
  if( sections.length ) {
    async.forEach( sections, function(item, callback){
      Section.remove( {_id: item._id}, function(){
        callback();
      });
    }, function(){
      next();
    });
  } else {
    next();
  }
}
function _updateArticle( request, reply, article) {
  var oldSections = _.filter( article.sections, function(sec){ return !_.findWhere(request.payload.article.sections, {_id: sec.id}); });

  _removeSections( oldSections, function(){
    article.sections = _.map( request.payload.article.sections, function(sec){ return sec._id;});
    article.save( function(err, article) {
      if( err ) { return reply( Boom.badRequest(err) ); }

      reply( {article: article} );
    });
  });
}
function _createSections( sections ) {
  return Section.create( sections );
}
function _saveSections( sections, next ) {
  async.forEach( sections, function(item, callback){
    Section.update( {_id: item._id}, { $set : { body: item.body }}, function(){
      callback();
    });
  }, function(){
    next();
  });
}
function updateArticle( request, reply ) {
  if( !_.contains(request.params.credentials.access, 'admin') ) {
    return reply( Boom.forbidden() );
  }

  getArticle( request, reply, function( article ) {
    if( !article ) {
      return reply(Boom.badRequest('article not found'));
    }

    var newSections = _.filter( request.payload.article.sections, function(item){ return !item._id; });
    request.payload.article.sections = _.filter( request.payload.article.sections, function(item){ return item._id; });

    _createSections( newSections )
      .then(function( sections ){
        _.each( sections, function(item){ request.payload.article.sections.push(item); });
        _saveSections( request.payload.article.sections, function() {
          _updateArticle( request, reply, article);
        });
      });
  });
}

function _createArticle( request ){
  request.payload.article._creator = request.auth.credentials.id;

  return new Article( request.payload.article ).save();
}
function createArticle( request, reply ) {
  if( !_.contains(request.params.credentials.access, 'admin') ) {
    return reply( Boom.forbidden() );
  }
  if( !request.payload.article ) {
    return reply( Boom.badRequest() );
  }

  _createSections( request.payload.article.sections )
    .then(function(sections){
      request.payload.article.sections = [];
      _.each( sections, function(item){ request.payload.article.sections.push(item.id); });
      _createArticle(request)
        .then( function(article) {
          return reply({article: article});
        }, function(err){
          return reply( Boom.badRequest(err) );
        });
    }, function(err){
      return reply( Boom.badRequest(err) );
    });
}

function removeArticle(request, reply){
  if( !_.contains(request.params.credentials.access, 'admin') ) {
    return reply( Boom.forbidden() );
  }

  getArticle( request, reply, function( article ) {
    if( !article ) {
      return reply(Boom.badRequest('article not found'));
    }
    article._removed = true;

    article.save( function(err) {
      if( err ) { return reply( Boom.badRequest(err )); }
      reply({removed: true});
    });
  });
}

module.exports = {
  get: getArticle,
  create: createArticle,
  update: updateArticle,
  remove: removeArticle
};