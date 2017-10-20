/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

var common = __webpack_require__(1);
var zendesk = __webpack_require__(2);

// zendesk.generateModal();

zendesk.initializeApp();
common.displayHtml();


/***/ }),
/* 1 */
/***/ (function(module, exports) {

var common = {};

common.displayHtml = function() {
  $(document).ready(function() {
    $('.modal-container').html('<div class="l-grid"><div class="u-ta-center"><h3 class="u-gamma">Authorization</h3><p class="u-p">Please authorize to the following services to get started with your automation.</p><ul><li class="u-p-sm"><button class="c-btn c-btn--primary" id="zendesk-auth" style="width: 235px;">Connect to Zendesk</button></li><li><button class="c-btn c-btn--primary" style="width: 235px;" id="gsheets-auth">Connect to Google Sheets</button></li></ul></div>');
  });
};

common.generateAuthHandlers = function() {
  var client = ZAFClient.init();
  client.context().then(function(context) {
    var date = Date.now();
    var subdomain = context.account.subdomain;

    var configName = subdomain.concat(date);
    var zendeskAuth = 'https://designer2.azuqua.com/app/oauth/zendeskoauth2/authorize?app_token=azq_apps&orgId=6160&configName=' + configName + '&version=1.0.39&subdomain=' + subdomain;
    var gsheetsAuth = 'https://designer2.azuqua.com/app/oauth/googlesheets2_29/authorize?app_token=azq_apps&orgId=6160&configName=' + configName + '&version=0.2.13&subdomain=' + subdomain;

    $('#zendesk-auth').click(function(e) {
      var zendeskAuthWindow = window.open(zendeskAuth, 'Authorize to Zendesk', 'resizable,scrollbars,status,width=650,height=650');
      zendeskAuthWindow.onunload = function() {
        $('#zendesk-auth').html('<p>icon goes here</p>');
        //update configuration status in wellspring, step 1 complete
      };
    });
    $('#gsheets-auth').click(function(e) {
      var zendeskAuthWindow = window.open(gsheetsAuth, 'Authorize to Google Sheets', 'resizable,scrollbars,status,width=650,height=650');
      zendeskAuthWindow.onunload = function() {
        $('#gsheets-auth').html('<p>icon goes here</p>');
        //update configuration status in wellspring, step 2 complete
      };
    });
  });
};

module.exports = common;


/***/ }),
/* 2 */
/***/ (function(module, exports) {

var zendesk = {};

var client = ZAFClient.init();

zendesk.initializeApp = function() {
  client.invoke('resize', {
    height: 250,
    width: 350
  });
};


//old, from modal version
zendesk.generateModal = function() {
    client.on('app.registered', function(context) {
      console.log(context);
        if (context.context.location === 'background') {
            client.invoke('instances.create', {
                location: 'modal',
                url: 'assets/iframe.html'
            }).then(function(modalContext) {
                console.log('fired off the modal successfully');
                var modalClient = client.instance(modalContext['instances.create'][0].instanceGuid);
                modalClient.invoke('resize', {
                    width: '400px',
                    height: '350px'
                });

                modalClient.on('modal.close', function() {
                    console.log('user just closed the modal');
                });
            });
        }
    });
};

module.exports = zendesk;


/***/ })
/******/ ]);