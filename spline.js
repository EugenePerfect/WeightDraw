class Spline {
  constructor(){
    this._x = [];
    this._y = [];
    this._calculated = false;
  }

  IsOK () { return (this._x.length > 1 && this._x.length == this._y.length) ? true : false; }

  get length () { return this._x.length; }

  GetCount () { return this.length; }

  GetMinX () { return this._x.length ? this._x[0] : Number.POSITIVE_INFINITY ; }
  GetMaxX () { return this._x.length ? this._x[this._x.length - 1] : Number.POSITIVE_INFINITY ; }

  GetX (i) { 
    if(i >= this._x.length) return Number.POSITIVE_INFINITY;
    if(i < 0) return Number.NEGATIVE_INFINITY;

    return this._x[i];
  }

  GetY (i) { 
    if(i >= this._y.length) return Number.POSITIVE_INFINITY;
    if(i < 0) return Number.NEGATIVE_INFINITY;

    return this._y[i];
  };

  AddValue (x, y) {
    if(this._x.length)
      for (var i = 0; i < this._x.length; i++){
        if(Math.abs(x - this._x[i]) < Number.EPSILON){
          console.log("AddValue (", x, y, "): абцисса уже есть в массиве, проигнорировано");
          return false;
        }
    
        if(x < this._x[i]){
          this._x.insert(i, x);
          this._y.insert(i, y);
          this._calculated = false;
          return true;
        }
      }

    this._x.push(x);
    this._y.push(y);
    this._calculated = false;

    return true;
  };

  Dump(){
    console.log("Spline():IsOK()", this.IsOK());
    console.log("Spline():GetCount()", this.length);
    console.log("_calculated", this._calculated);
    console.log("_x", this._x);
    console.log("_y", this._y);
  }

  Reset(){
    this._x = [];
    this._y = [];
    this._calculated = false;
  }

  CalculateCoeffs (){
    alert("Spline():CalculateCoeffs(): called base method! Need to be realized in derived class");
  }

  Approximate (cx){
    alert("Spline():Approximate(): called base method! Need to be realized in derived class");
  }

  LinearApproximate (cx){
    if(this.GetCount() < 2) return Number.POSITIVE_INFINITY;

    if(this.GetCount() == 2){
      var dx = this._x[1] - this._x[0], dy = this._y[1] - this._y[0];

      var m = dy / dx; /* dx != 0.0 asserted by insertpoint */

      return this._y[0] + m * (cx - this._x[0]);
    }
  }
}

// Реализацию сплайна Акимы я портировал из C-кода программы для debian aspline Дэвида Фрея.
// Адрес (мертвая ссылка) http://homepage.hispeed.ch/david.frey/

class AkimaSpline extends Spline {
  constructor(){
    super();

    this._vx = [];
    this._vy = [];

    this._dx = [];
    this._dy = [];

    this._m = [];
    this._t = [];

    this._C = [];
    this._D = [];
  }

  Reset(){
    super.Reset();

    this._vx = [];
    this._vy = [];

    this._dx = [];
    this._dy = [];

    this._m = [];
    this._t = [];

    this._C = [];
    this._D = [];
  }

  Dump(){
    super.Dump();
    console.log("AkimaSpline:_vx", this._vx);
    console.log("AkimaSpline:_vy", this._vy);

    console.log("AkimaSpline:_dx", this._dx);
    console.log("AkimaSpline:_dy", this._dy);

    console.log("AkimaSpline:_m", this._m);
    console.log("AkimaSpline:_t", this._t);

    console.log("AkimaSpline:_m", this._C);
    console.log("AkimaSpline:_t", this._D);
  }

  Approximate (cx){
    if(this.length < 2) return Number.POSITIVE_INFINITY;

    if(this.length == 2) return super.LinearApproximate(cx);

    this.CalculateCoeffs();

    // Возвратить "бесконечность", если вне интервала аппроксимации
    if(cx < this.GetMinX() || cx > this.GetMaxX())
      return Number.POSITIVE_INFINITY;

    var p = 2;

    for(; p < this._vx.length - 2; p++){
      if(Math.abs(cx - this._vx[p]) < Number.EPSILON) /* strict match */
        return this._vy[p];

      if(this._vx[p] > cx) 
        break;
    }

    var xd = (cx - this._vx[p-1]);

    return this._vy[p-1] + (this._t[p-1] + (this._C[p-1] + this._D[p-1]*xd)*xd)*xd;
  }


