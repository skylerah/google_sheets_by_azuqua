var zendesk = {};

var client = ZAFClient.init();

zendesk.initializeApp = function() {
  client.invoke('resize', {
    height: 250,
    width: 350
  });
};

client.invoke('preloadPane');

module.exports = zendesk;
