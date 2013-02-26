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
					'click #show_all': 'redir',
					'click #my_videos': 'redir',
					'click #my_photos': 'redir',
					'click #my_rich': 'redir',
					'click #my_links': 'redir',
					'click #playlists': 'redir2',
					'click #embed': 'redir2',
					'click #add_playlist': 'redir3',
					'click #pubPlaylist': 'playlist',
					'click #dashboard': 'dashboard',
					'click #login': 'login',
					'click #logout': 'logout',
				},
				render: function () {
					var username = session.checkCookie() || '';
					var attrib = {
							'username' : username,
							'uri': this.model.get("uri"),
							'website': DEM.website
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
				},
				redir: function (e) {
					if (typeof e !== "undefined") {
						var clickedEl = $(e.currentTarget); // which element was clicked?
						var uri = decodeURIComponent(clickedEl.attr("id")); // get the value
						uri = uri === "show_all" ? "" : uri;
						uri = "dashboard/" + uri;
						e.preventDefault();
						Backbone.history.navigate(uri, true);
					}
				},
				redir2: function(e) {
					e.preventDefault();
					var clickedEl = $(e.currentTarget); // which element was clicked?
					var uri = clickedEl.attr("id");
					if (uri === 'playlists') {
						uri = 'dashboard/' + uri;
					};
					
					if (uri === 'my_dashboard') {
						uri = 'dashboard';
					};
					
					if (uri === 'redir_to_add_playlist') {
						$('#addToPlaylistModal').modal('hide');
						uri = 'dashboard/playlists/add';
					};
					e.preventDefault();
					Backbone.history.navigate(uri, true);
					
				},
				redir3: function(e) {
					uri = 'dashboard/playlists/add';					
					e.preventDefault();
					Backbone.history.navigate(uri, true);
				},
			});
		},
		Model: function () {
			return new Head_m();
		}
	
	}
	return Head;
});