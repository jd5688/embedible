define([
	'jquery',
	'underscore',
	'jcrypt',
  	'backbone',
  	'DEM',
  	'mysession',
  	'models/login_m',
	'text!templates/login/login_tpl.html',
	'text!templates/login/login_fail_tpl.html'
], function($, _, jcrypt, Backbone, DEM, session, Log_in, tmplate, fail_tmplate){
	var Login = {
		'login' : function () {
			return new Log_in();
		},
		'View' : function() {
			return Backbone.View.extend({
				events: {
					'click #signin': 'do_login'
				},
				initialize: function () {
					// check if logged
					var logged = session.checkCookie();
					if (logged) {
						// no need to go to the login page.
						// navigate to the index page
						Backbone.history.navigate('', true);
					} else {
						// initialize the counter;
						// this counter is used to prevent 'do_login' from doing unexpected and unwanted loops when user authenticates. 
						// a bug from my script? or require.js? or a bug from backbone? not yet known as of writing this
						this.counter = this.inc(); 
						
						this.render();
					};
				},
				'inc' : function () {
					var i = 0;
					return function (j) {
						return j !== undefined ? j : i += 1;
					};
				},
				
				'counter' : '',
				render: function () {
					//var attributes = this.json();
					//var embedlyKey = attributes.key;
					var template = _.template( tmplate );
					//render the template
					this.$el.html( template );
				},
				json: function () {
					return this.model.toJSON();
				},
		
				do_login: function () {
					var username = this.$('#username').val();
					var password = this.$('#password').val();
					var ckey = username + password;
					if (this._user_validate(username) && password !== '') {
						// increment and make sure it's 1
						// if more than one, it's looping/creating another instance-- so ignore
						if (this.counter() === 1) {
							// use jcrypt to encrypt
							var password = $().crypt({
								method: "md5",
								source: ckey}
							);
							
							// contact the server and authenticate the user
							this.model.fetch({url : DEM.domain + "login?u=" + username + "&p=" + password + "&callback=?"});
			
							if (this.model.has('result')) {
								// model already updated
								this._catch();
							} else {
								// wait for the model to update
								this.model.on('change', this._catch, this);
							}
							this.counter();
						};
					} else {
						// increment and make sure it's 1
						// if more than one, it's looping so ignore
						if (this.counter() === 1) {
							// auth failure
							// all fields should be filled up and username must be valid email
							this.counter(); // increment to prevent script loop
							Backbone.history.navigate('login/failed', true);
						};
					}
					
					return true;
				},
				
				_catch: function () {
					var attributes = this.json();
					if (attributes.result === 'success') {
						var username = this.$('#username').val();
						session.setCookie("username", username, 1);
						Backbone.history.navigate('dashboard', true);
					} else {
						// authentication failed
						var bool = session.delCookie("username");
						if (bool === true) {
							Backbone.history.navigate('login/failed', true);
						};
					};
					
					return true;
				},
				
				_user_validate: function (user) {
					if (user !== '') {
						// test if valid email
						var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
						return regex.test(user);
					} else {
						// username can't be blank
						return false;
					}
				}
				
			});
		},
		
		'ViewFail' : function () {
			return Backbone.View.extend({
				events: {
					'click #reauth': 'reauth'
				},
				initialize: function () {
					// check if logged
					var logged = session.checkCookie();
					if (logged) {
						// no need to go to the login page.
						// navigate to the index page
						Backbone.history.navigate('', true);
					} else {
						this.render();
					};
				},
				render: function () {
					var template = _.template( fail_tmplate );
					this.$el.html( template );
				},
				reauth: function (e) {
					e.preventDefault();
					Backbone.history.navigate('login', true);
				}
			});
		} 
	};
	
	return Login;
});