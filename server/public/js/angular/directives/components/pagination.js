angular.module('baseApp.directives')
  .directive('paginate', ['$rootScope',
    function(){
      'use strict';
      return {
        restrict: 'E',
        replace: true,
        templateUrl: '/assets/html/directives/components/pagination',
        scope: {
          config: '=',
          right: '@'
        },
        link: function(){
        }
      };
    }
  ]);