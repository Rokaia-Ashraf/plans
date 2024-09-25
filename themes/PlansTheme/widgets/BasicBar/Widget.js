define(['dojo/_base/declare', 'jimu/BaseWidget', "dojo/query", "jimu/WidgetManager", "dojo/dom"],
  function (declare, BaseWidget, query, WidgetManager, dom) {
    return declare([BaseWidget], {
      baseClass: 'jimu-widget-basic',
      overView: null,
      postCreate: function () {
        this.inherited(arguments);
        this.inherited(arguments);
        this.map.extentHistory = [];
        this.map.currentExtent = -1;
        this.map.zoomFromHistory = false;
        this.map.on('extent-change', this.extentchange);
      },

      startup: function () {
        this.inherited(arguments);
        this._loadWidget();
        this._loadUI();
      },
      changeViewScale: function (evt) {
        var scale = (evt.target.value + "").replace("1:", "");
        if (!isNaN(scale) && scale > 0) {
          this.map.setScale(scale);
        }
      },
      changeViewScaleInput: function () {
        var scale = dom.byId('scaleInput').value;
        if (!isNaN(scale) && scale > 0) {
          this.map.setScale(scale);
        }
      },
      zoomIn: function () {
        var level = this.map.getLevel();
        this.map.centerAndZoom(this.map.extent.getCenter(), level + 1);
      },
      zoomOut: function () {
        var level = this.map.getLevel();
        if (level > 1)
          this.map.centerAndZoom(this.map.extent.getCenter(), level - 1);
      },
      zoomPrevious: function () {
        var self = this.map;
        if (self.currentExtent > 0) {
          self.zoomFromHistory = true;
          self.setExtent(self.extentHistory[--self.currentExtent]);
        }
      },
      zoomNext: function () {
        var self = this.map;
        if (self.currentExtent < self.extentHistory.length - 1) {
          self.zoomFromHistory = true;
          self.setExtent(self.extentHistory[++self.currentExtent]);
        }
      },
      changeToHand: function () {
        this.map.setMapCursor('pointer');
      },
      changeToHelp: function () {
        this.map.setMapCursor('help');
      },
      extentchange: function (event) {
        var self = event.target;
        if (!this.zoomFromHistory) {
          self.extentHistory.splice(self.currentExtent + 1);
          self.extentHistory.push(event.extent);
          self.currentExtent++;
        }
        self.zoomFromHistory = false;
      },
      _loadWidget: function () {
        var wm = WidgetManager.getInstance();
        var self = this;
        wm.loadWidget({ "uri": "widgets/Search/Widget" }).then(function (widget) { widget.placeAt(self.searchNode); });
        wm.loadWidget({ "uri": "widgets/Select/Widget","config":"configs/Select/config__6.json" }).then(function (widget) { widget.placeAt(self.selectNode); });
        wm.loadWidget({ "uri": "widgets/Measurement/Widget" }).then(function (widget) { widget.placeAt(self.measureNode); });
        wm.loadWidget({ "uri": "widgets/CoordinateConversion/Widget" }).then(function (widget) { widget.placeAt(self.coordinatesNode); });
        wm.loadWidget({ "uri": "widgets/OverviewMap/Widget" }).then(function (widget) { self.overView = widget; });
      },
      _loadUI: function () {
        var self = this;
        $('.spad-dropdown').click(function () {
          $(this).next('.spad-dropdown-menu').toggle();
        });
        $('#scaleInput').keyup(function (event) {
          if (event.which === 13) {
            self.changeViewScaleInput();
          }
        });
      },
      _toggleOverView: function () {

      }
    });
  });