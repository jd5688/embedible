define([
  'jquery',
  'bootstrap',
  'underscore',
  'backbone',
  'models/playlist_m',
  'DEM',
  'text!templates/playlists/playlist_tpl.html',
  'text!templates/playlists/playlist_nav_tpl.html',
], function($, bootstrap, _, Backbone, Playlists, DEM, main_tpl, nav_tpl){
	var Playlist = {
		View : function () {
			return Backbone.View.extend({
				events: {
					'click #embed': 'redir',
					'click #dashboard': 'redir',
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
					/*
					if (this.model.has("id")) {
						this.main_body();
					} else {
						this.model.on('change', this.main_body, this);
					}
					*/
					this.main_body();
				},
				main_body: function () {
					var data = {};
					//data.data = this.json();
					//data.website = DEM.website;
					var template = _.template( main_tpl, data );
					//render the template
					this.$el.html( template );
					
					var navTpl = _.template( nav_tpl );
					$('#nav_tabs').html( navTpl );
					
				},
				json: function() {
					return this.model.toJSON();
				},
				redir: function(e) {
					var clickedEl = $(e.currentTarget); // which element was clicked?
					var uri = clickedEl.attr("id");
					
					e.preventDefault();
					Backbone.history.navigate(uri, true);					
				}
			});
		},
		Model : function () {
			return new Playlists();
		}
	};
	return Playlist;
});