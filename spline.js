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
    if(this.GetCount() < 2) return Number.POSITIVE_INFINITY;

    if(this.GetCount() == 2){
      var dx = this._x[1] - this._x[0], dy = this._y[1] - this._y[0];

      var m = dy / dx; /* dx != 0.0 asserted by insertpoint */

      return this._y[0] + m * (cx - this._x[0]);
    }

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


class CubicSpline extends Spline {
  constructor(){
    super();

    this._b = [];
    this._c = [];
    this._d = [];
  }

  Reset(){
    super.Reset();

    this._b = [];
    this._c = [];
    this._d = [];
  }

  Dump(){
    super.Dump();
    console.log("CubicSpline:_b", this._b);
    console.log("CubicSpline:_c", this._c);
    console.log("CubicSpline:_d", this._d);
  }

  Approximate (cx){
    if(this.GetCount() < 2) return Number.POSITIVE_INFINITY;

    if(this.GetCount() == 2){
      let dx = this._x[1] - this._x[0], dy = this._y[1] - this._y[0];

      let m = dy / dx; /* dx != 0.0 asserted by insertpoint */

      return this._y[0] + m * (cx - this._x[0]);
    }

    this.CalculateCoeffs();

    // Возвратить "бесконечность", если вне интервала аппроксимации
    if(cx < this.GetMinX() || cx > this.GetMaxX())
      return Number.POSITIVE_INFINITY;


    let n = this.length;

		let i = 0;
		let j = n - 1;

    while (i + 1 < j){
      let k = i + (j - i) / 2;

      if (cx <= this._x[k]) j = k;
				else i = k;
    }

		let dx = (cx - this._x[j]);

		return this._y[j] + (this._b[j] + (this._c[j] / 2.0 + this._d[j] * dx / 6.0) * dx) * dx;
  }

  CalculateCoeffs (){
    if(this._calculated) return;

// _a = _y, нет необходимости копировать 

    this._b = [];
    this._c = [];
    this._d = [];

    let n = this.length;
    console.log("n = ", n);

		this._c[0] = 0;
    this._c[n - 1] = 0;

		let alpha = [], beta = [];

		alpha[0] = 0;
    beta[0] = 0;

		for (let i = 1; i < n - 1; i++){
			let h_i = this._x[i] - this._x[i - 1];
			let h_i1 = this._x[i + 1] - this._x[i];

			let A = h_i;
			let C = 2.0 * (h_i + h_i1);
			let B = h_i1;
			let F = 6.0 * ((this._y[i + 1] - this._y[i]) / h_i1 - (this._y[i] - this._y[i - 1]) / h_i);
			let z = (A * alpha[i - 1] + C);

			alpha[i] = - B / z;
			beta[i] = (F - A * beta[i - 1]) / z;
		}

		for (let j = n - 2; j > 0; j--)
		{
			this._c[j] = alpha[j] * this._c[j + 1] + beta[j];
		}

		for (let k = n - 1; k > 0; k--)
		{
			let h_i = this._x[k] - this._x[k - 1];

			this._d[k] = (this._c[k] - this._c[k - 1]) / (3.0 * h_i);

			this._b[k] = h_i * (2.0 * this._c[k] + this._c[k - 1]) / 3.0 + (this._y[k] - this._y[k - 1]) / h_i;
		}

    this._calculated = true;
  }
}


class CubicSpline2 extends Spline {
  constructor(){
    super();

    this._coefs = [];
  }

  Reset(){
    super.Reset();

    this._coefs = [];
  }

  Dump(){
    super.Dump();
    console.log("CubicSpline:_coefs", this._coefs);
  }

  Approximate (cx){
    if(this.GetCount() < 2) return Number.POSITIVE_INFINITY;

    if(this.GetCount() == 2){
      let dx = this._x[1] - this._x[0], dy = this._y[1] - this._y[0];

      let m = dy / dx; /* dx != 0.0 asserted by insertpoint */

      return this._y[0] + m * (cx - this._x[0]);
    }

    this.CalculateCoeffs();

    // Возвратить "бесконечность", если вне интервала аппроксимации
    if(cx < this.GetMinX() || cx > this.GetMaxX())
      return Number.POSITIVE_INFINITY;


    let n = this.length - 1;

		let i = 0;
		let j = n - 1;

    while (i + 1 < j){
      let k = i + (j - i) / 2;

      if (cx <= this._x[k]) j = k;
				else i = k;
    }

		let dx = (cx - this._x[j]);

		console.log("cx =", j);
		console.log("j =", j);

		return this._coefs[j][3] + dx * (this._coefs[j][2] + dx * (this._coefs[j][1] / 2.0 + this._coefs[j][0] * dx / 6.0));
  }

