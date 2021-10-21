// Ширина и цвет линии "все точки"
const nDayWidth = 2;
const sDayStyle = 'blue'; 
const nDrawDots = true;

// Ширина и цвет линии "среднемесячная"
const nMonthWidth = 9;
const sMonthStyle = 'rgba(255, 55, 55, 0.2)';

// Ширина и цвет линии "усредненная"
const nWeekWidth = 6;
const sWeekStyle = 'rgba(65, 65, 255, 0.3)';

// Ширина сетки усреднения по умолчанию. 
// Этой цифрой инициализируется соответствующее поле в интерфейсе. 
const nDefaultWeekDays = 5;

// Количество дней, которые учитываются в усреднении "старта" и "конца"
const nAverageWindowDays = 5;

// Размах "окна" в днях, за сколько дней до и после конца месяца учитывается вес 
// для подсчетов потери веса за месяц и за неделю (помесячная статистика сверху графика) 
const nMonthStartCalculateWindow = 5;
