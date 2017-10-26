var zendesk = {};

var client = ZAFClient.init();

zendesk.initializeApp = function() {
  client.invoke('resize', {
    height: 250,
    width: 350
  });
};

module.exports = zendesk;
