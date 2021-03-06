'use strict';

var Path = require('path'),
    rootPath = Path.normalize(__dirname + '/../../'),
    language = require('./../languages');

module.exports = function( env ) {

  var environments = {
    development: {
      datastoreURI: env.MONGODB_DATASTORE_URI,
      cmsURL: 'http://com.computerenchiladas.com/~whichdegree/cms-stage/?q=',
      port: 8042
    },
    test: {
      datastoreURI: 'mongodb://localhost/testing',
      cmsURL: '',
      port: 8043
    },

    stage: {
      datastoreURI: 'mongodb://localhost/staging',
      cmsURL: 'http://localhost/~whichdegree/cms-stage/?q=',
      port: 8041
    },

    production: {
      datastoreURI: env.MONGOLAB_URI,
      cmsURL: 'http://com.computerenchiladas.com/~whichdegree/cms-stage/?q='
    }
  };

  var baseSetup = environments[ env.NODE_ENV ];
  baseSetup.rootPath = rootPath;
  baseSetup.lang = language;
  baseSetup.env = env.NODE_ENV;
  baseSetup.IN_CLIENT_ID = env.IN_CLIENT_ID;
  baseSetup.IN_CLIENT_SECRET = env.IN_CLIENT_SECRET;
  baseSetup.IN_CALLBACK_URL = env.IN_CALLBACK_URL;

  baseSetup.FB_CLIENT_ID = env.FB_CLIENT_ID;
  baseSetup.FB_CLIENT_SECRET = env.FB_CLIENT_SECRET;
  baseSetup.FB_CALLBACK_URL = env.FB_CALLBACK_URL;

  baseSetup.CMS_URL = env.CMS_URL;

  baseSetup.AWS_ACCESS_KEY = env.AWS_ACCESS_KEY;
  baseSetup.AWS_SECRET_KEY = env.AWS_SECRET;
  baseSetup.S3_BUCKET = env.S3_BUCKET;

  baseSetup.STRIPE_SECRET_KEY = env.STRIPE_SECRET_KEY;

  if ( baseSetup.env === 'production' ) {
    baseSetup.port = env.PORT || env.NODE_PORT || 8140;
  }

  baseSetup.DOMAIN = env.NODE_DOMAIN || 'http://localhost:'+baseSetup.port;

  return baseSetup;
};