define(['dojo/_base/declare', 'jimu/BaseWidget'],
function(declare, BaseWidget) {  
  return declare([BaseWidget], {
    baseClass: 'jimu-widget-dbheader',

    postCreate: function() {
      this.inherited(arguments);      
    },

    startup: function() {
        this.inherited(arguments);     
        var headerConfig = this.appConfig.headerConfig;
        $('.home').attr('href', headerConfig.homeUrl)
        $('.databrowser').attr('href', headerConfig.databrowserUrl)
        $('.dashboard').attr('href', headerConfig.dashboardUrl)
        $('.storyteller').attr('href', headerConfig.storytellerUrl)
        $('.plans').attr('href', headerConfig.plansUrl)
    },    

    onSignIn: function(credential){      
      console.log('onSignInHeader');
      console.log(credential);
    },

    onSignOut: function(){
      console.log('onSignOutHeader');
    }    
  });
});