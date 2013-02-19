define([
  'jquery',
  'bootstrap',
  'jcrypt',
  'underscore',
  'backbone',
  'models/playlist_m',
  'models/playlist_add_m',
  'models/delete_embed_m',
  'models/puborpriv_m',
  'DEM',
  'mysession',
  'text!templates/dashboard/playlists/playlist_tpl.html',
  'text!templates/dashboard/playlists/playlist_nav_tpl.html',
  'text!templates/dashboard/playlists/playlist_alert_success_tpl.html',
  'text!templates/modal_tpl.html'
], function($, bootstrap, jcrypt, _, Backbone, Playlists, AddPlaylist, Dembed_m, Puborpriv_m, DEM, session, main_tpl, nav_tpl, alert_tpl, modal_template){
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
					'click a[alt=pl_name_list]': 'show_playlist_content',
					'click .remplay': 'show_modal',
					'click #modal_confirm': 'do_remove',
					'click .del_playlist': 'modal_delete_playlist',
					'click #propu': 'propu'
					
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
						var ckey = publc + DEM.key();
					
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
					
					// enable the tooltips plugin
					$('.thumbnail').tooltip({
						selector: "input[rel=tooltip]",
						placement: "bottom"
					});
					
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
					};
					
					// the modal template is used for removing content from playlist
					var mod_tpl = _.template( modal_template );
					$('#modal_container').html( mod_tpl );
					
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
					var pl_desc = $('#playlist_description').val();
					var pl_tags = $('#playlist_tags').val();
					
					if (pl_name === '' || pl_desc === '') {
						$('#blank_playlist').fadeIn();
						$('#playlist_name').val('');
						setTimeout(function () {
							$('#blank_playlist').fadeOut();
						},3000);
						return;
					}
					
					// prevent special characters
					if (/[^a-zA-Z 0-9,'()"]+/.test(pl_name)){
						// show the alerter
						$('#alerter_add').fadeIn();
						$('#playlist_name').val('');
						setTimeout(function () {
							$('#alerter_add').fadeOut();
						},3000);
					} else if (/[^a-zA-Z 0-9,'()"]+/.test(pl_desc)){
						// show the alerter
						$('#alerter_desc').fadeIn();
						$('#playlist_description').val('');
						setTimeout(function () {
							$('#alerter_desc').fadeOut();
						},3000);
					} else if (/[^a-zA-Z 0-9,'()"]+/.test(pl_tags)){
						// show the alerter
						$('#alerter_tags').fadeIn();
						$('#playlist_tags').val('');
						setTimeout(function () {
							$('#alerter_tags').fadeOut();
						},3000);
					} else {
						var addPlaylist = new AddPlaylist();
						var username = session.checkCookie();
						var data = {
							'username' : username,
							'pl_name' : pl_name,
							'pl_desc' : pl_desc,
							'pl_tags' : pl_tags
						};
						// set the data
						addPlaylist.set(data);
						addPlaylist.save(null, {
							// always results in error even if successful. maybe this is due to cross-domain
							// error: -> goes to success page
							error : function(options) {
								$('#alerter_success').fadeIn();
								$('#playlist_name').val('');
								$('#playlist_description').val('');
								$('#playlist_tags').val('');
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
				show_modal: function (e) {
					var clickedEl = $(e.currentTarget);
					var ids = clickedEl.attr("id");
					//ids = ids.split("-");
					//var pl_id = ids[0];
					//var vid_id = ids[1];

					// populate the modal template with some values
					$('#modal_body').html('This embed is about to be removed from this playlist!');
					$('#modal_value').val(ids);
					
					// then show it
					$('#my_modal').modal('show');
				
				},
				do_remove: function (e) {
					e.preventDefault();
					// hide the modal
					$('#my_modal').modal('hide');
					var ids = $('#modal_value').val();
					
					// ids could be (example): 23_130 (playlist-id_video-id)
					// or could be: playlist_23 ('playlist'_playlist-id)
					ids = ids.split("_");
					var pl_id = ids[0];
					var prefix = ids[0] + '_';
					var vid_id = ids[1];
					
					// check if pl_id is an id or a 'playlist' string
					if (pl_id === 'playlist') {
						// this is a playlist being removed (ex: playlist_23)
						// ids[1] must be the playlist id
						var pl_id = ids[1];
						
						// call this function
						this._delete_playlist(pl_id);
						return;
					}
					
					var ux = DEM.ux();
					
					var ckey = pl_id + ux + DEM.key();
					
					
					// use jcrypt to encrypt
					var hash = $().crypt({
						method: "md5",
						source: ckey}
					);
					
					var dembed = new Dembed_m();
					dembed.fetch({ url: DEM.domain + "remplay?hash=" + hash + "&publc=" + ux + "&vid_id=" + vid_id + "&pl_id=" + pl_id + "&callback=?" });
					dembed.on('change', function() {
						obj = dembed.toJSON();
						response = obj.response;
						
						if (response === 'success') {
							var root = DEM.root;
							var url = location.pathname;
							//split the URL to extract the URI
							myArr = url.split(root);
							//alert(myArr[1]);
							
							var clickedEl = $(e.currentTarget); // which element was clicked?
					
							
							$('li').remove('#' + prefix + vid_id);
							// hide the playlist
							$('#' + pl_id + '_list_container').fadeOut();
							// show the 'show list' icon
							$('#' + pl_id + 'xpl_name_show_list').show();
							// hide the clicked icon - 'hide list'
							$('#' + pl_id + 'xpl_name_hide_list').hide();
						} else {
							$('#alerter').fadeIn();
						};
					});
					
				},
				_delete_playlist: function(pl_id) {
					var ux = DEM.ux();
					
					var ckey = pl_id + ux + DEM.key();
					
					
					// use jcrypt to encrypt
					var hash = $().crypt({
						method: "md5",
						source: ckey}
					);
					
					var dembed = new Dembed_m();
					dembed.fetch({ url: DEM.domain + "del_playlist?hash=" + hash + "&publc=" + ux + "&pl_id=" + pl_id + "&callback=?" });
					dembed.on('change', function() {
						obj = dembed.toJSON();
						response = obj.response;
						
						if (response === 'success') {
							$('div #' + pl_id).fadeOut();
							$('#alerter_playlist_deleted').fadeIn();
								setTimeout(function () {
									$('#alerter_playlist_deleted').fadeOut();
								},2000);
						} else {
							$('#alerter').fadeIn();
						};
					});
				},
				modal_delete_playlist: function (e) {
					e.preventDefault();
					var clickedEl = $(e.currentTarget);
					var pl_id = clickedEl.attr("id");
					
					// populate the modal template with some values
					$('#modal_body').html('This playlist and all its contents will be deleted.');
					$('#modal_value').val(pl_id);
					
					// then show it
					$('#my_modal').modal('show');
					
				},
				propu: function (e) {
					e.preventDefault();
					var clickedEl = $(e.currentTarget);
					var playlist_id = clickedEl.attr("name");
					var axion = clickedEl.attr("title");
					
					// replace with 'saving' button
					var thisHtml = '<a href="" class="btn"><i class="icon-refresh"></i></a>';
					//$('#' + att).html(thisHtml);
					$('span[id=' + playlist_id + '_propu]').html(thisHtml);
					
					var pubOrPriv = new Puborpriv_m();
					var obj = {};
					var response = '';
					
					var ux = DEM.ux(); // this is the public key
					var ckey = playlist_id + ux + DEM.key();
					
					// use jcrypt to encrypt
					var hash = $().crypt({
						method: "md5",
						source: ckey}
					);
					
					if (axion === 'Playlist is public') {
						// make it private
						pubOrPriv.fetch({ url: DEM.domain + "makePlPriv?hash=" + hash + "&publc=" + ux + "&is_public=0&id=" + playlist_id + "&callback=?" });
						
						pubOrPriv.on('change', function() {
							obj = pubOrPriv.toJSON();
							response = obj.response;
							if (response === 'success') {
								// reverse the button to 'Playlist is private'
								var thisHtml = '<a href="" id="propu" name="' + playlist_id + '" class="btn" title="Playlist is private"><i class="icon-ban-circle"></i></a>';
							} else {
								// revert to original status
								var thisHtml = '<a href="" id="propu" name="' + playlist_id + '" class="btn" title="Playlist is public"><i class="icon-ok-circle"></i></a>';
								// show 'fail' alert
								$('#alerter').fadeIn();
							};
							//$('#' + att).html(thisHtml);
							$('span[id=' + playlist_id + '_propu]').html(thisHtml);
						});
					} else { // Playlist is private was pressed
						// make it public
						pubOrPriv.fetch({ url: DEM.domain + "makePlPriv?hash=" + hash + "&publc=" + ux + "&is_public=1&id=" + playlist_id + "&callback=?" });
						pubOrPriv.on('change', function() {
							obj = pubOrPriv.toJSON();
							response = obj.response;
							if (response === 'success') {
								var thisHtml = '<a href="" id="propu" name="' + playlist_id + '" class="btn" title="Playlist is public"><i class="icon-ok-circle"></i></a>';
							} else {
								var thisHtml = '<a href="" id="propu" name="' + playlist_id + '" class="btn" title="Playlist is private"><i class="icon-ban-circle"></i></a>';
								// show 'fail' alert
								$('#alerter').fadeIn();
							};
							$('span[id=' + playlist_id + '_propu]').html(thisHtml);
						});
					};
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