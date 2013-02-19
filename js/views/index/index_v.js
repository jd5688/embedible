define([
  'jquery',
  'bootstrap',
  'tooltip',
  'underscore',
  'backbone',
  'models/index_main_m',
  'DEM',
  'text!templates/index/main_body_tpl.html',
  'text!templates/page_desc_title_tpl.html',
], function($, bootstrap, tooltip, _, Backbone, Index_m, DEM, body_tpl, seo_tpl){
	var Index = {
		'View'	: function () { 
			return Backbone.View.extend({
				events: {
					'click input[type=image]':  'redir',
				},
				render: function () {
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
					
					// for seo
					data.meta_desc = "All your favorites videos, music, photos, and links embedded in one place.";
					data.page_title = "Embed, create a playlist, then share -- Embedible.com";
					var template = _.template( seo_tpl, data );
					$('#meta_desc-title').html( template );
					
					data.data = this.json();
					data.website = DEM.website;
					var template = _.template( body_tpl, data );
					//render the template
					this.$el.html( template );
				},
				json: function() {
					return this.model.toJSON();
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