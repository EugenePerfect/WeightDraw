// Константы времени. Менять нельзя!
const hour_len_ms = 60 * 60 * 1000;
const day_len_ms = 24 * hour_len_ms;

// Количество дней, которые учитываются в усреднении "старта" и "конца"
const average_window_days = 5;

let smooth = false;
let month_format = "январь";

function ZeroFill(n){
  if(n >= 10) return n;

  return "0" + n;
}

Date.prototype.daysInMonth = function() {
  return 33 - new Date(this.getFullYear(), this.getMonth(), 33).getDate();
};

// проверяем, находится ли дата на расстоянии window или менее от date
Date.prototype.dateInRange = function(date, window) {
  var window_ms = window * day_len_ms;

  if(this.getTime() > date.getTime() + window_ms) return false;
  if(this.getTime() < date.getTime() - window_ms) return false;


  return true;
};

// Делает из даты строку вид "01.21" 
Date.prototype.MakeMonthString = function (){
  return ZeroFill((this.getMonth() + 1).toString()) + "." + ZeroFill((this.getFullYear() - 2000).toString());
}

// Обратная функция: создать дату из строки обозначения месяца вида "01.21"
function MakeMonthDate(s, day = 1){
  var a = s.split('.');

  var year = 2000 + parseInt(a[1], 10);
  var month = parseInt(a[0], 10) - 1;

  return new Date(year, month, day);
}

// проверяем, относятся ли даты к одному месяцу. 
// Аргумент s может быть как датой, так и строкой вида "01.21" 
Date.prototype.IsSameMonth = function (s){
  var month = 0, year = 0;

  if (typeof s == 'string'){
    month = parseInt(s.split('.')[0], 10) - 1;
    year = 2000 + parseInt(s.split('.')[1], 10);
  }else{
    month = s.getMonth();
    year = s.getFullYear();
  }

  if(this.getMonth() == month && this.getFullYear() == year) return true;

  return false;
};

// Возвращает строку названия месяца
Date.prototype.GetMonthName = function (format){
  var names = [ 
    "январь", "февраль", "март", "апрель", "май", "июнь", 
    "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь" 
  ];

  var short_names = [ 
    "янв", "фев", "мар", "апр", "май", "июн", 
    "июл", "авг", "сен", "окт", "ноя", "дек" 
  ];

  if(format == "январь") return names[this.getMonth()];

  if(format == "янв") return short_names[this.getMonth()];

  if(format == "01") return ZeroFill(this.getMonth() + 1);
     
  if(format == "01/21") return ZeroFill(this.getMonth() + 1) + "/" + ZeroFill(this.getFullYear() - 2000);

  if(format == "янв 21") return short_names[this.getMonth()] + " " + ZeroFill(this.getFullYear() - 2000);

  return names[this.getMonth()];
};

// Замыкание
(function() {
  /**
   * Корректировка округления десятичных дробей.
   *
   * @param {String}  type  Тип корректировки.
   * @param {Number}  value Число.
   * @param {Integer} exp   Показатель степени (десятичный логарифм основания корректировки).
   * @returns {Number} Скорректированное значение.
   */
  function decimalAdjust(type, value, exp) {
    // Если степень не определена, либо равна нулю...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // Если значение не является числом, либо степень не является целым числом...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // Сдвиг разрядов
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Обратный сдвиг
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
  }

  // Десятичное округление к ближайшему
  if (!Math.round10) {
    Math.round10 = function(value, exp) {
      return decimalAdjust('round', value, exp);
    };
  }
  // Десятичное округление вниз
  if (!Math.floor10) {
    Math.floor10 = function(value, exp) {
      return decimalAdjust('floor', value, exp);
    };
  }
  // Десятичное округление вверх
  if (!Math.ceil10) {
    Math.ceil10 = function(value, exp) {
      return decimalAdjust('ceil', value, exp);
    };
  }
})();


Array.prototype.insert = function ( index, item ) {
    return this.splice( index, 0, item );
};

