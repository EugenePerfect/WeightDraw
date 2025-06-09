// Константы времени. Менять нельзя!
const hour_len_ms = 60 * 60 * 1000;
const day_len_ms = 24 * hour_len_ms;

// Скорее всего, подлежит удалению
function MatchString(s, a){
  for(let i = 0; i < a.length; i++){
    if(str[a[i]] == s) return a[i];
  }

  return false;
}

function ZeroFill(n){
  if(n >= 10) return n;

  return "0" + n;
}

Date.prototype.daysInMonth = function() {
  let d33 = new Date(Date.UTC(this.getUTCFullYear(), this.getUTCMonth(), 33));

  return 33 - d33.getUTCDate();
};

// проверяем, находится ли дата на расстоянии window или менее от date
Date.prototype.dateInRange = function(date, window) {
  let window_ms = window * day_len_ms;

  if(this.getTime() > date.getTime() + window_ms) return false;
  if(this.getTime() < date.getTime() - window_ms) return false;


  return true;
};

// Делает из даты строку вид "01.21" 
Date.prototype.MakeMonthString = function (){
  return ZeroFill((this.getUTCMonth() + 1).toString()) + "." + ZeroFill((this.getUTCFullYear() - 2000).toString());
}

// Обратная функция: создать дату из строки обозначения месяца вида "01.21"
function MakeMonthDate(s, day = 1){
  let a = s.split('.');

  let year = 2000 + parseInt(a[1], 10);
  let month = parseInt(a[0], 10) - 1;

  return new Date(Date.UTC(year, month, day));
}

// проверяем, относятся ли даты к одному месяцу. 
// Аргумент s может быть как датой, так и строкой вида "01.21" 
Date.prototype.IsSameMonth = function (s){
  let month = 0, year = 0;

  if (typeof s == 'string'){
    month = parseInt(s.split('.')[0], 10) - 1;
    year = 2000 + parseInt(s.split('.')[1], 10);
  }else{
    month = s.getUTCMonth();
    year = s.getUTCFullYear();
  }

  if(this.getUTCMonth() == month && this.getUTCFullYear() == year) return true;

  return false;
};

// Возвращает строку названия месяца
Date.prototype.GetMonthName = function (format){
  if(format == "format_month_full") return month_names[this.getUTCMonth()];

  if(format == "format_month_short") return month_short_names[this.getUTCMonth()];

  if(format == "format_month_digit") return ZeroFill(this.getUTCMonth() + 1);
     
  if(format == "format_month_year_digit") return ZeroFill(this.getUTCMonth() + 1) + "/" + ZeroFill(this.getUTCFullYear() - 2000);

  if(format == "format_month_year") return month_short_names[this.getUTCMonth()] + " " + ZeroFill(this.getUTCFullYear() - 2000);

  return names[this.getUTCMonth()];
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
function line(ctx, w, x1, y1, x2, y2, s = false, dash = false) {
  ctx.save();

  ctx.lineWidth = w;

  if(s) ctx.strokeStyle = s; 

  if(dash) ctx.setLineDash(dash);

  ctx.beginPath();

  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);

  ctx.stroke();

  ctx.restore();
};

// Рисуем горизонтальную линию, сохраняя и восстанавливая 
// выбранный цвет и ширину в контексте
function hline(ctx, w, x1, x2, y, s, dash){
  line(ctx, w, x1, y, x2, y, s, dash); 
}

// Рисуем вертикальную линию, сохраняя и восстанавливая 
// выбранный цвет и ширину в контексте
function vline(ctx, w, x, y1, y2, s, dash){
  line(ctx, w, x, y1, x, y2, s, dash); 
}

class CDataSet {
  constructor(a) {
    this.Reset();

    if(a instanceof CDataSet){ // конструктор копирования
      this.weights = a.weights; 

      this.Init();
    }

    if(a instanceof Array){ // конструктор из массива

      for(var i = 0; i < a.length / 2; i++){
        this.weights.push(a[2 * i]);
        this.weights.push(0);
        this.weights.push(a[2 * i + 1]);
      }

      this.Init();
    }
  }

