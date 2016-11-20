var svgEle = document.getElementById("svg1");

var width = document.body.clientWidth;
var height = window.innerHeight;
svgEle.setAttribute('width',width);
svgEle.setAttribute('height',height);

// var i = 0;
// setInterval(function(){
//   i += 50;
//   createShape();
// },25);
// var j = 525;
// setInterval(function(){
//  j += 50;
//  createShape();
// },25);

function createShape() {
  var shape = getRandomShape();
  svgEle.appendChild(shape);
  var shapei = 1;
  var shapeOpacityInterval = setInterval(function(){
    shapei -= 0.01;
    shape.setAttribute("style","opacity:"+shapei);
    if(shapei <= 0) {
      svgEle.removeChild(shape);
      clearInterval(shapeOpacityInterval);
    }
  },50)
}

function getRandomShape() {
  var rand = Math.floor(Math.random()*1);
  switch(rand) {
    case 0:
      var circle = document.createElementNS("http://www.w3.org/2000/svg","circle");
      circle.setAttributeNS(null, "cx", i%width);
      circle.setAttributeNS(null, "cy", i%height);
      circle.setAttributeNS(null, "r", 15);
      circle.setAttributeNS(null, "fill", getRandomColor());
      return circle;
    case 1:
      var rect = document.createElementNS("http://www.w3.org/2000/svg","rect");
      rect.setAttributeNS(null, "x", i%width-15);
      rect.setAttributeNS(null, "y", i%height-15);
      rect.setAttributeNS(null, "height", 30);
      rect.setAttributeNS(null, "width", 30);
      rect.setAttributeNS(null, "fill", getRandomColor());
      return rect;
  }
}

function getRandomColor() {
  var rand = Math.floor(Math.random()*5);
  switch(rand) {
    case 0:
      return 'yellow';
    case 1:
      return 'blue';
    case 2:
      return 'red';
    case 3:
      return 'green';
    case 4:
      return '#DDDDFF';
  }
}

function createNonrandomShape(x,y,radius) {
  if(!y) {
    y = height;
  }
  var shape = document.createElementNS("http://www.w3.org/2000/svg","circle");
      shape.setAttributeNS(null, "cx", x);
      shape.setAttributeNS(null, "cy", y);
      shape.setAttributeNS(null, "r", radius);
      shape.setAttributeNS(null, "fill", "blue");
  svgEle.appendChild(shape);
  return shape;
  // var shapei = 1;
  // var shapeOpacityInterval = setInterval(function(){
  //   shapei -= 0.01;
  //   shape.setAttribute("style","opacity:"+shapei);
  //   if(shapei <= 0) {
  //     svgEle.removeChild(shape);
  //     clearInterval(shapeOpacityInterval);
  //   }
  // },50)
}





//Audio
function initializeVolumeSlider() {
  var listener = function() {
    window.requestAnimationFrame(function() {
      volumeSliderChange();
    });
  };

  volumeSlider.addEventListener("mousedown", function() {
    listener();
    volumeSlider.addEventListener("mousemove", listener);
  });
  volumeSlider.addEventListener("mouseup", function() {
    volumeSlider.removeEventListener("mousemove", listener);
  });
}


var visual = null;
var shapes = [];
var fftSize = 256;
var lastFrequency = [[]];
var numberLastFrequencies = 10;
var minNumberLastFrequencies = 5;
var maxNumberLastFrequencies = 10;
var highestFrequency = 0;
var audio = document.getElementById('audioIn');
var smoothSlider = document.getElementById('smooth-slider');
if(smoothSlider) {
  smoothSlider.value = numberLastFrequencies;
  smoothSlider.min = minNumberLastFrequencies;
  smoothSlider.max = maxNumberLastFrequencies;
}
var volumeSlider = document.getElementById('volume-slider');
if(volumeSlider) {
  volumeSlider.value = audio.volume * 100;
  volumeSlider.min = 0;
  volumeSlider.max = 100;
}
initializeVolumeSlider();

