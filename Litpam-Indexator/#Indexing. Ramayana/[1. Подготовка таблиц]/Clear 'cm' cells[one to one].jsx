//  Clear 'cm' cells[one to one].jsx

/*
    
Если в обработанной таблице оказались grep-запросы для строк, в которых есть ссылка 'см.', то эту информацию надо из ячеек удалить.
Делается это данным скриптом.

Искомый вариант сокращения определён в переменной sampleCm.

В нем два режима запуска:
1. Запуск, когда курсор в ячейке. Скрипт найдёт первое  "см." в какой-то строке ниже той, в которой был курсор при запуске программы.
Эта ячейка выделяется, строка показывается на экране, и на этом скрипт завершает работу.
2. Запуск при выделенной ячейке.
Скрипт очищает в строке ячейки с второй по пятую. 
После этого скрипт в первой колонке следующих строк ищет очередное "см." и выделяет эту ячейку. 
Строка с выделенной ячейкой показывается на экране, и на этом скрипт завершает работу.

Повторный запуск приведёт в порядок ячейки, стоящие в той строке, где выделен текст, и будет найдена следующая строка с ячейкой с такой же ссылкой, т.е. будет повторен вариант "2" работы скрипта.

Так надо будет пройти по всем строкам, где есть 'см.'  Такой режим работы обработки  по одной ячейке отражён и названии, там есть [one to one]. Вариант этой программы, в названии которой [all at once] -- обработка всех таких строк за один запуск программы.

*/

// © Михаил Иванюшин, 2020-2023  |  dotextok@gmail.com  |  dotextok.ru

var sampleCm = " см\\."; // предполагается, что ищется такой вариант ссылки: пробел, сокращение строчными буквами, потом точка.
var programTitul = "Очистка ячеек строки с адресацией 'см.'";
if (app.documents.length == 0) {
    alert("Нет открытого документа.", programTitul);
    exit();
    }
var sel = app.selection[0];
if (sel == null || (sel.constructor.name != "Text" && sel.constructor.name != "Paragraph" && sel.constructor.name != "InsertionPoint") || sel.parent.constructor.name != "Cell") {
    alert("Или курсор должен быть в ячейке, или должен быть выделен текст ячейки, в котором есть '" + sampleCm + "'.", programTitul);
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
if (sel.constructor.name == "InsertionPoint") { // InsertionPoint
    rowIndex = rowIndex+1;
    cellCont = "";
    for (var ii = rowIndex; ii < rowsNum; ii++) { // ii++
        cellCont = table.rows[ii].cells[0].texts[0].contents;
        rez = cellCont.match(sampleCm);
        if (rez == null) continue;
        table.rows[ii].cells[0].texts[0].select();
        app.activeWindow.activePage = app.selection[0].parentTextFrames[0].parentPage;
        exit();
        } // ii++
        app.documents[0].select(NothingEnum.nothing);
        alert("В первой колонке не найдено ни одной ячейки, в тексте которой есть '" + sampleCm + "'.", programTitul);
        exit();    
    } // InsertionPoint
for (var i = 1; i < 5; i++) row.cells[i].texts[0].contents = "";
rowIndex = rowIndex+1;
var notFound = true;
cellCont = "";
for (var ii = rowIndex; ii < rowsNum; ii++) { // ii++
    cellCont = table.rows[ii].cells[0].texts[0].contents;
    rez = cellCont.match(sampleCm);
    if (rez == null) continue;
    table.rows[ii].cells[0].texts[0].select();
    app.activeWindow.activePage = app.selection[0].parentTextFrames[0].parentPage;
    notFound = false;
    break;
    } // ii++
if (notFound) {
    app.documents[0].select(NothingEnum.nothing);    
    alert("Не найдена строка с ячейкой в первой колонке, в тексте которой есть '" + sampleCm + "'. Похоже, вся таблица обработана.", programTitul);   
    }
exit();