  Reset () {
    this.weights = []; 

    this.yMax = 0;
    this.yMin = 100000;

    this.scale_w_min = 60;
    this.scale_w_max = 120;

    this.initdone = false;
  }

  TotalDots () { 
    return this.weights.length / 3;
  }

  GetScaleMax () {
    this.InitIfNeed();

    return this.scale_w_max;
  }

  GetScaleMin () {
    this.InitIfNeed();

    return this.scale_w_min;
  }

  GetMax () {
    this.InitIfNeed();

    return this.yMax;
  }

  GetMin () {
    this.InitIfNeed();

    return this.yMin;
  }

  TotalDays () { 
    return Math.round((this.LastX().getTime() - this.X(0).getTime()) / day_len_ms);
  }

  StartWeight (nAverageWindowDays = nDefAverageWindowDays) {
    // В случае, если всего две точки, или общее время на графике меньше "окна" усреднения на концах 
    // просто вернуть вес в первой точке без усреднения
    if(this.TotalDots() < 3 || this.TotalDays() <= nAverageWindowDays) return this.Y(0);

    const average_window_ms = nAverageWindowDays * day_len_ms;

    let start = this.X(0).getTime();
    let n = 1, s = this.Y(0);

    for(var i = 1; i < this.TotalDots(); i++){
      if(this.X(i).getTime() > start + average_window_ms)
        break;

      n++;
      s += this.Y(i);
    }

    let start_weight = s / n;
    return start_weight;
  }

  EndWeight (nAverageWindowDays = nDefAverageWindowDays) {
    // В случае, если всего две точки, или общее время на графике меньше "окна" усреднения на концах 
    // просто вернуть вес в последней точке без усреднения
    if(this.TotalDots() < 3 || this.TotalDays() <= nAverageWindowDays) return this.LastY(i);

    const average_window_ms = nAverageWindowDays * day_len_ms;

    let start = this.LastX().getTime();

    let n = 1, s = this.LastY(i);

    for(var i = this.TotalDots() - 2; i >= 0; i--){
      if(this.X(i).getTime() < start - average_window_ms){
        break;
      }

      n++;
      s += this.Y(i);
    }

    let end_weight = s/n; 
    return end_weight;
  }

  TotalLoss (nAverageWindowDays = nDefAverageWindowDays) {
    return this.EndWeight(nAverageWindowDays) - this.StartWeight(nAverageWindowDays);
  }

  X (i) {
    if(i >= this.TotalDots()) alert("CDataSet:X(",i,"): read past of array end (array size = ", this.TotalDots());

    this.InitIfNeed();

    return this.weights[i * 3 + 1];
  }

  LastX (i) {
    return this.X(this.TotalDots() - 1);
  }

  Y (i) {
    if(i >= this.TotalDots()) alert("CDataSet:Y(",i,"): read past of array end (array size = ", this.TotalDots());

    return this.weights[i * 3 + 2];
  }

  LastY (i) {
    return this.Y(this.TotalDots() - 1);
  }

  InsertPoint (day, month, year, weight) {
    let idx = this.FindDate (day, month, year);
    if(idx != -1) return -1;

    let data_txt = ZeroFill(day) + "." + ZeroFill(month) + "." + ZeroFill(year - 2000);
    let date = new Date(Date.UTC(year, month-1, day));

   
    if(!this.TotalDots() || date > this.LastX()){
      this.weights.push(data_txt);
      this.weights.push(date);
      this.weights.push(parseInt(weight, 10));
      idx = this.TotalDots() - 1;
    }else{
      for(var i = 0; i < this.TotalDots(); i++){
        if(date < this.X(i)){
          this.weights.insert(i * 3, parseInt(weight, 10));
          this.weights.insert(i * 3, date);
          this.weights.insert(i * 3, data_txt);
          idx = i;
          debugger;
          break;
        }
      }
    }

    if(idx != -1) this.ReInit();

    return idx;
  }

