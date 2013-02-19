define([
  'jquery',
  'bootstrap',
  'underscore',
  'backbone',
  'mysession',
  'DEM',
  'models/heading_m',
  'text!templates/header_tpl.html',
], function($, bootstrap, _, Backbone, session, DEM, Head_m, header){
	var Head = {
		View: function () {
			return Backbone.View.extend({
				uri : '',
				events: {
					'click #home': 'home',
					'click #video': 'videos',
					'click #photo': 'photos',
					'click #rich': 'rich',
					'click #link': 'link',
					'click #pubPlaylist': 'playlist',
					'click #dashboard': 'dashboard',
					'click #login': 'login',
					'click #logout': 'logout'
				},
				render: function () {
					var username = session.checkCookie() || '';
					var attrib = {
							'username' : username,
							'uri': this.model.get("uri")
						}
					var template = _.template( header, attrib );
					//render the template
					this.$el.html( template );
				},
				
				home: function(e) {
					e.preventDefault();
					Backbone.history.navigate('', true);
				},
				
				videos: function(e) {
					e.preventDefault();
					Backbone.history.navigate('video', true);
				},
				
				photos: function(e) {
					e.preventDefault();
					Backbone.history.navigate('photo', true);
				},
				
				rich: function(e) {
					e.preventDefault();
					Backbone.history.navigate('rich', true);
				},
				
				link: function(e) {
					e.preventDefault();
					Backbone.history.navigate('link', true);
				},
				
				playlist: function(e) {
					e.preventDefault();
					Backbone.history.navigate('playlist', true);
				},
				
				login: function(e) {
					e.preventDefault();
					Backbone.history.navigate('login', true);
				},
				
				logout: function(e) {
					e.preventDefault();
					Backbone.history.navigate('logout', true);
				},
				
				dashboard: function(e) {
					e.preventDefault();
					Backbone.history.navigate('dashboard', true);
				}
			});
		},
		Model: function () {
			return new Head_m();
		}
	
	}
	return Head;
});