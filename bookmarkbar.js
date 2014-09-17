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
  } while((domelem = domelem.parentNode));
}

function setTrans(elem, style){
  // turns out Firefox is satisfied with "transform" style. Only Safari requires 
  // use of -webkit-transform
  elem.style.transform = elem.style['-webkit-transform'] = style;
}
function transStyle(x, y, z){
  return "translate3d("+x+"px,"+y+"px,"+z+"px)";
}
function setTransStyle(elem, x, y, z){
  z = z || 0;
  setTrans(elem, transStyle(x, y, z));
}
function clearTransStyle(elem){
  setTrans(elem, "");
}

var snapthreshold = 15; // CSS pixels vertical snap threshold

window.onload = function(){
  // begin state relevant to dragging li's in the ul
  var dragging;
  var dragitemwidth;
  var dragitemstartx;
  var unsnapped;
  var pos;
  var itemlocationdata; // this is an example of some state that should have
                        // better structure but which doesn't because I wanted
                        // to keep the implementation short and simple
  var currentindex; // the index that dragging item is poised for insertion at
  // end state relevant to dragging li's in the ul

  // I want to use jQuery -- so far I would have used it to double up on the 
  // evenet handlers. For example, when handling only single touch and mouse you
  // can get away with just assigning the same event handlers to mousedown and 
  // touchstart
  $('ul').addEventListener("mousedown", function(event){
    dragging = parentIsTag(event.target, "LI");
    if(!dragging) return;
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
    itemlocationdata = toArray($('ul').children).map(function(li){
      // ensures notransition is not set on all the li's
      li.className = "item";
      if (li == dragging) return "dragged";
      // do note that doc.body.gBCR cannot be cached, suppose the zoom of the 
      // page changes or the page is scrolled while zoomed in (Safari!), all the
      // BCR coordinates change. This computed difference, however, conveniently 
      // remains constant in CSS-pixels.
      var xBCR = li.getBoundingClientRect();
      var thisitemcenter = (xBCR.left + xBCR.right)/2 - document.body.getBoundingClientRect().left;
      return {el: li, wasAfter: thisitemcenter > dragitemstartx, center: thisitemcenter};
    });
    dragging.className = "item dragging";
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
      // This next for loop can be optimized! (loops thru the cached item list 
      // each mousemove)
      // We can optimize this by only searching the range that the last two mouse 
      // positions have traversed. However, the additional complexity will cause 
      // it to be slower overall when there is a small number of items in the 
      // bookmarklist.
      var tmpdeleteme = [];
      currentindex = -1; // -1 means not dragged far enough to rearrange anything
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
            currentindex = currentindex < i ? i : currentindex;
          } else {
            setTransStyle(ii.el, 0, 0);
          }
        } else {
          if (offset[0] + dragitemstartx < ii.center) {
            setTransStyle(ii.el, dragitemwidth, 0);
            currentindex = i;
            // not as complicated as the other assignment of currentindex due to
            // the iteration order of the loop
          } else {
            setTransStyle(ii.el, 0, 0);
          }
        }
      }
      l('ci', currentindex);
    } else {
      // move all the "after" items to their minus position because I have 
      // unsnapped the draggable
      for (i = itemlocationdata.length; i--;) {
        ii = itemlocationdata[i];
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
    if (dragging) {
      dragging.className = "item"; // clears dragging class
      // apply the positioning of all items by actually moving them and 
      // zeroing/clearing their transform styles
      if (unsnapped || currentindex == -1) {
        for (var i = itemlocationdata.length; i--;) {
          var ii = itemlocationdata[i];
          if (ii == "dragged") continue;
          clearTransStyle(ii.el);
        }
        clearTransStyle(dragging);
      } else {
        // now we gotta do some shuffling around:
        // first disable the transitions/animation, then remove the transform 
        // styles and physically move the dragged item in the DOM (they should 
        // remain in the same exact positions visually)
        var startindex;
        for (i = itemlocationdata.length; i--;) {
          ii = itemlocationdata[i];
          if (ii == "dragged") { startindex = i; continue; }
          ii.el.className = "item notransition";
          clearTransStyle(ii.el);
        }

        // the only tricky bit is getting the dragged item's animation to behave
        // in a sane fashion -- this requires it to get DOM-moved into place, 
        // with the transform correspondingly warped using notransition class, 
        // and then switched back on and re-transitioned to a transform of zero, 
        // so we do have to do window.getComputedStyle() madness here.

        // following comment applies for the non-dragged items...
        // We can force-apply the styles (allow browser to evaluate styles) 
        // using window.getComputedStyle(), but since we're done (i.e. no other 
        // styles need to be set on these elements *right now*), this can also 
        // be skipped.
        // The notransition class is eventually cleared; no need to do it here.
      }
      dragging = false;
      return false;
    }
    dragging = false;
  }, false);
};
