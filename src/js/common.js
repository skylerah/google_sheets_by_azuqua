var common = {};

var client = ZAFClient.init();

var floMap = {
  main: {
    alias: 'f6ecf46d61e99b0bdc005ae2e642ea81',
    token: '67c5f43d99c9dfc4a18fa96f5a0d00dafa532ea1fcdb37deb882ddf3665c4944',
    id: 38081
  },
  install: {
    alias: '2e46f6823a641dc08afdda5c71c3e5ec',
    token: 'e07a421eb6fa4a8789eda7c0a20d15fc7d942e66bb2809ee1ee85e1324658eff',
    id: 38083
  },
  updateInstanceSettings: {
    alias: '5f8edd0cbbc730653656697031e2b981',
    token: '1c9d7093a5aed45b14013fc0ec1da435f1d1a512fbb8d7415708f3863e471e1b',
    id: 38078
  },
  getState: {
    alias: 'dace07e1852ff063eb57aa3f001027e5',
    token: 'c7236d091c6d7fdd9f143d85116f97b6d91f1abc2ee7d767dad8606164ba2de1',
    id: 38153
  },
  updateConfigurationStatus: {
    alias: 'a0d14677e54f8bce5b642252355d742c',
    token: '7eba6b231cf05e2f923ccf5da8ec347a1762c5a16dff8da102e4975d85463d4f',
    id: 38080
  },
  updateConnectorAccountConfigs: {
    alias: 'e1eccef4a71da985f2978780208dfa2f',
    token: 'ad9a448b8295f5589c1dbd45471a586efd97396cb84342038f6025ad14e8c0ed',
    id: 38082
  },
  createGoogleSheet: {
    alias: '1eb965efb3f935152627d0f7a929113f',
    token: '641410f2b538e0c1091dd090c816ed9dbe5fc1646f62f38a81496b709534c794',
    id: 38882
  }

};


invokeFlo = function(name, data, cb) {
  var alias = floMap[name].alias;
  var token = floMap[name].token;
  var floId = floMap[name].id;

  $.post({url: 'https://api.azuqua.com/flo/' + alias + '/invoke?clientToken=' + token, data: data}, function(response) {
    console.log('invoking', name);
    cb(response);
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
        console.log('app view');
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
      console.log(state, typeof state, state.authObject);
      var parsedState = JSON.parse(state);
      cb(parsedState);
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
    console.log(state, typeof state);
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
