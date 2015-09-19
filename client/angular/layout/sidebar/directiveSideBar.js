angular.module('baseApp.directives')
  .directive('sideBar', ['$rootScope','$state','currentUser',
    function($rootScope, $state ){
      'use strict';
      return {
        restrict: 'A',
        scope: {
          access: '='
        },
        link: function(scope, elem, attrs) {
          scope.logout = $rootScope.logout;
          scope.$watch( 'access', function(access){
            switch( access ){
              case 'sudo':
              case 'admin':
              case 'authorized':
                if( attrs.type === 'navigation' ){
                  scope.dynamicTemplateUrl = '/assets/html/layout/sidebar/leftMainNavigation';
                } else {
                  scope.dynamicTemplateUrl = '/assets/html/layout/sidebar/rightMainSettings';
                }
                break;
              default:
                scope.dynamicTemplateUrl = '';
            }
          });
          scope.goTo = function( state, id ) {
            if( $('#'+id).next().height() < 10 ) {
              $state.go( state );
            }
          };
        },
        template: '<ng-include src="dynamicTemplateUrl" render-app-gestures></ng-include>'
      };
    }
  ]);