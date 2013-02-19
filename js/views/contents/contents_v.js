define([
  'jquery',
  'bootstrap',
  'tooltip',
  'underscore',
  'backbone',
  'models/contents_m',
  'DEM',
  'text!templates/index/main_body_tpl.html',
  'text!templates/index/detail_tpl.html'
], function($, bootstrap, tooltip, _, Backbone, Contents_m, DEM, body_tpl, detail_tpl ){
	var Contents = {
		'View'	: function () { 
			return Backbone.View.extend({
				events: {
					'click input[type=image]':  'redir',
					'click a[alt=pl_name_list]': 'show_playlist_content',
					'click a[name=playlist_details]': 'playlist_details',
					'click a[class=thumbnail]': 'redir2',
				},
				initialize: function () {
					this.render();
				},
				render: function () {
					if (this.model.has("id") || this.model.has("username")) {
						// if model has attribute named 'id' or 'username', load main_body immediately.
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
					
					$('.thumbnail').tooltip({
						selector: "input[rel=tooltip]",
						placement: "bottom"
					});
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
				json: function() {
					return this.model.toJSON();
				},
				redir: function (e) {
					// make sure e is defined
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
		'Model': function () {
			return new Contents_m();
		},
	}
	return Contents;
});