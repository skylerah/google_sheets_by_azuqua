var common = {};

common.displayHtml = function() {
  $(document).ready(function() {
    $('.modal-container').html('<div class="l-grid"><div class="u-ta-center"><h3 class="u-gamma">Authorization</h3><p class="u-p">Please authorize to the following services to get started with your automation.</p><ul><li class="u-p-sm"><button class="c-btn c-btn--primary" id="zendesk-auth" style="width: 235px;">Connect to Zendesk</button></li><li><button class="c-btn c-btn--primary" style="width: 235px;" id="gsheets-auth">Connect to Google Sheets</button></li></ul></div>');
  });
};

common.generateAuthHandlers = function() {
  var client = ZAFClient.init();
  client.context().then(function(context) {

    //helper FLO that is called, getInstanceId, that returns back the appropriate instanceId based on the JWT
    //phill needs to make this

    var instanceId = 'getInstanceId';

    var date = Date.now();
    var subdomain = context.account.subdomain;

    var configName = instanceId.concat(date);
    var zendeskAuth = 'https://designer2.azuqua.com/app/oauth/zendeskoauth2/authorize?app_token=azq_apps&orgId=6105&configName=' + configName + '&version=1.0.39&subdomain=' + subdomain;
    var gsheetsAuth = '';

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
