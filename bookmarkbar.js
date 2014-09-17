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
    // Once an item is picked up, whether it is unsnapped or sliding around, it 
    // may be important to note that
    // 1. all items in the list can move because the dragging item can be slid 
    //    to any position before or after all other items
    // 2. there is a fixed range of motion for all of the other items. In fact, 
    //    we find that we will be setting all of them to one of two possible 
    //    positions, and these positions are determined by the size of the item 
    //    being dragged and where it is currently being held.
    // Specifically, for all items originally before the dragging item, their 
    // possible positions are their current position (0) or dragitemwidth to the
    // right (+diw) if dragging item is before it. For all items originally 
    // after the dragging item, their possible positions are their current 
    // position (0) or (-diw) if dragging item is after it. We can allow CSS 
    // transitions to tween the transforms of all of the items efficiently.
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