// Реализацию сплайна Акимы я портировал из C-кода программы для debian aspline Дэвида Фрея.
// Адрес (мертвая ссылка) http://homepage.hispeed.ch/david.frey/

function AkimaSpline () {
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

//CanvasRenderingContext2D

// Рисуем линию, сохраняя и восстанавливая выбранный цвет и ширину в контексте
function line(ctx, w, x1, y1, x2, y2, s = false) {
  ctx.save();

  ctx.lineWidth = w;
  if(s) ctx.strokeStyle = s; 

  ctx.beginPath();

  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);

  ctx.stroke();

  ctx.restore();
};

// Рисуем горизонтальную линию, сохраняя и восстанавливая 
// выбранный цвет и ширину в контексте
function hline(ctx, w, x1, x2, y, s){
  line(ctx, w, x1, y, x2, y, s); 
}

// Рисуем верикальную линию, сохраняя и восстанавливая 
// выбранный цвет и ширину в контексте
function vline(ctx, w, x, y1, y2, s){
  line(ctx, w, x, y1, x, y2, s); 
}

var myDataSet = {
  weights : new Array(), 

  yMax : 0,
  yMin : 100000,

  scale_w_min : 60,
  scale_w_max : 120,

  initdone : false,
  dataloaded : false,

  GetScaleMax : function () {
    if(!this.initdone) this.Init();

    return this.scale_w_max;
  },

  GetScaleMin : function () {
    if(!this.initdone) this.Init();

    return this.scale_w_min;
  },

  GetMax : function () {
    if(!this.initdone) this.Init();

    return this.yMax;
  },

  GetMin : function () {
    if(!this.initdone) this.Init();

    return this.yMin;
  },

  TotalDots : function () { 
    if(!this.dataloaded) this.LoadData();

    return this.weights.length / 3;
  },

  TotalDays : function () { 
    if(!this.dataloaded) this.LoadData();

    return Math.round((this.X(this.TotalDots() - 1).getTime() - this.X(0).getTime()) / day_len_ms) - 1;
  },

  StartWeight : function (average_window_days) {
    if(!this.dataloaded) this.LoadData();

    const average_window_ms = average_window_days * day_len_ms;

    var start = this.X(0).getTime();
    var n = 0; s = 0;
    var start_weight = 0;

    for(var i = 0; i < this.TotalDots(); i++){
      if(this.X(i).getTime() > start + average_window_ms){
        start_weight = s / n, -1;
        break;
      }

      n++;
      s += this.Y(i);
    }

    return start_weight;
  },

  EndWeight : function (average_window_days) {
    if(!this.dataloaded) this.LoadData();

    const average_window_ms = average_window_days * day_len_ms;

    var start = this.X(this.TotalDots() - 1).getTime();
    var n = 0; s = 0;
    var end_weight = 0;

    for(var i = this.TotalDots() - 1; i >= 0; i--){
      if(this.X(i).getTime() < start - average_window_ms){
        end_weight = s / n, -1;
        break;
      }

      n++;
      s += myDataSet.Y(i);
    }
    return end_weight;
  },

  TotalLoss : function (average_window_days) {
    if(!this.dataloaded) this.LoadData();

    return this.EndWeight(average_window_days) - this.StartWeight(average_window_days);
  },

  X : function (i) {
    if(!this.dataloaded) this.LoadData();

    return this.weights[i * 3 + 1];
  },

  LastX : function (i) {
    if(!this.dataloaded) this.LoadData();

    return this.X(this.TotalDots() - 1);
  },

  Y : function (i) {
    if(!this.dataloaded) this.LoadData();

    return this.weights[i * 3 + 2];
  },

  LastY : function (i) {
    if(!this.dataloaded) this.LoadData();

    return this.Y(this.TotalDots() - 1);
  },

  LoadData : function () {
    if(this.dataloaded) return;

    for(var i = 0; i < myRawData.length / 2; i++){
      this.weights.push(myRawData[2 * i]);
      this.weights.push(0);
      this.weights.push(myRawData[2 * i + 1]);
    }

    this.dataloaded = true;
  },

  Init : function () {
    if(this.initdone) return;

    for(var i = 0; i < this.TotalDots(); i++){
      if(i == 51) 
        console.log(this.weights[i * 3]);

      var a = this.weights[i * 3].split('.');

      var year = 2000 + parseInt(a[2], 10);
      var month = parseInt(a[1], 10) - 1;
      var day = parseInt(a[0], 10);

      this.weights[i * 3 + 1] = new Date(year, month, day);

      // Find max and min values
      if(this.Y(i) < this.yMin) this.yMin = this.Y(i);
      if(this.Y(i) > this.yMax) this.yMax = this.Y(i);
    }
    
    this.scale_w_min = 5 * Math.floor(this.yMin / 5);
    this.scale_w_max = 5 * Math.ceil (this.yMax / 5);

    this.initdone = true;
  }
};