function changeAudio() {
  if(visual) {
    visual.stop();
  }
  document.getElementById('audioIn').src = document.getElementById('fileUpload').files[0].name;
  initLastFrequencyArrays();
  // document.getElementById('fileUpload').value = '';
}

function smoothSliderChange() {
  var sliderValue = parseInt(document.getElementById('smooth-slider').value);
  numberLastFrequencies = sliderValue;
  // console.log(sliderValue,numberLastFrequencies);
}

function volumeSliderChange() {
  var sliderValue = parseInt(document.getElementById('volume-slider').value);
  audio.volume = sliderValue/100;
  // console.log(sliderValue,audio.volume);
}

function initLastFrequencyArrays() {
  for(var i=0; i<maxNumberLastFrequencies; i++) {
    lastFrequency[i] = [];
  }
}

function createShapes(count) {
  var baseX = 6;
  var baseY = 0;
  var baseRadius = 6;
  var baseXMultiplier = width/count;
  var baseRadiusMultiplier = baseXMultiplier/10;
  console.log(count, baseXMultiplier);
  for(var i=0; i<count; i++) { 
    shapes[i] = createNonrandomShape(baseX+i*baseXMultiplier,0,baseRadius*baseRadiusMultiplier);
  }
}


var renderers = {
  'visWindow': (function() {
      var initialized = false;
      var count;
      var maxHeight = height-20;

    var init = function(config) {
      count = config.count;
      createShapes(count);
      initLastFrequencyArrays();
      initialized = true;
    };

    var setLastFrequencies = function(index,frequency) {
      for(var i=maxNumberLastFrequencies-1; i>0; i--) {
        lastFrequency[i][index] = lastFrequency[i-1][index] || 0;
      }
      lastFrequency[0][index] = frequency;
    }

    var getLastFrequencies = function(index) {
      var sum = 0;
      for(var i=0; i<numberLastFrequencies; i++) {
        sum += lastFrequency[i][index] || 0;
      }
      return sum;
    }

    var renderFrame = function(frequencyData) {
      for(var i=0; i<count; i++) {
        //Get the average of the current frequency and the last n frequencies
        var curFrequency = (frequencyData[i] + getLastFrequencies(i)) / (numberLastFrequencies+1);
        //Set the y position of the shape to the value of the current frequency, based on the height of the window
        shapes[i].setAttribute('cy',height-(curFrequency/256*maxHeight));
        //Update the array of last frequencies
        setLastFrequencies(i,frequencyData[i]);
      }
    };


    return {
      init: init,
      isInitialized: function() {
        return initialized;
      },
      renderFrame: renderFrame
    }
  })()
}

function Visualization(config) {
  var audioStream,
    analyser,
    source,
    audioCtx,
    canvasCtx,
    frequencyData,
    running = false,
    renderer = config.renderer,
    width = config.width || 1200,
    height = config.height || 600,
    fftSize = 256;

  var init = function() {
    audioCtx = new AudioContext();
    analyser = audioCtx.createAnalyser();
    source =  audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyser.fftSize = fftSize;
    frequencyData = new Uint8Array(analyser.frequencyBinCount);
    renderer.init({
      count: analyser.frequencyBinCount,
      width: width,
      height: height
    });
  };
  this.start = function() {
    audio.play();
    running = true;
    renderFrame();
  };
  this.stop = function() {
    running = false;
    audio.pause();
  };
  this.setRenderer = function(r) {
    if (!r.isInitialized()) {
      r.init({
        count: analyser.frequencyBinCount,
        width: width,
        height: height
      });
    } 
    renderer = r;
  };
  this.isPlaying = function() {
    return running;
  }

  var renderFrame = function() {
    analyser.getByteFrequencyData(frequencyData);
    renderer.renderFrame(frequencyData);
    if (running) {
      requestAnimationFrame(renderFrame);
    }
  };

  init();

};

var rend = renderers['visWindow'];
visual = new Visualization({renderer: rend });
visual.setRenderer(rend);

document.getElementById("play-button").onclick = (function() {
  if (visual.isPlaying() && !audio.paused) {
    visual.stop();
  } else {
    visual.start();
  }
});