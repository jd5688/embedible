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
				},
				initialize: function () {
					this.counter = this.inc(); // initialize counter
					this.render();
				},
				'inc' : function () {
					var i = 0;
					return function (j) {
						return j !== undefined ? j : i += 1;
					};
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
				json: function() {
					return this.model.toJSON();
				},
				redir: function (e) {
					if (this.counter() === 1) {
						// make sure e is defined
						if (typeof e !== "undefined") {
							var clickedEl = $(e.currentTarget); // which element was clicked?
							var uri = decodeURIComponent(clickedEl.attr("value")); // get the value
							//var uri = $("#" + id).val();
							e.preventDefault();
							Backbone.history.navigate(uri, true);
						}
					}					
				}
			});
		},
		'Model': function () {
			return new Contents_m();
		},
	}
	return Contents;
});