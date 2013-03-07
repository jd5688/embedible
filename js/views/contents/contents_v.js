define([
  'jquery',
  'bootstrap',
  'jcrypt',
  'tooltip',
  'underscore',
  'backbone',
  'models/contents_m',
  'models/content_m',
  'DEM',
  'Paginator',
  'text!templates/index/main_body_tpl.html',
  'text!templates/index/main_body_page_tpl.html',
  'text!templates/index/detail_tpl.html',
  'text!templates/page_loading_tpl.html'
], function($, bootstrap, jcrypt, tooltip, _, Backbone, Contents_m, Content_m, DEM, Paginator, body_tpl, body_page_tpl, detail_tpl, page_loading_tpl ){
	var Contents = {
		'View'	: function () { 
			return Backbone.View.extend({
				events: {
					'click input[type=image]':  'redir',
					'click a[id=goToDetail]': 'redir',
					'click a[alt=pl_name_list]': 'show_playlist_content',
					'click a[name=playlist_details]': 'playlist_details',
					'click a[class=thumbnail]': 'redir2',
					'click #show_more_button': 'paginate',
					'click #scrollToTop': 'scrollToTop',
					'click #embedibles': 'redir3'
				},
				render: function () {
					Paginator.initialize();
					var publc = DEM.ux();
					var ckey = publc + DEM.key();		
					// use jcrypt to encrypt
					hash = $().crypt({
						method: "md5",
						source: ckey}
					);
					var type = this.model.get('type');
					var tag = this.model.get('tag');
					
					// render loading gif image
					var template = _.template( page_loading_tpl );
					this.$el.html( template );
					this.model.fetch({ url : DEM.domain + "contents?hash=" + hash + "&publc=" + publc + "&limit=" + Paginator.limit + "&type=" + type + "&tag=" + tag + "&curPage=1&callback=?" }); // fetch data from the server
					
					if (this.model.has("id")) {
						// if model has attribute named 'id', load main_body immediately.
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
					data.uri = this.model.get('uri');
					data.tag = this.model.get('tag');
					
					Paginator.curPage = (Paginator.curPage) ? Paginator.curPage : 1; 
					Paginator.totalRec = data.data.records
					data.showNextButton = Paginator.showMore();
					
					var template = _.template( body_tpl, data );
					//render the template
					this.$el.html( template );
					
					// show the 'show more' button if there's more data to display
					if (data.showNextButton) {
						$('#showMore').show();
					}
					
					$('.thumbnail').tooltip({
						selector: "input[rel=tooltip]",
						placement: "bottom"
					});
				},
				paginate: function (e) {
					e.preventDefault();
					var data = {};
					var publc = DEM.ux();
					var ckey = publc + DEM.key();		
					// use jcrypt to encrypt
					hash = $().crypt({
						method: "md5",
						source: ckey}
					);
					Paginator.curPage += 1; // increment
					var type = this.model.get('type');
					var tag = this.model.get('tag');
					
					var load_tpl = '<p style="text-align:center"><img src="' + DEM.website + '/images/icons/loading_horizontal.gif"/></p>';
					$('#showMore').html( load_tpl );
					
					// we cannot use the same model (this.model). appending on the same model proves to be
					// buggy -- unexpected behaviour happens.
					// we need to use another model.
					Contents = new Content_m();
					Contents.fetch({
						url : DEM.domain + "contents?hash=" + hash + "&publc=" + publc + "&limit=" + Paginator.limit + "&type=" + type + "&curPage=" + Paginator.curPage + "&tag=" + tag + "&callback=?",
						success: function (model, response) {
							data.data = model.toJSON();
							data.website = DEM.website;
							data.curPage = Paginator.curPage;
							 
							Paginator.totalRec = data.data.records
							data.showNextButton = Paginator.showMore();
							
							var load_tpl = '<button id="show_more_button" class="btn btn-large btn-block btn-primary" type="button">Show more</button><br/>';
							$('#showMore').html( load_tpl );
							
							var tpl = _.template( body_page_tpl, data );
							//render the template
							$('#embed_area').append( tpl );
							
							if (!data.showNextButton) {
								$('#showMore').fadeOut();
								$('#scrollTop').fadeIn();
							}
						}
					});
				},
				scrollToTop: function () {
					$("html, body").animate({ scrollTop: 0 }, "fast");
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
				playlist_details: function (e) {
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
				redir3: function (e) {
					e.preventDefault();
					var uri = 'tags/' + $('#embedibles').val();
					Backbone.history.navigate(uri, true);
				},
				json: function() {
					return this.model.toJSON();
				},
				redir: function (e) {
					// make sure e is defined
					if (typeof e !== "undefined") {
						//e.preventDefault();
						var clickedEl = $(e.currentTarget); // which element was clicked?
						var uri = decodeURIComponent(clickedEl.attr("value")); // get the value
						// check if uri was literally assigned the value 'undefined'
						// most probably default behaviour of decodeURIComponent if attribute does not exist
						if (uri === "undefined") {
							// check in the name
							uri = decodeURIComponent(clickedEl.attr("name"));
						};
						Backbone.history.navigate(uri, true);
					}
				},
				onClose: function(){
					this.model.unbind("change", this.render);
				}
			});
		},
		'Model': function () {
			return new Contents_m();
		},
	}
	return Contents;
});