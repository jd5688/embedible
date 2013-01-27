define([
	'jquery',
	'underscore',
	'jcrypt',
  	'backbone',
  	'DEM',
  	'models/session_m',
  	'models/login_m',
	'text!templates/login/login_tpl.html'
], function($, _, jcrypt, Backbone, DEM, session, Login, tmplate){
	var login = new Login();

	var LoginView = Backbone.View.extend({
		model: login,
		events: {
			'click #submit': 'do_login',
		},
		initialize: function () {
			// when the document body has been fully loaded, render this
			this.render();
		},
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
			if (username !== '' && password !== '') {
				// user jcrypt to encrypt
				var password = $().crypt({
					method: "md5",
					source: ckey}
				);
				this.model.fetch({url : DEM.domain + "login?u=" + username + "&p=" + password + "&callback=?"});
				//this.model.fetch();
			} else {
				// all fields should be filled up
				alert('Please fill up your username and password');
			}
		}
		
	});
	
	return LoginView;
});