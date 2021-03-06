angular.module('baseApp.controllers')
  .controller('ArticleController', ['$scope', '$state', '$http', 'currentUser', 'Article', '_','Notification','FormHelper',
    function($scope, $state, $http, currentUser, Article, _, Notification, FormHelper){
      'use strict';

      $scope.articles = [];
      var formSetup = function(){
        $scope.sortableOptions = { disabled: true };

        $scope.addSection = function( section ){
          $scope.article.sections.push( {body: section} );
        };
        $scope.editSection = function( index ) {
          $scope.article.sections[ index].edit = true;
        };
        $scope.saveSection = function( index ) {
          delete $scope.article.sections[ index].edit;
        };
        $scope.sortSections = function( ){
          $scope.sortableOptions = {
            disabled: false
          };
          $scope.sortingSections = true;
        };
        $scope.stopSorting = function(){
          $scope.sortableOptions = {
            disabled: true
          };
          $scope.sortingSections = false;
        };
        $scope.removeSection = function( index ) {
          $scope.article.sections.splice( index, 1);
        };
        $scope.addWidget = function( widget ){
          $scope.article.widgets.push( widget );
        };
        $scope.editWidget = function( index ) {
          $scope.article.widgets[ index].edit = true;
        };
        $scope.saveWidget = function( index ){
          delete $scope.article.widgets[ index].edit;
        };
        $scope.removeWidget = function( index ) {
          $scope.article.widgets.splice( index, 1);
        };
        FormHelper.setupFormHelper( $scope, 'article', Article );
      };
      switch( $state.current.name ) {
        case 'articles.new':
          $scope.article = {
            sections: [],
            widgets: []
          };
          $scope.save = function(){
            _.forEach( $scope.article.sections, function(sec, key) {
              sec.order = key;
            });
            Article.add( $scope.article )
              .then( function(){
                $state.go('articles.list',{}, { reload: true });
              });
          };
          formSetup();
          break;
        case 'articles.detail':
          Article.get( $state.params.id )
            .then( function(res) {
              $scope.article = res.article;
              if( $scope.article.media && $scope.article.media.length ) {
                $scope.article.primaryImage = {
                  url: $scope.article.media[0].url
                };
              }
            });
          break;
        case 'articles.list':
          Article.get()
            .then( function( res ) {
              $scope.articles = res.articles;
              $scope.articles = _.indexBy( $scope.articles, '_id' );
              _.each( $scope.articles, function(item){
                if( item.media && item.media.length ) {
                  item.primaryImage = {
                    url: item.media[0].url
                  };
                }
              });
            });
          break;
        case 'articles.edit':
          Article.get( $state.params.id )
            .then( function( res ) {
              $scope.article = res.article;
            });
          formSetup();
          $scope.save = function( ) {
            $scope.article.media = Object.keys(_.indexBy( $scope.article.media, '_id'));
            Article.update( $scope.article )
              .then( function(){
                //$state.go('articles.list');
                $state.go('articles.list', {}, {reload: true});
              });
          };
          break;
        default:
          break;
      }


      $scope.remove = function( id ){
        Notification.id = id;
        Notification.confirm = 'Are you sure you want to delete?';
        Notification.confirmed = false;
      };
      $scope.$watch( function(){ return Notification.confirmed; }, function(newVal) {
        if (newVal) {
          Notification.confirmed = null;
          Article.remove( Notification.id )
            .then( function(){
              $state.go('articles.list', {}, {reload: true});
            });
        }
      });
    }]);