  CalculateCoeffs (){
    if(this._calculated) return;

    this._vx = [];
    this._vy = [];

    var n = this._x.length + 4;
    console.log("n = ", n);

  /* Add leading and trailing extrapolation points, actual values will be filled in later */
    this._vx.push(0);
    this._vx.push(0);
    this._vx = this._vx.concat(this._x);
    this._vx.push(0);
    this._vx.push(0);

    this._vy.push(0);
    this._vy.push(0);
    this._vy = this._vy.concat(this._y);
    this._vy.push(0);
    this._vy.push(0);

    this._dx = Array(n);
    this._dy = Array(n);

    this._m = Array(n);
    this._t = Array(n);

    this._C = Array(n);
    this._D = Array(n);


  /* a) Calculate the differences and the slopes m[i]. */

    for(var i = 2; i < n - 3; i++) {
      this._dx[i] = this._vx[i+1] - this._vx[i]; 
      this._dy[i] = this._vy[i+1] - this._vy[i];
      this._m[i] = this._dy[i] / this._dx[i]; /* dx != 0, asserted by insertpoint() */
    }

  /* b) interpolate the missing points: */

    this._vx[1] = this._vx[2] + this._vx[3] - this._vx[4];
    this._dx[1] = this._vx[2] - this._vx[1];

    this._vy[1] = this._dx[1] * (this._m[3] - 2*this._m[2]) + this._vy[2]; 
    this._dy[1] = this._vy[2] - this._vy[1];
    this._m[1] = this._dy[1] / this._dx[1];


    this._vx[0] = 2*this._vx[2] - this._vx[4];
    this._dx[0] = this._vx[1] - this._vx[0];

    this._vy[0] = this._dx[0]*(this._m[2] - 2*this._m[1]) + this._vy[1]; 
    this._dy[0] = this._vy[1] - this._vy[0];
    this._m[0] = this._dy[0]/this._dx[0];

    this._vx[n-2] = this._vx[n-3] + this._vx[n-4] - this._vx[n-5];
    this._vy[n-2] = (2*this._m[n-4] - this._m[n-5]) * (this._vx[n-2] - this._vx[n-3]) + this._vy[n-3];

    // Ошибка и ее исправление:ниже используется _m[n-3] до его вычисления
    this._dx[n-3] = this._vx[n-2] - this._vx[n-3]; this._dy[n-3] = this._vy[n-2] - this._vy[n-3];
    this._m[n-3] = this._dy[n-3] / this._dx[n-3];

//    _m[n-3] = 0;
    
    this._vx[n-1] = 2*this._vx[n-3] - this._vx[n-5];
    this._vy[n-1] = (2*this._m[n-3] - this._m[n-4])*(this._vx[n-1] - this._vx[n-2]) + this._vy[n-2];

    for (var i = n-3; i < n-1; i++) {
      this._dx[i] = this._vx[i+1] - this._vx[i]; this._dy[i] = this._vy[i+1] - this._vy[i];
      this._m[i] = this._dy[i] / this._dx[i];
    }

    
    this._t[0]=0.0; this._t[1]=0.0;  /* not relevant */
    this._t[n-1]=0.0; this._t[n-2]=0.0;  /* not relevant - тоже не было в оригинале */

    for (var i = 2; i < n - 2; i++) {
      var num = Math.abs(this._m[i+1] - this._m[i]) * this._m[i-1] + Math.abs(this._m[i-1] - this._m[i-2])*this._m[i];
      var den = Math.abs(this._m[i+1] - this._m[i]) + Math.abs(this._m[i-1] - this._m[i-2]);

      if(den > Number.EPSILON) this._t[i]= num/den; else this._t[i]=0.0;
    }

    /* c) Allocate the polynom coefficients */

    for (var i = 2; i < n-2; i++) {
      this._C[i] = (3*this._m[i] - 2*this._t[i] - this._t[i+1])/this._dx[i];
      this._D[i] = (this._t[i] + this._t[i+1] - 2*this._m[i])/(this._dx[i]*this._dx[i]);
    }

    this._calculated = true;
  }
}

