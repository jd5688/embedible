define([
  'jquery',
  'bootstrap',
  'jcrypt',
  'underscore',
  'backbone',
  'models/content_m',
  'models/add_to_playlist_m',
  'DEM',
  'text!templates/index/detail_tpl.html',
  'text!templates/facebook/fb_comments_tpl.html',
  'text!templates/modalAddToPlaylist_tpl.html',
  'text!templates/index/detail_recommend_tpl.html',
  'text!templates/facebook/fb_og_tpl.html',
  'mysession',
], function($, bootstrap, jcrypt, _, Backbone, Content_m, Atpl_m, DEM, detail_tpl, fb_comments, modalAddToPlaylist_tpl, recommend_tpl, fb_og_tpl, session){
	var Content = {
		'View'	: function () { 
			return Backbone.View.extend({
				events: {
					'click #showDetBut':  'showDetails',
					'click #hideDetBut':  'hideDetails',
					'click a[name=linktags]' : 'redir',
					'click .addToPlaylist': 'show_modal_atpl',
					'click #modal_confirm_add': 'add_to_playlist',
					'click a[id=goToDetail]': 'redir2',
					'click input[type=image]': 'redir2',
					'click #toLogin': 'toLogin',
					'click #redir_to_add_playlist': 'redir_to_add_playlist'
				},
				render: function () {
					// get the username so we can connect the user to this content
					username = session.checkCookie();
					this.atpl_callback = this.iclosure(); // initialize the callback function for the playlist modal
					
					var publc = DEM.ux();
					var id = this.model.get('uniq');
					var ckey = id + publc + DEM.key();
					// use jcrypt to encrypt
					hash = $().crypt({
						method: "md5",
						source: ckey}
					);
				
					this.model.fetch({ url : DEM.domain + "content?hash=" + hash + "&publc=" + publc + "&id=" + id +"&username=" + username + "&callback=?"}); // fetch data from the server
					if (this.model.has("id")) {
						if (this.model.hasChanged) {
							this.model.on('change', this.main_body, this);
						} else {
							// if model has attribute named 'id' or 'username', and it hasn't changed value, load main_body immediately.
							this.main_body();
						}
					} else {
						// Otherwise, wait. if change happens, then load main_body.
						this.model.on('change', this.main_body, this);
					}
				},
				main_body: function () {
					var data = {};
					data.data = this.json();
					if (typeof data.data.id === 'undefined') {
						Backbone.history.navigate('404', true); // not found
					} else {
						data.website = DEM.website;
						
						// render the facebook open graph template
						// as well as the meta title and description for SEO purpose
						//var fbOg_tpl = _.template( fb_og_tpl, data );
						//$('#meta_desc-title').html( fbOg_tpl )
						
						//  for SEO
						var dat = JSON.parse(data.data.data);
						var origin = location.protocol + '//' + location.hostname + location.pathname
						$('meta#ogtitle').attr('content', dat.title);
						$('meta#ogurl').attr('content', origin);
						$('meta#ogimage').attr('content', dat.thumbnail_url);
						// for SEO
						
						// load the fb comments plugin js sdk code
						var fbTemplate = _.template( fb_comments );
						$("#fb_sdk").html( fbTemplate );
						
						//get the tags
						var tags = data.data.tags;
						var tagsArr = tags.split(',');
						data.data.tags = this._createTagLinks(tagsArr);
						
						// render the main template
						var template = _.template( detail_tpl, data );
						this.$el.html( template );
						
						// render the related/recommended embeds
						var recom = _.template( recommend_tpl, data);
						$('#recommend_container').html( recom );
					}
				},
				_createTagLinks: function (tagsArr) {
					var tags = '';
					for (i = 0; i < tagsArr.length; i+= 1) {
						if (i === 0) {
							tags += '<a name="linktags" href="" id="' + $.trim(tagsArr[i]) + '">' + $.trim(tagsArr[i]) + '</a>';
						} else {
							tags += ', <a name="linktags" href="" id="' + $.trim(tagsArr[i]) + '">' + $.trim(tagsArr[i]) + '</a>';
						}
					}
					return tags;
				},
				json: function() {
					return this.model.toJSON();
				},
				showDetails: function () {
					$("#conDetails").fadeIn();
					$("#showDetBut").hide();
					$("#hideDetBut").show();
					return false;
				},
				hideDetails: function () {
					$("#conDetails").fadeOut();
					$("#showDetBut").show();
					$("#hideDetBut").hide();
					return false;
				},
				redir: function (e) {
					var clickedEl = $(e.currentTarget); // which element was clicked?
					var tag = clickedEl.attr("id");
					tag = tag.replace(/ /g, "+");
					tag = encodeURIComponent(tag);
					var uri = 'tags/' + tag;
					e.preventDefault();
					Backbone.history.navigate(uri, true);
				},
				redir2: function (e) {
					if (typeof e !== "undefined") {	
						//e.preventDefault();
						var clickedEl = $(e.currentTarget); // which element was clicked?
						var uri = decodeURIComponent(clickedEl.attr("value")); // get the value
						// check if uri was literally assigned the value 'undefined'
						// most probably default behaviour of decodeURIComponent if attribute does not exist
						if (uri === "undefined") {
							// check in the href
							uri = decodeURIComponent(clickedEl.attr("name"));
						};
						
						Backbone.history.navigate(uri, true);
					}
				},
				toLogin: function (e) {
					e.preventDefault();
					$('#addToPlaylistModal').modal('hide');
					Backbone.history.navigate("login", true);
				},
				redir_to_add_playlist: function (e) {
					e.preventDefault();
					$('#addToPlaylistModal').modal('hide');
					Backbone.history.navigate("dashboard/playlists/add", true);
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
					var id = clickedEl.attr("id");
					
					var data = {};
					data.data = this.json();
					data.website = DEM.website;
					data.mycallback = this.atpl_callback;
					data.atpl_id = id;
					data.username = session.checkCookie();
					
					// the modal Add to Playlist template
					var mod_atpl_tpl = _.template( modalAddToPlaylist_tpl, data );
					$('#modalAddToPLaylistContainer').html( mod_atpl_tpl );
					
					// populate the modal template with some values
					var title = $('#h_' + id).val();
					$('#atpl_content_title').html(decodeURIComponent(title));
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
					var ux = DEM.ux();
					var ckey = atpl_id + ux + DEM.key();
					// use jcrypt to encrypt
					var hash = $().crypt({
						method: "md5",
						source: ckey}
					);
					
					var atpl = new Atpl_m();
					atpl.fetch({ url: DEM.domain + "add_to_playlist?hash=" + hash + "&publc=" + ux + "&atpl_id=" + atpl_id + "&list_ids=" + list_ids + "&callback=?" });
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
		'Model': function () {
			return new Content_m();
		},
	}
	return Content;
});