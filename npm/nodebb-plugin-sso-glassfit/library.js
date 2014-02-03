(function(module) {
	"use strict";

	var user = module.parent.require('./user'),
		  db = module.parent.require('../src/database'),
		  passport = module.parent.require('passport'),
  		passportGlassfit = require('passport-glassfit').Strategy,
  		fs = module.parent.require('fs'),
  		path = module.parent.require('path'),
  		nconf = module.parent.require('nconf');

	var constants = Object.freeze({
		'name': "Glassfit",
		'admin': {
			'route': '/glassfit',
			'icon': 'fa-road'
		}
	});

	var Glassfit = {};

	Glassfit.getStrategy = function(strategies) {
		if (meta.config['social:glassfit:key'] && meta.config['social:glassfit:secret']) {
			passport.use(new passportGlassfit({
				clientID: meta.config['social:glassfit:key'],
				clientSecret: meta.config['social:glassfit:secret'],
				callbackURL: nconf.get('url') + '/auth/glassfit/callback'
			}, function(accessToken, refreshToken, profile, done) {
				Glassfit.login(profile.id, profile.displayName, profile.email, function(err, user) {
					if (err) {
						return done(err);
					}
					done(null, user);
				});
			}));

			strategies.push({
				name: 'glassfit',
				url: '/auth/glassfit',
				callbackURL: '/auth/glassfit/callback',
				icon: 'check',
				scope: ''
			});
		}

		return strategies;
	};

	Glassfit.login = function(gfid, name, email, callback) {
		Glassfit.getUidByGfid(gfid, function(err, uid) {
			if(err) {
				return callback(err);
			}

			if (uid !== null) {
				// Existing User
				callback(null, {
					uid: uid
				});
			} else {
				// New User
				var success = function(uid) {
					// Save glassfit-specific information to the user
					user.setUserField(uid, 'gfid', gfid);
					db.setObjectField('gfid:uid', gfid, uid);
					callback(null, {
						uid: uid
					});
				};

				user.getUidByEmail(email, function(err, uid) {
					if(err) {
						return callback(err);
					}

					if (!uid) {
						user.create({username: name, email: email}, function(err, uid) {
							if(err) {
								return callback(err);
							}

							success(uid);
						});
					} else {
						success(uid); // Existing account -- merge
					}
				});
			}
		});
	}

	Glassfit.getUidByGfid = function(gfid, callback) {
		db.getObjectField('gfid:uid', gfid, function(err, uid) {
			if (err) {
				return callback(err);
			}
			callback(null, uid);
		});
	};

	Glassfit.addMenuItem = function(custom_header) {
		custom_header.authentication.push({
			"route": constants.admin.route,
			"icon": constants.admin.icon,
			"name": constants.name
		});

		return custom_header;
	}

	Glassfit.addAdminRoute = function(custom_routes, callback) {
		fs.readFile(path.resolve(__dirname, './static/admin.tpl'), function (err, template) {
			custom_routes.routes.push({
				"route": constants.admin.route,
				"method": "get",
				"options": function(req, res, callback) {
					callback({
						req: req,
						res: res,
						route: constants.admin.route,
						name: constants.name,
						content: template
					});
				}
			});

			callback(null, custom_routes);
		});
	};

	module.exports = Glassfit;
}(module));
