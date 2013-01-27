require.config({
  paths: {   
    //baseURL is /js/
    jquery: 'libs/jquery',
    jcrypt: 'libs/jquery.crypt',
    underscore: 'libs/underscore',
    backbone: 'libs/backbone', // this version of backbone is AMD enabled, downloaded at https://github.com/amdjs
    templates: '../templates', // the templates folder
    text: 'text', // required for require-ing templates
    DEM: 'namespace' // set globals here
  }
});

require([
  	'app',
], function(app){
    app.initialize();
});