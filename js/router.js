define([
	'jquery',
	'underscore',
	'backbone',
	'views/add_embed_v',
	'views/embed_save_v',
	'views/embed_save_success',
	'views/login/login_v'
], function($, _, Backbone, EmbedView, SaveEmbed, EmbedSucFail, LoginView){
	var Router = Backbone.Router.extend({
		routes: {
			"index.html"		: "index",
			"" 					: "index",
			"embed" 			: "embed",
			"embed/" 			: "embed",
			"embed/save"		: "save_embed",
			"embed/save/"		: "save_embed",
			"embed/save/:opt"	: "save_embed",
			"login"				: "login",
			"login/"			: "login",
			"404"				: "fourfour",
			"*anything"			: "defaultRoute"
		},
		
		start: function () {
			// declare your root URL if located in a folder other than the main
			// folder - http://example.com/~admin/
			Backbone.history.start({ pushState: true, root: "/~admin" });
		},
		
		index: function () {
			alert('hello');
		},
		
		defaultRoute: function(anything) {
			this.fourfour(anything);
		},
		
		// user submitting content
		embed: function() {		
			var embedView = new EmbedView({ el: $("#main") });
		},
		
		// saving the user-submitted content to the db
		save_embed: function(opt) {
			// check wether category radio selection exists in the DOM.
			// if not, means user typed the URL (/embed/save) directly
			// we do not allow user to go directly to /embed/save,
			// so...
			var cat = $("input:radio[name=category]:checked").val();
			if (cat === undefined) {
				Backbone.history.navigate('embed', true); // redirect to the embed main page
			};
			
			// else, do the following
			if (opt === 'success') {
				var embedSucFail = new EmbedSucFail({ el: $("#main") });
				embedSucFail.success();
			} else if (opt === 'fail') {
				var embedSucFail = new EmbedSucFail({ el: $("#main") });
				embedSucFail.fail();
			} else if (opt === undefined) {
				var saveEmbed = new SaveEmbed({ el: $("#main") });
				saveEmbed.save();
			} else {
				Backbone.history.navigate('404', true);
			}
		},
		
		//nowhere to go
		fourfour: function(uri) {
			uri = uri || '';
			alert('this is 404 -' + uri);
		},
		
		//login page
		login: function() {
			var loginView = new LoginView({ el: $("#main") });
		}
	});
	
	var initialize = function() {
		var router = new Router();
		router.start();
	};
	
  
	return {
		initialize: initialize
	};
});