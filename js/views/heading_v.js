define([
  'jquery',
  'underscore',
  'backbone',
  'mysession',
  'DEM',
  'text!templates/header_tpl.html',
], function($, _, Backbone, session, DEM, header){
	var HeadView = Backbone.View.extend({
		events: {
			'click #home': 'home',
			'click #embed': 'embed',
			'click #login': 'login',
			'click #logout': 'logout'
		},
		initialize: function () {
			this.render();
		},
		render: function () {
			var username = session.checkCookie() || '';
			var attrib = {
					'username' : username,
				}
			var template = _.template( header, attrib );
			//render the template
			this.$el.html( template );
		},
		
		home: function(e) {
			e.preventDefault();
			Backbone.history.navigate('', true);
		},
		
		login: function(e) {
			e.preventDefault();
			Backbone.history.navigate('login', true);
		},
		
		logout: function(e) {
			e.preventDefault();
			Backbone.history.navigate('logout', true);
		},
		
		embed: function(e) {
			e.preventDefault();
			Backbone.history.navigate('embed', true);
		}
	});
	
	return HeadView;
});