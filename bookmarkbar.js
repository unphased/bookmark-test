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

window.onload = function(){
  var dragging;
  var pos;
  // I want to use jQuery! This is a really crappy substitute
  $('ul').addEventListener("mousedown", function(event){
    dragging = event.target;
    pos = [event.clientX, event.clientY];
    l('clicked ul on', event.target);
    return false;
  }, false);

  document.addEventListener("mousemove", function(event){
    if (!dragging) return;
    var offset = [event.clientX - pos[0], event.clientY - pos[1]];
    dragging.style.transform = "translate3d("+offset[0]+"px,"+offset[1]+"px,0)";
  });

  document.addEventListener("mouseup", function(event){
    dragging = false;
    return false;
  }, false);
};
