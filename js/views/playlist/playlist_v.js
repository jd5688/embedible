define([
  'jquery',
  'bootstrap',
  'jcrypt',
  'underscore',
  'backbone',
  'carousel',
  'models/playlist_m',
  'text!templates/playlist/playlist_tpl.html',
  'text!templates/playlist/playlist_content_tpl.html',
  'DEM',
  'mysession',
], function($, bootstrap, jcrypt, _, Backbone, carousel, Playlist_m, main_tpl, content_tpl, DEM, session){
	var Playlist = {
		View : function () {
			return Backbone.View.extend({
				events: {
					'click a[alt=pl_name_list]': 'show_playlist_content',
					'click a[name=playlist_details]': 'redir',
					'click a[class=thumbnail]': 'redir2',
				},
				render: function () {
					// get the username if user is logged in
					var username = session.checkCookie();
					var publc = DEM.ux();
					var ckey = publc + DEM.key();
				
					// use jcrypt to encrypt
					var hash = $().crypt({
						method: "md5",
						source: ckey}
					);
				
					// get the playlists from the server
					// this is coming from homepage
					this.model.fetch({ url : DEM.domain + "playlists?hash=" + hash + "&public=" + publc + "&u=" + username + "&src=home&callback=?"});
					
					if (this.model.has("id")) {
						this.main_body();
					} else {
						// if this is a new connection, then we have to wait for change
						this.model.on('change', this.main_body, this);
					}
				},
				main_body: function () {
					var data = {};
					data.data = this.json();
					data.website = DEM.website;
					
					var template = _.template( main_tpl, data );
					//render the template
					this.$el.html( template );
					
					// enable the tooltips plugin
					$('.thumbnail').tooltip({
						selector: "input[rel=tooltip]",
						placement: "bottom"
					});
					
					$('#alerter_public_playlists').fadeIn();
					setTimeout(function () {
						$('#alerter_public_playlists').fadeOut();
					},5000);
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
				redir: function (e) {
					e.preventDefault();
					var clickedEl = $(e.currentTarget); // which element was clicked?
					var uniq_id = clickedEl.attr("id");
										
					var url = 'playlist/' + uniq_id;
					Backbone.history.navigate(url, true);;
				},
				redir2: function (e) {
					e.preventDefault();
					var clickedEl = $(e.currentTarget); // which element was clicked?
					var ids = clickedEl.attr("id");
					ids = ids.split("_");
					Backbone.history.navigate( 'playlist/' + ids[0] + '/' + ids[1], true);
				},
				json: function() {
					return this.model.toJSON();
				},
				onClose: function(){
					this.model.unbind("change", this.render);
				}
			});
		},
		Model : function () {
			return new Playlist_m();
		},
		ContentView: function () {
			return Backbone.View.extend({
				events: {
					'click .pull-right': 'hider',
					'click .thumbnail': 'redir'
				},
				render: function () {
					// get the username if user is logged in
					var username = session.checkCookie();
					if (!username) { username = ''; }
					var publc = DEM.ux();
					
					var uniq_id = this.model.get('uniq_id');
					
					var ckey = publc + uniq_id + DEM.key();
				
					// use jcrypt to encrypt
					var hash = $().crypt({
						method: "md5",
						source: ckey}
					);
					
				
					// get the playlists from the server
					this.model.fetch({ url : DEM.domain + "playlistContent?hash=" + hash + "&public=" + publc + "&uniq_id=" + uniq_id + "&u=" + username + "&callback=?"});
					
					if (this.model.has("id")) {
						this.main_body();
					} else {
						// if this is a new connection, then we have to wait for change
						this.model.on('change', this.main_body, this);
					}
				},
				main_body: function () {
					var data = {};
					data.data = this.json();
					data.website = DEM.website;
					data.vid_uniq = this.model.get('vid_uniq');
					data.detectEmbed = this.detectEmbedType();
					
					// check if vid_uniq is in the URL.
					// if it's in the url, we need to get its embed code
					if (data.vid_uniq) {
						// we need to hide the sidebar
						data.sidebar_is_visible = 'style="display:none"';
						data.sidebar_is_hidden = '';
						data.sidebar = 'style="display:none"';
					} else {
						// we need to show the sidebar
						data.sidebar_is_visible = '';
						data.sidebar_is_hidden = 'style="display:none"';
						data.sidebar = '';
					}
					
					
					
					var template = _.template( content_tpl, data );
					//render the template
					this.$el.html( template );
					
					// enable the tooltips plugin
					$('.thumbnail').tooltip({
						selector: "input[rel=tooltip]",
						placement: "bottom"
					});
				},
				detectEmbedType: function () {
					return function (dat) {
						var showThis;
						if (dat.type === 'video' || dat.type === 'rich') {
							showThis = dat.html;
						} else if (dat.type === 'photo') {
							showThis = '<a href="' + dat.thumbnail_url + '"><img src="' + dat.url + '" border="0"/></a>'
						} else if (dat.type === 'link') {
							if (typeof thumbnail_url !== "undefined" && thumbnail_url !== "") {
								showThis = '<a href="' + dat.url + '" target="_blank"><img src="' + dat.thumbnail_url + '"/></a>'
							} else {
								showThis = '<a href="' + dat.url + '" target="_blank">' + dat.url + '</a>'
							}
						}
						return showThis;
					};
				},
				hider: function(e) {
					var clickedEl = $(e.currentTarget);
					var axion = clickedEl.attr("id");
					
					// hide the sidebar
					if (axion === 'sidebar_hide') {
						$('#sidebar').hide();
						$('#sidebar_is_visible').hide();
						$('#sidebar_is_hidden').fadeIn();
					};
					
					// show the sidebar
					if (axion === 'sidebar_reveal') {
						$('#sidebar').fadeIn();
						$('#sidebar_is_visible').fadeIn();
						$('#sidebar_is_hidden').hide();
					};
				},
				redir: function (e) {
					e.preventDefault();
					var clickedEl = $(e.currentTarget);
					var vid_uniq = clickedEl.attr("id");
					if (vid_uniq === this.model.get('vid_uniq')) {
						// no need to redirect, vid_uniq is in the url
						this.main_body();
						return;
					}
					
					pl_uniq = this.model.get('uniq_id');
					var url = 'playlist/' + pl_uniq + '/' + vid_uniq;
					Backbone.history.navigate(url, true);;
				},
				json: function() {
					return this.model.toJSON();
				},
				onClose: function(){
					this.model.unbind("change", this.render);
				}
			});
		},
	};
	
	return Playlist;
});