function Scaler(v, v_min, v_max, scr_min, scr_max){
  return (v - v_min) * (scr_max - scr_min) / (v_max - v_min);
}

class CScaler {
  constructor(v1, v2, cmin, cmax, reversed = false) {
    this.cmin = cmin; // Минимальная координата на экране
    this.cmax = cmax; // Максимальная координата на экране
    this.v1 = v1;     // Минимальное значение величины 
    this.v2 = v2;     // Максимальное значение величины 
    this.reversed = reversed;
  }

  /* Только масштабирование */
  Scale(v){
    return Scaler(v, this.v1, this.v2, this.cmin, this.cmax);
  }

  /* Масштабирование и сдвиг */
  Transform(v){
    if(this.reversed)
      return this.cmax - this.Scale(v);
    else
      return this.cmin + this.Scale(v);
  }
}

function FindThis(element, index, array){
  return (this == element.number); 
}

function DrawStatistics(ctx, y1, XScaler, day1, day2, monthloss, weekloss, color = 'black'){
  var xl = XScaler.Transform(day1);
  var xr = XScaler.Transform(day2);

  var txt1 = monthloss + " кг/мес";
  var txt2 = weekloss + " кг/нед ";

  ctx.fillStyle = color;
  ctx.font = '18px serif';
  ctx.fillText(txt1, (xr + xl) / 2, y1 + 40);
  ctx.fillText(txt2, (xr + xl) / 2, y1 + 56);
}

function DrawGraph(ctx, spline, XScaler, YScaler, smooth = true, nWidth = 1, StrokeStyle){
  let keepwidth = ctx.lineWidth;
  ctx.lineWidth = nWidth;

  let keepstyle = ctx.strokeStyle;
  if(typeof StrokeStyle !== 'undefined') ctx.strokeStyle = StrokeStyle;

  console.log("DrawGraph(): spline.GetCount() = ", spline.GetCount());
  console.log("DrawGraph(): spline.GetMinX() = ", spline.GetMinX());

  ctx.beginPath();

  if(smooth){
    let xt1 = spline.GetMinX(); // Время
    let xt2 = spline.GetMaxX();

    let x1 = XScaler.Transform(xt1); // Пиксели
    let x2 = XScaler.Transform(xt2);

    let last = spline.GetCount() - 1;

    let delta = (xt2 - xt1)/(2 * (x2 - x1));

    console.log("delta = ", delta);
    console.log("xt1 + delta = ", xt1 + delta);

    ctx.moveTo(x1, YScaler.Transform(spline.GetY(0)));

    for(let xxx = xt1 + delta; xxx < xt2; xxx += delta)
      ctx.lineTo(XScaler.Transform(xxx), YScaler.Transform(spline.Approximate(xxx)));

    ctx.lineTo(XScaler.Transform(spline.GetX(last)), YScaler.Transform(spline.GetY(last)));

  }else{
    for(let i = 0; i < spline.GetCount(); i++){
      let x = XScaler.Transform(spline.GetX(i)); // pixels
      let y = YScaler.Transform(spline.GetY(i));

      if(i)
        ctx.lineTo(x, y);
      else
        ctx.moveTo(x, y);
    }
  }

  ctx.stroke();

  ctx.lineWidth = keepwidth;
  ctx.strokeStyle = keepstyle;
}

