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
