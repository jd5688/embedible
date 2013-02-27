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
					'click #signin': 'do_login',
					'keypress input[type=email]': 'filterOnEnter',
					'keypress input[type=password]': 'filterOnEnter'
				},
				render: function () {
					var logged = session.checkCookie();
					if (logged) {
						// no need to go to the login page.
						// navigate to the index page
						Backbone.history.navigate('', true);
					}
					//var attributes = this.json();
					//var embedlyKey = attributes.key;
					var template = _.template( tmplate );
					//render the template
					this.$el.html( template );
				},
				json: function () {
					return this.model.toJSON();
				},
				
				filterOnEnter: function(e) {
					if (e.keyCode !== 13) {
						return;
					} else {
						this.do_login(e);
					}
				},
				
				do_login: function (e) {
					// do not refresh
					e.preventDefault();
					
					var ux = DEM.ux();
					var username = this.$('#username').val();
					var password = this.$('#password').val();
					var ckey = password + ux + DEM.key();
					if (this._user_validate(username) && password !== '') {
						// increment and make sure it's 1
						// if more than one, it's looping/creating another instance-- so ignore
						// use jcrypt to encrypt
						var password = $().crypt({
							method: "md5",
							source: ckey}
						);
						
						// contact the server and authenticate the user
						this.model.fetch({url : DEM.domain + "login?u=" + username + "&p=" + password + "&publc=" + ux + "&callback=?"});
		
						if (this.model.has('result')) {
							// model already updated
							this._catch();
						} else {
							// wait for the model to update
							this.model.on('change', this._catch, this);
						}
					} else {
						Backbone.history.navigate('login/failed', true);
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
				},
				onClose: function(){
					this.model.unbind("change", this.render);
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