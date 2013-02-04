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
	'views/login/login_v',
	'views/index/index_v',
	'views/contents/contents_v',
	'views/contents/content_v',
	'views/heading_v',
	'DEM',
], function($, _, Backbone, session, Embed, Login, Index, Contents, Content, HeadView, DEM){

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
			"video"				: "video",
			"video/"			: "video",
			"video/:id"			: "video",
			"photo"				: "photo",
			"photo/"			: "photo",
			"photo/:id"			: "photo",
			"logout"			: "logout",
			"404"				: "fourfour",
			"*anything"			: "defaultRoute"
		},
		
		start: function () {
			// declare your root URL if located in a folder other than the main
			// folder - http://example.com/~admin/
			Backbone.history.start({ pushState: true, root: DEM.root });
		},
		
		// the index or home page
		index: function () {
			var headView = new HeadView({ el: $("#head") });
			var indexMain = Index.Main(); // create the model
			indexMain.fetch();
            var IndexView = Index.View();
			var indexView = new IndexView({ el: $("#main"), model: indexMain });
		},
		
		defaultRoute: function(anything) {
			this.fourfour(anything);
		},
		
		// user submitting content
		embed: function() {	
			var headView = new HeadView({ el: $("#head") });
			var cat = Embed.Cat(); // category model
			cat.fetch(); // fetch data from the server
			var EmbedView = Embed.View();
			var embedView = new EmbedView({ el: $("#main"), model : cat });
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
			if (opt === 'success' || opt === 'fail') {
				var EmbedSucFail = Embed.SuccessFail();
				var embedSucFail = new EmbedSucFail({ el: $("#main") });
				
				if (opt === 'success') {
					embedSucFail.success();
				} else if (opt === 'fail') {			
					embedSucFail.fail();
				}
			} else if (opt === undefined) {
				var embedSave = Embed.SaveM(); // create the model
				
				var SaveEmbed = Embed.Save(); // the view constructor
				var saveEmbed = new SaveEmbed({ el: $("#main"), model: embedSave });
				saveEmbed.save();
			} else {
				Backbone.history.navigate('404', true);
			}
		},
		
		video: function (id) {
			var headView = new HeadView({ el: $("#head") });
			
			if (id) {
				var contentModel = Content.Model({ noCache: true });
				contentModel.fetch({ url : DEM.domain + "contents_video?id=" + id +"&callback=?"}); // fetch data from the server
				var ContentView = Content.View(); // the view constructor
				var contentView = new ContentView({ el: $("#main"), model: contentModel });
			} else {
				var contentsModel = Contents.Model();
				contentsModel.fetch({ url : DEM.domain + "contents_video?callback=?"}); // fetch data from the server
				var ContentsView = Contents.View(); // the view constructor
				var contentsView = new ContentsView({ el: $("#main"), model: contentsModel });
			}
			
			
		},
		
		photo: function (id) {
			var headView = new HeadView({ el: $("#head") });
			
			if (id) {
				var contentModel = Content.Model({ noCache: true });
				contentModel.fetch({ url : DEM.domain + "contents_photo?id=" + id +"&callback=?"}); // fetch data from the server
				var ContentView = Content.View(); // the view constructor
				var contentView = new ContentView({ el: $("#main"), model: contentModel });
			} else {
				var contentsModel = Contents.Model();
				contentsModel.fetch({ url : DEM.domain + "contents_photo?callback=?"}); // fetch data from the server
				var ContentsView = Contents.View(); // the view constructor
				var contentsView = new ContentsView({ el: $("#main"), model: contentsModel });
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
				var LoginViewFail = Login.ViewFail();
				var loginViewFail = new LoginViewFail({ el: $("#main") });
			} else {
				var login = Login.login(); // create a login model 
				var LoginView = Login.View();
				var loginView = new LoginView({ el: $("#main"), model : login });
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