function DrawSmart(ctx, x1, y1, x2, y2, mesh = nWeekDays, show_weeks = true){
  if(myDataSet.TotalDots() < 2){
    alert("Нечего рисовать. Нужно минимум две точки.");
    return;
  }

  var dmin = myDataSet.X(0).getTime();   
  var dmax = myDataSet.LastX().getTime();

  var XScaler = new CScaler(dmin, dmax, x1, x2);
  var YScaler = new CScaler(myDataSet.GetScaleMin(), myDataSet.GetScaleMax(), y1, y2, true);

  var spline = new AkimaSpline();

  // Сначала рисуем ломаную через все точки 
  for(var x = 0; x < myDataSet.TotalDots(); x++)
    spline.AddValue(myDataSet.X(x).getTime(), myDataSet.Y(x));

  DrawGraph(ctx, spline, XScaler, YScaler, smooth, nDayWidth);

  // Теперь сами точки, если необходимо, квадратиками
  if(nDrawDots){
    for(var x = 0; x < myDataSet.TotalDots(); x++){
      var xc = XScaler.Transform(myDataSet.X(x));
      var yc = YScaler.Transform(myDataSet.Y(x));

      var nExtremumWidth = nDayWidth * 2; 

      // Точку с минимальным значением рисуем зеленым квадратом двойного размера, максимальным - красного
      if(myDataSet.Y(x) == myDataSet.GetMin())
        vline(ctx, nExtremumWidth * 2, xc, yc - nExtremumWidth, yc + nExtremumWidth, 'green');
      else if(myDataSet.Y(x) == myDataSet.GetMax())
        vline(ctx, nExtremumWidth * 2, xc, yc - nExtremumWidth, yc + nExtremumWidth, 'red');
      else 
        vline(ctx, nDayWidth * 1.5, xc, yc - nDayWidth, yc + nDayWidth);
    }
  }

  // Теперь ломаную через точки с усреднением, если задано
  if(mesh){
    spline.Reset();

    const week_len_ms = mesh * day_len_ms;
    let week_start = dmin;

    let s = 0, n = 0;

    for(let i7 = 0; i7 < myDataSet.TotalDots(); i7++){

    // +1 час = компенсация за перевод часов на летнее время
      if(myDataSet.X(i7).getTime() + hour_len_ms >= week_start + week_len_ms){
//      console.log("точка", ws_d.toDateString());
        var Y = s / n;
        var X = week_start + week_len_ms / 2;

        s = 0;
        n = 0;
        week_start += week_len_ms;

        spline.AddValue(X, Y);
      }

      s += myDataSet.Y(i7);
      n++; 
    }

    DrawGraph(ctx, spline, XScaler, YScaler, smooth, nWeekWidth, sWeekStyle);
  }

  // Сначала строим список месяцев
  var aMonth = new Array();

  for(var i = 0; i < myDataSet.TotalDots(); i++){
    var Month = myDataSet.X(i).MakeMonthString();

    var idx = aMonth.findIndex(FindThis, Month);
    if(idx == -1){ 
      var firstday = MakeMonthDate(Month);
      var length = firstday.daysInMonth();
      var m = { 
         number : Month, // Текстовая строка вида "01.21"  
         name : firstday.GetMonthName(month_format), // Название месяца словами
         firstday: firstday, // Первый день месяца
         length: length, // Дней в месяце
         middle: MakeMonthDate(Month, Math.round10(length / 2)), // Середина месяца
         X: 0, Y: 0,
         startweight: 0
      };
      aMonth.push(m);
    }
  }

  console.log(aMonth);

  // Рассчитываем точки помесячно и рисуем шкалу по оси Х
  for(var m = 0; m < aMonth.length; m++){
    // насечки на каждом 5м дне
    for(var day = 5; day <= aMonth[m].length; day += 5){
      var fifth_x = XScaler.Transform(MakeMonthDate(aMonth[m].number, day));

      if(fifth_x < x1) continue;
      if(fifth_x > x2) break;

      ctx.strokeStyle = 'black'; 
      ctx.font = '12px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.fillText(day, fifth_x, y2 + 10);

      vline(ctx, 1, fifth_x, y2 - 2, y2 + 2);
    }

    // Считаем среднемесячные значение (по всем точкам за конкретный месяц)
    var s = 0, n = 0;
    for(var j = 0; j < myDataSet.TotalDots(); j++){
      if(myDataSet.X(j).IsSameMonth(aMonth[m].number)){
        n++;
        s += myDataSet.Y(j);
      }
    }

    var Y = s / n;

    let X = XScaler.Transform(aMonth[m].middle); // координаты середины месяца
    let Xt = aMonth[m].middle.getTime(); // время экранной середины месяца

    if(X < x1){ X = x1; Xt = dmin; } 
    if(X > x2){ X = x2; Xt = dmax; } 

    aMonth[m].Y = YScaler.Transform(Y);
    aMonth[m].X = X;

    // Для сплайна - в исходном диапазоне значений абцис и ординат  
    aMonth[m].Yv = Y;
    aMonth[m].Xv = Xt;

    // Считаем среднее значение на начало месяца 
    s = 0, n = 0;
    for(var j = 0; j < myDataSet.TotalDots(); j++){
      if(myDataSet.X(j).dateInRange(aMonth[m].firstday, nMonthStartCalculateWindow)){
        n++;
        s += myDataSet.Y(j);
      }
    }

    if(n) aMonth[m].startweight = s / n;

    ctx.save();

    ctx.strokeStyle = 'gray'; 
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    var strMonthFont = 'bold 24px serif';
    
    if(!m){ // Для первого месяца пишем название только в случае, 
            // если начало данных приходится на 15е число или ранее; 
            // статистика за этот месяц не считается 
      if(myDataSet.X(0).getDate() <= 20){
        var xl = x1;
        var xr = XScaler.Transform(aMonth[m + 1].firstday);

        ctx.fillStyle = 'blue';
        ctx.font = strMonthFont;
        ctx.fillText(aMonth[m].name, (xr + xl) / 2, y1 + 10);
      }  
    }else{ 
      // Вывод статистики за месяц
      if(m < aMonth.length && aMonth[m - 1].startweight){
        // Различие: "потеря за месяц" = потеря за календарный месяц
        var monthloss = Math.round10(aMonth[m].startweight - aMonth[m - 1].startweight, -1);
        // "потеря за неделю" = считается из предыдущего показателя в пересчете на 7 дней
        // в отличие от "потери за месяц" - это сравнимые показатели, 
        // т.к. влияние разной длины месяца нивелируется
        var weekloss = Math.round10(monthloss * 7 / aMonth[m].length, -2);           

        DrawStatistics(ctx, y1, XScaler, aMonth[m - 1].firstday, aMonth[m].firstday, monthloss, weekloss);


        console.log("aMonth.length = ", aMonth.length);
        console.log("m = ", m);
        console.log(aMonth[m]);
      }

      // Название пишем для следущего месяца и только для того случая, когда последняя точка это 15 число или далее
      if(m + 1 < aMonth.length || myDataSet.LastX().getDate() > 15){
        var xl = XScaler.Transform(aMonth[m].firstday);
        var xr = (m + 1 < aMonth.length) ? XScaler.Transform(aMonth[m + 1].firstday) : x2;

        ctx.fillStyle = 'blue';
        ctx.font = strMonthFont;
        ctx.fillText(aMonth[m].name, (xr + xl) / 2, y1 + 10);

        // Для последнего неполного месяца 
        if(m + 1 == aMonth.length){
          // Число дней
          var days = (myDataSet.LastX() - aMonth[m].firstday) / day_len_ms;
          // Потеряно килограмм
          var loss = myDataSet.EndWeight(average_window_days) - aMonth[m].startweight;
          // В день терялось
          var dailyloss = loss / days; 

          // Прогноз за целый месяц
          var monthloss = Math.round10(dailyloss * aMonth[m].length, -1);
          var weekloss = Math.round10(dailyloss * 7, -2);           

          DrawStatistics(ctx, y1, XScaler, aMonth[m].firstday, myDataSet.LastX(), monthloss, weekloss, 'gray');
        }
      }
    }

    ctx.restore();
 
    if(m){
      // Вертикальные линии "граница между месяцами", рисуются на 12:00 последнего дня предыдущего месяца
      // Почему так? Если последняя точка - первое число, при рисовании разделителя на 00:00 первого числа
      // не совсем очевидно, что последняя точка, которая в этом случае совпадает с линией, относится 
      // уже к новому месяцу 
      var x = XScaler.Transform(aMonth[m].firstday - day_len_ms / 2);
      vline(ctx, 1, x, y1, y2, 'gray');
    }
  }

  // Линия по среднемесячным 
  spline.Reset();

  for(var m = 0; m < aMonth.length; m++)
    spline.AddValue(aMonth[m].Xv, aMonth[m].Yv);

  DrawGraph(ctx, spline, XScaler, YScaler, smooth, nMonthWidth, sMonthStyle);

//  spline.Dump();

  console.log(aMonth);

  // Обозначание воскресений. Тупо проходим по всем дням и отмечаем те, в которых день недели = 0 (вс) 
  if(show_weeks){
    ctx.strokeStyle = 'red'; 
    for(var sun = myDataSet.X(0).getTime(); sun <= myDataSet.LastX().getTime() + hour_len_ms; sun += day_len_ms){

      var ddd = new Date(sun);
      if(!ddd.getDay()){
        var sunpos = x1 + Scaler(sun, dmin, dmax, x1, x2);
        vline(ctx, 0.5, sunpos, y2, y1 + 60);
      }
    }
  }
}