  FindDate (day, month, year) {
//    if(!this.TotalDots()) return -1;

    for(var i = 0; i < this.TotalDots(); i++){
      let a = this.weights[i * 3].split('.');

      let year1 = 2000 + parseInt(a[2], 10);
      let month1 = parseInt(a[1], 10);
      let day1 = parseInt(a[0], 10);

      if(year1 == year && month1 == month && day1 == day) return i;
    }

    return -1;
  }

  InitIfNeed () {
    if(!this.initdone) this.Init();
  }

  ReInit () {
    this.initdone = false;
    this.yMax = 0;
    this.yMin = 100000;

    this.scale_w_min = 60;
    this.scale_w_max = 120;

    this.Init ();
  }

  Init () {
    if(this.initdone) return;

    for(var i = 0; i < this.TotalDots(); i++){
      let a = this.weights[i * 3].split('.');

      let year = 2000 + parseInt(a[2], 10);
      let month = parseInt(a[1], 10) - 1;
      let day = parseInt(a[0], 10);

      this.weights[i * 3 + 1] = new Date(Date.UTC(year, month, day));

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
}

function Scaler(v, v_min, v_max, scr_min, scr_max){
  return (v - v_min) * (scr_max - scr_min) / (v_max - v_min);
}

class CTextStyler {
  constructor(font, fillStyle = 'black', textAlign = 'center', textBaseline = 'middle', shadowOffsetX = 0, shadowOffsetY = 0, shadowBlur = 0.0, shadowColor = "rgba(0, 0, 0, 0)") {
    if(font instanceof CTextStyler){ // конструктор копирования
      this.font = font.font;
      this.fillStyle = font.fillStyle;
      this.textAlign = font.textAlign;
      this.textBaseline = font.textBaseline;
      this.shadowOffsetX = font.shadowOffsetX;     
      this.shadowOffsetY = font.shadowOffsetY;     
      this.shadowBlur = font.shadowBlur;
      this.shadowColor= font.shadowColor;
    }else{
      this.font = font;
      this.fillStyle = fillStyle;
      this.textAlign = textAlign;
      this.textBaseline = textBaseline;
      this.shadowOffsetX = shadowOffsetX;     
      this.shadowOffsetY = shadowOffsetY;     
      this.shadowBlur = shadowBlur;
      this.shadowColor= shadowColor;
    }
  }

  fillText(ctx, text, x, y) {
    ctx.save();
    ctx.font = this.font;
    ctx.fillStyle = this.fillStyle;
    ctx.textAlign = this.textAlign;
    ctx.textBaseline = this.textBaseline;
    ctx.shadowOffsetX = this.shadowOffsetX;     
    ctx.shadowOffsetY = this.shadowOffsetY;     
    ctx.shadowBlur = this.shadowBlur;
    ctx.shadowColor= this.shadowColor;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  measureText(ctx, text){
    ctx.save();

    ctx.font = this.font;
    ctx.textAlign = this.textAlign;
    ctx.textBaseline = this.textBaseline;
    ctx.shadowOffsetX = this.shadowOffsetX;     
    ctx.shadowOffsetY = this.shadowOffsetY;     
    ctx.shadowBlur = this.shadowBlur;
    ctx.shadowColor= this.shadowColor;

    let a = ctx.measureText(text);

    ctx.restore();
    return a;
  }

}

let myDataSet = new CDataSet(myRawData);

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

let MonthStyle = new CTextStyler('bold 24px serif', 'blue', 'center', 'top', 2, 2, 2, "rgba(0, 0, 63, 0.3)");

let StatStyle  = new CTextStyler('bold 18px serif', 'black', 'center', 'top');
let StatHeader = new CTextStyler(StatStyle);
StatHeader.textAlign = 'left';

let xScaleStyle = new CTextStyler('12px serif');
let yScaleStyle = new CTextStyler('14px serif');

let LegendStyle = new CTextStyler('18px serif');

let LegendStyleR = new CTextStyler(LegendStyle);
LegendStyleR.textAlign = 'right';

let LegendStyleL = new CTextStyler(LegendStyle);
LegendStyleL.textAlign = 'left';

const nStatRow1Offset = 28;
const nStatRow2Offset = 48;

function DrawStatistics(ctx, y1, XScaler, day1, day2, monthloss, weekloss, color = 'black'){
  let xl = XScaler.Transform(day1);
  let xr = XScaler.Transform(day2);

  let StatStyle1 = new CTextStyler(StatStyle);
  StatStyle1.fillStyle = color;

  StatStyle1.fillText(ctx, monthloss, (xr + xl) / 2, y1 + nStatRow1Offset);
  StatStyle1.fillText(ctx, weekloss,  (xr + xl) / 2, y1 + nStatRow2Offset);
}

function DrawGraph(ctx, spline, XScaler, YScaler, smooth = true, nWidth = 1, StrokeStyle){
  let keepwidth = ctx.lineWidth;
  ctx.lineWidth = nWidth;

  let keepstyle = ctx.strokeStyle;
  if(typeof StrokeStyle !== 'undefined') ctx.strokeStyle = StrokeStyle;

  let keepjoin = ctx.lineJoin;
  ctx.lineJoin = 'bevel';

  console.log("DrawGraph(): spline.GetCount() = ", spline.GetCount());
  console.log("DrawGraph(): spline.GetMinX() = ", spline.GetMinX());

  ctx.beginPath();

  if(spline.type != "spline_base"){
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

  ctx.lineJoin = keepjoin;
  ctx.lineWidth = keepwidth;
  ctx.strokeStyle = keepstyle;
}

function DrawSmart(ctx, x1, y1, x2, y2, y0, config){
  let dmin = myDataSet.X(0).getTime();   
  let dmax = myDataSet.LastX().getTime();

  let XScaler = new CScaler(dmin, dmax, x1, x2);
  let YScaler = new CScaler(myDataSet.GetScaleMin(), myDataSet.GetScaleMax(), y1, y2, true);

  if(config.bDrawMinMaxLines){
    // Рисуем линию максимального веса 
    hline(ctx, 0.5, x1, x2, YScaler.Transform(myDataSet.GetMax()), "red");

    // Рисуем линию минимального веса 
    hline(ctx, 0.5, x1, x2, YScaler.Transform(myDataSet.GetMin()), "green");
  }

  // Если сглаживание не задано - используем базовый объект 
  let spline = new Spline; 

  switch(config.sSmoothType){
    case "spline_akima": spline = new AkimaSpline(); break;
    case "spline_cubic": spline = new CubicSpline(); break;
    case "spline_hermit": spline = new MonotonicCubicSpline(); break;
    case "spline_catmullrom": spline = new CatmullRomSpline(); break;
    default: break;
  }

  console.log("spline type", spline.type);

  if(config.bDrawMainGraph == "main_lines" || config.bDrawMainGraph == "main_all"){
    // Сначала рисуем ломаную через все точки 
    for(var x = 0; x < myDataSet.TotalDots(); x++)
      spline.AddValue(myDataSet.X(x).getTime(), myDataSet.Y(x));

    DrawGraph(ctx, spline, XScaler, YScaler, config.nSmoothType, nDayWidth);

    spline.Dump();
  }

  // Теперь сами точки, если необходимо, квадратиками
  if(config.bDrawMainGraph == "main_dots" || config.bDrawMainGraph == "main_all"){
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

    let summWeek = 0, n = 0;

    for(let i7 = 0; i7 < myDataSet.TotalDots(); i7++){

    // +1 час = компенсация за перевод часов на летнее время
      if(myDataSet.X(i7).getTime() + hour_len_ms >= week_start + week_len_ms){
//      console.log("точка", ws_d.toDateString());
        var Y = summWeek / n;
        var X = week_start + week_len_ms / 2;

        if(n)
          spline.AddValue(X, Y);

        summWeek = 0;
        n = 0;
        week_start += week_len_ms;

        // Хак для случая пустой недели, чтобы не дублировать проверки 
        i7--;
        continue;
      }

      summWeek += myDataSet.Y(i7);
      n++; 
    }

    console.log("Weekly spline done");
    spline.Dump();
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
  StatHeader.fillText(ctx, str["kgmonth"], 5, y0 + nStatRow1Offset);
  StatHeader.fillText(ctx, str["kgweek"],  5, y0 + nStatRow2Offset);

  // Фаза 1: Рассчитываем точки помесячно и рисуем шкалу по оси Х
  for(let m = 0; m < aMonth.length; m++){
    // Считаем среднемесячные значение (по всем точкам за конкретный месяц)
    let s = 0, n = 0;
    for(let j = 0; j < myDataSet.TotalDots(); j++){
      if(myDataSet.X(j).IsSameMonth(aMonth[m].number)){
        n++;
        s += myDataSet.Y(j);
      }
    }

    let Y = n ? s / n : 0;

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
  }

  // Фаза 2: Собственно, все пишем и рисуем
  for(let m = 0; m < aMonth.length; m++){
    const nMonthNamePos = y0;

    // насечки на каждом 5м дне
    for(let day = 5; day <= aMonth[m].length; day += 5){
      let fifth_x = XScaler.Transform(MakeMonthDate(aMonth[m].number, day));

      if(fifth_x < x1) continue;
      if(fifth_x > x2) break;

      xScaleStyle.fillText(ctx, day, fifth_x, y2 + 10);

      vline(ctx, 1, fifth_x, y2 - 2, y2 + 2);
    }

    if(!m){ // Для первого месяца пишем название только в случае, 
            // если начало данных приходится на 20е число или ранее; 
            // статистика за этот месяц не считается 
      if(myDataSet.X(0).getUTCDate() <= 20){
        let xl = x1;
        let xr = XScaler.Transform(aMonth[m + 1].firstday);

        MonthStyle.fillText(ctx, aMonth[m].name, (xr + xl) / 2, nMonthNamePos);

        if(aMonth.length > 1 && myDataSet.X(0).getUTCDate() <= 15 && aMonth[m + 1].startweight){
          // Число дней
          let days = (aMonth[m + 1].firstday - myDataSet.X(0)) / day_len_ms;
          // Потеряно килограмм
          let loss = aMonth[m + 1].startweight - myDataSet.StartWeight(nDefAverageWindowDays);
          // В день терялось
          let dailyloss = loss / days; 

          // Прогноз за целый месяц
          let monthloss = Math.round10(dailyloss * aMonth[m].length, -1);
          let weekloss = Math.round10(dailyloss * 7, -2);           

          DrawStatistics(ctx, y0, XScaler, myDataSet.X(0), aMonth[m + 1].firstday, monthloss, weekloss, 'gray');

        }
      }  
    }else{ 
      // Вывод статистики за предыдущий месяц
      if(m < aMonth.length && aMonth[m - 1].startweight){
        // Различие: "потеря за месяц" = потеря за календарный месяц
        let monthloss = Math.round10(aMonth[m].startweight - aMonth[m - 1].startweight, -1);
        // "потеря за неделю" = считается из предыдущего показателя в пересчете на 7 дней
        // в отличие от "потери за месяц" - это сравнимые показатели, 
        // т.к. влияние разной длины месяца нивелируется
        let weekloss = Math.round10(monthloss * 7 / aMonth[m].length, -2);           

        DrawStatistics(ctx, y0, XScaler, aMonth[m - 1].firstday, aMonth[m].firstday, monthloss, weekloss);
        
        console.log("aMonth.length = ", aMonth.length);
        console.log("m = ", m);
        console.log(aMonth[m]);
      }

      // Название пишем для следущего месяца и только для того случая, когда последняя точка это 15 число или далее
      if(m + 1 < aMonth.length || myDataSet.LastX().getUTCDate() > 15){
        let xl = XScaler.Transform(aMonth[m].firstday);
        let xr = (m + 1 < aMonth.length) ? XScaler.Transform(aMonth[m + 1].firstday) : x2;

        MonthStyle.fillText(ctx, aMonth[m].name, (xr + xl) / 2, nMonthNamePos);

        // Для последнего неполного месяца 
        if(m + 1 == aMonth.length){
          // Число дней
          let days = (myDataSet.LastX() - aMonth[m].firstday) / day_len_ms;
          // Потеряно килограмм
          let loss = myDataSet.EndWeight(nDefAverageWindowDays) - aMonth[m].startweight;
          // В день терялось
          let dailyloss = loss / days; 

          // Прогноз за целый месяц
          let monthloss = Math.round10(dailyloss * aMonth[m].length, -1);
          let weekloss = Math.round10(dailyloss * 7, -2);           

          DrawStatistics(ctx, y0, XScaler, aMonth[m].firstday, myDataSet.LastX(), monthloss, weekloss, 'gray');
        }
      }
    }

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
  let canvas = document.getElementById(id);
  let ctx = canvas.getContext('2d');

  canvas.width = config.width;
  canvas.height = config.height;

  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, canvas.width, canvas.height); // clear canvas
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  // Если точек мало - ничего не рисуем, пишем сообщение; размер шрифта подбираем максимально возможный
  if(myDataSet.TotalDots() < 2){
    let strFont1 = 'bold ';
    let strFont2 = 'px serif';
    let nFontSize = 384;
    let ErrorStyle = new CTextStyler(strFont1 + nFontSize + strFont2, 'red', 'center', 'middle', 2, 2, 2, "rgba(0, 0, 63, 0.3)");
    let txtError = str["error_need_more_dots"];

    for(;;){
      ErrorStyle.font = strFont1 + nFontSize + strFont2;
      let sizeError = ErrorStyle.measureText(ctx, txtError);
     // console.log("ErrorStyle.font = ", ErrorStyle.font, " sizeError.width = ", sizeError.width, 
     //             " canvas.width = ", canvas.width, " sizeError.height = ", sizeError.height, 
     //             " canvas.height = ", canvas.height, sizeError)
      if(sizeError.width > canvas.width || sizeError.height > canvas.height){
        nFontSize /= 2;
      }else
        break;
    }

    ErrorStyle.fillText(ctx, txtError, canvas.width / 2, canvas.height / 2);
    return;
  }

  const vborder = 48;
  const topborder = 86, bottomborder = 32;

  let x1 = vborder, x2 = canvas.width - vborder;
  let y0 = topborder, y2 = canvas.height - bottomborder;

  let y1 = y0 + 72;

  let column = (x2 - x1) / (myDataSet.TotalDots() + 1);

  // -----------------------------------------------
  // выводим статистику и образцы линий над графиком 
  // -----------------------------------------------

  const textstartx = 10;
  const textstarty = 20;

  let textendx = canvas.width - textstartx;

  // Межстрочное расстояние
  const nLineHeight = 20;


  // -----------------------------------------------
  // выводим максимальный, минимальный вес, и общую потерю

  let txtMax = str["weight_max"]; // "максимум, кг: ",
  let txtMin = str["weight_min"]; // "минимум, кг: ", 

  // Вычисляем максимальную ширину подписей для выравнивания значений
  let sizeMaxText = LegendStyleL.measureText(ctx, txtMax);
  let sizeMinText = LegendStyleL.measureText(ctx, txtMin);
  let nCaptionWidth = Math.max(sizeMaxText.width, sizeMinText.width);

  let second_col_x = textstartx + nCaptionWidth;

  // Выводим максимальный и минимальный вес - без усреднения!
  LegendStyleL.fillText(ctx, txtMax, textstartx, textstarty);
  LegendStyleL.fillText(ctx, myDataSet.GetMax(), second_col_x, textstarty);

  LegendStyleL.fillText(ctx, txtMin, textstartx, textstarty + nLineHeight);
  LegendStyleL.fillText(ctx, myDataSet.GetMin(), second_col_x, textstarty + nLineHeight);

  // Вычисляем общую потерю веса (разница между усреднеными за nDefAverageWindowDays 
  // начальным и конечным весом)
  let total_loss = myDataSet.TotalLoss(nDefAverageWindowDays);

  let txtLossTotal = str["weight_loss_total"]; // "суммарно, кг: " 
  let txtLossFor   = str["weight_loss_for"];   // " за "
  let txtLossDays  = str["weight_loss_days"];  // " дней",

  LegendStyleL.fillText(ctx, txtLossTotal + Math.round10(total_loss, -1) + txtLossFor + 
               myDataSet.TotalDays() + txtLossDays, textstartx, textstarty + 2 * nLineHeight);


  // -----------------------------------------------
  // рисуем образцы разных линий по центру

  const nLineSampleWidth = 20;

  let dailytext = str["graph_all_points"]; // "все точки",
  let monthlytext = str["graph_month_average"]; // "усредненный",
  let weeklytext = str["graph_averaged"]; //"среднемесячный",

  let mtext = ctx.measureText(monthlytext);
  let centerwidth = nLineSampleWidth + mtext.width;

  let centerleft = canvas.width/2 - centerwidth/2;

  hline(ctx, nDayWidth, centerleft, centerleft + nLineSampleWidth - 5, textstarty, sDayStyle);
  LegendStyleL.fillText(ctx, dailytext, centerleft + nLineSampleWidth, textstarty);

  if(config.nMeshSize){
    hline(ctx, nWeekWidth, centerleft, centerleft + nLineSampleWidth - 5, textstarty + nLineHeight, sWeekStyle);
    LegendStyleL.fillText(ctx, weeklytext, centerleft + nLineSampleWidth, textstarty + nLineHeight);
  }

  if(config.bDrawMonthlyGraph){
    hline(ctx, nMonthWidth, centerleft, centerleft + nLineSampleWidth - 5, textstarty + 2 * nLineHeight, sMonthStyle);
    LegendStyleL.fillText(ctx, monthlytext, centerleft + nLineSampleWidth, textstarty + 2 * nLineHeight);
  }

  if(1){
    console.log("Draw(): TotalDays() = ", myDataSet.TotalDays(), "TotalDots() = ", myDataSet.TotalDots());
  }

  // -----------------------------------------------
  // справа выводим срежднемесячное,"за неделю" и среднесуточная потеря веса  

  var daily_loss = total_loss / myDataSet.TotalDays();

  var month_days = (365 * 3 + 366) / (4 * 12); // 

  let txtAverageDay   = str["weight_loss_average_day"]; // "В среднем за сутки ",
  let txtAverageWeek  = str["weight_loss_average_week"]; // "В среднем за неделю ",
  let txtAverageMonth = str["weight_loss_average_month"]; // "В среднем за месяц ",

  LegendStyleR.fillText(ctx, txtAverageDay + Math.round10(daily_loss * 1000, -1) + " " + str["g"], textendx, textstarty);
  LegendStyleR.fillText(ctx, txtAverageWeek + Math.round10(daily_loss * 7, -2) + " " + str["kg"], textendx, textstarty + nLineHeight);
  LegendStyleR.fillText(ctx, txtAverageMonth + Math.round10(daily_loss * month_days, -1) + " " + str["kg"], textendx, textstarty + 2 * nLineHeight);

  // Главные оси 
  vline(ctx, 2, x1, y1, y2);
  hline(ctx, 2, x1, x2, y2);

  // Насечки на оси У, обозначения
  for(var j = myDataSet.GetScaleMin(); j <= myDataSet.GetScaleMax(); j++){
    var y = y2 - Scaler(j, myDataSet.GetScaleMin(), myDataSet.GetScaleMax(), y1, y2);

    if(j != myDataSet.GetScaleMin() && j != myDataSet.GetScaleMax())
      yScaleStyle.fillText(ctx, j, vborder / 2, y);

    hline(ctx, 1, x1 - 2, x1 + 2, y);

    if(j % 5 == 0)
      hline(ctx, 0.5, x1 + 2, x2, y);
    else
      hline(ctx, 0.2, x1 + 2, x2, y, ctx.strokeStyle, [1, 5]);
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
  let config = {};

  let size_raw = $("#size_selector")[0].value.split(' ');
  config.width = parseInt(size_raw[0], 10);
  config.height = parseInt(size_raw[2], 10);

  config.bShowSundays = $("#showsundays_selector")[0].checked;

  let minmax = $("select#minmax_selector")[0].value;
  config.bDrawMinMaxBoxes = (minmax == "minmax_all" || minmax == "minmax_dots") ? true : false;
  config.bDrawMinMaxLines = (minmax == "minmax_all" || minmax == "minmax_lines") ? true : false;

  config.bDrawMainGraph = $("select#main__selector")[0].value;

  config.bDrawMonthlyGraph = $("#showmonthlygraph_selector")[0].checked;

  config.sMonthFormat = $("#monthlabels_selector")[0].value;

  config.sSmoothType = $("#smoothing_selector")[0].value;

  config.nMeshSize = parseInt($("#mesh_selector").val() || 0, 10);

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

$("#minmax_selector").bind( "change", function(e) { Update(); });
$("#main__selector").bind( "change", function(e) { Update(); });

$("#showmonthlygraph_selector").bind( "change", function(e) { Update(); });

// Удаление всех данных 
$("#data_reset").bind( "click", function(e) { 
  if(confirm(str["warn_delete_data"])){
    myDataSet.Reset(); 
    Update(); 
  }
});

// Загрузка демонстрационных данных из data.js 
$("#data_demo").bind("click", function(e) { 
  if(confirm(str["warn_load_sample_data"])){
    myDataSet = new CDataSet(myRawData);
    Update(); 
  }
});

// Добавление замера веса 
$("#data_add").bind("click", function(e) { 
  let d = $("input#data_add_date")[0].value;
  if(d == ""){
    alert(str["error_no_date_entered"]);
    return;
  }

  let weight = $("input#data_add_weight")[0].value;
  if(weight == ""){
    alert(str["error_no_weight_entered"]);
    return;
  }

  let a = d.split('-');

  let year = parseInt(a[0], 10);
  let month = parseInt(a[1], 10);
  let day = parseInt(a[2], 10);

  weight = parseInt(weight, 10);

  let data_rus = ZeroFill(day) + "." + ZeroFill(month) + "." + year;

  let idx = myDataSet.FindDate(day, month, year);

  if(idx != -1){
    alert("Ошибка ввода: для даты " + data_rus + " уже введен вес " + myDataSet.Y(idx));
    return;
  }

  if(myDataSet.TotalDots() && (weight > myDataSet.GetMax() + 10 || weight < myDataSet.GetMin() - 10))
    if(!confirm("Подсказка: вводимый вес более чем на 10 кг отличается от ранее введенных значений. Все равно добавить?"))
      return;

  let data = new Date(Date.UTC(year, month-1, day)); 
  if(myDataSet.TotalDots() && (data.getTime() < myDataSet.X(0).getTime() - day_len_ms * 30 || data.getTime() > myDataSet.LastX().getTime() + day_len_ms * 30)){
/*
    let xmin = myDataSet.X(0);
    let xmax = myDataSet.LastX();

    let t0 = data.getTime();
    let t1 = myDataSet.X(0).getTime();
    let t2 = myDataSet.LastX().getTime();


    debugger;*/
    if(!confirm("Подсказка: вводимая дата более чем на 30 дней отличается от ранее введенных. Все равно добавить?"))
      return;
  }

  myDataSet.InsertPoint(day, month, year, weight);

  if(myDataSet.TotalDots() == 1)
    alert("Подсказка: введите еще одну точку для отображения графика");

  Update(); 
});

Update();
