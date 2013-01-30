define([
	'jquery',
	'underscore',
  	'backbone',
  	'mysession',
	'text!templates/login/login_fail_tpl.html'
], function($, _, Backbone, session, fail_tmplate){

	var LoginViewFail = Backbone.View.extend({
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
	
	return LoginViewFail;
});