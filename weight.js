// Константы времени. Менять нельзя!
const hour_len_ms = 60 * 60 * 1000;
const day_len_ms = 24 * hour_len_ms;

Date.prototype.daysInMonth = function() {
  return 33 - new Date(this.getFullYear(), this.getMonth(), 33).getDate();
};

function ZeroFill(n){
  if(n >= 10) return n;

  return "0" + n;
}

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

  Y : function (i) {
    if(!this.dataloaded) this.LoadData();

    return this.weights[i * 3 + 2];
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

// Рисуем линию, сохраняя и восстанавливая выбранный цвет и ширину в контексте
function line(ctx, w, x1, y1, x2, y2, s = false){
  var keep = ctx.lineWidth;
  var keeps = ctx.strokeStyle;

  if(s) ctx.strokeStyle = s; 

  ctx.beginPath();
  ctx.lineWidth = w;
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.strokeStyle = keeps;
  ctx.lineWidth = keep;
}

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

function DrawRegular(ctx, x1, y1, x2, y2){
  for(var x = 1; x < myDataSet.TotalDots(); x++){
    var xprev = x1 + Scaler(x - 1, 0, myDataSet.TotalDots(), x1, x2);
    var xcurr = x1 + Scaler(x, 0, myDataSet.TotalDots(), x1, x2);

    var yprev = y2 - Scaler(myDataSet.Y(x-1), myDataSet.GetScaleMin(), myDataSet.GetScaleMax(), y1, y2);
    var ycurr = y2 - Scaler(myDataSet.Y(x),   myDataSet.GetScaleMin(), myDataSet.GetScaleMax(), y1, y2);

    line(ctx, 2, xprev, yprev, xcurr, ycurr);
  }
}

function FindThis(element, index, array){
  return (this == element.number); 
}

function MakeMonthString(d){
  return ZeroFill((d.getMonth() + 1).toString()) + "." + ZeroFill((d.getFullYear() - 2000).toString());
}

function MakeMonthDate(s, day = 1){
  var a = s.split('.');

  var year = 2000 + parseInt(a[1], 10);
  var month = parseInt(a[0], 10) - 1;

  return new Date(year, month, day);
}

function GetMonthName(s){
  var month = 0;

  if (typeof s == 'string')
    month = parseInt(s.split('.')[0], 10) - 1;
  else
    month = s.getMonth();

  if(month < 0 || month > 11) return 'фигня';

  var names = [ "январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь" ];

  return names[month];
}

function IsSameMonth(s, d){
  var month = 0, year = 0;

  if (typeof s == 'string'){
    month = parseInt(s.split('.')[0], 10) - 1;
    year = 2000 + parseInt(s.split('.')[1], 10);
  }else{
    month = s.getMonth();
    year = s.getFullYear();
  }

  if(d.getMonth() == month && d.getFullYear() == year) return true;

  return false;
}

function DrawSmart(ctx, x1, y1, x2, y2, mesh = nWeekDays, show_weeks = true){

  var xmin = myDataSet.X(0).getTime();
  var xmax = myDataSet.X(myDataSet.TotalDots()-1).getTime();

  // Сначала рисуем все точки 
  for(var x = 1; x < myDataSet.TotalDots(); x++){
    var xprev = x1 + Scaler(myDataSet.X(x-1), xmin, xmax, x1, x2);
    var xcurr = x1 + Scaler(myDataSet.X(x),   xmin, xmax, x1, x2);

    var yprev = y2 - Scaler(myDataSet.Y(x-1), myDataSet.GetScaleMin(), myDataSet.GetScaleMax(), y1, y2);
    var ycurr = y2 - Scaler(myDataSet.Y(x),   myDataSet.GetScaleMin(), myDataSet.GetScaleMax(), y1, y2);

    line(ctx, nDayWidth, xprev, yprev, xcurr, ycurr);
  }

  // Теперь точки с усреднением
  ctx.strokeStyle = sWeekStyle; 
  ctx.lineWidth = nWeekWidth;
  ctx.beginPath();

  var week_len_ms = mesh * day_len_ms;
  var week_start =  myDataSet.X(0).getTime();

  var s = 0, n = 0;

  for(var i7 = 0, first = true; i7 < myDataSet.TotalDots(); i7++){
//    var ws_d = new Date(week_start);
//    var we_d = new Date(week_start + week_len_ms);

//    console.log(ws_d.toDateString(), we_d.toDateString(), myDataSet.X(i7).toDateString());
//    console.log(ws_d, we_d, myDataSet.X(i7));

    // +1 час = компенсация за перевод часов на летнее время
    if(myDataSet.X(i7).getTime() + hour_len_ms >= week_start + week_len_ms){
//      console.log("точка", ws_d.toDateString());
      var Y = s / n;
      var X = week_start + week_len_ms / 2;

      s = 0;
      n = 0;
      week_start += week_len_ms;

      var x = x1 + Scaler(X, xmin, xmax, x1, x2);
      var y = y2 - Scaler(Y, myDataSet.GetScaleMin(), myDataSet.GetScaleMax(), y1, y2);

      if(first){
        first = false;
        ctx.moveTo(x, y);
      }else
        ctx.lineTo(x, y);

    }

    s += myDataSet.Y(i7);
    n++; 
  }

  ctx.stroke();

  // Сначала строим список месяцев
  var aMonth = new Array();

  for(var i = 0; i < myDataSet.TotalDots(); i++){
    var Month = MakeMonthString(myDataSet.X(i));

    var idx = aMonth.findIndex(FindThis, Month);
    if(idx == -1){ 
      var firstday = MakeMonthDate(Month);
      var length = firstday.daysInMonth();
      var m = { 
         number : Month, // Текстовая строка вида "01.21"  
         name : GetMonthName(Month), // Название месяца словами
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

  // Рассчитываем точки помесячно и рисуем шкалу
  for(var m = 0; m < aMonth.length; m++){
    // насечки на каждом 5м дне
    for(var day = 5; day <= aMonth[m].length; day += 5){
      var fifth_x = x1 + Scaler(MakeMonthDate(aMonth[m].number, day), xmin, xmax, x1, x2);

      if(fifth_x < x1) continue;
      if(fifth_x > x2) break;

      ctx.strokeStyle = 'black'; 
      ctx.font = '12px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.fillText(day, fifth_x, y2 + 10);

      vline(ctx, 1, fifth_x, y2 - 2, y2 + 2);
    }

    // Считаем среднемесячные
    var s = 0, n = 0;
    for(var j = 0; j < myDataSet.TotalDots(); j++){
      if(IsSameMonth(aMonth[m].number, myDataSet.X(j))){
        n++;
        s += myDataSet.Y(j);
      }
    }

    var Y = s / n;
    var X = x1 + Scaler(aMonth[m].middle, xmin, xmax, x1, x2);
    if(X < x1) X = x1;
    if(X > x2) X = x2;

    aMonth[m].Y = y2 - Scaler(Y, myDataSet.GetScaleMin(), myDataSet.GetScaleMax(), y1, y2);
    aMonth[m].X = X;

    // Считаем значение на начало месяца 
    var window = 5;
    s = 0, n = 0;
    for(var j = 0; j < myDataSet.TotalDots(); j++){
      if( (myDataSet.X(j).getTime() >= aMonth[m].firstday.getTime() - day_len_ms * window) && (myDataSet.X(j).getTime() <= aMonth[m].firstday.getTime() + day_len_ms * window) ){
        n++;
        s += myDataSet.Y(j);
      }
    }

    if(n) aMonth[m].startweight = s / n;

    ctx.strokeStyle = 'gray'; 
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    if(!m){
      if(myDataSet.X(0).getDate() < 20){
        var xl = x1;
        var xr = x1 + Scaler(aMonth[m + 1].firstday, xmin, xmax, x1, x2);

        ctx.font = '24px serif';
        ctx.fillText(aMonth[m].name, (xr + xl) / 2, y1 + 10);
      }  
    }else{ 
      if(m < aMonth.length && aMonth[m - 1].startweight){
        var monthloss = Math.round10(aMonth[m].startweight - aMonth[m - 1].startweight, -1);
        var weekloss = Math.round10(monthloss * 7 / aMonth[m].length, -2);           

        var xl = x1 + Scaler(aMonth[m - 1].firstday, xmin, xmax, x1, x2);
        var xr = x1 + Scaler(aMonth[m].firstday, xmin, xmax, x1, x2);

        var txt = monthloss + " кг/мес, " + weekloss + " кг/нед ";
        ctx.font = '18px serif';
        ctx.fillText(txt, (xr + xl) / 2, y1 + 40);
      }

      if(m + 1 < aMonth.length || myDataSet.X(myDataSet.TotalDots() - 1).getDate() > 10){
        var xl = x1 + Scaler(aMonth[m].firstday, xmin, xmax, x1, x2);
        var xr = (m + 1 < aMonth.length) ? x1 + Scaler(aMonth[m + 1].firstday, xmin, xmax, x1, x2) : xr = x2;

        ctx.font = '24px serif';
        ctx.fillText(aMonth[m].name, (xr + xl) / 2, y1 + 10);
      }
    }
 
    if(m){
      ctx.strokeStyle = 'gray'; 
      var x = x1 + Scaler(aMonth[m].firstday, xmin, xmax, x1, x2);
      vline(ctx, 1, x, y1, y2);

      ctx.strokeStyle = sMonthStyle;
      line(ctx, nMonthWidth, aMonth[m - 1].X, aMonth[m - 1].Y, aMonth[m].X, aMonth[m].Y);
    }
  }

  console.log(aMonth);

  // Обозначание воскресений. Тупо проходим по всем дням и отмечаем те, в которых день недели = 0 (вс) 
  if(show_weeks){
    ctx.strokeStyle = 'red'; 
    for(var sun = myDataSet.X(0).getTime(); sun <= myDataSet.X(myDataSet.TotalDots() - 1).getTime() + hour_len_ms; sun += day_len_ms){

      var ddd = new Date(sun);
      if(!ddd.getDay()){
        var sunpos = x1 + Scaler(sun, xmin, xmax, x1, x2);
        vline(ctx, 0.5, sunpos, y2, y1 + 40);
      }
    }
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

  const average_window_days = 5;
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
  var s = $("#size_selector")[0].value;
  var m = $("#mesh_selector")[0].value;
  var week = $("#weeksshow_selector")[0].value;

  var a = s.split(' ');

//  alert(a);
  var width = parseInt(a[0], 10); 
  var height = parseInt(a[2], 10); 

//  alert(width);
//  alert(height);
  week = (week == 'отметить') ? true : false;

  Draw(width, height, m, week, 'smart', 'canvas2');
//  Draw(800, 600, 'regular', 'canvas3');
}

$("#mesh_selector")[0].value = nWeekDays;

$("#size_selector").bind( "change", function(e) { Update(); });
$("#mesh_selector").bind( "change", function(e) { Update(); });
$("#weeksshow_selector").bind( "change", function(e) { Update(); });

Update();
