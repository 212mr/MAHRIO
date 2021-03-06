'use strict';

var mongoose = require('mongoose'),
    uniqueValidator = require('mongoose-unique-validator'),
    schema, User;

var crypto = require('crypto');

function createSalt () {
  return crypto.randomBytes(128).toString('base64');
}

function hashPwd (salt, pwd) {
  var hmac = crypto.createHmac('md5', salt);
  return hmac.update(pwd).digest('hex');
}

schema = mongoose.Schema({
  avatarImage: { type: mongoose.Schema.Types.ObjectId, ref: 'Media' },
  email: {
    type: String, trim: true, lowercase: true, required: true, unique: true, index: true
  },
  confirmed:  {type: Boolean, default: false},
  salt:       {type: String },
  password:   {type: String },
  resetPasswordToken:   {type: String},
  resetPasswordExpires: {type: Date },
  authorizationToken:   [{type: String}],

  networks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Network' }], // ACCESS CONTROL
  pending: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Network' }], // ACCESS CONTROL
  created:    { type: Date, default: Date.now },
  access:     [{type: String}],
  status:     {type: String},
  notifications: [{type: mongoose.Schema.Types.ObjectId, ref: 'Notification'}],
  profile: {type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
  disabled: {type: Boolean},
  stripeId: {type: String, default: null}
});

schema.methods.authenticate = function(passwordToMatch) {
  return hashPwd(this.salt, passwordToMatch) === this.password;
};

schema.methods.updatePassword = function(newPassword) {
  this.salt = createSalt();
  this.password = hashPwd(this.salt, newPassword || '');
};

schema.statics.recoverPassword = function( email, cb ){
  if( !email ) { return cb(); }

  User.findOne({email: email}, function (err, user) {
    if (err || !user) { return cb(); }

    if (!user) { return cb(); }

    var token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;

    user.save( function(err,scs){
      if( scs ){
        cb( null, {token: token });
      }else{
        cb();
      }
    });
  });
};

schema.statics.resetPassword = function(token, newPassword, cb) {
  if (!token  || ! newPassword) { return cb('missing email or password'); }

  User.findOne({resetPasswordToken: token}, function (err, user) {
    if (err) { return cb(err); }
    if (!user) { return cb('user does not exist'); }

    user.salt = createSalt();
    user.password = hashPwd(user.salt, newPassword || '');
    user.authorizationToken = crypto.randomBytes(20).toString('hex');

    user.save( function(err, user){
      if( err ){
        return cb('unable to save new password');
      }
      cb(null, user);
    });

  });
};

schema.statics.login = function(email, passwordToMatch, cb) {
  if (!email  || ! passwordToMatch) { return cb('missing email or password'); }

  User.findOne({email: email}, function (err, user) {
    if (err) { return cb(err); }
    if (!user) { return cb('user does not exist'); }
    if (!user.authenticate(passwordToMatch)) {
      return cb('wrong password');
    }
    var newToken = crypto.randomBytes(20).toString('hex');
    if( user.authorizationToken.length ) {
      user.authorizationToken.push( newToken );
    } else {
      user.authorizationToken = [ newToken ];
    }

    user.save( function(err, user){
      if( err || typeof user === 'undefined'){ return cb('error'); }

      cb(null, newToken);
    });
  });
};
schema.statics.findAndModify = function (query, sort, doc, options, callback) {
  return this.collection.findAndModify(query, sort, doc, options, callback);
};

schema.pre('save', function (next) {
  if (this.isNew) {
    this.salt = createSalt();
    this.password = hashPwd(this.salt, this.password || '');
    this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    this.authorizationToken = crypto.randomBytes(20).toString('hex');
  }

  next();
});

schema.plugin( uniqueValidator, { message: '{PATH} needs to be unique.'} );


User = mongoose.model('User', schema);
module.exports = User;
