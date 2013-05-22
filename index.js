var qt = require('node-qt'),
    Writable = require('stream').Writable,
    util = require('util');

var Scope = function(w, h, opts) {
  var self = this;
  Writable.call(self, opts);
  self.buf = [];
  self.drawing = false;
  self.width = w;
  self.height = h;
  self.app = new qt.QApplication();
  self.painter = new qt.QPainter();
  self.pixmap = new qt.QPixmap(w, h);
  self.painter.begin(self.pixmap);

  self.window = new qt.QWidget;
  self.window.resize(self.width, self.height);
  self.window.show();
  self.window.paintEvent(function() {
    var p = new qt.QPainter();
    p.begin(self.window);
    p.drawPixmap(0, 0, self.pixmap);
    p.end();
  });
  setInterval(function() {
    self.app.processEvents();
  });
};
util.inherits(Scope, Writable);
Scope.prototype._write = function(chunk, encoding, cb) {
  var self = this;
  self.buf.push(chunk);
  if (!self.drawing) {
    self.drawing = true;
    setImmediate(self.drawBuffer.bind(self));
  }
  cb(null);
};
Scope.prototype.drawBuffer = function() {
  var self = this,
      chunk = self.buf.shift();
  self.drawScope(chunk);
  if (self.buf.length > 0) {
    setTimeout(function() {
      self.drawBuffer();
    }, 1000 / 44100 * chunk.length / 4);
  } else {
    self.drawing = false;
  }
};
Scope.prototype.drawScope = function(chunk) {
  var self = this,
      size = chunk.length,
      color = new qt.QColor(255, 255, 0),
      b = Math.pow(2, 15),
      h = self.height / 2;

  self.painter.fillRect(0, 0, self.width, self.height, 1);
  for (var i = 0; i < self.width; i++) {
    var index = Math.floor(self.width / size * i);
    var val = chunk.readInt16LE(index) / b * h + h;
    self.painter.fillRect(i, val, 1, 1, color);
  }
  self.window.update();
};
module.exports = function(w, h, opts) {
  return new Scope(w, h, opts);
};
