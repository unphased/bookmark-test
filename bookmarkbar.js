// skipping as much boilerplate stuff as I can to keep everything short and 
// sweet for purposes of demo/test

// debug helper
function l() {
  console.log.apply(console,arguments);
}

// replicate browsers' commandline API
function $() {
  return document.querySelector.apply(document,arguments);
}

window.onload = function() {
  var dragging = false;
  // I want to use jQuery! This is a really crappy substitute
  $('ul').addEventListener("mousedown", function(event){
    dragging = true;
    l('clicked ul on', event.target);
    return false;
  }, false);
  $('ul').addEventListener("mouseup", function(){
    dragging = false;
    return false;
  }, false);
}
