//  Clear 'cm' cells [all at once].jsx

/*
    
Если в обработанной таблице оказались grep-запросы для строк, в которых есть ссылка 'см.', то эту информацию надо из ячеек удалить.
Делается это данным скриптом.

Искомый вариант сокращения определён в переменной sampleCm.

Когда курсор в ячейке, скрипт найдёт первое  "см." в какой-то строке ниже той, в которой был курсор при запуске программы.
Скрипт очищает в строке ячейки с второй по пятую. 
После этого скрипт в первой колонке следующих строк ищет очередное "см." и снова очищает в строке ячейки с второй по пятую.
И так до конца таблицы. Это обработка таблицы за один раз, и это отражено в названии, там есть all at once]

Есть вариант этого скрипта, в котором ищутся ячейки с "см.", выделяются, но обрабатываются только при повторном запуске программы.
В названии такого варианта пошаговой обработки есть  [one to one].

*/

// © Михаил Иванюшин, 2020-2023  |  dotextok@gmail.com  |  dotextok.ru

#include "../ForIndex.jsxinc"

var sampleCm = " см\\."; // предполагается, что ищется такой вариант ссылки: пробел, сокращение строчными буквами, потом точка.
var programTitul = "Очистка ячеек строки с адресацией 'см.'";
if (app.documents.length == 0) {
    alert("Нет открытого документа.", programTitul);
    exit();
    }
var sel = app.selection[0];
if (sel == null || sel.constructor.name != "InsertionPoint" || sel.parent.constructor.name != "Cell") {
    alert("Курсор должен быть в ячейке.", programTitul);
    exit();
    }
var table = sel.parent.parent;
var rowsNum = table.rows.length;
var row = sel.parent.parentRow;
var rowIndex = row.index;
if (row.cells.length != 5) {
    alert("Предполагается, что в таблице пять колонок.", programTitul);
    exit();    
    }
var cellCont;
var rez;
var pBar = new ProgressBar(programTitul);
pBar.reset("", rowsNum - rowIndex);
for (var r = rowIndex; r < rowsNum; r++, pBar.hit()) { // r++
    row = table.rows[r];
    cellCont = row.cells[0].texts[0].contents;   
    rez = cellCont.match(sampleCm);
    if (rez == null) continue;    
    for (var i = 1; i < 5; i++) row.cells[i].texts[0].contents = ""; 
    } // r++
pBar.close();
exit();
