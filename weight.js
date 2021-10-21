// Константы времени. Менять нельзя!
const hour_len_ms = 60 * 60 * 1000;
const day_len_ms = 24 * hour_len_ms;

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
  if(format == str["format_month_full"]) return month_names[this.getMonth()];

  if(format == str["format_month_short"]) return month_short_names[this.getMonth()];

  if(format == "01") return ZeroFill(this.getMonth() + 1);
     
  if(format == "01/21") return ZeroFill(this.getMonth() + 1) + "/" + ZeroFill(this.getFullYear() - 2000);

  if(format == str["format_month_year"]) return month_short_names[this.getMonth()] + " " + ZeroFill(this.getFullYear() - 2000);

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

  StartWeight : function (nAverageWindowDays) {
    if(!this.dataloaded) this.LoadData();

    const average_window_ms = nAverageWindowDays * day_len_ms;

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

  EndWeight : function (nAverageWindowDays) {
    if(!this.dataloaded) this.LoadData();

    const average_window_ms = nAverageWindowDays * day_len_ms;

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

  TotalLoss : function (nAverageWindowDays) {
    if(!this.dataloaded) this.LoadData();

    return this.EndWeight(nAverageWindowDays) - this.StartWeight(nAverageWindowDays);
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
    
    this.scale_w_min = Math.floor(this.yMin) - 1;
    this.scale_w_max = Math.ceil (this.yMax) + 1;

//    this.scale_w_min = 5 * Math.floor(this.yMin / 5);
//    this.scale_w_max = 5 * Math.ceil (this.yMax / 5);

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

const nStatRow1Offset = 28;
const nStatRow2Offset = 48;
const strStatFont = "18px serif";

function DrawStatistics(ctx, y1, XScaler, day1, day2, monthloss, weekloss, color = 'black'){
  var xl = XScaler.Transform(day1);
  var xr = XScaler.Transform(day2);

  ctx.fillStyle = color;
  ctx.font = strStatFont;

  ctx.fillText(monthloss, (xr + xl) / 2, y1 + nStatRow1Offset);
  ctx.fillText(weekloss,  (xr + xl) / 2, y1 + nStatRow2Offset);
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

function DrawSmart(ctx, x1, y1, x2, y2, y0, config){
  if(myDataSet.TotalDots() < 2){
    alert("Нечего рисовать. Нужно минимум две точки.");
    return;
  }

  var dmin = myDataSet.X(0).getTime();   
  var dmax = myDataSet.LastX().getTime();

  var XScaler = new CScaler(dmin, dmax, x1, x2);
  var YScaler = new CScaler(myDataSet.GetScaleMin(), myDataSet.GetScaleMax(), y1, y2, true);

  if(config.bDrawMinMaxLines){
    // Рисуем линию максимального веса 
    hline(ctx, 0.5, x1, x2, YScaler.Transform(myDataSet.GetMax()), "red");

    // Рисуем линию минимального веса 
    hline(ctx, 0.5, x1, x2, YScaler.Transform(myDataSet.GetMin()), "green");
  }

  // Объект сплайна создается в любом случае, даже если рисуем без сглаживания!
  var spline = config.nSmoothType == 1 ? new AkimaSpline() : new CubicSpline2();

  // Сначала рисуем ломаную через все точки 
  for(var x = 0; x < myDataSet.TotalDots(); x++)
    spline.AddValue(myDataSet.X(x).getTime(), myDataSet.Y(x));

  DrawGraph(ctx, spline, XScaler, YScaler, config.nSmoothType, nDayWidth);

  spline.Dump();

  // Теперь сами точки, если необходимо, квадратиками
  if(nDrawDots){
    for(var x = 0; x < myDataSet.TotalDots(); x++){
      var xc = XScaler.Transform(myDataSet.X(x));
      var yc = YScaler.Transform(myDataSet.Y(x));

      var nExtremumWidth = nDayWidth * 2; 

      // Точку с минимальным значением рисуем зеленым квадратом двойного размера, максимальным - красного
      if(myDataSet.Y(x) == myDataSet.GetMin() && config.bDrawMinMaxBoxes)
        vline(ctx, nExtremumWidth * 2, xc, yc - nExtremumWidth, yc + nExtremumWidth, 'green');
      else if(myDataSet.Y(x) == myDataSet.GetMax() && config.bDrawMinMaxBoxes)
        vline(ctx, nExtremumWidth * 2, xc, yc - nExtremumWidth, yc + nExtremumWidth, 'red');
      else 
        vline(ctx, nDayWidth * 1.5, xc, yc - nDayWidth, yc + nDayWidth);
    }
  }

  // Теперь ломаную через точки с усреднением, если задано
  if(config.nMeshSize){
    spline.Reset();

    const week_len_ms = config.nMeshSize * day_len_ms;
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

    DrawGraph(ctx, spline, XScaler, YScaler, config.nSmoothType, nWeekWidth, sWeekStyle);
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
         name : firstday.GetMonthName(config.sMonthFormat), // Название месяца словами
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

// Подписи статистики слева
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'black';

  ctx.textAlign = 'left';
  ctx.font = strStatFont;
  ctx.fillText(str["kgmonth"], 5, y0 + nStatRow1Offset);
  ctx.fillText(str["kgweek"],  5, y0 + nStatRow2Offset);

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

    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';

    var strMonthFont = 'bold 24px serif';

    const nMonthNamePos = y0;

    if(!m){ // Для первого месяца пишем название только в случае, 
            // если начало данных приходится на 15е число или ранее; 
            // статистика за этот месяц не считается 
      if(myDataSet.X(0).getDate() <= 20){
        var xl = x1;
        var xr = XScaler.Transform(aMonth[m + 1].firstday);

        ctx.fillStyle = 'blue';
        ctx.font = strMonthFont;
        ctx.fillText(aMonth[m].name, (xr + xl) / 2, nMonthNamePos);
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

        DrawStatistics(ctx, y0, XScaler, aMonth[m - 1].firstday, aMonth[m].firstday, monthloss, weekloss);
        
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
        ctx.fillText(aMonth[m].name, (xr + xl) / 2, nMonthNamePos);

        // Для последнего неполного месяца 
        if(m + 1 == aMonth.length){
          // Число дней
          var days = (myDataSet.LastX() - aMonth[m].firstday) / day_len_ms;
          // Потеряно килограмм
          var loss = myDataSet.EndWeight(nAverageWindowDays) - aMonth[m].startweight;
          // В день терялось
          var dailyloss = loss / days; 

          // Прогноз за целый месяц
          var monthloss = Math.round10(dailyloss * aMonth[m].length, -1);
          var weekloss = Math.round10(dailyloss * 7, -2);           

          DrawStatistics(ctx, y0, XScaler, aMonth[m].firstday, myDataSet.LastX(), monthloss, weekloss, 'gray');
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
      vline(ctx, 1, x, y0 + 10, y2, 'gray');
    }
  }
    
  // Линия по среднемесячным 
  if(config.bDrawMonthlyGraph){
    spline.Reset();

    for(var m = 0; m < aMonth.length; m++)
      spline.AddValue(aMonth[m].Xv, aMonth[m].Yv);

    DrawGraph(ctx, spline, XScaler, YScaler, config.nSmoothType, nMonthWidth, sMonthStyle);
  }

//  spline.Dump();
  console.log(aMonth);

  // Обозначание воскресений. Тупо проходим по всем дням и отмечаем те, в которых день недели = 0 (вс) 
  if(config.bShowSundays){
    ctx.strokeStyle = 'red'; 
    for(var sun = myDataSet.X(0).getTime(); sun <= myDataSet.LastX().getTime() + hour_len_ms; sun += day_len_ms){

      var ddd = new Date(sun);
      if(!ddd.getDay()){
        var sunpos = x1 + Scaler(sun, dmin, dmax, x1, x2);
        vline(ctx, 0.5, sunpos, y2, y1);
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

function Draw(config, method, id){
  var canvas = document.getElementById(id);
  var ctx = canvas.getContext('2d');

  canvas.width = config.width;
  canvas.height = config.height;

  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, canvas.width, canvas.height); // clear canvas
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  ctx.textBaseline = 'middle';

  const vborder = 48;
  const topborder = 86, bottomborder = 32;

  var x1 = vborder, x2 = canvas.width - vborder;
  var y0 = topborder, y2 = canvas.height - bottomborder;

  let y1 = y0 + 72;

  var column = (x2 - x1) / (myDataSet.TotalDots() + 1);

  ctx.font = '16px serif';

  let maxtext = str["weight_max"]; // "максимум, кг: ",
  let mintext = str["weight_min"]; // "минимум, кг: ", 

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

  var total_loss = myDataSet.TotalLoss(nAverageWindowDays);

  let txtLossTotal = str["weight_loss_total"]; // "суммарно, кг: " 
  let txtLossFor   = str["weight_loss_for"];   // " за "
  let txtLossDays  = str["weight_loss_days"];  // " дней",

  ctx.fillText(txtLossTotal + Math.round10(total_loss, -1) + txtLossFor + 
               myDataSet.TotalDays() + txtLossDays, textstartx, textstarty + 2 * textline);

//  ctx.textAlign = 'center';
//  ctx.fillText("Метод: " + method, w / 2, textstarty);

  const samplewidth = 20;

  let dailytext = str["graph_all_points"]; // "все точки",
  let monthlytext = str["graph_month_average"]; // "усредненный",
  let weeklytext = str["graph_averaged"]; //"среднемесячный",

  let mtext = ctx.measureText(monthlytext);
  let centerwidth = samplewidth + mtext.width;

  ctx.textAlign = 'left';

  let centerleft = canvas.width/2 - centerwidth/2;

  hline(ctx, nDayWidth, centerleft, centerleft + samplewidth - 5, textstarty, sDayStyle);
  ctx.fillText(dailytext, centerleft + samplewidth, textstarty);

  if(config.nMeshSize){
    hline(ctx, nWeekWidth, centerleft, centerleft + samplewidth - 5, textstarty + textline, sWeekStyle);
    ctx.fillText(weeklytext, centerleft + samplewidth, textstarty + textline);
  }

  if(config.bDrawMonthlyGraph){
    hline(ctx, nMonthWidth, centerleft, centerleft + samplewidth - 5, textstarty + 2 * textline, sMonthStyle);
    ctx.fillText(monthlytext, centerleft + samplewidth, textstarty + 2 * textline);
  }

  var daily_loss = total_loss / myDataSet.TotalDays();

  var month_days = (365 * 3 + 366) / (4 * 12);

  ctx.textAlign = 'right';

  let txtAverageDay   = str["weight_loss_average_day"]; // "В среднем за сутки ",
  let txtAverageWeek  = str["weight_loss_average_week"]; // "В среднем за неделю ",
  let txtAverageMonth = str["weight_loss_average_month"]; // "В среднем за месяц ",

  ctx.fillText(txtAverageDay + Math.round10(daily_loss, -3) + " " + str["kg"], textendx, textstarty);
  ctx.fillText(txtAverageWeek + Math.round10(daily_loss * 7, -2) + " " + str["kg"], textendx, textstarty + textline);
  ctx.fillText(txtAverageMonth + Math.round10(daily_loss * month_days, -1) + " " + str["kg"], textendx, textstarty + 2 * textline);

  // Главные оси 
  vline(ctx, 2, x1, y1, y2);
  hline(ctx, 2, x1, x2, y2);

  // Насечки на оси У, обозначения
  for(var j = myDataSet.GetScaleMin(); j <= myDataSet.GetScaleMax(); j++){
    var y = y2 - Scaler(j, myDataSet.GetScaleMin(), myDataSet.GetScaleMax(), y1, y2);

    ctx.font = '14px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if(j != myDataSet.GetScaleMin() && j != myDataSet.GetScaleMax())
      ctx.fillText(j, vborder / 2, y);

    hline(ctx, 1, x1 - 2, x1 + 2, y);

    if(j % 5 == 0)
      hline(ctx, 0.5, x1 + 2, x2, y);
  }

  x1 += column;
  x2 -= column;

  ctx.strokeStyle = sDayStyle; 

  if(method == 'smart') 
    DrawSmart(ctx, x1, y1, x2, y2, y0, config);
  else /*(method == 'regular')*/
    DrawRegular(ctx, x1, y1, x2, y2);
}

function Update(){
  let no = str["none"];;

  let config = {};

  let size_raw = $("#size_selector")[0].value.split(' ');
  config.width = parseInt(size_raw[0], 10);
  config.height = parseInt(size_raw[2], 10);

  config.bShowSundays = $("#showsundays_selector")[0].checked;
  config.bDrawMinMaxBoxes= $("#showminmaxdots_selector")[0].checked;
  config.bDrawMinMaxLines = $("#showminmaxlines_selector")[0].checked;

  config.bDrawMonthlyGraph = $("#showmonthlygraph_selector")[0].checked;

  config.sMonthFormat = $("#monthlabels_selector")[0].value;

  let smooth = $("#smoothing_selector")[0].value;
  config.nSmoothType = (smooth == str["spline_akima"]) ? 1 :(smooth == str["spline_cubic"]) ? 2 : false;

  let m = $("#mesh_selector")[0].value;
  config.nMeshSize = m == no ? m = 0 : m;


  console.log("Update():", "config = ", config);

  Draw(config, 'smart', 'canvas2');
//  Draw(800, 600, 'regular', 'canvas3');
}

$("#mesh_selector")[0].value = nDefaultWeekDays;

$("#size_selector").bind( "change", function(e) { Update(); });
$("#mesh_selector").bind( "change", function(e) { Update(); });
$("#showsundays_selector").bind( "change", function(e) { Update(); });
$("#smoothing_selector").bind( "change", function(e) { Update(); });
$("#monthlabels_selector").bind( "change", function(e) { Update(); });
$("#showminmaxdots_selector").bind( "change", function(e) { Update(); });
$("#showminmaxlines_selector").bind( "change", function(e) { Update(); });

$("#showmonthlygraph_selector").bind( "change", function(e) { Update(); });

Update();
