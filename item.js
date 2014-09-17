var Item = function(ele, setting)
{
  this._init(ele, setting);
};

Item.prototype = new function()
{
  this._init = function(ele, setting)
  {
    this.ele = ele;
    this._x0 = setting ? setting.x0 : 0;
    this._x1 = setting ? setting.x1 : 0;
    this._y0 = setting ? setting.y0 : 0;
    this._y1 = setting ? setting.x0 : 0;
    this.width = setting ? setting.width : ele ? ele.offsetWidth : 0;
    this.height = setting ? setting.height : ele ? ele.offsetHeight : 0;
  };

  Object.defineProperty(this, "x0", {
    get: function() { return this._x0; },
    set: function(x0)
    {
      this._x0 = x0;
      if (this.ele)
        this.ele.style.left = x0 + "px";
    }
  });

  Object.defineProperty(this, "y0", {
    get: function() { return this._y0; },
    set: function(y0)
    {
      this._y0 = y0;
      if (this.ele)
        this.ele.style.top = y0 + "px";
    }
  });

  Object.defineProperty(this, "x1", {
    get: function() { return this._x0 + this.width; },
    set: function(val) { }
  });

  Object.defineProperty(this, "y1", {
    get: function() { return this._y0 + this.height; },
    set: function(val) { }
  });
};
