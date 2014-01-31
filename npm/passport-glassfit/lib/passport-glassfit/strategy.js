/**
 * Module dependencies.
 */
var util = require('util')
  , OAuth2Strategy = require('passport-oauth').OAuth2Strategy
  , InternalOAuthError = require('passport-oauth').InternalOAuthError;


/**
 * `Strategy` constructor.
 *
 * The Glassfit authentication strategy authenticates requests by delegating to
 * Glassfit using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your Glassfit application's App ID
 *   - `clientSecret`  your Glassfit application's App Secret
 *   - `callbackURL`   URL to which Glassfit will redirect the user after granting authorization
 *
 * Examples:
 *
 *     passport.use(new GlassfitStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/glassfit/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://auth.raceyourself.com/oauth/authorize';
  options.tokenURL = options.tokenURL || 'https://auth.raceyourself.com/oauth/token';
  options.scopeSeparator = options.scopeSeparator || ',';

  OAuth2Strategy.call(this, options, verify);
  this.name = 'glassfit';
  this._profileURL = options.profileURL || 'https://auth.raceyourself.com/api/1/me';
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);

/**
 * Return extra Glassfit-specific parameters to be included in the authorization
 * request.
 *
 * Options:
 *
 * @param {Object} options
 * @return {Object}
 * @api protected
 */
Strategy.prototype.authorizationParams = function (options) {
  var params = {};
  return params;
};

/**
 * Retrieve user profile from Glassfit.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `glassfit`
 *   - `id`               the user's Glassfit ID
 *   - `email`            the contact email address for the user
 *   - `username`         the user's Glassfit username
 *   - `displayName`      the user's full name
 *   - `gender`           the user's gender: `M` or `F` or `U`
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {
  var url = this._profileURL;

  this._oauth2.getProtectedResource(url, accessToken, function (err, body, res) {
    if (err) { return done(new InternalOAuthError('failed to fetch user profile', err)); }
    
    try {
      var json = JSON.parse(body);
      
      var profile = { provider: 'glassfit' };
      profile.id = json.response.id;
      profile.email = json.response.email;
      profile.username = json.response.username;
      profile.displayName = json.response.name;
      profile.gender = json.response.gender;

      profile._raw = body;
      profile._json = json;

      done(null, profile);
    } catch(e) {
      done(e);
    }
  });
}

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
