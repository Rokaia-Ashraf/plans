define(['dojo/_base/declare', 'jimu/BaseWidget', 'jimu/loaderplugins/jquery-loader!themes/SpaDTheme/jquery-git.min.js'],
    function (declare, BaseWidget) {
        return declare([BaseWidget], {
            baseClass: 'jimu-widget-dbheader',
            postCreate: function () {
                this.inherited(arguments);
            },
            startup: function () {
                this.inherited(arguments);
                this.initalizeUI();
            },

            onOpen: function () {
            },
            onSignIn: function (credential) {
                console.log('onSignInDBHeader');
                console.log(credential);
            },

            onSignOut: function () {
                console.log('onSignOutDBHeader');
            },
            initalizeUI: function () {
                $('.drop-down').click(function () {
                    $(this).children('.drop-down-menu').first().toggle();
                });
            }
        });
    });