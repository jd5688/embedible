define([
	'jquery',
	'underscore',
  	'backbone',
  	'mysession',
  	'models/add_embed_m',
  	'models/embed_save_m',
	'text!templates/embed/embed_tpl.html',
	'text!templates/embed/embed_data_tpl.html',
	'text!templates/embed/embed_success_tpl.html',
  	'text!templates/embed/embed_fail_tpl.html',
  	'text!templates/embed/embed_alert_tpl.html',
  	'text!templates/embed/embed_nav_tpl.html',
], function($, _, Backbone, session, Cat, EmbedSaveM, tmplate, embed_result, esuccess, efail, alert_tpl, nav_tab){
	var Embed = {
		'Cat' : function () {
			return new Cat();
		},
		'View'	: function(obj) {
			return Backbone.View.extend({
				events: {
					"click input[type=radio]"	: "onRadioClick",
					'click #choose_cat'			: 'showSelect',
					'click #hide_cat'			: 'hideSelect',
					'click #submit'				: 'embedly', // the link was submitted.
					'click #save'				: 'navi', // #save does not get rendered until 'embedly' has rendered.
					'click #embCancel'			: 'redir',
					'click #show_all'			: 'redir2',
					'click #my_videos'			: 'redir2',
					'click #my_photos'			: 'redir2',
					'click #my_rich'			: 'redir2',
					'click #my_links'			: 'redir2',
					'click #my_dashboard'		: 'redir2',
					'click #playlists'			: 'redir2',
					'click #embed'				: 'redir2'
				},
				/*
				initialize: function () {
					// check if user is logged
					var logged = session.checkCookie();
					if (logged === false) {
						// only logged in users can submit embed. so...
						Backbone.history.navigate('', true);
						return true;
					}
				
					if (this.model.has("key")) {
						// if model has attribute named 'key', render immediately.
						// means that the model has already been preloaded before and no need to
						// wait for change anymore. Waiting for change at this time, will result in
						// render() function not firing. So...
						this.render();
					} else {
						// Otherwise, wait. if change happens, then render.
						// means that this model has no attribute named 'key' yet. Probably this is a fresh connection
						// or a reload on /embed page. Calling the render() function without waiting
						// for change at this time will result in page not properly loaded. So...
						this.model.on('change', this.render, this);
					}
				},
				*/
				render: function () {	
					var logged = session.checkCookie();
					if (logged === false) {
						// only logged in users can submit embed. so...
						Backbone.history.navigate('', true);
						return true;
					}
				
					var attributes = this.json();
					var embedlyKey = attributes.key;
					var template = _.template( tmplate, attributes );
					//render the template
					this.$el.html( template );

					//var naviTabs = _.template( nav_tab );
					//$('#nav_tabs').html( naviTabs );
				},
				json: function() {
					return this.model.toJSON();
				},
				showSelect: function() {
					// display the radio buttons
					this.$('#sf').fadeIn();
					this.$('#b1').hide();
					this.$('#b2').show();
				},
						
				hideSelect: function() {
					// hide the radio buttons
					this.$('#sf').fadeOut();
					this.$('#b1').show();
					this.$('#b2').hide();
				},
						
				onRadioClick: function() {
					// if radio button clicked
					this.hideSelect();
					// assign the value of the 'checked' radio to rvalue;
					rvalue = $("input:radio[name=category]:checked").val();
					// update the span #disp_cat
					this.$('#disp_cat').html(rvalue);
				},
						
				embedly: function() {
					var embedlyKey = this.json().key;
					var url = this.$('#url').val();
		
					if (typeof embedlyKey !== "undefined" && url !== '') {
						var api = 'http://api.embed.ly/1/oembed?key=' + embedlyKey + '&url=' + url + '&format=json';
						$.get(api, function(data) {
							// data in firefox is 'string'. in chrome it's an 'object'
							// so convert to jSON obj if not yet an object
							if (typeof data !== 'object') {
								var strData = data; // assign the 'string' type data
								data = $.parseJSON(data); // then parse
								data.data = strData; // finally, assign the original 'string' data to a property
							} else {
								// data is already an object
								var strData = JSON.stringify(data); // assign as a string
								data.data = strData;
							}
							var template = _.template( embed_result, data );
							$('#embedible').html( template );
						});
					} else {
						// display an error message. user did not input any URL
						var data = { message : 'Please enter a link or URL.' };
						var template = _.template( alert_tpl, data );
						//render the template
						$('#embed_alert').html( template );
					}
				},
				
				navi: function() {
					var categ = $("input:radio[name=category]:checked").val();
					
					if (categ !== undefined) {
						Backbone.history.navigate('embed/save', true);
					} else {
						var data = { message: 'You need to choose a category' };
						var template = _.template( alert_tpl, data );
						//render the template
						$('#embed_alert_bottom').html( template );
					}
				},
				
				redir: function(e) {
					this.$('#url').val('');
					
					//$('#embedible').html( '<input type="submit" id="submit" name="submit" value="Send"/>' );
					
					$('#embedible').html( '<button class="btn btn-small btn-primary" id="submit" name="submit">Send</button>' );
				},
				redir2: function(e) {
					var clickedEl = $(e.currentTarget); // which element was clicked?
					var uri = clickedEl.attr("id");
					if (uri === 'playlists') {
							uri = 'dashboard/' + uri;
						};
					
					if (uri === 'my_dashboard') {
						uri = 'dashboard';
					};
					e.preventDefault();
					Backbone.history.navigate(uri, true);
				},
				onClose: function(){
					this.model.unbind("change", this.render);
				}
			});
		},
		
		'SaveM': function () {
			return new EmbedSaveM();
		},
		'Save' : function () {
			return Backbone.View.extend({
				//model: embedSave,
				
				/*
				initialize: function () {
					this.render();
				},
				*/
				render: function () {
					this.data.data = $("#data").val();
					this.data.tags = $("#tags").val();
					this.data.is_public = $("#is_public").val();
					this.data.category = $("input:radio[name=category]:checked").val();
					this.data.username = session.getCookie("username");
					this.model.set(this.data);
					//this.model.on('change', this.save, this);
					this.save();
				},
				
				data: {},
				
				save: function() {
					this.model.save(null, {
						// always results in error even if successful. maybe this is due to cross-domain
						// error: -> goes to success page
						error : function(options) {
							Backbone.history.navigate('embed/save/success', true);
						},
						success: function() {
							Backbone.history.navigate('embed/save/success', true);
						}
					});
				},
				onClose: function(){
					this.model.unbind("change", this.render);
				}
			});
		},
		
		'SuccessFail' : function () {
			return Backbone.View.extend({
				events: {
					'click #a_embed': 'gotoPage'
				},
				render: function () {
					//this is a blank render 
					// the AppView function from router.js file invokes
					// render() by default.
					// do nothing.
				},
				success: function() {
					var template = _.template( esuccess );
					//render the template
					this.$el.html( template );
				},
				
				fail: function() {
					var template = _.template( efail );
					//render the template
					this.$el.html( template );
				},
				
				gotoPage: function(e) {	
					e.preventDefault();
					Backbone.history.navigate('embed', true); // redirect to the embed main page
				},
				onClose: function(){
					this.model.unbind("change", this.render);
				}
			});
		}
	};
	
	return Embed;
});