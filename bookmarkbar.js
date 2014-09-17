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
function parentIsTag(domelem, tag){
  do {
    if (!domelem || domelem.tagName == tag)
      return domelem;
  } while(domelem = domelem.parentNode);
}

function setTrans(elem, style){
  elem.style.transform = elem.style['-webkit-transform'] = style;
}
function transStyle(x, y, z){
  return "translate3d("+x+"px,"+y+"px,"+z+"px)";
}
function setTransStyle(elem, x, y, z){
  z = z || 0;
  setTrans(elem, transStyle(x, y, z));
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
    if(!dragging) return;
    dragging.className = "item dragging";
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
      var xBCR = x.getBoundingClientRect();
      var thisitemcenter = (xBCR.left + xBCR.right)/2 - document.body.getBoundingClientRect().left;
      return {el: x, wasAfter: thisitemcenter > dragitemstartx, center: thisitemcenter};
    });
    l('itemlocationdata', itemlocationdata);
    return false;
  }, false);

  document.addEventListener("mousemove", function(event){
    if (!dragging) return;
    var offset = [event.clientX - pos[0], event.clientY - pos[1]];
    unsnapped = Math.abs(offset[1]) > snapthreshold;
    // correct the positioning of the remaining items by using transform
    setTransStyle(dragging, offset[0], unsnapped?offset[1]:0, 100);
    if (!unsnapped) {
      l('x', offset[0]);
      // This next for loop can be optimized! (loops thru the cached item list 
      // each mousemove)
      // We can optimize this by only searching the range that the last two mouse 
      // positions have traversed. However, the additional complexity will cause 
      // it to be slower overall when there is a small number of items in the 
      // bookmarklist.
      for (var i=itemlocationdata.length; i--;) {
        // for items starting on the right side, if the right side of dragged is 
        // > their middle, send it to the minus position.
        // for items starting on the left side, if the left side of dragged is 
        // < their middle, send it to the plus position.
        // In all other cases just set the position offset to 0.
        var ii = itemlocationdata[i];
        if (ii == "dragged") continue;
        if (ii.wasAfter) {
          if (offset[0] + dragitemstartx + dragitemwidth > ii.center) {
            setTransStyle(ii.el, -dragitemwidth, 0);
          } else {
            setTransStyle(ii.el, 0, 0);
          }
        } else {
          if (offset[0] + dragitemstartx < ii.center) {
            setTransStyle(ii.el, dragitemwidth, 0);
          } else {
            setTransStyle(ii.el, 0, 0);
          }
        }
      }
    } else {
      // move all the "after" items to their minus position because I have 
      // unsnapped the draggable
      for (var i=itemlocationdata.length; i--;) {
        var ii = itemlocationdata[i];
        if (ii == "dragged") continue;
        if (ii.wasAfter) {
          setTransStyle(ii.el, -dragitemwidth, 0);
        } else {
          setTransStyle(ii.el, 0, 0);
        }
      }
    }
  });

  document.addEventListener("mouseup", function(event){
    if (dragging) dragging.className = "item";
    dragging = false;
    // apply the positioning of all items by actually moving them and zeroing 
    // their transform styles
    return false;
  }, false);
};
