angular.module('baseApp.services').factory('ArticleResource', [ '$resource', function($resource) {
  'use strict';
  return $resource('/api/articles/:id',
    { id: '@id' },
    {
      create: { method: 'POST' },
      read:   { method: 'GET' },
      update: { method: 'PUT' },
      remove: { method: 'DELETE' }
    });
}]);
angular.module('baseApp.services').factory('Article', [ 'ArticleResource', function( ArticleResource ) {
  'use strict';
  return {
    add: function( article ) { return ArticleResource.create( {article: article} ).$promise; },
    get: function( id ) { return ArticleResource.read( id ? {id: id} : {} ).$promise; },
    update: function( article ) { return ArticleResource.update( {id: article._id}, {article: article} ) .$promise; },
    remove: function(id){ return BoardResource.remove( {id: id} ).$promise; }
  };
}]);