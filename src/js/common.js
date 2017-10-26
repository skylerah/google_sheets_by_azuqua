//not split up...

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
    cb(data);
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
        generateView(view);
        invokeFlo('install', {instanceName: instanceName}, function(response) {
          generateAuthObjects(function() {
            generateAuthView();
          });
        });
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
        object.complete = true;
        var authWindow = window.open(object.authUrl, 'Authorize to ' + object.prettyName, 'resizable,scrollbars,status,width=650,height=650');
        var pollTimer = window.setInterval(function() {
            if (authWindow.closed !== false) {
              window.clearInterval(pollTimer);
              if (object.id === 'zendesk-auth') {
                invokeFlo('updateConfigurationStatus', {stepNumber: 1, completed: true, instanceName: instanceName}, function(response) {
                  var stringifiedState = JSON.stringify(state);
                  invokeFlo('updateConnectorAccountConfigs', {accountName: object.configName, connectorVersion: object.version, connectorName: object.name, instanceName: instanceName}, function() {
                    invokeFlo('updateInstanceSettings', {instanceName: context.account.subdomain + '.zendesk.com', settings: stringifiedState}, function() {
                      globalStateHandler();
                    });
                  });
                });
              }
              if (object.id === 'gsheets-auth') {
                invokeFlo('updateConfigurationStatus', {stepNumber: 2, completed: true, instanceName: instanceName}, function(response) {
                  object.complete = true;
                  invokeFlo('updateConnectorAccountConfigs', {accountName: object.configName, connectorVersion: object.version, connectorName: object.name, instanceName: instanceName}, function() {
                    var stringifiedState = JSON.stringify(state);
                    invokeFlo('updateInstanceSettings', {instanceName: context.account.subdomain + '.zendesk.com', settings: stringifiedState}, function() {
                      invokeFlo('createGoogleSheet', {instanceName: instanceName}, function() {
                        globalStateHandler();
                      });
                    });
                  });
                });
              }
            }
        }, 200);
      });
    });
  });
};

module.exports = common;