// Адаптировано с https://cielab.xyz/cubicspline/
class CubicSpline extends Spline {
  constructor(){
    super();

    this.x = [];
    this._a = [];
    this._b = [];
    this._c = [];
    this._d = [];
  }

  Reset(){
    super.Reset();

    this.x = [];
    this._a = [];
    this._b = [];
    this._c = [];
    this._d = [];
  }

  Dump(){
    super.Dump();
    console.log("CubicSpline:x", this.x);
    console.log("CubicSpline:_a", this._a);
    console.log("CubicSpline:_b", this._b);
    console.log("CubicSpline:_c", this._c);
    console.log("CubicSpline:_d", this._d);
  }

  Approximate(newX){
    if(this.length < 2) return Number.POSITIVE_INFINITY;

    if(this.length == 2) return super.LinearApproximate(newX);

    this.CalculateCoeffs();

    // Возвратить "бесконечность", если вне интервала аппроксимации
    if(newX < this.GetMinX() || newX > this.GetMaxX())
      return Number.POSITIVE_INFINITY;

    var _ref, i;
    for (i = _ref = this.x.length - 1; (_ref <= 0 ? i <= 0 : i >= 0); (_ref <= 0 ? i += 1 : i -= 1)) {
      if (this.x[i] <= newX) {
        break;
      }
    }
    let deltaX = newX - this.x[i];
    return this._a[i] + this._b[i] * deltaX + this._c[i] * Math.pow(deltaX, 2) + this._d[i] * Math.pow(deltaX, 3);
  }

  // Коды возврата:
  //  2 коэффициенты просчитаны 
  //  1 коэффициенты уже ранее просчитаны 
  // -1 размеры входных массивов не совпадают
  // -2 число точек на входе < 3

  CalculateCoeffs(){
    if(this._calculated) return 1;

    if(this._x.length != this._y.length){ 
      console.error("CubicSpline::CalcCoefficients(): размеры входных массивов не совпадают: _x.length: ", this._x.length, ", _y.length: ", this._y.length); 
      return -1;
    }

    if(this.length < 3){ 
      console.error("CubicSpline::CalcCoefficients(): размеры входного массива < 3: ", this.length); 
      return -2;
    }

    let x = this._x;
    let a = this._y;

    var b, c, d, h, i, k, l, s, u, y, z, _ref;

    let n = x.length - 1;

    h = [];
    y = [];
    l = [];
    u = [];
    z = [];
    c = [];
    b = [];
    d = [];
    k = [];
    s = [];
    for (i = 0; (0 <= n ? i < n : i > n); (0 <= n ? i += 1 : i -= 1)) {
      h[i] = x[i + 1] - x[i];
      k[i] = a[i + 1] - a[i];
      s[i] = k[i] / h[i];
    }
    for (i = 1; (1 <= n ? i < n : i > n); (1 <= n ? i += 1 : i -= 1)) {
      y[i] = 3 / h[i] * (a[i + 1] - a[i]) - 3 / h[i - 1] * (a[i] - a[i - 1]);
    }
      l[0] = 1;
      u[0] = 0;
      z[0] = 0;
    for (i = 1; (1 <= n ? i < n : i > n); (1 <= n ? i += 1 : i -= 1)) {
      l[i] = 2 * (x[i + 1] - x[i - 1]) - h[i - 1] * u[i - 1];
      u[i] = h[i] / l[i];
      z[i] = (y[i] - h[i - 1] * z[i - 1]) / l[i];
    }
      l[n] = 1;
      z[n] = 0;
      c[n] = 0;
    for (i = _ref = n - 1; (_ref <= 0 ? i <= 0 : i >= 0); (_ref <= 0 ? i += 1 : i -= 1)) {
      c[i] = z[i] - u[i] * c[i + 1];
      b[i] = (a[i + 1] - a[i]) / h[i] - h[i] * (c[i + 1] + 2 * c[i]) / 3;
      d[i] = (c[i + 1] - c[i]) / (3 * h[i]);
    }
    this.x = x.slice(0, n + 1);
    this._a = a.slice(0, n);
    this._b = b;
    this._c = c.slice(0, n);
    this._d = d;

    this._calculated = true;

//    debugger;

    return 2;
  }
}
