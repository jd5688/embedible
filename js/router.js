/*
 by Rudem Labial. http://embedible.com
 see repository: https://github.com/jd5688/embedible
*/

define([
	'jquery',
	'underscore',
	'backbone',
	'mysession',
	'views/dashboard/embed/add_embed_v',
	'views/login/login_v',
	'views/index/index_v',
	'views/contents/contents_v',
	'views/contents/content_v',
	'views/dashboard/dashboard_v',
	'views/dashboard/playlists/playlist_v',
	'views/playlist/playlist_v',
	'views/heading_v',
	'views/footer_v',
	'DEM',
], function($, _, Backbone, session, Embed, Login, Index, Contents, Content, Dashboard, Playlist, MainPlaylist, Head, Foot, DEM){
	// create a close function on the view prototype
	Backbone.View.prototype.close = function(){
		this.remove();
		this.unbind();
		if (this.onClose){
			this.onClose();
		}
	}
	
	var Router = Backbone.Router.extend({
		routes: {
			"index.html"					: "index",
			""								: "index",
			"dashboard"						: "dashboard",
			"dashboard/"					: "dashboard",
			"dashboard/:page/"				: "dashboard",
			"dashboard/:page"				: "dashboard",
			"dashboard/:page/:option"		: "dashboard",
			"dashboard/:page"				: "dashboard",
			"dashboard/:page/"				: "dashboard",
			"embed"							: "embed",
			"embed/"						: "embed",
			"embed/:save"					: "save_embed",
			"embed/:save/"					: "save_embed",
			"embed/:save/:opt"				: "save_embed",
			"embed/:save/:opt/"				: "save_embed",
			"login"							: "login",
			"login/"						: "login",
			"login/:failed"					: "login",
			"video"							: "video",
			"video/"						: "video",
			"video/:id"						: "video",
			"photo"							: "photo",
			"photo/"						: "photo",
			"photo/:id"						: "photo",
			"rich"							: "rich",
			"rich/"							: "rich",
			"rich/:id"						: "rich",
			"link"							: "link",
			"link/"							: "link",
			"link/:id"						: "link",
			"tags"							: "tags",
			"tags/"							: "tags",
			"tags/:id"						: "tags",
			"playlist"						: "playlist",
			"playlist/"						: "playlist",
			"playlist/:uniq_id"				: "playlist",
			"playlist/:uniq_id/:vid_uniq"	: "playlist",
			"logout"						: "logout",
			"404"							: "fourfour",
			"*anything"						: "defaultRoute"
		},
		
		start: function (options) {
			// declare your root URL if located in a folder other than the main
			// folder - http://example.com/~admin/
			Backbone.history.start({ pushState: true, root: DEM.root });
		},
		
		_renderHead: function (uri) {
			var headModel = Head.Model();
			headModel.set({ uri: uri });
			var HeadView = Head.View();
			var headView = new HeadView({ model: headModel });
			this.AppView.showHeadView(headView);
			
			// render the footer
			var FootView = Foot.View();
			var footView = new FootView();
			this.AppView.showFootView(footView);
		},
		
		// the index or home page
		index: function () {
			this._renderHead('home');
			var indexMain = Index.Main(); // create the model
			indexMain.set({ uri : 'Most Recent' });
            var IndexView = Index.View();
			var indexView = new IndexView({ model: indexMain });
			this.AppView.showView(indexView);
		},
		
		// logged in users go here
		dashboard: function (page, option) {
			var activ;
			if (page !== undefined) {
				if (page === 'playlists' && option === undefined) {
					activ = 'playlists';
				} else if (page === 'playlists' && option !== undefined) {
					activ = 'add_playlist';
				} else {
					activ = page;
				};
			} else {
				activ = 'show_all';
			};
			this._renderHead(activ);
		
			var gPass = '';
			if (typeof page === 'undefined' || page === 'show_all' || page === 'my_videos' || page === 'my_photos' || page === 'my_rich' || page === 'my_links') {
				gPass = 1;
			} else if (page === 'playlists'){
				this.playlists(activ);
				return;
			}

			username = session.checkCookie();
			if (typeof username === 'string') {
				if (gPass === 1) {
					var dashboardMain = Dashboard.Main(); // create the model
					dashboardMain.fetch({ url: DEM.domain + "getembed?username=" + username + "&callback=?" });
					dashboardMain.set({ uri: activ });
					var DashboardView = Dashboard.View();
					var dashboardView = new DashboardView({ model: dashboardMain });
					this.AppView.showView(dashboardView);
				}
			} else {
				Backbone.history.navigate('', true); // redirect to the main page
				return true;
			}
		},
		
		defaultRoute: function(anything) {
			this.fourfour(anything);
		},
		
		// user submitting content
		embed: function() {	
			this.AppView.closeView('saveEmbed');
			this.AppView.closeView('embedSucFail');
			
			this._renderHead('embed');
			var cat = Embed.Cat(); // category model
			
			// fetch data from the server
			var that = this;
			cat.fetch({
				success: function (model, response) { 
					var EmbedView = Embed.View();
					var embedView = new EmbedView({ model : cat });
					that.AppView.showView(embedView);
				}
			});
		},
		
		// saving the user-submitted content to the db
		save_embed: function(save, opt) {
			this._renderHead('dashboard');
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
				var embedSucFail = new EmbedSucFail();
				
				var that = this.AppView.showViewNoClose(embedSucFail);
				
				if (opt === 'success') {
					//embedSucFail.success();
					that[embedSucFail].success();
				} else if (opt === 'fail') {			
					//embedSucFail.fail();
					that[embedSucFail].fail();
				}
				
				// now destroy/close the saveEmbed view
				//this.AppView.closeView('saveEmbed');
			} else if (opt === undefined) {
				var embedSave = Embed.SaveM(); // create the model
				
				var SaveEmbed = Embed.Save(); // the view constructor
				var saveEmbed = new SaveEmbed({ model: embedSave } );
				
				// do not destroy the previous view (embedView)
				// we need it's rendered view event
				// just create another view instance (saveEmbed)
				this.AppView.showViewNoClose(saveEmbed);
			} else {
				Backbone.history.navigate('404', true);
			}
		},
		
		video: function (id) {
			this._renderHead('video');
			
			if (id) {
				var contentModel = Content.Model({ noCache: true });
				contentModel.fetch({ url : DEM.domain + "contents?id=" + id +"&callback=?"}); // fetch data from the server
				var ContentView = Content.View(); // the view constructor
				var contentView = new ContentView({ model: contentModel });
				this.AppView.showView(contentView);
			} else {
				var contentsModel = Contents.Model();
				contentsModel.set({ uri: 'Videos' });
				contentsModel.fetch({ url : DEM.domain + "contents?type=video&callback=?" }); // fetch data from the server
				var ContentsView = Contents.View(); // the view constructor
				var contentsView = new ContentsView({ model: contentsModel });
				this.AppView.showView(contentsView);
			}
			
			
		},
		
		photo: function (id) {
			this._renderHead("photo");
			
			if (id) {
				var contentModel = Content.Model({ noCache: true });
				contentModel.fetch({ url : DEM.domain + "contents?id=" + id +"&callback=?"}); // fetch data from the server
				var ContentView = Content.View(); // the view constructor
				var contentView = new ContentView({ model: contentModel });
				this.AppView.showView(contentView);
			} else {
				var contentsModel = Contents.Model();
				contentsModel.set({ uri: 'Photos' });
				contentsModel.fetch({ url : DEM.domain + "contents?type=photo&callback=?" }); // fetch data from the server
				var ContentsView = Contents.View(); // the view constructor
				var contentsView = new ContentsView({ model: contentsModel });
				this.AppView.showView(contentsView);
			}	
		},
		
		rich: function (id) {
			this._renderHead("rich");
			
			if (id) {
				var contentModel = Content.Model({ noCache: true });
				contentModel.fetch({ url : DEM.domain + "contents?id=" + id +"&callback=?"}); // fetch data from the server
				var ContentView = Content.View(); // the view constructor
				var contentView = new ContentView({ model: contentModel });
				this.AppView.showView(contentView);
			} else {
				var contentsModel = Contents.Model();
				contentsModel.set({ uri: 'Rich Media' });
				contentsModel.fetch({ url : DEM.domain + "contents?type=rich&callback=?" }); // fetch data from the server
				var ContentsView = Contents.View(); // the view constructor
				var contentsView = new ContentsView({ model: contentsModel });
				this.AppView.showView(contentsView);
			}	
		},
		
		link: function (id) {
			this._renderHead("link");
			if (id) {
				var contentModel = Content.Model({ noCache: true });
				contentModel.fetch({ url : DEM.domain + "contents?id=" + id + "&callback=?"}); // fetch data from the server
				var ContentView = Content.View(); // the view constructor
				var contentView = new ContentView({ model: contentModel });
				this.AppView.showView(contentView);
			} else {
				var contentsModel = Contents.Model();
				contentsModel.set({ uri: 'Links' });
				contentsModel.fetch({ url : DEM.domain + "contents?type=link&callback=?" }); // fetch data from the server
				var ContentsView = Contents.View(); // the view constructor
				var contentsView = new ContentsView({ model: contentsModel });
				this.AppView.showView(contentsView);
			}	
		},
		
		tags: function (id) {
			id = decodeURIComponent(id);
			id = id.replace(/\+/g, " ");

			this._renderHead();
			if (id) {
				var contentsModel = Contents.Model();
				contentsModel.fetch({ url : DEM.domain + "contents?tag=" + id + "&callback=?"}); // fetch data from the server
				var ContentsView = Contents.View(); // the view constructor
				var contentsView = new ContentsView({ model: contentsModel });
				this.AppView.showView(contentsView);
			} else {
				this.fourfour();
			}	
		},
		
		playlists: function(activ) {
			this._renderHead(activ);
			var playlistModel = Playlist.Model();
			playlistModel.set({ uri: activ });
			//playlistModel.fetch({ url : DEM.domain + "playlists?hash=" + hash + "&id=" + id +"&callback=?"});
			var PlaylistView = Playlist.View(); // the view constructor
			var playlistView = new PlaylistView({ model: playlistModel });
			
			this.AppView.showView(playlistView);
		},
		
		playlist: function (uniq_id, vid_uniq) {
			// uniq_id is the playlist uniq id
			// vid_uniq is the db table 'Videos' uniq_id
			// Videos table does not just contain embedded videos but all types of embeds
			this._renderHead("playlist");
			if (!uniq_id) {
				var playlistModel = MainPlaylist.Model();
				var PlaylistView = MainPlaylist.View();
				var playlistView = new PlaylistView({ model: playlistModel });
				this.AppView.showView(playlistView);
			} else {
				if (typeof vid_uniq === 'undefined') {
					vid_uniq = '';
				}
				var playlistModel = MainPlaylist.Model();
				playlistModel.set({uniq_id: uniq_id, vid_uniq: vid_uniq});
				var PlaylistContentView = MainPlaylist.ContentView();
				var playlistContentView = new PlaylistContentView( { model: playlistModel } );
				this.AppView.showView(playlistContentView);
			}
		},
		
		// it's very important to close events that are no longer being used.
		// backbone is event-driven and so will create event zombies if views and models are not properly
		// closed or destroyed
		AppView: {
			showView: function(view) {
				if (this.currentView){
					this.currentView.close();
				}
		 
				this.currentView = view;
				this.currentView.render();
		 
				// display the new view
				$("#main").html(this.currentView.el);
				return this;
			},
			showHeadView: function(view) {
				if (this.headView){
					this.headView.close();
				}
		 
				this.headView = view;
				this.headView.render();
		 
				// display the new view
				$("#head").html(this.headView.el);
			},
			showFootView: function(view) {
				if (this.footView){
					this.footView.close();
				}
		 
				this.footView = view;
				this.footView.render();
		 
				// display the new view
				$("#footer_links").html(this.footView.el);
			},
			closeView: function(view){
			// this is the partner of showViewNoClose
				if (this[view]) {
					this[view].close();
				};
			},
			showViewNoClose: function (view) {
				// this will create another view event without closing
				// the previous view. this is needed sometimes when a new view
				// depends on the old view's rendered elements
				this[view] = view;
				this[view].render();
		 
				$("#main").html(this[view].el);
				return this;
			}
		},
		
		//nowhere to go
		fourfour: function(uri) {
			uri = uri || '';
			alert('this is 404 -' + uri);
		},
		
		//login page
		login: function(failed) {
			this._renderHead("login");
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