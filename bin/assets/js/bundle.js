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
common.onInit();

// common.displayHtml();


/***/ }),
/* 1 */
/***/ (function(module, exports) {

var common = {};

var client = ZAFClient.init();

var floMap = {
  main: {
    id: 38081
  },
  install: {
    id: 38083
  },
  updateInstanceSettings: {
    id: 38078
  },
  getState: {
    id: 38153
  },
  updateConfigurationStatus: {
    id: 38080
  },
  updateConnectorAccountConfigs: {
    id: 38082
  },
  createGoogleSheet: {
    id: 38882
  }

};

invokeFlo = function(name, data, cb) {
  // var alias = floMap[name].alias;
  // var token = floMap[name].token;
  var floId = floMap[name].id;

  studio.invokeFlo(floId, data, function(error, data) {
    if (error) {
      cb(error);
    } else if (data) {
      cb(data);
    }
  });
};

common.onInit = function() {
  globalStateHandler();
};

globalStateHandler = function() {
  client.context().then(function(context) {
    var subdomain = context.account.subdomain;
    var instanceName = subdomain + '.zendesk.com';


    invokeFlo('main', {instanceName: instanceName}, function(state) { 
      var view = state.path;
      if (view === '/install') {
        client.get('currentUser').then(function (user) {
          var currentUser = user.currentUser;
          invokeFlo('install', { instanceName: instanceName, currentUser: currentUser }, function (response) {
            generateAuthObjects(function () {
              generateAuthView();
            });
          });
        });
        generateView(view);
      }
      if (view === '/authorize') {
        generateView(view);
        generateAuthView();
      }
      if (view === '/') {
        generateView(view);
      }
    });
  });
};

generateView = function(view) {
  if (view === '/install' || '/authorize') {
    $('.app-container').html('<div class="l-grid"><div class="l-grid__item u-2/2"><h2 class="u-beta u-pb">Authentication</h3></div><div class="l-grid__item u-2/2 u-mb">Please authorize the following services to get started with your automation.</div></div><div class="auth-container"><div class="l-grid"><div id="zendesk-auth" class="l-grid__item u-2/2 u-ta-center u-mb-sm"></div><div id="gsheets-auth" class="l-grid__item u-2/2 u-ta-center u-mb-sm"></div></div></div>');
    // generateAuthView();
  }
  if (view === '/') {
    $('.app-container').html('Loading...');
    getState(function(state) {
      $('.app-container').html('<div class="l-grid"><div class="l-grid__item u-2/2"><h2 class="u-beta u-pb">Google Sheets Report</h2></div><div class="l-grid__item u-2/2 u-mb">Below, you\'ll find a link to a newly created Google Sheets sheet. <p class="u-pt-sm">This sheet will start aggregrating new tickets as they are created, as well as stay in sync with changes made to any tickets.</p><div class="l-grid"><div class="l-grid__item u-2/2"><p class="u-pt-sm"><a href="' + state.spreadsheetUrl + '" target="_blank">Click here for your report</a></p></div></div></div>');
    });
  }
};

updateState = function(state, cb) {
  client.context().then(function(context) {
    var stringifiedState = JSON.stringify(state);
    //update instance settings
    invokeFlo('updateInstanceSettings', {instanceName: context.account.subdomain + '.zendesk.com', settings: stringifiedState}, function() {});
  });
};

getState = function(cb) {
  client.context().then(function(context) {
    //get state FLO
    invokeFlo('getState', {instanceName: context.account.subdomain + '.zendesk.com'}, function(state) {
      // var parsedState = JSON.parse(state);
      cb(state);
    });
  });
};

generateAuthObjects = function(cb) {
  client.context().then(function(context) {
    var date = Date.now();
    var subdomain = context.account.subdomain;
    var instanceName = subdomain + '.zendesk.com';
    var configName = subdomain.concat(date);

    var zendeskAuth = 'https://designer2.azuqua.com/app/oauth/zendeskoauth2/authorize?app_token=azq_apps&orgId=6160&configName=' + configName + '&version=1.0.39&subdomain=' + subdomain;
    var gsheetsAuth = 'https://designer2.azuqua.com/app/oauth/googlesheets2_29/authorize?app_token=azq_apps&orgId=6160&configName=' + configName + '&version=0.2.13&subdomain=' + subdomain;

    var objectArray = [];

    var zendeskObject = {
      name: 'zendeskoauth2',
      prettyName: 'Zendesk',
      authUrl: zendeskAuth,
      id: 'zendesk-auth',
      complete: false,
      configName: configName,
      version: '1.0.39'
    };

    var gsheetsObject = {
      name: 'googlesheets2_29',
      prettyName: 'Google Sheets',
      authUrl: gsheetsAuth,
      id: 'gsheets-auth',
      complete: false,
      configName: configName,
      version: '0.2.13'
    };

    objectArray.push(zendeskObject);
    objectArray.push(gsheetsObject);

    var authObject = {
      objectArray: objectArray
    };

    var stringifiedArray = JSON.stringify(authObject);

    //updateInstanceSettings
    invokeFlo('updateInstanceSettings', {instanceName: instanceName, settings: stringifiedArray}, function(response) {
      cb();
    });
  });
};

generateAuthView = function() {
  getState(function(state) {
    state.objectArray.forEach(function(object) {
      if (object.complete === false) {
        $('#' + object.id).html('<button style="width: 200px;" class="c-btn c-btn--primary" id="' + object.id + '">Connect to ' + object.prettyName + ' </button>');
      } else if (object.complete === true) {
        $('#' + object.id).off('click');
        $('#' + object.id).html('<div><strong>... authorized!</strong></div>');
      }
    });
    attachAuthHandlers(state);
  });
};

attachAuthHandlers = function(state) {
  client.context().then(function(context) {
    var instanceName = context.account.subdomain + '.zendesk.com';
    state.objectArray.forEach(function(object) {
      $('#' + object.id).click(function(e) {
        $(this).html('Authorizing...');
        $(this).off('click');
        var authWindow = window.open(object.authUrl, 'Authorize to ' + object.prettyName, 'resizable,scrollbars,status,width=650,height=650');
        var pollTimer = window.setInterval(function() {
            if (authWindow.closed !== false) {
              window.clearInterval(pollTimer);
              if (object.id === 'zendesk-auth') {
                console.log('invoking connector account configs');
                invokeFlo('updateConnectorAccountConfigs', {accountName: object.configName, connectorVersion: object.version, connectorName: object.name, instanceName: instanceName}, function(response) {
                  console.log(response);
                  if (response.status !== undefined) {
                    console.log('hit an error', response);
                    $('#' + object.id).html('<strong>Failed to authorize. Please reload the app to try again.</strong>');
                  } else {
                    object.complete = true;
                    var stringifiedState = JSON.stringify(state);
                    invokeFlo('updateConfigurationStatus', {stepNumber: 1, completed: true, instanceName: instanceName, settings: stringifiedState}, function(response) {
                      if (response.status !== undefined) {
                        console.log('hit an error', response);
                        $('#' + object.id).html('<strong>Failed to authorize. Please reload the app to try again.</strong>');
                      } else {
                        globalStateHandler();
                      }
                    });
                  }
                });
              }
              if (object.id === 'gsheets-auth') {
                invokeFlo('updateConnectorAccountConfigs', {accountName: object.configName, connectorVersion: object.version, connectorName: object.name, instanceName: instanceName}, function(response) {
                  console.log('invoking updateconnectoraccountconfigs', response, response.status);
                  if (response.status !== undefined) {
                    console.log('hit an error', response);
                    $('#' + object.id).html('<strong>Failed to authorize. Please reload the app to try again.</strong>');
                  } else {
                    object.complete = true;
                    var stringifiedState = JSON.stringify(state);
                    invokeFlo('updateConfigurationStatus', {settings: stringifiedState, stepNumber: 2, completed: true, instanceName: instanceName}, function(response) {
                      console.log('invoking updateconfigurationstatus', response, response.status);
                      if (response.status !== undefined) {
                        console.log('hit an error', response);
                        $('#' + object.id).html('<strong>Failed to authorize. Please reload the app to try again.</strong>');
                      } else {
                        globalStateHandler();
                      }
                    });
                  }
                });
              }
            }
        }, 200);
      });
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

module.exports = zendesk;


/***/ })
/******/ ]);