  CalculateCoeffs (){
    if(this._calculated) return;

    let N = this.length;
    let Nx = N - 1;

    this._coefs = [N];

    if(N < 3){
      console.error("CubicSpline:CalculateCoeffs(): size too small", N);
      this.Dump();
      return;
    }

    let dx = [Nx];
    let b = [N];
    let alfa = [N];
    let beta = [N];
    let gama = [N];

    for (let i = 0; i + 1 <= Nx; i++)
      dx[i] = this._x[i + 1] - this._x[i];

    for (let i = 1; i + 1 <= Nx; i++)
      b[i] = 3.0 * (dx[i] * ((this._y[i] - this._y[i - 1]) / dx[i - 1]) + dx[i - 1] * ((this._y[i + 1] - this._y[i]) / dx[i]));

    b[0] = ((dx[0] + 2.0 * (this._x[2] - this._x[0])) * dx[1] * ((this._y[1] - this._y[0]) / dx[0]) +
                        dx[0] * dx[0] * ((this._y[2] - this._y[1]) / dx[1])) / (this._x[2] - this._x[0]);

    b[N - 1] = (dx[Nx - 1] * dx[Nx - 1] * ((this._y[N - 2] - this._y[N - 3]) / dx[Nx - 2]) + (2.0 * (this._x[N - 1] - this._x[N - 3])
                + dx[Nx - 1]) * dx[Nx - 2] * ((this._y[N - 1] - this._y[N - 2]) / dx[Nx - 1])) / (this._x[N - 1] - this._x[N - 3]);

    beta[0] = dx[1];
    gama[0] = this._x[2] - this._x[0];
    beta[N - 1] = dx[Nx - 1];
    alfa[N - 1] = (this._x[N - 1] - this._x[N - 3]);

    for (let i = 1; i < N - 1; i++){
      beta[i] = 2.0 * (dx[i] + dx[i - 1]);
      gama[i] = dx[i];
      alfa[i] = dx[i - 1];
    }

    let c = 0.0;

    for (let i = 0; i < N - 1; i++){
      c = beta[i];
      b[i] /= c;
      beta[i] /= c;
      gama[i] /= c;

      c = alfa[i + 1];
      b[i + 1] -= c * b[i];
      alfa[i + 1] -= c * beta[i];
      beta[i + 1] -= c * gama[i];
    }

    b[N - 1] /= beta[N - 1];
    beta[N - 1] = 1.0;

    for (let i = N - 2; i >= 0; i--){
      c = gama[i];
      b[i] -= c * b[i + 1];
      gama[i] -= c * beta[i];
    }

    for (let i = 0; i < Nx; i++){
      let dzzdx = (this._y[i + 1] - this._y[i]) / dx[i] * dx[i] - b[i] / dx[i];
      let dzdxdx = b[i + 1] / dx[i] - (this._y[i + 1] - this._y[i]) / dx[i] * dx[i];

      this._coefs[i] = [];

      this._coefs[i][0] = (dzdxdx - dzzdx) / dx[i];
      this._coefs[i][1] = (2.0 * dzzdx - dzdxdx);
      this._coefs[i][2] = b[i];
      this._coefs[i][3] = this._y[i];
    }

		this.Dump();

    this._calculated = true;
  }
}


