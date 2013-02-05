define([
  'jquery',
  'easing',
  'underscore',
  'backbone',
  'mysession',
  'DEM',
  'text!templates/css/menu.html',
  'text!templates/header_tpl.html',
], function($, j_easing, _, Backbone, session, DEM, menu, header){
	var HeadView = Backbone.View.extend({
		events: {
			'click #home': 'home',
			'click #video': 'videos',
			'click #photo': 'photos',
			'click #rich': 'rich',
			'click #embed': 'embed',
			'click #login': 'login',
			'click #logout': 'logout',
			'mouseover li': 'mouseOver',
			'mouseout li': 'mouseOut'
		},
		initialize: function () {
			this.render();
		},
		render: function () {
			var menuTemp = _.template( menu );
			$("#css_container").append(menuTemp);
		
			var username = session.checkCookie() || '';
			var attrib = {
					'username' : username,
				}
			var template = _.template( header, attrib );
			//render the template
			this.$el.html( template );
		},
		
		mouseOver: function (e) {
			var liEl = $(e.currentTarget); // which element was clicked?
			//var uri = decodeURIComponent(clickedEl.attr("value")); // get the value
			$(liEl).stop().animate({height:'150px'},{queue:false, duration:600, easing: 'easeOutBounce'});
		},
		
		mouseOut: function (e) {
			var liEl = $(e.currentTarget); // which element was clicked?
			$("li").stop().animate({height:'50px'},{queue:false, duration:600, easing: 'easeOutBounce'}) 
		},
		
		home: function(e) {
			e.preventDefault();
			Backbone.history.navigate('', true);
		},
		
		videos: function(e) {
			e.preventDefault();
			Backbone.history.navigate('video', true);
		},
		
		photos: function(e) {
			e.preventDefault();
			Backbone.history.navigate('photo', true);
		},
		
		rich: function(e) {
			e.preventDefault();
			Backbone.history.navigate('rich', true);
		},
		
		login: function(e) {
			e.preventDefault();
			Backbone.history.navigate('login', true);
		},
		
		logout: function(e) {
			e.preventDefault();
			Backbone.history.navigate('logout', true);
		},
		
		embed: function(e) {
			e.preventDefault();
			Backbone.history.navigate('embed', true);
		}
	});
	
	return HeadView;
});