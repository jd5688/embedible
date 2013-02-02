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
], function($, _, Backbone, session, Cat, EmbedSaveM, tmplate, embed_result, esuccess, efail){
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
					'click #embCancel'			: 'redir'
				},
				initialize: function () {
					// check if user is logged
					var logged = session.checkCookie();
					if (logged === false) {
						// only logged in users can submit embed. so...
						Backbone.history.navigate('', true);
						return true;
					}
				
					// initialize the counter;
					// this counter is used to prevent the functions from doing unexpected and unwanted loops. 
					// a bug from my script? or require.js? or a bug from backbone? not yet known as of writing this
					this.counter = this.inc(); 
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
				
				'inc' : function () {
					var i = 0;
					return function (j) {
						return j !== undefined ? j : i += 1;
					};
				},
				
				'counter' : '',
		
				render: function () {			
					var attributes = this.json();
					var embedlyKey = attributes.key;
					var template = _.template( tmplate, attributes );
					//render the template
					this.$el.html( template );
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
						if (this.counter() === 1) {
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
						}
					} else {
						if (this.counter() === 1) {
							// display an error message. user did not input any URL
							alert('Please enter your URL');
							this.counter = this.inc();  // re-initialize counter
						}
					}
				},
				
				navi: function() {
					if (this.counter() === 2) {
						var categ = $("input:radio[name=category]:checked").val();
						
						if (categ !== undefined) {
							Backbone.history.navigate('embed/save', true);
						} else {
							alert('You need to choose category');
						}
						this.counter = this.inc();  // re-initialize counter
						this.counter();
					}
				},
				
				redir: function(e) {
					this.counter = this.inc();  // re-initialize counter
					this.$('#url').val('');
					$('#embedible').html( '<input type="submit" id="submit" name="submit" value="Send"/>' );
					//$('#embedible')
				}
			});
		},
		
		'SaveM': function () {
			return new EmbedSaveM();
		},
		'Save' : function () {
			return Backbone.View.extend({
				//model: embedSave,
				
				initialize: function () {
					this.render();
				},
				
				render: function () {
					this.data.data = this.$("#data").val();
					this.data.tags = this.$("#tags").val();
					this.data.is_public = this.$("#is_public").val();
					this.data.category = $("input:radio[name=category]:checked").val();
					this.data.username = session.getCookie("username");
					this.model.set(this.data);
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
				}
			});
		},
		
		'SuccessFail' : function () {
			return Backbone.View.extend({
				events: {
					'click #a_embed': 'gotoPage'
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
				}
			});
		}
	};
	
	return Embed;
});