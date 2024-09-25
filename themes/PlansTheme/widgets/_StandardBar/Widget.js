define(['dojo/_base/declare', "dojo", "dojo/dom", "dojo/on", "dojo/domReady!", 'jimu/PoolControllerMixin', 'dijit/_TemplatedMixin', 'jimu/BaseWidget', "dojo/query", "widgets/AddData/Widget", "dojo/parser", "jimu/WidgetManager"],
  function (declare, dojo, dom, on, ready, PoolControllerMixin, _TemplatedMixin, BaseWidget, query, AddData, parser, WidgetManager) {
    return declare([PoolControllerMixin, BaseWidget, BaseWidget, _TemplatedMixin], {

      allConfigs: [],
      toggelers: {},
      baseClass: 'jimu-widget-sidebar-controller jimu-main-background',
      grid: null,
      gridSystem:null,
      swipe: null,
      postCreate: function () {
        this.inherited(arguments);
      },

      startup: function () {
        this.inherited(arguments);
        this.loadWidget();
        this._initUI();
      },
      gridSystemClick: function (open) {
        var wm = WidgetManager.getInstance();
        var self = this;
        if (open) {
          if (this.gridSystem == null) {
            wm.loadWidget({ "uri": "widgets/GriddedReferenceGraphic/Widget" }).then(function (widget) { self.grid = widget; widget.placeAt(self.gridSystemNode); });
          }          
        }        
      },
      gridClick: function (open) {
        var wm = WidgetManager.getInstance();
        var self = this;
        if (open) {
          if (this.grid == null) {
            wm.loadWidget({ "uri": "widgets/GridOverlay/Widget" }).then(function (widget) { self.grid = widget; widget.placeAt(self.gridNode); });
          }
          else {
            wm.openWidget(this.grid);
          }
        }
        else {
          wm.closeWidget(this.grid);
        }
      },
      swipeClick: function (open) {
        var wm = WidgetManager.getInstance();
        var self = this;
        if (open) {
          if (this.swipe == null) {
            wm.loadWidget({ "uri": "widgets/Swipe/Widget" }).then(function (widget) { self.swipe = widget; widget.placeAt(self.swipeNode); });
          }
          else {
            wm.openWidget(this.swipe);
          }
        }
        else {
          wm.closeWidget(this.swipe);
        }
      },
      loadWidget: function () {
        var wm = WidgetManager.getInstance();
        var self = this;
        wm.loadWidget({ "uri": "widgets/AddData/Widget" }).then(function (widget) { widget.placeAt(self.addDataNode); });
        wm.loadWidget({ "uri": "widgets/Bookmark/Widget", "config": "configs/Bookmark/config__7.json" }).then(function (widget) { widget.placeAt(self.bookMarkNode); });
        wm.loadWidget({ "uri": "widgets/Share/Widget", "visible": false }).then(function (widget) { widget.placeAt(self.shareNode); });
        wm.loadWidget({ "uri": "widgets/Analysis/Widget", "config": "configs/Analysis/config__8.json" }).then(function (widget) { widget.placeAt(self.analysisNode); });
        wm.loadWidget({ "version": "2.16", "uri": "widgets/Query/Widget", "config": "configs/Query/config__8.json" }).then(function (widget) { widget.placeAt(self.queryNode); });
        wm.loadWidget({ "version": "2.16", "uri": "widgets/Chart/Widget", "config": "configs/Chart/config__9.json" }).then(function (widget) { widget.placeAt(self.chartNode); });
        wm.loadWidget({ "uri": "widgets/Filter/Widget", "openAtStart": true, "config": "configs/Filter/config__5.json" }).then(function (widget) { widget.placeAt(self.filterNode); });
        wm.loadWidget({ "uri": "widgets/Draw/Widget", "openAtStart": true }).then(function (widget) { widget.placeAt(self.drawNode); });
        wm.loadWidget({ "uri": "widgets/LayerList/Widget" }).then(function (widget) { widget.placeAt(self.layerListNode); });
        wm.loadWidget({ "uri": "widgets/Print/Widget" }).then(function (widget) { widget.placeAt(self.printNode); });
      },
      takeScreenshot: function (evt) {
        _canvasScreenShots();
      },
      fullScreen: function (evt) {
        if (document.fullscreenElement) {
          // fullscreen is activated
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.mozCancelFullScreen) { /* Firefox */
            document.mozCancelFullScreen();
          } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
            document.webkitExitFullscreen();
          } else if (document.msExitFullscreen) { /* IE/Edge */
            document.msExitFullscreen();
          }
        } else {
          var elem = document.body;

          if (elem.requestFullscreen) {
            elem.requestFullscreen();
          } else if (elem.mozRequestFullScreen) { /* Firefox */
            elem.mozRequestFullScreen();
          } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
            elem.webkitRequestFullscreen();
          } else if (elem.msRequestFullscreen) { /* IE/Edge */
            elem.msRequestFullscreen();
          }
        }
      },
      _initUI: function () {
        var self = this;
        $('.standard-item .icon').click(function () {
          $('.standard-item .icon').not($(this)).parent().removeClass('active');
          $(this).parent().toggleClass('active');
          var left = $('.standard').width();
          if ($('.standard-item.active').length > 0) {
            left += $('.standard-item.active .spad-panel').first().width();
          }
          $('.layer-list').css('left', left + 'px');
        });
        $('.layer-list .icon').click(function () {
          $(this).parent().toggleClass('active');
        });
        $('.spad-panel .item > button').click(function () {
          $(this).parent().toggleClass('active');
          if ($(this).parent().hasClass('grid')) {
            self.gridClick($(this).parent().hasClass('active'));
          }
          else if ($(this).parent().hasClass('gridSystem')) {
            self.gridSystemClick($(this).parent().hasClass('active'));
          }
          else if ($(this).parent().hasClass('swipe')) {
            self.swipeClick($(this).parent().hasClass('active'));
          }
        });
        $('.layerlist button').click(function () {
          $(this).parent().parent().parent().removeClass('active');
        });
        $('#print-tab .icon').click(function () {
          $('#print-tab .content').toggle();
        });
      }
    });
  });