function AkimaSpline2 () {
  var _calculated = false;
  var _x = [];
  var _y = [];

  var _vx = [];
  var _vy = [];

  var _dx = [];
  var _dy = [];

  var _m = [];
  var _t = [];

  var _C = [];
  var _D = [];

  this.Dump = function(){
    console.log("AkimaSpline():IsOK()", this.IsOK());
    console.log("AkimaSpline():GetCount()", this.GetCount());
    console.log("_calculated", _calculated);
    console.log("_x", _x);
    console.log("_y", _y);

    if(_calculated){
      console.log("_vx", _vx);
      console.log("_vy", _vy);

      console.log("_dx", _dx);
      console.log("_dy", _dy);

      console.log("_m", _m);
      console.log("_t", _t);

      console.log("_C", _C);
      console.log("_D", _D);
    }
  };

  this.IsOK = function() { return _x.length > 1 ? true : false; };

  this.GetCount = function() { return _x.length; };

  this.GetMinX = function() { return _x.length ? _x[0] : Number.POSITIVE_INFINITY ; };
  this.GetMaxX = function() { return _x.length ? _x[_x.length - 1] : Number.POSITIVE_INFINITY ; };

  this.GetX = function(i) { 
    if(i >= _x.length) return Number.POSITIVE_INFINITY;
    if(i < 0) return Number.NEGATIVE_INFINITY;

    return _x[i];
  };

  this.GetY = function(i) { 
    if(i >= _y.length) return Number.POSITIVE_INFINITY;
    if(i < 0) return Number.NEGATIVE_INFINITY;

    return _y[i];
  };

  this.Reset = function() { _x = []; _y = []; _dx = []; _dy = []; _vx = []; _vy = []; _s = []; _m = []; _t = []; _C = []; _D = []; _calculated = false; };

  this.AddValue = function (x, y) {
    if(_x.length)
      for (var i = 0; i < _x.length; i++){
        if(Math.abs(x - _x[i]) < Number.EPSILON){
          console.log("AddValue (", x, y, "): абцисса уже есть в массиве, проигнорировано");
          return false;
        }
    
        if(x < _x[i]){
          _x.insert(i, x);
          _y.insert(i, y);
          _calculated = false;
          return true;
        }
      }

    _x.push(x);
    _y.push(y);
    _calculated = false;
    return true;
  };

  this.CalculateCoeffs = function (){
    if(_calculated) return;

    _vx = [];
    _vy = [];

    var n = _x.length + 4;
    console.log("n = ", n);

  /* Add leading and trailing extrapolation points, actual values will be filled in later */
    _vx.push(0);
    _vx.push(0);
    _vx = _vx.concat(_x);
    _vx.push(0);
    _vx.push(0);

    _vy.push(0);
    _vy.push(0);
    _vy = _vy.concat(_y);
    _vy.push(0);
    _vy.push(0);

    _dx = Array(n);
    _dy = Array(n);

    _m = Array(n);
    _t = Array(n);

    _C = Array(n);
    _D = Array(n);


  /* a) Calculate the differences and the slopes m[i]. */

    for(var i = 2; i < n - 3; i++) {
      _dx[i] = _vx[i+1] - _vx[i]; 
      _dy[i] = _vy[i+1] - _vy[i];
      _m[i] = _dy[i] / _dx[i]; /* dx != 0, asserted by insertpoint() */
    }

  /* b) interpolate the missing points: */

    _vx[1] = _vx[2] + _vx[3] - _vx[4];
    _dx[1] = _vx[2] - _vx[1];

    _vy[1] = _dx[1] * (_m[3] - 2*_m[2]) + _vy[2]; 
    _dy[1] = _vy[2] - _vy[1];
    _m[1] = _dy[1] / _dx[1];


    _vx[0] = 2*_vx[2] - _vx[4];
    _dx[0] = _vx[1] - _vx[0];

    _vy[0] = _dx[0]*(_m[2] - 2*_m[1]) + _vy[1]; 
    _dy[0] = _vy[1] - _vy[0];
    _m[0] = _dy[0]/_dx[0];

    _vx[n-2] = _vx[n-3] + _vx[n-4] - _vx[n-5];
    _vy[n-2] = (2*_m[n-4] - _m[n-5]) * (_vx[n-2] - _vx[n-3]) + _vy[n-3];

    // Ошибка и ее исправление:ниже используется _m[n-3] до его вычисления
    _dx[n-3] = _vx[n-2] - _vx[n-3]; _dy[n-3] = _vy[n-2] - _vy[n-3];
    _m[n-3] = _dy[n-3] / _dx[n-3];

//    _m[n-3] = 0;
    
    _vx[n-1] = 2*_vx[n-3] - _vx[n-5];
    _vy[n-1] = (2*_m[n-3] - _m[n-4])*(_vx[n-1] - _vx[n-2]) + _vy[n-2];

    for (var i = n-3; i < n-1; i++) {
      _dx[i] = _vx[i+1] - _vx[i]; _dy[i] = _vy[i+1] - _vy[i];
      _m[i] = _dy[i] / _dx[i];
    }

    
    _t[0]=0.0; _t[1]=0.0;  /* not relevant */
    _t[n-1]=0.0; _t[n-2]=0.0;  /* not relevant - тоже не было в оригинале */

    for (var i = 2; i < n - 2; i++) {
      var num = Math.abs(_m[i+1] - _m[i]) * _m[i-1] + Math.abs(_m[i-1] - _m[i-2])*_m[i];
      var den = Math.abs(_m[i+1] - _m[i]) + Math.abs(_m[i-1] - _m[i-2]);

      if(den > Number.EPSILON) _t[i]= num/den; else _t[i]=0.0;
    }

    /* c) Allocate the polynom coefficients */

    for (var i = 2; i < n-2; i++) {
      _C[i] = (3*_m[i] - 2*_t[i] - _t[i+1])/_dx[i];
      _D[i] = (_t[i] + _t[i+1] - 2*_m[i])/(_dx[i]*_dx[i]);
    }

    _calculated = true;

  };

  this.Approximate = function (cx){
    if(this.GetCount() < 2) return Number.POSITIVE_INFINITY;

    if(this.GetCount() == 2){
      var dx = _x[1] - _x[0], dy = _y[1] - _y[0];

      var m = dy / dx; /* dx != 0.0 asserted by insertpoint */

      return _y[0] + m * (cx - _x[0]);
    }

    this.CalculateCoeffs();

    // Возвратить "бесконечность", если вне интервала аппроксимации
    if(cx < this.GetMinX() || cx > this.GetMaxX())
      return Number.POSITIVE_INFINITY;

    var p = 2;

    for(; p < _vx.length - 2; p++){
      if(Math.abs(cx - _vx[p]) < Number.EPSILON) /* strict match */
        return _vy[p];

      if(_vx[p] > cx) 
        break;
    }

    var xd = (cx - _vx[p-1]);

    return _vy[p-1] + (_t[p-1] + (_C[p-1] + _D[p-1]*xd)*xd)*xd;

  };

};