// Простая отрисовка, все точки равномерно на графике без учета даты как координаты на оси Y
function DrawRegular(ctx, x1, y1, x2, y2){
  var XScaler = new CScaler(myDataSet.X(0).getTime(), myDataSet.LastX().getTime(), x1, x2);
  var YScaler = new CScaler(myDataSet.GetScaleMin(), myDataSet.GetScaleMax(), y1, y2, true);


  for(var x = 1; x < myDataSet.TotalDots(); x++){
    var xprev = XScaler.Transform(x - 1);
    var xcurr = XScaler.Transform(x);

    var yprev = YScaler.Transform(myDataSet.Y(x-1));
    var ycurr = YScaler.Transform(myDataSet.Y(x));

    line(ctx, 2, xprev, yprev, xcurr, ycurr);
  }
}

function Draw(w, h, m, week, method, id){
  var canvas = document.getElementById(id);
  var ctx = canvas.getContext('2d');

  canvas.width = w;
  canvas.height = h;

  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, canvas.width, canvas.height); // clear canvas
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  ctx.textBaseline = 'middle';

  const vborder = 32;
  const topborder = 96, bottomborder = 32;

  var x1 = vborder, x2 = canvas.width - vborder;
  var y1 = topborder, y2 = canvas.height - bottomborder;

  var column = (x2 - x1) / (myDataSet.TotalDots() + 1);

  ctx.font = '16px serif';

  const maxtext = "максимум, кг: ";
  const mintext = "минимум, кг: ";
  const textstartx = 10;
  const textstarty = 20;
  const textline = 20;

  var textendx = canvas.width - textstartx;

  let text = ctx.measureText(maxtext);
  let second_col_x = textstartx + text.width;

  ctx.fillText(maxtext, textstartx, textstarty);
  ctx.fillText(myDataSet.GetMax(), second_col_x, textstarty);

  ctx.fillText(mintext, textstartx, textstarty + textline);
  ctx.fillText(myDataSet.GetMin(), second_col_x, textstarty + textline);

  var total_loss = myDataSet.TotalLoss(average_window_days);

  ctx.fillText("суммарно, кг: " + Math.round10(total_loss, -1) + " за " + myDataSet.TotalDays() + " дней" , textstartx, textstarty + 2 * textline);

