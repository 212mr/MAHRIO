/*
  TODO: example here
 */

angular.module('baseApp', [
  'ui.router',
  'ui.bootstrap.typeahead',
  'ui.bootstrap.tabs',
  'ui.sortable',
  'ngResource',
  'btford.socket-io',
  'angular-loading-bar',
  'chart.js',
  'baseApp.services',
  'baseApp.directives',
  'baseApp.filters',
  'baseApp.controllers',
  'angular-underscore'
])
  .constant('_', window._)
  .config(
  function ($stateProvider, $urlRouterProvider, $locationProvider, ChartJsProvider, ResProvider) {
    'use strict';

    var resource = ResProvider.$get();

    ChartJsProvider.setOptions({ responsive: true });
    ChartJsProvider.setOptions('Line', { responsive: true });
    ChartJsProvider.setOptions('Doughnut', { responsive: true });

    $locationProvider.html5Mode(false);
  /*      .html5Mode({
          enabled: true,
          requireBase: true
        });*/
    $stateProvider
      .state('root', {
        url: '/',
        templateUrl: '/assets/html/layout/page/root',
        title: 'Dashboard'
      })
      .state('notifications', {
        url: '/notifications',
        templateUrl: '/assets/html/notification/index',
        controller: 'NotificationsController',
        title: 'Notifications',
        subTitle: 'What\'s New'
      })
      .state('articles', {
        abstract: true,
        url: '/articles',
        controller: 'ArticleController',
        template: '<ui-view/>'
      })
      .state('articles.new', {
        url: '/new',
        templateUrl: '/assets/html/article/form',
        title: 'New Article'
      })
      .state('articles.list', {
        url: '/all',
        controller: 'ArticleController',
        templateUrl: '/assets/html/article/list',
        title: 'List Articles'
      })
      .state('articles.edit', {
        url: '/:id/edit',
        templateUrl: '/assets/html/article/form',
        title: 'Edit Article'
      })
      .state('articles.detail', {
        url: '/:id',
        templateUrl: '/assets/html/article/detail',
        title: 'Article'
      })
      .state('about', {
        url: '/about',
        templateUrl: '/assets/html/pages/about',
        title: 'About Us'
      })
      .state('contact', {
        url: '/contact',
        templateUrl: '/assets/html/pages/contact',
        title: 'Contact Us'
      })
      .state('terms', {
        url: '/terms',
        templateUrl: '/assets/html/pages/terms',
        title: 'Terms and Conditions'
      })
      .state('policy', {
        url: '/policy',
        templateUrl: '/assets/html/pages/policy',
        title: 'Privacy Policy'
      })
      .state('cookies', {
        url: '/cookies',
        templateUrl: '/assets/html/pages/cookies',
        title: 'Cookie Policy'
      })
      .state('users', {
        abstract: true,
        url: '/users',
        template: '<ui-view/>',
        controller: 'UsersController'
      })
      .state('users.new', {
        url: '/new',
        templateUrl: '/assets/html/user/form-register',
      })
      .state('users.list', {
        url: '/list',
        templateUrl: '/assets/html/user/list',
        title: 'List Users'
      })
      .state('users.detail', {
        url: '/profile/:id',
        controller: 'ProfileController',
        templateUrl: '/assets/html/profile/directive-summary',
        title: 'User'
      })
      .state('newsletters', {
        url: '/admin/newsletter',
        templateUrl: '/assets/html/admin_newsletter/newsletters',
        controller: 'adminNewslettersController'
      })
      .state('questions', {
        url: '/questions',
        templateUrl: '/assets/html/questions/index',
        controller: 'QuestionsController'
      })
      .state('conversations', {
        url: '/conversations',
        templateUrl: '/assets/html/chat/index',
        controller: 'ConversationsController',
        title: 'All Conversations'
      })
      .state('conversations.public', {
        url: '/public',
        title: 'Public Conversations'
      })
      .state('conversations.private', {
        url: '/private',
        title: 'Private Conversations'
      })
      .state('conversations.view', {
        url: '/:id',
        controller: 'ConversationsController',
        title: 'Conversation'
      })
      .state('login', {
        url: '/login?linkedIn',
        templateUrl: '/assets/html/session/form-login',
        controller: 'SessionController'
      })
      .state('confirm', {
        url: '/confirm/:token?user=true',
        templateUrl: '/assets/html/auth/confirm',
        controller: 'UsersController'
      })
      .state('recoverpassword', {
        url: '/recoverpassword',
        controller: 'SessionController',
        templateUrl: '/assets/html/session/form-recover-password'
      })
      .state('passwordreset', {
        url: '/passwordreset/:token',
        controller: 'SessionController',
        templateUrl: '/assets/html/session/form-password-reset'
      })
      .state('calendar', {
        url: '/calendar',
        controller: 'CalendarController',
        templateUrl: '/assets/html/calendar/index',
        title: 'Calendar',
        subTitle: 'Events'
      })
      .state('calendar.day', {
        url: '/day'
      })
      .state('calendar.month', {
        url: '/month'
      })
      .state('profile', {
        url: '/profile',
        controller: 'ProfileController',
        templateUrl: '/assets/html/profile/profile-landing',
        title: 'My Profile'
      })
      .state('profile.info', {
        url: '/info',
        title: 'My Profile',
        subTitle: 'General'
      })
      .state('profile.contact', {
        url: '/contact',
        title: 'My Profile',
        subTitle: 'Contact'
      })
      .state('profile.security', {
        url: '/security',
        title: 'My Profile',
        subTitle: 'Security'
      })
      .state('boards', {
        abstract: true,
        url: '/boards',
        controller: 'BoardController',
        template: '<ui-view/>'
      })
      .state('boards.new', {
        url: '/new',
        templateUrl: '/assets/html/board/form',
        title: 'New Board'
      })
      .state('boards.list', {
        url: '/all',
        controller: 'BoardController',
        templateUrl: '/assets/html/board/list',
        title: 'List Boards'
      })
      .state('boards.edit', {
        url: '/:board/edit',
        templateUrl: '/assets/html/board/form',
        title: 'Edit Board'
      })
      .state('boards.detail', {
        url: '/:id',
        controller: 'TaskController',
        templateUrl: '/assets/html/task/index',
        title: 'Board',
        subTitle: 'Tasks'
      })
      .state('boards.detail.backlog', {
        url: '/backlog',
        controller: 'TaskController',
        templateUrl: '/assets/html/task/index',
        title: 'Board',
        subTitle: 'Backlog'
      })
      .state('boards.detail.backlog.new', {
        url: '/new',
        controller: 'TaskController',
        templateUrl: '/assets/html/task/index',
        title: 'Board',
        subTitle: 'New Task'
      })
      .state('boards.detail.backlog.edit', {
        url: '/:task/edit',
        controller: 'TaskController',
        templateUrl: '/assets/html/task/index',
        title: 'Board',
        subTitle: 'Edit Task'
      })
      .state('networks', {
        abstract: true,
        url: '/networks',
        template: '<ui-view/>'
      })
      .state('networks.new', {
        url: '/new',
        controller: 'NetworksController',
        templateUrl: '/assets/html/network/form',
        title: 'New Network',
        resolve: { networks: function(){ return []; } }
      })
      .state('networks.list', {
        url: '',
        controller: 'NetworksController',
        templateUrl: '/assets/html/network/list',
        title: 'List Networks',
        resolve: {
          networks: function($stateParams, Network, $q) {
            return resource.network( $stateParams.id, Network, $q.defer() );
          }
        }
      })
      .state('networks.detail', {
        url: '/:id',
        controller: 'NetworkController',
        templateUrl: '/assets/html/network/detail',
        title: 'Network',
        subTitle: 'View',
        resolve: {
          network: function($stateParams, Network, $q) {
            return resource.network( $stateParams.id, Network, $q.defer() );
          }
        }
      })
      .state('networks.edit', {
        url: '/:id/edit',
        controller: 'NetworkController',
        templateUrl: '/assets/html/network/form',
        title: 'Edit Network',
        resolve: {
          network: function($stateParams, Network, $q) {
            return resource.network( $stateParams.id, Network, $q.defer() );
          }
        }
      })

      .state('networks.detail.boards', {
        url: '/boards',
        controller: 'NetworkBoardsCtrl',
        templateUrl: '/assets/html/task/index',
        title: 'Network',
        subTitle: 'View'
      })
      //.state('tasks', {
      //  url: '/tasks',
      //  controller: 'TaskController',
      //  templateUrl: '/assets/html/task/index'
      //})
      //.state('tasks.current',{
      //  url: '/current'
      //})
      //.state('tasks.new',{
      //  url: '/new'
      //})
      //.state('tasks.view', {
      //  url: '/:id'
      //})
      //.state('tasks.edit',{
      //  url: '/:id/edit'
      //})
      .state('mail', {
        url: '/mail',
        controller: 'MailboxController',
        templateUrl: '/assets/html/mail/index',
        title: 'Mailbox',
        subTitle: 'Inbox'
      })
      .state('mail.inbox', {
        url: '/inbox',
        title: 'Mailbox',
        subTitle: 'Inbox'
      })
      .state('mail.new', {
        url: '/new',
        title: 'Mailbox',
        subTitle: 'New'
      })
      .state('mail.drafts', {
        url: '/drafts',
        title: 'Mailbox',
        subTitle: 'Drafts'
      })
      .state('mail.sent', {
        url: '/sent',
        title: 'Mailbox',
        subTitle: 'Sent'
      })
      .state('mail.starred', {
        url: '/starred',
        title: 'Mailbox',
        subTitle: 'Starred'
      })
      .state('mail.archived', {
        url: '/archived',
        title: 'Mailbox',
        subTitle: 'Archived'
      })
      .state('mail.view', {
        url: '/view/:id/:action',
        title: 'Mailbox',
        subTitle: 'View'
      });

    $urlRouterProvider.otherwise('/');

  })
  .config(['ChartJsProvider', function (ChartJsProvider) {
    // Configure all charts
    'use strict';
    ChartJsProvider.setOptions({
      responsive: false
    });
    // Configure all line charts
    ChartJsProvider.setOptions('Line', {
      datasetFill: false
    });
  }]);