class CubicSpline3 extends Spline {
  constructor(){
    super();

    this._b = [];
    this._c = [];
    this._d = [];
  }

  Reset(){
    super.Reset();

    this._b = [];
    this._c = [];
    this._d = [];
  }

  Dump(){
    super.Dump();
    console.log("CubicSpline:_b", this._b);
    console.log("CubicSpline:_c", this._c);
    console.log("CubicSpline:_d", this._d);
  }

  Approximate (cx){
    if(this.length < 2) return Number.POSITIVE_INFINITY;

    if(this.length == 2){
      let dx = this._x[1] - this._x[0], dy = this._y[1] - this._y[0];

      let m = dy / dx; /* dx != 0.0 asserted by insertpoint */

      return this._y[0] + m * (cx - this._x[0]);
    }

    this.CalculateCoeffs();

    // Возвратить "бесконечность", если вне интервала аппроксимации
    if(cx < this.GetMinX() || cx > this.GetMaxX())
      return Number.POSITIVE_INFINITY;

    let j = 0;

    for(; j < this._x.length; j++){
      if(Math.abs(cx - this._x[j]) < Number.EPSILON * 100){ /* strict match */
        console.log("Approximate(", cx, ") = ", this._y[j], 
         "(j = ", j, ", x[] = ", this._x[j], ", y[] = ", this._y[j], " == match");
        return this._y[j];
      }

      if(this._x[j] > cx) 
        break;
    }

//    if(j > 0) j--;

		let dx = (cx - this._x[j]);

		let y = this._y[j] + (this._b[j] + (this._c[j] / 2.0 + this._d[j] * dx / 6.0) * dx) * dx; 

    console.log("Approximate(", cx, ") = ", y, 
      "(j = ", j, ", x[] = ", this._x[j], ", y[] = ", this._y[j]);

		return y;
  }

  CalculateCoeffs (){
    if(this._calculated) return;

// _a = _y, нет необходимости копировать 

    this._b = [];
    this._c = [];
    this._d = [];

    let n = this.length;
    console.log("n = ", n);

		this._c[0] = 0;
    this._c[n - 1] = 0;

		let alpha = [], beta = [];

		alpha[0] = 0;
    beta[0] = 0;

		for (let i = 1; i < n - 1; i++){
			let h_i = this._x[i] - this._x[i - 1];
			let h_i1 = this._x[i + 1] - this._x[i];

			let A = h_i;
			let C = 2.0 * (h_i + h_i1);
			let B = h_i1;
			let F = 6.0 * ((this._y[i + 1] - this._y[i]) / h_i1 - (this._y[i] - this._y[i - 1]) / h_i);
			let z = (A * alpha[i - 1] + C);

			alpha[i] = - B / z;
			beta[i] = (F - A * beta[i - 1]) / z;
		}

		for (let j = n - 2; j > 0; j--)
		{
			this._c[j] = alpha[j] * this._c[j + 1] + beta[j];
		}

		for (let k = n - 1; k > 0; k--)
		{
			let h_i = this._x[k] - this._x[k - 1];

			this._d[k] = (this._c[k] - this._c[k - 1]) / (3.0 * h_i);

			this._b[k] = h_i * (2.0 * this._c[k] + this._c[k - 1]) / 3.0 + (this._y[k] - this._y[k - 1]) / h_i;
		}

    this._calculated = true;
  }
}
