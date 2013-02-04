define([
  'jquery',
  'tooltipster',
  'underscore',
  'backbone',
  'models/index_main_m',
  'DEM',
  'text!templates/css/tooltipster.html',
  'text!templates/index/index_tpl.html',
  'text!templates/index/main_body_tpl.html',
], function($, tooltipster, _, Backbone, Index_m, DEM, tt_css, tmplate, body_tpl){
	var Index = {
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
				
				'counter' : '',
				render: function () {
					var ttip = _.template( tt_css ); // load the css template for tooltips
					var template = _.template( tmplate );
					//render the templates
					$('#css_container').html( ttip ); // append the css to the <head>
					this.$el.html( template );
					
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
					
					// enable the tooltipster plugin
					$('.tooltip').tooltipster({
						position: 'top-right',
						touchDevices: true,
						fixedWidth: 300,
						interactive: true,
						delay: 100
					});
				},
				json: function() {
					return this.model.toJSON();
				},
				redir: function (e) {
					if (this.counter() === 1) {
						// close the tooltip when the image was clicked.
						$(e.currentTarget).data('plugin_tooltipster').hideTooltip();
						
						var clickedEl = $(e.currentTarget); // which element was clicked?
						var uri = decodeURIComponent(clickedEl.attr("value")); // get the value
						//var uri = $("#" + id).val();
						e.preventDefault();
						Backbone.history.navigate(uri, true);
					}
					
				}
			});
		},
		'Main'	: function () {
			return new Index_m();
		}
	}
	return Index;
});