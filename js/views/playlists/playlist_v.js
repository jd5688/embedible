define([
  'jquery',
  'bootstrap',
  'jcrypt',
  'underscore',
  'backbone',
  'models/playlist_m',
  'DEM',
  'mysession',
  'text!templates/playlists/playlist_tpl.html',
  'text!templates/playlists/playlist_nav_tpl.html',
], function($, bootstrap, jcrypt, _, Backbone, Playlists, DEM, session, main_tpl, nav_tpl){
	var Playlist = {
		View : function () {
			return Backbone.View.extend({
				events: {
					'click #embed': 'redir',
					'click #my_dashboard': 'redir',
					'click #playlists': 'redir'
				},
				initialize: function () {
					this.counter = this.inc(); // initialize counter
					this.render();
				},
				inc : function () {
					var i = 0;
					return function (j) {
						return j !== undefined ? j : i += 1;
					};
				},
				counter : '',
				render: function () {
					// user needs to be logged in to write playlists
					username = session.checkCookie();
					if (typeof username === 'string') {
						var ux = new Date().getTime();
						var publc = DEM.ux();
						var ckey = publc + DEM.key + username;
					
						// use jcrypt to encrypt
						var hash = $().crypt({
							method: "md5",
							source: ckey}
						);
					
						this.model.fetch({ url : DEM.domain + "playlists?hash=" + hash + "&u=" + username + "&public=" + publc + "&callback=?"});
						//this.model.fetch({ url : DEM.domain + "playlists?callback=?"})
						if (this.model.has("id")) {
							this.main_body();
						} else {
							this.model.on('change', this.main_body, this);
						}
					} else {
						Backbone.history.navigate('', true); // redirect to the main page
						return true;
					}
				},
				main_body: function () {
					var data = {};
					data.data = this.json();
					data.website = DEM.website;
					data.activ = "show_playlists";
					
					console.log(data);
					var template = _.template( main_tpl, data );
					//render the template
					this.$el.html( template );
					
					var navTpl = _.template( nav_tpl, data );
					$('#nav_tabs').html( navTpl );
					
				},
				json: function() {
					return this.model.toJSON();
				},
				redir: function(e) {
					if (this.counter() === 1) {
						var clickedEl = $(e.currentTarget); // which element was clicked?
						var uri = clickedEl.attr("id");
						
						if (uri === 'playlists') {
								uri = 'dashboard/' + uri;
							};
						
						if (uri === 'my_dashboard') {
							uri = 'dashboard';
						};
						
						e.preventDefault();
						Backbone.history.navigate(uri, true);
					}
				}
			});
		},
		Model : function () {
			return new Playlists();
		}
	};
	return Playlist;
});