angular.module('baseApp.services', ['ngResource']);
angular.module('baseApp.directives', []);
angular.module('baseApp.filters', []);
angular.module('baseApp.controllers', [])
  .run(['$rootScope', '$state', '$http', '$location', 'LocaleFactory', 'ValidatorFactory', 'currentUser',
    function ($rootScope, $state, $http, $location, LocaleFactory, ValidatorFactory, currentUser) {
      'use strict';

      $rootScope.locale = LocaleFactory.getEnglish();
      $rootScope.validate = ValidatorFactory;

      $rootScope.$on('$routeChangeSuccess', function(){
        //window.ga('send', 'pageview', $location.path());
      });

      $rootScope.logout = function(){
        currentUser.logout()
          .then( function(){
            delete $http.defaults.headers.common.Authorization;
            delete window.localStorage.Access;
            delete window.localStorage.Authorization;
          });
      };

      // AUTHENTICATION
      $rootScope.setAccess = function( access ){
        $rootScope.access = access;
        window.localStorage.Access = access;
      };
      $rootScope.setAccess( window.localStorage.Access || ['any'] );

      $rootScope.setAuthorizationHeader = function(token){

        if( token ) {
          $http.defaults.headers.common.Authorization = token;
          window.localStorage.Authorization = token;
        }
      };
      $rootScope.setAuthorizationHeader( window.localStorage.Authorization);

      $rootScope.getProfile = function(route){
        if( angular.isDefined( $http.defaults.headers.common.Authorization ) ) {
          currentUser.isLoggedIn()
            .then( function(response){
              if( response.user ) {
                currentUser.login( response.user, route || false );
              }
            }, function(){
              delete window.localStorage.Authorization;
              window.localStorage.Access = ['any'];
              $rootScope.access = ['any'];
            });
        }
      };
      $rootScope.getProfile();

      $rootScope.isDefined = function( val ){
        return angular.isDefined( val );
      };

      $rootScope.access = ['any'];
      $rootScope.settings = { skin: window.localStorage.skin || 'skin-blue' };
      $rootScope.getThemeClass = function(){
        return $rootScope.settings.skin;
      };

      window.rootScope = $rootScope;

      $rootScope.isSidebarCollapsed = window.localStorage.isSidebarCollapsed || false;
      $rootScope.toggleSidebarCollapsed = function(){
        if( window.localStorage.isSidebarCollapsed ) {
          delete window.localStorage.isSidebarCollapsed;
        } else {
          window.localStorage.isSidebarCollapsed = true;
        }
      };
      $rootScope.setSettings = function( settings ) {
        $rootScope.settings = settings;
        window.localStorage.skin = settings.skin;
      };
    }
  ]);

