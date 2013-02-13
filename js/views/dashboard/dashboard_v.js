define([
  'jquery',
  'bootstrap',
  'jcrypt',
  'tooltip',
  'modal',
  'underscore',
  'backbone',
  'models/index_main_m',
  'models/puborpriv_m',
  'models/delete_embed_m',
  'models/add_to_playlist_m',
  'DEM',
  'text!templates/dashboard/dashboard_nav_tpl.html',
  'text!templates/dashboard/main_body_tpl.html',
  'text!templates/modal_tpl.html',
  'text!templates/modalAddToPlaylist_tpl.html',
], function($, bootstrap, jcrypt, tooltip, modal, _, Backbone, Index_m, Puborpriv_m, Dembed_m, Atpl_m, DEM, d_nav, body_tpl, modal_template, modalAddToPlaylist_tpl){
	var Dashboard = {
		View : function () {
			return Backbone.View.extend({
				events: {
					'click input[type=image]':  'redir',
					'click #show_all': 'redir2',
					'click #my_videos': 'redir2',
					'click #my_photos': 'redir2',
					'click #my_rich': 'redir2',
					'click #my_links': 'redir2',
					'click #propu': 'propu',
					'click .fordelete': 'show_modal',
					'click .addToPlaylist': 'show_modal_atpl',
					'click #modal_confirm': 'do_delete',
					'click #embed': 'redir3',
					'click #playlists': 'redir3',
					'click #my_dashboard': 'redir3',
					'click #redir_to_add_playlist': 'redir3',
					'click #modal_confirm_add': 'add_to_playlist',
				},
				/*
				initialize: function () {
					this.atpl_callback = this.iclosure(); // initialize callback
					this.render();
				},
				*/
				render: function () {
					this.atpl_callback = this.iclosure();
					if (this.model.has("username") || this.model.has("id")) {
						// if model has attribute named 'username', load main_body immediately.
						this.main_body();
					} else {
						// Otherwise, wait. if change happens, then load main_body.
						this.model.on('change', this.main_body, this);
					}
				},
				main_body: function () {
					var data = {};
					data.data = this.json();
					data.website = DEM.website;
					var template = _.template( body_tpl, data );
					//render the template
					this.$el.html( template );
					
					// the modal template is used for deleting content
					var mod_tpl = _.template( modal_template );
					$('#modal_container').html( mod_tpl );
					
					// the modal Add to Playlist template
					//var mod_atpl_tpl = _.template( modalAddToPlaylist_tpl, data );
					//$('#modalAddToPLaylistContainer').html( mod_atpl_tpl );
					
					
					// check the uri and make the appropriate tab active at the dashboard
					var cURL = location.protocol + '//' + location.hostname + location.pathname
					
					//alert(cURL + ' - ' + DEM.website + 'dashboard/');
					
					if (cURL === DEM.website + 'dashboard' || cURL === DEM.website + 'dashboard/') {
						this._show_all();
					} else if (cURL === DEM.website + "dashboard/my_videos" || cURL === DEM.website + "dashboard/my_videos/") {
						this._my_videos();
					} else  if (cURL === DEM.website + "dashboard/my_photos" || cURL === DEM.website + "dashboard/my_photos/") {
						this._my_photos();
					} else  if (cURL === DEM.website + "dashboard/my_links" || cURL === DEM.website + "dashboard/my_links/") {
						this._my_links();
					} else  if (cURL === DEM.website + "dashboard/my_rich" || cURL === DEM.website + "dashboard/my_rich/") {
						this._my_rich();
					}
					
					// enable the tooltips plugin
					$('.thumbnail').tooltip({
						selector: "input[rel=tooltip]",
						placement: "bottom"
					});
					
					$('.none').tooltip({
						selector: "input[rel=tooltip]",
						placement: "bottom"
					});
				},
				json: function() {
					return this.model.toJSON();
				},
				add_to_playlist: function (e) {
					var clickedEl = $(e.currentTarget); // which element was clicked?
					var info = clickedEl.attr("id");
					var infoArr = info.split('_');
					var playlist_id = infoArr[1];
				},
				redir: function (e) {
					if (typeof e !== "undefined") {
						var clickedEl = $(e.currentTarget); // which element was clicked?
						var uri = decodeURIComponent(clickedEl.attr("value")); // get the value
						//var uri = $("#" + id).val();
						e.preventDefault();
						Backbone.history.navigate(uri, true);
					}
				},
				redir2: function (e) {
					if (typeof e !== "undefined") {
						var clickedEl = $(e.currentTarget); // which element was clicked?
						var uri = decodeURIComponent(clickedEl.attr("id")); // get the value
						uri = uri === "show_all" ? "" : uri;
						uri = "dashboard/" + uri;
						e.preventDefault();
						Backbone.history.navigate(uri, true);
					}
				},
				redir3: function(e) {
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
				propu: function (e) {
					e.preventDefault();
					var clickedEl = $(e.currentTarget);
					var att = clickedEl.attr("name");
					var attArr = att.split('_');
					
					// ID is the primary key id of the embed
					var id = attArr[1];
					var axion = clickedEl.attr("title");
					
					// replace with 'saving...' text
					var thisHtml = '<a><span class="label">saving...</span></a>';
					//$('#' + att).html(thisHtml);
					$('span[id=' + att + ']').html(thisHtml);
					
					var pubOrPriv = new Puborpriv_m();
					var obj = {};
					var response = '';
					
					var ux = DEM.ux(); // this is the public key
					var ckey = id + ux + DEM.key();
					
					// use jcrypt to encrypt
					var hash = $().crypt({
						method: "md5",
						source: ckey}
					);
					
					if (axion === 'make it private') {
						pubOrPriv.fetch({ url: DEM.domain + "makepriv?hash=" + hash + "&publc=" + ux + "&is_public=0&id=" + id + "&callback=?" });
						
						pubOrPriv.on('change', function() {
							obj = pubOrPriv.toJSON();
							response = obj.response;
							if (response === 'success') {
								// reverse the button to 'make it public'
								var thisHtml = '<a href="" id="propu" name="' + att + '" title="make it public"><span class="label label-info">private</span></a>';
							} else {
								// revert to original status
								var thisHtml = '<a href="" id="propu" name="' + att + '" title="make it private"><span class="label">public</span></a>';
								// show 'fail' alert
								$('#alerter').fadeIn();
							};
							//$('#' + att).html(thisHtml);
							$('span[id=' + att + ']').html(thisHtml);
						});
					} else { // make it public was pressed
						pubOrPriv.fetch({ url: DEM.domain + "makepriv?hash=" + hash + "&publc=" + ux + "&is_public=1&id=" + id + "&callback=?" });
						pubOrPriv.on('change', function() {
							obj = pubOrPriv.toJSON();
							response = obj.response;
							if (response === 'success') {
								var thisHtml = '<a href="" id="propu" name="' + att + '" title="make it private"><span class="label">public</span></a>';
							} else {
								var thisHtml = '<a href="" id="propu" name="' + att + '" title="make it public"><span class="label label-info">private</span></a>';
								// show 'fail' alert
								$('#alerter').fadeIn();
							};
							//$('#' + att).html(thisHtml);
							$('span[id=' + att + ']').html(thisHtml);
						});
					};
				},
				do_delete: function (e) {
					e.preventDefault();
					// hide the modal
					$('#my_modal').modal('hide');
					var preId = $('#modal_value').val();
					preArr = preId.split('_');
					var id = preArr[1];
					var prefix = preArr[0] + '_';
					var publc = DEM.ux();
					var ckey = id + DEM.key();
					
					// use jcrypt to encrypt
					var hash = $().crypt({
						method: "md5",
						source: ckey}
					);
					
					var dembed = new Dembed_m();
					dembed.fetch({ url: DEM.domain + "dembed?hash=" + hash + "&publc=" + publc + "&id=" + id + "&callback=?" });
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
							var uri = decodeURIComponent(clickedEl.attr("id")); // get the value
							
							$('li').remove('#' + prefix + id);
						} else {
							$('#alerter').fadeIn();
						};
						return true;
					});
					
				},
				_show_all: function () {
					var data = {};
					data.activ = "show_all";
					var naviTabs = _.template( d_nav, data );
					$('#nav_tabs').html( naviTabs );
					
					$('#xmy_videos').hide();
					$('#xshow_all').fadeIn();
					$('#xmy_photos').hide();
					$('#xmy_links').hide();
					$('#xmy_rich').hide();
					return true;
				},
				_my_videos: function () {
					var data = {};
					data.activ = "my_videos";
					var naviTabs = _.template( d_nav, data );
					$('#nav_tabs').html( naviTabs );
					
					$('#xmy_videos').fadeIn();
					$('#xshow_all').hide();
					$('#xmy_photos').hide();
					$('#xmy_links').hide();
					$('#xmy_rich').hide();
					return true;
				},
				_my_photos: function () {
					var data = {};
					data.activ = "my_photos";
					var naviTabs = _.template( d_nav, data );
					$('#nav_tabs').html( naviTabs );
					
					$('#xmy_videos').hide();
					$('#xshow_all').hide();
					$('#xmy_photos').fadeIn();
					$('#xmy_links').hide();
					$('#xmy_rich').hide();
					return true;
				},
				_my_links: function () {
					var data = {};
					data.activ = "my_links";
					var naviTabs = _.template( d_nav, data );
					$('#nav_tabs').html( naviTabs );
					
					$('#xmy_videos').hide();
					$('#xshow_all').hide();
					$('#xmy_photos').hide();
					$('#xmy_links').fadeIn();
					$('#xmy_rich').hide();
					return true;
				},
				_my_rich: function () {
					var data = {};
					data.activ = "my_rich";
					var naviTabs = _.template( d_nav, data );
					$('#nav_tabs').html( naviTabs );
					
					$('#xmy_videos').hide();
					$('#xshow_all').hide();
					$('#xmy_photos').hide();
					$('#xmy_links').hide();
					$('#xmy_rich').fadeIn();
					return true;
				},
				show_modal: function (e) {
					var clickedEl = $(e.currentTarget);
					var id = clickedEl.attr("id");

					// populate the modal template with some values
					$('#modal_body').html('Your embed is about to be deleted!<br/><small>note that deleting an embed means that you are no longer taking ownership of it.</small>');
					$('#modal_value').val(id);
					
					// then show it
					$('#my_modal').modal('show');
				
				},
				iclosure: function () {
					var obj = [];
					return {
						set : function (id, name, atpl_id) {
							obj.push(id + 'xdemx' + name + 'xdemx' + atpl_id);
						},
						get : function () {
							return obj;
						}
					};
				},
				atpl_callback: [],
				show_modal_atpl: function (e) {
					var clickedEl = $(e.currentTarget);
					var preId = clickedEl.attr("id");
					preArr = preId.split('_');
					var id = preArr[1]; // the id of the content
					
					var data = {};
					data.data = this.json();
					data.website = DEM.website;
					data.mycallback = this.atpl_callback;
					data.atpl_id = id;
					
					// the modal Add to Playlist template
					var mod_atpl_tpl = _.template( modalAddToPlaylist_tpl, data );
					$('#modalAddToPLaylistContainer').html( mod_atpl_tpl );
					
					// populate the modal template with some values
					var title = $('#' + id + '_title').val();
					$('#atpl_content_title').html(title);
					$('#modal_atpl_value').val(id);
					
					// then show it
					$('#addToPlaylistModal').modal('show');
				},
				add_to_playlist: function (e) {
					e.preventDefault();
					// hide the modal
					$('#addToPlaylistModal').modal('hide');
					var atpl_id = $('#modal_atpl_value').val(); // get the id of the content to be added to playlist
					
					// get all the checked boxes' value
					var list_ids = [];
					var that = this;
					var cb;
					$('#content_id input:checked').each(function() {
						list_ids.push(this.value);
						// this is a callback function so that the add playlist
						// modal will get updated even without refreshing the page
						that.atpl_callback.set(this.value, this.name, atpl_id);
					});
					var ckey = atpl_id + DEM.key();
					// use jcrypt to encrypt
					var hash = $().crypt({
						method: "md5",
						source: ckey}
					);
					
					var atpl = new Atpl_m();
					atpl.fetch({ url: DEM.domain + "add_to_playlist?hash=" + hash + "&atpl_id=" + atpl_id + "&list_ids=" + list_ids + "&callback=?" });
					atpl.on('change', function() {
						obj = atpl.toJSON();
						response = obj.response;
						if (response === 'success') {
							$('#alerter_success_atpl').fadeIn();
							setTimeout(function () {
								$('#alerter_success_atpl').fadeOut();
							},1500);
						} else {
							//$('#alerter').fadeIn();
						};
						return true;
					});
				},
				onClose: function(){
					this.model.unbind("change", this.render);
				}
			});
		},
		'Main'	: function () {
			return new Index_m();
		}
	};
	return Dashboard;
});