//  ctx.textAlign = 'center';
//  ctx.fillText("Метод: " + method, w / 2, textstarty);


  const samlplewidth = 20;
  const dailytext = "все точки";
  const monthlytext = "среднемесячный";
  const weeklytext = "усредненный";
  var mtext = ctx.measureText(monthlytext);
  var centerwidth = samlplewidth + mtext.width;

  ctx.textAlign = 'left';

  var centerleft = w/2 - centerwidth/2;

  hline(ctx, nDayWidth, centerleft, centerleft + samlplewidth - 5, textstarty, sDayStyle);
  ctx.fillText(dailytext, centerleft + samlplewidth, textstarty);

  hline(ctx, nWeekWidth, centerleft, centerleft + samlplewidth - 5, textstarty + textline, sWeekStyle);
  ctx.fillText(weeklytext, centerleft + samlplewidth, textstarty + textline);

  hline(ctx, nMonthWidth, centerleft, centerleft + samlplewidth - 5, textstarty + 2 * textline, sMonthStyle);
  ctx.fillText(monthlytext, centerleft + samlplewidth, textstarty + 2 * textline);

  var daily_loss = total_loss / myDataSet.TotalDays();

  var month_days = (365 * 3 + 366) / (4 * 12);

  ctx.textAlign = 'right';
  ctx.fillText("В среднем за сутки " + Math.round10(daily_loss, -3) + " кг", textendx, textstarty);
  ctx.fillText("В среднем за неделю " + Math.round10(daily_loss * 7, -2) + " кг", textendx, textstarty + textline);
  ctx.fillText("В среднем за месяц " + Math.round10(daily_loss * month_days, -1) + " кг", textendx, textstarty + 2 * textline);

  // Главные оси 
  vline(ctx, 2, x1, y1, y2);
  hline(ctx, 2, x1, x2, y2);

  // Насечки на оси У, обозначения
  for(var j = myDataSet.GetScaleMin(); j <= myDataSet.GetScaleMax(); j++){
    var y = y2 - Scaler(j, myDataSet.GetScaleMin(), myDataSet.GetScaleMax(), y1, y2);

    ctx.font = '12px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(j, vborder / 2, y);

    hline(ctx, 1, x1 - 2, x1 + 2, y);

    if(j % 5 == 0)
      hline(ctx, 0.5, x1 + 2, x2, y);
  }

  x1 += column;
  x2 -= column;

  ctx.strokeStyle = sDayStyle; 

  if(method == 'smart') 
    DrawSmart(ctx, x1, y1, x2, y2, m, week);
  else /*(method == 'regular')*/
    DrawRegular(ctx, x1, y1, x2, y2);
}

function Update(){

  var size_raw = $("#size_selector")[0].value;

  var m = $("#mesh_selector")[0].value;
  if(m == 'нет') m = 0;

  var week = $("#weeksshow_selector")[0].value;

  var size_raw = size_raw.split(' ');

  var width = parseInt(size_raw[0], 10); 
  var height = parseInt(size_raw[2], 10); 

  console.log("Update():", "size_raw = ", size_raw, ", width=", width, ", height=", height);

  week = (week == 'отметить') ? true : false;

  smooth = ($("#smoothing_selector")[0].value == "да") ? true : false;

  month_format = $("#monthlabels_selector")[0].value;

  Draw(width, height, m, week, 'smart', 'canvas2');
//  Draw(800, 600, 'regular', 'canvas3');
}

$("#mesh_selector")[0].value = nWeekDays;

$("#size_selector").bind( "change", function(e) { Update(); });
$("#mesh_selector").bind( "change", function(e) { Update(); });
$("#weeksshow_selector").bind( "change", function(e) { Update(); });
$("#smoothing_selector").bind( "change", function(e) { Update(); });
$("#monthlabels_selector").bind( "change", function(e) { Update(); });

Update();
