define([
  'jquery',
  'bootstrap',
  'underscore',
  'backbone',
  'jcrypt',
  'mysession',
  'models/register_m',
  'DEM',
  'text!templates/register/register_tpl.html',
  'text!templates/register/register_success_tpl.html',
], function($, bootstrap, _, Backbone, jcrypt, session, Register_m, DEM, register_tpl, success_tpl){
	var Register = {
		View: function () {
			return Backbone.View.extend({
				uri : '',
				events: {
					'click #register': 'doRegister',
					'click #toLogin': 'redir',
					'click #reTry': 'reTry'
				},
				render: function () {
					var template = _.template( register_tpl );
					//render the template
					this.$el.html( template );
				},
				doRegister: function (e) {
					e.preventDefault();
					var email = $('#username').val();
					if (this._user_validate(email)) {
						var pw = $('#password').val();
						var cpw = $('#confirm_password').val();
						if (pw && cpw && pw === cpw) {
							if (pw.length < 8) {
								$('#invalid_pass_length').fadeIn();
								$('#password').val('');
								$('#confirm_password').val('');
								setTimeout(function () {
									$('#invalid_pass_length').fadeOut();
								}, 3000);
							} else if (/[^a-zA-Z 0-9,'()!@#$%^&*()_"]+/.test(pw)){
								// show the alerter
								$('#invalid_chars').fadeIn();
								$('#password').val('');
								$('#confirm_password').val('');
								setTimeout(function () {
									$('#invalid_chars').fadeOut();
								},3000);
							} else {
								ux = DEM.ux();
								var ckey = email + ux + DEM.key();
								var hash = $().crypt({
									method: "md5",
									source: ckey}
								);
								
								this.model.fetch({url : DEM.domain + "register?hash=" + hash + "&publc=" + ux + "&u=" + email + "&p=" + pw + "&callback=?"});
								this.model.on('change', this._catch, this);
							}
						} else {
							$('#invalid_pass').fadeIn();
							$('#password').val('');
							$('#confirm_password').val('');
							setTimeout(function () {
								$('#invalid_pass').fadeOut();
							}, 2000);
						}
					} else {
						$('#invalid_user').fadeIn();
						$('#username').val('');
						setTimeout(function () {
							$('#invalid_user').fadeOut();
						}, 2000);
					}
				},
				_catch: function () {
					var data = this.model.toJSON();
					if (data.status === 'Error!') {
						$('#reg_message').html(data.message);
						$('#reg_fail').fadeIn();
						$('#password').val('');
						$('#confirm_password').val('');
						$('#username').val('');
						setTimeout(function () {
							$('#reg_fail').fadeOut();
						}, 5000);
					} else {
						var template = _.template( success_tpl, data );
						//render the template
						this.$el.html( template );
					}
				},
				_user_validate: function (user) {
					if (user !== '') {
						// test if valid email
						var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
						return regex.test(user);
					} else {
						// username can't be blank
						return false;
					}
				},
				redir: function (e) {
					e.preventDefault();
					Backbone.history.navigate('login', true);
				},
				reTry: function (e) {
					e.preventDefault();
					Backbone.history.navigate('register', true);
				},
				onClose: function(){
					this.model.unbind("change", this.render);
				}
			});
		},
		model: function() {
			return new Register_m();
		}

	}
	return Register;
});