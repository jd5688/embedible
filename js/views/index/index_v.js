define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/index/index_tpl.html',
], function($, _, Backbone, tmplate){
	var IndexView = Backbone.View.extend({
		initialize: function () {
			this.render();
		},
		render: function () {
			var template = _.template( tmplate );
			//render the template
			this.$el.html( template );
		}
	});
	
	return IndexView;
});