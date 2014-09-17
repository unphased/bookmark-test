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

// helper for arrayifying stuff needed due to not having jQuery
function toArray(obj) {
  var array = [];
  // iterate backwards ensuring that length is positive integer
  for (var i = Math.max(obj.length >> 0, 0); i--;) { 
    array[i] = obj[i];
  }
  return array;
}

// not very generally useful helper due to no jQuery
function parentIsTag(domelem, tag) {
  do {
    if (!domelem || domelem.tagName == tag)
      return domelem;
  } while(domelem = domelem.parentNode);
}

var snapthreshold = 15; // CSS pixels vertical snap threshold

window.onload = function(){
  var dragging;
  var dragitemwidth;
  var dragitemstartx;
  var unsnapped;
  var pos;
  var itemlocationdata;

  // I want to use jQuery -- so far I would have used it to double up on the 
  // evenet handlers. For example, when handling only single touch and mouse you
  // can get away with just assigning the same event handlers to mousedown and 
  // touchstart
  $('ul').addEventListener("mousedown", function(event){
    dragging = parentIsTag(event.target, "LI");
    dragitemwidth = dragging.offsetWidth;
    pos = [event.clientX, event.clientY];
    dragitemstartx = dragging.getBoundingClientRect().left -
                     document.body.getBoundingClientRect().left;
                     // grabbing the page position
    l('clicked ul on', event.target, 'it has width', dragitemwidth, 'positioned with left side at', dragitemstartx);
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
    // position (0) or (-diw) if dragging item is after it. We can use CSS 
    // transitions to tween the transforms of all of the items efficiently.
    // Note also that the offset values are just diw because no margin exists on
    // the items. Ordinarily the offset is width+(marginleft+marginright)/2 or 
    // some such.

    // cache the layout of the list in a variable once per mouse interaction 
    // (rather than accessing the DOM in a loop once per mouse movement!)
    itemlocationdata = toArray($('ul').children).map(function(x){
      if (x == dragging) return "dragged";
      // do note that doc.body.gBCR cannot be cached, suppose the zoom of the 
      // page changes or the page is scrolled while zoomed in (Safari!), all the
      // BCR coordinates change. This computed difference, however, conveniently 
      // remains constant in CSS-pixels.
      var thisitempos = x.getBoundingClientRect().left - document.body.getBoundingClientRect().left;
      return {el: x, wasAfter: thisitempos > dragitemstartx, pos: thisitempos};
    });
    l('itemlocationdata', itemlocationdata);
    return false;
  }, false);

  document.addEventListener("mousemove", function(event){
    if (!dragging) return;
    var offset = [event.clientX - pos[0], event.clientY - pos[1]];
    unsnapped = Math.abs(offset[1]) > snapthreshold;
    // correct the positioning of the remaining items by using transform
    dragging.style.transform = dragging.style['-webkit-transform'] =
      "translate3d("+offset[0]+"px,"+(unsnapped?offset[1]:0)+"px,0)";
    if (!unsnapped) { l('x', offset[0]); }
    // this can be optimized! (loops thru the cached item list each mousemove)
    // we can optimize this by only searching the range that the last two mouse 
    // positions have traversed. However, the additional complexity will cause 
    // it to be slower overall when there is a small number of items in the 
    // bookmarklist.
    for (var i=itemlocationdata.length; i--;) {
      // if the right side of dragged is past the middle, send it to minus
    }
  });

  document.addEventListener("mouseup", function(event){
    dragging = false;
    // apply the positioning of all items by actually moving them and zeroing 
    // their transform styles
    return false;
  }, false);
};
