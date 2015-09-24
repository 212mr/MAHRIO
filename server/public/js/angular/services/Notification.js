angular.module('baseApp.services')
  .factory('NotificationResource', [ '$resource', function($resource) {
    'use strict';
    return $resource('/api/notifications/:id',
      { id: '@id' },
      {
        read:   { method: 'GET' },
        remove: { method: 'DELETE' }
      });
  }])
  .factory('Notification', [ 'NotificationResource', function( NotificationResource ) {
    'use strict';
    var confirmMessage = null, confirmed = null;
    return {
      get: function( ) { return NotificationResource.read( ).$promise; },
      remove: function( id ){ return NotificationResource.remove( { id: id } ).$promise; },
      confirm: confirmMessage,
      confirmed: confirmed
    };
  }]);
