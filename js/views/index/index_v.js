define([
  'jquery',
  'bootstrap',
  'jcrypt',
  'tooltip',
  'underscore',
  'backbone',
  'models/index_main_m',
  'models/contents_m',
  'DEM',
  'Paginator',
  'text!templates/index/main_body_tpl.html',
  'text!templates/index/main_body_page_tpl.html',
  'text!templates/page_desc_title_tpl.html'
], function($, bootstrap, jcrypt, tooltip, _, Backbone, Index_m, Contents_m, DEM, Paginator, body_tpl, body_page_tpl, seo_tpl){
	var Index = {
		'View'	: function () { 
			return Backbone.View.extend({
				events: {
					'click input[type=image]': 'redir',
					'click a[id=goToDetail]': 'redir',
					'click #show_more_button': 'paginate',
					'click #scrollToTop': 'scrollToTop',
				},
				render: function () {
					//alert(DEM.$_GET('page'));
				
					//Paginator.initialize()
					var publc = DEM.ux();
					var ckey = publc + DEM.key();		
					// use jcrypt to encrypt
					hash = $().crypt({
						method: "md5",
						source: ckey}
					);
					//var limit = 20; // limit per page
					
					this.model.fetch({ 
							url : DEM.domain + "getembed?hash=" + hash + "&publc=" + publc + "&limit=" + Paginator.limit + "&curPage=1&callback=?",
							cache: false
						});
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
					
					// for seo
					data.meta_desc = "All your favorites videos, music, photos, and links embedded in one place.";
					data.page_title = "Embed, create a playlist, then share -- Embedible.com";
					data.thumbnail = DEM.website + 'images/embedible_small.jpg';
					var template = _.template( seo_tpl, data );
					$('#meta_desc-title').html( template );
					
					Paginator.curPage = (Paginator.curPage) ? Paginator.curPage : 1; 
					Paginator.totalRec = data.data.records
					data.showNextButton = Paginator.showMore();
					
					var template = _.template( body_tpl, data );
					this.$el.html( template );
					
					// show the 'show more' button if there's more data to display
					if (data.showNextButton) {
						$('#showMore').show();
					}
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
					
					// we cannot use the same model (this.model). appending on the same model proves to be
					// buggy -- unexpected behaviour happens.
					// we need to use another model.
					Contents = new Contents_m();
					Contents.fetch({
						url : DEM.domain + "getembed?hash=" + hash + "&publc=" + publc + "&limit=" + Paginator.limit + "&curPage=" + Paginator.curPage + "&callback=?",
						success: function (model, response) {
							data.data = model.toJSON();
							data.website = DEM.website;
							data.curPage = Paginator.curPage;
							 
							Paginator.totalRec = data.data.records
							data.showNextButton = Paginator.showMore();
							
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
				json: function() {
					return this.model.toJSON();
				},
				redir: function (e) {
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
				onClose: function(){
					this.model.unbind("change", this.render);
				}
			});
		},
		'Main'	: function () {
			return new Index_m();
		}
	}
	return Index;
});