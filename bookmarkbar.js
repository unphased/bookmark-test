// skipping as much boilerplate stuff as I can to keep everything short and 
// sweet for purposes of demo/test

// debug helper
function l(){
  console.log.apply(console,arguments);
}

// replicate browsers' commandline API
function $(){
  return document.querySelector.apply(document,arguments);
}

var snapthreshold = 15; // CSS pixels vertical snap threshold

window.onload = function(){
  var dragging;
  var dragitemwidth;
  var unsnapped;
  var pos;

  // I want to use jQuery! This $ is a slovenly substitute
  $('ul').addEventListener("mousedown", function(event){
    dragging = event.target;
    dragitemwidth = dragging.offsetWidth;
    pos = [event.clientX, event.clientY];
    l('clicked ul on', event.target, 'it has width', dragitemwidth);
    return false;
  }, false);

  document.addEventListener("mousemove", function(event){
    if (!dragging) return;
    var offset = [event.clientX - pos[0], event.clientY - pos[1]];
    unsnapped = Math.abs(offset[1]) > snapthreshold;
    dragging.style.transform = "translate3d("+offset[0]+"px,"+(unsnapped?offset[1]:0)+"px,0)";
  });

  document.addEventListener("mouseup", function(event){
    dragging = false;
    return false;
  }, false);
};
