/*
 by Rudem Labial. http://embedible.com
 see repository: https://github.com/jd5688/embedible
*/

define([
	'jquery',
	'underscore',
	'backbone',
	'mysession',
	'views/embed/add_embed_v',
	'views/embed/embed_save_v',
	'views/embed/embed_save_success',
	'views/login/login_v',
	'views/login/login_v_fail',
	'views/index/index_v',
	'views/heading_v'
], function($, _, Backbone, session, EmbedView, SaveEmbed, EmbedSucFail, LoginView, LoginViewFail, IndexView, HeadView){

	var Router = Backbone.Router.extend({
		routes: {
			"index.html"		: "index",
			""					: "index",
			"embed"				: "embed",
			"embed/"			: "embed",
			"embed/save"		: "save_embed",
			"embed/save/"		: "save_embed",
			"embed/save/:opt"	: "save_embed",
			"login"				: "login",
			"login/"			: "login",
			"login/:failed"		: "login",
			"logout"			: "logout",
			"404"				: "fourfour",
			"*anything"			: "defaultRoute"
		},
		
		start: function () {
			// declare your root URL if located in a folder other than the main
			// folder - http://example.com/~admin/
			Backbone.history.start({ pushState: true, root: "/~admin" });
		},
		
		index: function () {
			var headView = new HeadView({ el: $("#head") });
			var indexView = new IndexView({ el: $("#main") });
		},
		
		defaultRoute: function(anything) {
			this.fourfour(anything);
		},
		
		// user submitting content
		embed: function() {	
			var headView = new HeadView({ el: $("#head") });
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
				return true;
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
		login: function(failed) {
			var headView = new HeadView({ el: $("#head") });
			if (failed) {
				var loginViewFail = new LoginViewFail({ el: $("#main") });
			} else {
				var loginView = new LoginView({ el: $("#main") });
			}
		},
		
		logout: function() {
			// destroy cookie
			var bool = session.delCookie("username");
			if (bool === true) {
				Backbone.history.navigate('', true);
			};
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