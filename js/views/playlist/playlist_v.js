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
					var publc = DEM.ux();
					var ckey = publc + DEM.key();
				
					// use jcrypt to encrypt
					var hash = $().crypt({
						method: "md5",
						source: ckey}
					);
				
					// get the playlists from the server
					this.model.fetch({ url : DEM.domain + "playlists?hash=" + hash + "&public=" + publc + "&callback=?"});
					
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
					},10000);
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
					var str = clickedEl.attr("id");
					var strArr = str.split("_");
					var pl_id = strArr[0];
					var pl_name = encodeURIComponent(strArr[1]);
					
					var url = 'playlist/' + pl_id + '/' + pl_name;
					Backbone.history.navigate(url, true);;
				},
				redir2: function (e) {
					e.preventDefault();
					var clickedEl = $(e.currentTarget); // which element was clicked?
					var playlist_id = clickedEl.attr("id");
					var title = encodeURIComponent(clickedEl.attr("name"));
					Backbone.history.navigate( 'playlist/' + playlist_id + '/' + title, true);
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
				},
				render: function () {
					// get the username if user is logged in
					var username = session.checkCookie();
					if (!username) { username = ''; }
					var publc = DEM.ux();
					
					pl_id = this.model.get('pl_id');
					pl_name = this.model.get('pl_name');

					
					var ckey = publc + pl_id + pl_name + DEM.key();
				
					// use jcrypt to encrypt
					var hash = $().crypt({
						method: "md5",
						source: ckey}
					);
					
				
					// get the playlists from the server
					this.model.fetch({ url : DEM.domain + "playlistContent?hash=" + hash + "&public=" + publc + "&pl_id=" + pl_id + "&pl_name=" + pl_name + "&u=" + username + "&callback=?"});
					
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
					
					var template = _.template( content_tpl, data );
					//render the template
					this.$el.html( template );
					
					$('#foo5').carouFredSel({
						auto: true,
						scroll: 2,
						prev: '#prev2',
						next: '#next2',
						mousewheel: true,
						swipe: {
							onMouse: true,
							onTouch: true
						}
					});
					
					// enable the tooltips plugin
					$('.thumbnail').tooltip({
						selector: "input[rel=tooltip]",
						placement: "bottom"
					});
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