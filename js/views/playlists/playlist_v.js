define([
  'jquery',
  'bootstrap',
  'jcrypt',
  'underscore',
  'backbone',
  'models/playlist_m',
  'models/playlist_add_m',
  'DEM',
  'mysession',
  'text!templates/playlists/playlist_tpl.html',
  'text!templates/playlists/playlist_nav_tpl.html',
  'text!templates/playlists/playlist_alert_success_tpl.html',
], function($, bootstrap, jcrypt, _, Backbone, Playlists, AddPlaylist, DEM, session, main_tpl, nav_tpl, alert_tpl){
	var Playlist = {
		View : function () {
			return Backbone.View.extend({
				events: {
					'click #embed': 'redir',
					'click #my_dashboard': 'redir',
					'click #playlists': 'redir',
					'click #show_playlists': 'redir',
					'click #add_playlist': 'redir',
					'click #add_submit': 'add_playlist',
					'keypress input[type=text]': 'filterOnEnter',
					'click #button_close': 'close_alerter',
					'click a[alt=pl_name_list]': 'show_playlist_content'
					
				},
				//initialize: function () {
				//	this.render();
				//},
				render: function () {
					// user needs to be logged in to write playlists
					var username = session.checkCookie();
					if (typeof username === 'string') {
						// set the hash
						var ux = new Date().getTime();
						var publc = DEM.ux();
						var ckey = publc + DEM.key + username;
					
						// use jcrypt to encrypt
						var hash = $().crypt({
							method: "md5",
							source: ckey}
						);
					
						// get the playlists from the server
						this.model.fetch({ url : DEM.domain + "playlists?hash=" + hash + "&u=" + username + "&public=" + publc + "&callback=?"});
						
						if (this.model.has("id")) {
							this.main_body();
						} else {
							// if this is a new connection, then we have to wait for change
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
					
					var template = _.template( main_tpl, data );
					//render the template
					this.$el.html( template );
					
					var navTpl = _.template( nav_tpl, data );
					$('#nav_tabs').html( navTpl );
					
					// check the uri and make the appropriate tab active at the dashboard
					// http://site.com/dashboard/playlists
					// or http://site.com/dashboard/playlists/add
					var cURL = location.protocol + '//' + location.hostname + location.pathname
					
					if (cURL === DEM.website + 'dashboard/playlists' || cURL === DEM.website + 'dashboard/playlists/') {
						this._show_pl_active_el();
					} else if (cURL === DEM.website + "dashboard/playlists/add" || cURL === DEM.website + "dashboard/playlists/add/") {
						this._show_add_active_el();
					} else {
						// you don't belong here, go to the home page
						Backbone.history.navigate('', true);
					}
					
				},
				filterOnEnter: function(e) {
					if (e.keyCode !== 13) {
						return;
					} else {
						this.add_playlist(e);
					}
				},
				add_playlist: function(e) {
					e.preventDefault();
					
					var pl_name = $('#playlist_name').val();
					
					if (pl_name === '') {
						$('#blank_playlist').fadeIn();
						$('#playlist_name').val('');
						setTimeout(function () {
							$('#blank_playlist').fadeOut();
						},1500);
						return;
					}
					

					// prevent special characters
					if (/[^a-zA-Z 0-9]+/.test(pl_name)){
						// show the alerter
						$('#alerter_add').fadeIn();
						$('#playlist_name').val('');
						setTimeout(function () {
							$('#alerter_add').fadeOut();
						},3000);
					} else {
						var addPlaylist = new AddPlaylist();
						var username = session.checkCookie();
						var data = {
							'username' : username,
							'pl_name' : $('#playlist_name').val()
						};
						// set the data
						addPlaylist.set(data);
						addPlaylist.save(null, {
							// always results in error even if successful. maybe this is due to cross-domain
							// error: -> goes to success page
							error : function(options) {
								$('#alerter_success').fadeIn();
								$('#playlist_name').val('');
								setTimeout(function () {
									$('#alerter_success').fadeOut();
								},1500);
							},
							success: function() {
								alert('ewan');
							}
						});
					};
				},
				show_playlist_content: function (e) {
					e.preventDefault();
					var clickedEl = $(e.currentTarget);
					var sp = clickedEl.attr("id");
					var spArr = sp.split("x");
					var id = spArr[0];
					var axion = spArr[1];
					if (axion === 'pl_name_show_list') {
						// reveal the playlist
						$('#' + id + '_list_container').fadeIn();
						// reveal the 'hide list' icon
						$('#' + id + 'xpl_name_hide_list').show();
						// hide the clicked icon - 'show list'
						$('#' + id + 'xpl_name_show_list').hide();
					} else {
						// _pl_name_hide_list' was clicked
						// so hide the playlist
						$('#' + id + '_list_container').fadeOut();
						// show the 'show list' icon
						$('#' + id + 'xpl_name_show_list').show();
						// hide the clicked icon - 'hide list'
						$('#' + id + 'xpl_name_hide_list').hide();
					}
				},
				close_alerter: function () {
					$('#alerter_add').fadeOut();
				},
				_show_pl_active_el: function () {
					var data = {};
					data.activ = "show_playlists";
					var naviTabs = _.template( nav_tpl, data );
					$('#nav_tabs').html( naviTabs );
					
					$('#show_add_active').hide();
					$('#show_pl_active').fadeIn();
					return true;
				},
				_show_add_active_el: function () {
					var data = {};
					data.activ = "add_playlist";
					var naviTabs = _.template( nav_tpl, data );
					$('#nav_tabs').html( naviTabs );
					
					$('#show_add_active').fadeIn();
					$('#show_pl_active').hide();
					return true;
				},
				json: function() {
					return this.model.toJSON();
				},
				redir: function(e) {
					var clickedEl = $(e.currentTarget); // which element was clicked?
					var uri = clickedEl.attr("id");
					
					if (uri === 'playlists' || uri === 'show_playlists') {
						uri = 'dashboard/playlists';
					} else if (uri === 'add_playlist') {
						uri = 'dashboard/playlists/add';
					} else if (uri === 'my_dashboard') {
						uri = 'dashboard';
					};
					
					e.preventDefault();
					Backbone.history.navigate(uri, true);
				},
				redir2: function (e) {
					if (typeof e !== "undefined") {
						var clickedEl = $(e.currentTarget); // which element was clicked?
						var uri = clickedEl.attr("id"); // get the value
						uri = uri === "add_playlist" ? "dashboard/playlists/add" : "dashboard/playlists/" + uri;
						e.preventDefault();
						Backbone.history.navigate(uri, true);
					}
				},
				onClose: function(){
					this.model.unbind("change", this.render);
				}
			});
		},
		Model : function () {
			return new Playlists();
		}
	};
	return Playlist;
});