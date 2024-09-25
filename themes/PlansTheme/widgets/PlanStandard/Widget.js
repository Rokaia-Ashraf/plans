define(['dojo/_base/declare', 'jimu/PoolControllerMixin', 'dijit/_TemplatedMixin', 'jimu/BaseWidget', "jimu/WidgetManager", "./layerLoader/AddUrlToMap"],
  function (declare, PoolControllerMixin, _TemplatedMixin, BaseWidget, WidgetManager, AddUrlToMap) {
    return declare([PoolControllerMixin, BaseWidget, BaseWidget, _TemplatedMixin], {

      allConfigs: [],
      baseClass: 'jimu-widget-sidebar-controller jimu-main-background',
      addUrlToMap: null,
      postCreate: function () {
        this.inherited(arguments);
      },

      startup: function () {
        this.inherited(arguments);
        this.loadWidget();
      },
      loadWidget: function () {
        var wm = WidgetManager.getInstance();
        var self = this;
        wm.loadWidget({ "uri": "widgets/LayerList/Widget" }).then(function (widget) { widget.placeAt(self.layerListNode); });

        $('.layer-list .icon').click(function () {
          $(this).parent().toggleClass('active');
        });
        $('.layerlist button').click(function () {
          $(this).parent().parent().parent().removeClass('active');
        });
      }
    });
  });