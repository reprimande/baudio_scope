var baudio = require('baudio'),
    scope = require('../');

var SinOsc = function(freq) {
  var self = this;
  self.freq = freq || 440;
};
SinOsc.prototype.p = function(t) {
  var self = this;
  return Math.sin(t * self.freq * Math.PI * 2);
};

var s1 = new SinOsc(400);
var b = baudio(function (t) {
  return s1.p(t);// + s2.p(t) * (t % 2 > 1);
});

var s = scope(1024, 480);
b.play();
b.pipe(s);
