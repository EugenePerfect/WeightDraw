let overscale = 0.3;

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

    // Физические точки
    let dots = x2 - x1 + 1;

    console.log("x1 = ", x1, "x2 = ", x2, "dots = ", dots);

    let delta = (xt2 - xt1)/(2 * dots);

    console.log("delta = ", delta);
    console.log("xt1 + delta = ", xt1 + delta);

//    ctx.moveTo(x1, YScaler.Transform(spline.GetY(0)));
    ctx.moveTo(x1, YScaler.Transform(spline.Approximate(xt1)));

//    for(let xxx = xt1 + delta; xxx < xt2; xxx += delta)
//      ctx.lineTo(XScaler.Transform(xxx), YScaler.Transform(spline.Approximate(xxx)));

    for(let xx = 1; xx < 2 * dots - 1; xx++){
      let xxx = (xx / 2 - x1) * (xt2 - xt1) / dots;
      ctx.lineTo(XScaler.Transform(xxx), YScaler.Transform(spline.Approximate(xxx)));
    }

//    ctx.lineTo(XScaler.Transform(spline.GetX(last)), YScaler.Transform(spline.GetY(last)));
    ctx.lineTo(XScaler.Transform(spline.GetX(last)), YScaler.Transform(spline.Approximate(spline.GetX(last))));

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

function UpdateGraph(spline){
  let minx = spline.GetMinX();
  let maxx = spline.GetMaxX();

  let miny = Number.MAX_VALUE;
  let maxy = Number.MIN_VALUE;

  for(let i = 0; i < spline.length; i++){
    if(spline.GetY(i) > maxy) maxy = spline.GetY(i);
    if(spline.GetY(i) < miny) miny = spline.GetY(i);
  }

  let miny1 = miny - (maxy - miny) * overscale;
  let maxy1 = maxy + (maxy - miny) * overscale;

  console.log("datax", datax);
  console.log("datay", datay);

  console.log("minx", minx);
  console.log("maxx", maxx);
  console.log("miny", miny);
  console.log("maxy", maxy);

  console.log("miny1", miny1);
  console.log("maxy1", maxy1);

  spline.Dump();

  let canvas = document.getElementById("canvas");
  var ctx = canvas.getContext('2d');

  canvas.width = 800;
  canvas.height = 600;

  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, canvas.width, canvas.height); // clear canvas
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  ctx.textBaseline = 'middle';

  let x1 = 0, x2 = canvas.width - 1;
  let y1 = 0, y2 = canvas.height - 1;

  var XScaler = new CScaler(minx, maxx, x1, x2);
  var YScaler = new CScaler(miny1, maxy1, y1, y2, true);

  DrawGraph(ctx, spline, XScaler, YScaler, false);
  DrawGraph(ctx, spline, XScaler, YScaler, true, 2, "blue");
}

function Update(){
  let spline = splines[$("#smoothing_selector")[0].value];

  UpdateGraph(spline);
}

$("#smoothing_selector").bind( "change", function(e) { Update(); });

let datax = [ 1, 2, 3, 4, 5];
let datay = [ 1, 2.5, 3, 2.5, 1];

let splineAkima = new AkimaSpline();
let splineCubic = new CubicSpline();
let splineCubic2 = new CubicSpline2();
let splineCubic3 = new CubicSpline3();

// Инициализируем все сплайны сразу
for(let i = 0; i < datax.length; i++){
  splineAkima.AddValue(datax[i], datay[i]);
  splineCubic.AddValue(datax[i], datay[i]);
  splineCubic2.AddValue(datax[i], datay[i]);
  splineCubic3.AddValue(datax[i], datay[i]);
}

let splines = [];

splines['Сплайн Akima'] = splineAkima;
splines['Кубический сплайн'] = splineCubic;
splines['Кубический сплайн 2'] = splineCubic2;
splines['Кубический сплайн 3'] = splineCubic3;

Update();

// 31