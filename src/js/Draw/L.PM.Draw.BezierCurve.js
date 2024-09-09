import Draw from './L.PM.Draw';
import '@elfalem/leaflet-curve';

Draw.BezierCurve = Draw.extend({
  initialize(map) {
    this._map = map;
    this._shape = 'BezierCurve';
    this.toolbarButtonName = 'drawBezierCurve';
    // this._doesSelfIntersect = false;

    this._points = [];
    this._handles = [];
    this._tempLine = null;
  },
  enable() {
    this._enabled = true;
    this._map.on('click', this._onMapClick, this);
    this._map.on('mousemove', this._onMouseMove, this);
    L.DomUtil.addClass(this._map._container, 'leaflet-pm-draw-bezier');
  },
  disable() {
    // disable draw mode

    // cancel, if drawing mode isn't even enabled
    if (!this._enabled) {
      return;
    }

    this._enabled = false;
    this._map.off('click', this._onMapClick, this);
    this._map.off('mousemove', this._onMouseMove, this);
    L.DomUtil.removeClass(this._map._container, 'leaflet-pm-draw-bezier');
    this._cleanUp();
  },
  enabled() {
    return this._enabled;
  },
  toggle(options) {
    if (this.enabled()) {
      this.disable();
    } else {
      this.enable(options);
    }
  },
  _onMapClick(e) {
    const { latlng } = e;
    this._points.push(latlng);

    if (this._points.length === 1) {
      this._shape = L.curve(['M', [latlng.lat, latlng.lng]], {
        color: 'red',
      }).addTo(this._map);
    } else if (this._points.length > 1) {
      this._updateCurve();
    }

    this._createHandle(latlng);
  },
  _onMouseMove(e) {
    if (this._points.length > 0) {
      const lastPoint = this._points[this._points.length - 1];
      if (!this._tempLine) {
        this._tempLine = L.polyline([lastPoint, e.latlng], {
          dashArray: '5,5',
        }).addTo(this._map);
      } else {
        this._tempLine.setLatLngs([lastPoint, e.latlng]);
      }
    }
  },
  _createHandle(latlng) {
    const handle = L.circleMarker(latlng, { radius: 3, color: 'blue' }).addTo(
      this._map
    );
    this._handles.push(handle);
  },
  _updateCurve() {
    const path = ['M', [this._points[0].lat, this._points[0].lng]];
    for (let i = 1; i < this._points.length; i += 3) {
      if (i + 2 < this._points.length) {
        path.push(
          'C',
          [this._points[i].lat, this._points[i].lng],
          [this._points[i + 1].lat, this._points[i + 1].lng],
          [this._points[i + 2].lat, this._points[i + 2].lng]
        );
      }
    }
    this._shape.setLatLngs(path);
  },
  _cleanUp() {
    if (this._shape) {
      this._map.removeLayer(this._shape);
    }
    if (this._tempLine) {
      this._map.removeLayer(this._tempLine);
    }
    this._handles.forEach((handle) => this._map.removeLayer(handle));
    this._points = [];
    this._handles = [];
    this._shape = null;
    this._tempLine = null;
  },

  _finishShape() {
    // 完成绘制，可以在这里触发事件或执行其他操作
    this._cleanUp();
  },
});
