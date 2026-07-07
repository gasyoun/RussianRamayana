//  UseReadyTable.jsx

#targetengine "UseReadyTable"
//#include "ForIndex.jsxinc"
#include "../ForIndex.jsxinc"
/*
// 20/11/2022.    Добавлен анализ текста второй колонки: если там есть точка с запятой, считаем её разделителем равнозначных терминов, синонимов.
// В этом случае строка  с синонимами дублируется, чтобы иметь столько строк, сколько найдено синонимов. И во второй ячейке остаётся по одному синониму.

// 02.02.2023 -- добавлена проверка наличия непрерывности представленных уровней.
// если есть термин уровня 4, а выше уровень 1, то создаются строки с уровнями 2 и 3, и в них вмеcто термина прочерк (тире)
// то же самое для 4-2 и 3-1
// прочерк - переменная noLevel, SpecialCharacters.emDash в файле ForIndex.jsxinc

// 06.11.2024 
// добавлено удаление точки с запятой в конце текста ячейки. Иногда остаётся в разметке.
// все случаи указания слова со строчной буквы переделываются в поиск с учётом строчной и прописной, т.е. без учёта регистра: (?i).
// А если с прописной, то поиск только прописной, то есть с учётом регистра: (?-i).

21.11.2024
Переделана обработка строк, в которых варианты через точку с запятой.
Теперь все варианты в одном grep-запросе.

Слова отсортированы в порядке убывания длины. Добавлены метасимволы границы слова.

Эта строка проверяется - если есть вертикальный разделитель, то grep не делается

ЭТОТ СКРИПТ ДЛЯ РАМАЯНЫ!

// © Михаил Иванюшин, 2020-2023  |  dotextok@gmail.com  |  dotextok.ru
*/
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll; // см. http://adobeindesign.ru/2008/10/24/restore-ui/

var programTitul = "Преобразование таблицы-двухколонника в файл IndexList";
if (app.documents.length == 0) {
    alert("Нет открытого документа.", programTitul);
    exit();
    }
var capitals = "QWERTYUIOPASDFGHJKLZXCVBNMЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮ";
var doc = app.activeDocument;
var noName = false;
var myDocPath;
try { myDocPath = doc.filePath; } // если документ не сохранён, маршрут не сообщается
catch(e) {
   alert("Это только что созданный и ещё ни разу не сохранённый файл.\nДайте ему имя.",programTitul);   
   noName = true;
    }
if (noName) {
    try { doc.save(); }
    catch (e) {
         alert("Файл не был сохранён с новым именем");
        exit(); 
        }
    }
var sel = app.selection[0];
if (sel == null || sel.constructor.name != "InsertionPoint" || sel.parent.constructor.name != "Cell") {
    alert("Поставьте курсор в ячейку таблицы.", programTitul);
    exit();
    }
var table = sel.parent.parent;
if (table.parent.overflows) {
    alert("В вёрстке не должно быть вытесненного текста.", programTitul);
    exit();    
    }
if (table.columns.length != 2) {
    alert("Это должна быть таблица с двумя колонками: 'термин' - 'вариант термина в тексте'.", programTitul);
    exit();    
    }
if (doc.paragraphStyleGroups.item(indStyleGroup).isValid == false) {
    alert("Не найдена группа абзацных стилей '" + indStyleGroup + "'.", programTitul);
    exit();       
    }
if (doc.paragraphStyleGroups.item(indStyleGroup).paragraphStyles.item(indStyle1).isValid == false) {
    alert("В группе абзацных стилей '" + indStyleGroup + "' нет стиля " + indStyle1 + ".", programTitul);
    exit();      
    }
if (doc.paragraphStyleGroups.item(indStyleGroup).paragraphStyles.item(indStyle2).isValid == false) {
    alert("В группе абзацных стилей '" + indStyleGroup + "' нет стиля " + indStyle2 + ".", programTitul);
    exit();      
    }
if (doc.paragraphStyleGroups.item(indStyleGroup).paragraphStyles.item(indStyle3).isValid == false) {
    alert("В группе абзацных стилей '" + indStyleGroup + "' нет стиля " + indStyle3 + ".", programTitul);
    exit();      
    }
if (doc.paragraphStyleGroups.item(indStyleGroup).paragraphStyles.item(indStyle4).isValid == false) {
    alert("В группе абзацных стилей '" + indStyleGroup + "' нет стиля " + indStyle4 + ".", programTitul);
    exit();      
    }
if (doc.paragraphStyleGroups.item(indStyleGroup).paragraphStyles.item("#PageShow").isValid == false) {
    alert("В группе абзацных стилей '" + indStyleGroup + "' нет стиля #PageShow.", programTitul);
    exit();      
    }
var txtCell = table.cells[0].texts[0].contents;
if ((txtCell.indexOf("\\") != -1) || (txtCell.indexOf("\t") != -1)) {
    alert("В первой ячейке не должно быть символов обратной наклонной черты или табуляции, указывающих, что это термин второго или следующих уровней.", programTitul);
    exit();     
    }
var myDateS = new Date;
var myHourS = myDateS.getHours();
if (myHourS <10) myHourS = "0" + myHourS;
var myMinuteS = myDateS.getMinutes();
if (myMinuteS <10) myMinuteS = "0" + myMinuteS;
var timeS = " [" + myHourS + ":" + myMinuteS + "]";
myDocPath = doc.filePath;
var tableRowsLength = table.rows.length;
var pBar = new ProgressBar(programTitul + timeS + " (число строк: " + tableRowsLength + ")");
var found, tPoz;
var rez = -1;
pBar.reset("1/6 Стилевое оформление уровней указателя", tableRowsLength);
//for (var i = 0; i < tableRowsLength; i++, pBar.hit()) { // i++
// просмотр в порядке убывания - чтобы сразу обнаружить случайно оказавшуюся в конце пустую строку.
for (var i = tableRowsLength-1; i >= 0; i--, pBar.hit()) { // i++    
    
//  удаление точки с запятой в конце текста ячейки.
app.findGrepPreferences = NothingEnum.nothing;
app.changeGrepPreferences = NothingEnum.nothing;
app.findGrepPreferences.findWhat = ";\\h*$"; 
app.changeGrepPreferences.changeTo = "";
//rez = table.rows[i].cells[1].texts[0].changeGrep(); // почему-то иногда не работает
if (table.rows[i].cells[1].texts[0].length != 0) rez = table.rows[i].cells[1].texts[0].changeGrep();
// if (table.rows[i].cells[1].texts[0].length != 0) $.writeln(i + " | " + table.rows[i].cells[1].texts[0].contents + " | " + rez.length);

    txtCell = table.rows[i].cells[0].texts[0];
    if (txtCell.length == 0 || txtCell.contents == "\\") {
        pBar.close();
        table.rows[i].cells[0].select();
        app.activeWindow.activePage = app.selection[0].texts[0].insertionPoints[0].parentTextFrames[0].parentPage;
        alert("В первой колонке не должно быть пустых ячеек. Пустые строки должны быть удалены. Сейчас найденная проблемная ячейка выделена.", programTitul);
        exit();            
        }
    txtCell.characters.itemByRange(0, txtCell.length-1).appliedCharacterStyle = app.activeDocument.characterStyles[0];
    app.findGrepPreferences = NothingEnum.nothing;
    app.changeGrepPreferences = NothingEnum.nothing;
    app.findGrepPreferences.findWhat = "\\t";  
    found = txtCell.findGrep();
    if (found.length > 0) { // found.length > 0
        if (found.length > 3) { // >3
            pBar.close();
            table.rows[i].cells[0].select();     
            app.activeWindow.activePage = app.selection[0].texts[0].insertionPoints[0].parentTextFrames[0].parentPage;            
            alert("В указателе не может быть больше четырёх уровней вложения. Ячейка с ошибкой подготовки данных (много знаков табуляции) выделена.", programTitul);
            exit();           
            }  // >3
        else { /// else tab
            if (found.length == 1) table.rows[i].cells[0].texts[0].appliedParagraphStyle = doc.paragraphStyleGroups.item(indStyleGroup).paragraphStyles.item(indStyle2);
            else if (found.length == 2) table.rows[i].cells[0].texts[0].appliedParagraphStyle = doc.paragraphStyleGroups.item(indStyleGroup).paragraphStyles.item(indStyle3);
            else table.rows[i].cells[0].texts[0].appliedParagraphStyle = doc.paragraphStyleGroups.item(indStyleGroup).paragraphStyles.item(indStyle4);
            tPoz = table.rows[i].cells[0].texts[0].contents.lastIndexOf("\t");
            txtCell.characters.itemByRange(0,tPoz).remove();
            txtCell = table.rows[i].cells[0].texts[0];
            txtCell.contents = removeStartSpace(txtCell); // учёт нелепой ситуации, что после табуляции были пробелы             
            continue;
            }  /// else tab
        } // found.length > 0
    ////
    app.findGrepPreferences = NothingEnum.nothing;
    app.changeGrepPreferences = NothingEnum.nothing;
    app.findGrepPreferences.findWhat = "\\";  
    found = txtCell.findGrep();
    if (found.length > 0) { // found.length > 0
        if (found.length > 3) { // >3
            pBar.close();            
            table.rows[i].cells[0].select();   
            app.activeWindow.activePage = app.selection[0].texts[0].insertionPoints[0].parentTextFrames[0].parentPage;            
            alert("В указателе не может быть больше четырёх уровней вложения. Ячейка с ошибкой подготовки данных (много символов обратной наклонной черты) выделена.", programTitul);
            exit();           
            }  // >3
        else { /// else slash
            if (testStyleName (table.rows[i].cells[0].texts[0].appliedParagraphStyle) == 0) continue; 
            if (found.length == 1) table.rows[i].cells[0].texts[0].appliedParagraphStyle = doc.paragraphStyleGroups.item(indStyleGroup).paragraphStyles.item(indStyle2);
            else if (found.length == 2) table.rows[i].cells[0].texts[0].appliedParagraphStyle = doc.paragraphStyleGroups.item(indStyleGroup).paragraphStyles.item(indStyle3);
            else table.rows[i].cells[0].texts[0].appliedParagraphStyle = doc.paragraphStyleGroups.item(indStyleGroup).paragraphStyles.item(indStyle4);
            tPoz = table.rows[i].cells[0].texts[0].contents.lastIndexOf("\\");
            txtCell.characters.itemByRange(0,tPoz).remove(); // служебный знак наклонной черты удален
            txtCell = table.rows[i].cells[0].texts[0];
            txtCell.contents = removeStartSpace(txtCell); // учёт нелепой ситуации, что после обратного слеша были пробелы             
            continue;            
            } /// else slash
        }  // found.length > 0
    if (testStyleName (table.rows[i].cells[0].texts[0].appliedParagraphStyle) == 0) continue; 
    table.rows[i].cells[0].texts[0].appliedParagraphStyle = doc.paragraphStyleGroups.item(indStyleGroup).paragraphStyles.item(indStyle1);   
    } // i++
// pBar.close();
///
pBar.reset("2/6 Приведение текста в порядок", tableRowsLength);
for (var i = 0; i < tableRowsLength; i++, pBar.hit()) { // i++
txtCell = table.rows[i].cells[0].texts[0]; // тут не contents, а вся информация
if (txtCell.length == 0) {
    pBar.close();
    table.rows[i].cells[0].select();
    app.activeWindow.activePage = app.selection[0].texts[0].insertionPoints[0].parentTextFrames[0].parentPage;    
    alert("Первая ячейка не должна быть пустой. Требующая внимания ячейка выделена.", programTitul);
    exit();     
    }
if (table.rows[i].cells[1].texts[0].length == 0) {
    table.rows[i].cells[1].texts[0].contents = txtCell.contents;
    }
app.findGrepPreferences = NothingEnum.nothing;
app.changeGrepPreferences = NothingEnum.nothing;
app.findGrepPreferences.findWhat = "[~m~>~f~|~S~s~<~/~.~3~4~%]{1,}";
app.changeGrepPreferences.changeTo = " "; 
txtCell.changeGrep(); // заменили шпации на пробелы
//
txtCell = table.rows[i].cells[1].texts[0];
app.findGrepPreferences = NothingEnum.nothing;
app.changeGrepPreferences = NothingEnum.nothing;
app.findGrepPreferences.findWhat = "[~m~>~f~|~S~s~<~/~.~3~4~%]{1,}";
app.changeGrepPreferences.changeTo = " "; 
txtCell.changeGrep(); // заменили шпации на пробелы
/////
txtCell = table.rows[i].cells[0].texts[0];
app.findGrepPreferences = NothingEnum.nothing;
app.changeGrepPreferences = NothingEnum.nothing;
app.findGrepPreferences.findWhat = "^ *\\r+";
app.changeGrepPreferences.changeTo = ""; 
txtCell.changeGrep(); // удалили переводы строки в начале текста ячейки
//
txtCell = table.rows[i].cells[1].texts[0];
app.findGrepPreferences = NothingEnum.nothing;
app.changeGrepPreferences = NothingEnum.nothing;
app.findGrepPreferences.findWhat = "^ *\\r+";
app.changeGrepPreferences.changeTo = ""; 
txtCell.changeGrep(); // удалили переводы строки в начале текста ячейки
//////
txtCell = table.rows[i].cells[0].texts[0];
app.findGrepPreferences = NothingEnum.nothing;
app.changeGrepPreferences = NothingEnum.nothing;
app.findGrepPreferences.findWhat = "\\r+ *$";
app.changeGrepPreferences.changeTo = ""; 
txtCell.changeGrep(); // удалили переводы строки в конце текста ячейки
//
txtCell = table.rows[i].cells[1].texts[0];
app.findGrepPreferences = NothingEnum.nothing;
app.changeGrepPreferences = NothingEnum.nothing;
app.findGrepPreferences.findWhat = "\\r+ *$";
app.changeGrepPreferences.changeTo = ""; 
txtCell.changeGrep(); // удалили переводы строки в конце текста ячейки
//////
txtCell = table.rows[i].cells[0].texts[0];
app.findGrepPreferences = NothingEnum.nothing;
app.changeGrepPreferences = NothingEnum.nothing;
app.findGrepPreferences.findWhat = " +$";
app.changeGrepPreferences.changeTo = ""; 
txtCell.changeGrep();   // удалили пробел в конце строки
//
txtCell = table.rows[i].cells[1].texts[0];
app.findGrepPreferences = NothingEnum.nothing;
app.changeGrepPreferences = NothingEnum.nothing;
app.findGrepPreferences.findWhat = " +$";
app.changeGrepPreferences.changeTo = ""; 
txtCell.changeGrep();   // удалили пробел в конце строки
/////
txtCell = table.rows[i].cells[0].texts[0];
txtCell.contents = removeStartSpace(txtCell); // удалили пробел в начале строки
///
txtCell = table.rows[i].cells[1].texts[0];
txtCell.contents = removeStartSpace(txtCell);
///////
txtCell = table.rows[i].cells[0].texts[0];
app.findGrepPreferences = NothingEnum.nothing;
app.changeGrepPreferences = NothingEnum.nothing;
app.findGrepPreferences.findWhat = "(\\u\\.)(\\u\\.)";
app.changeGrepPreferences.changeTo = "$1 $2";
txtCell.changeGrep();  // пробел между слипшимися инициалами
///
txtCell = table.rows[i].cells[1].texts[0];
app.findGrepPreferences = NothingEnum.nothing;
app.changeGrepPreferences = NothingEnum.nothing;
app.findGrepPreferences.findWhat = "(\\u\\.)(\\u\\.)";
app.changeGrepPreferences.changeTo = "$1 $2";
txtCell.changeGrep();  // пробел между слипшимися инициалами
////
// иногда текст второй ячейки -- это дубль первой ячейки. Убираем всё, что между началом текста и последним знаком табуляции или обратным слешем
txtCell = table.rows[i].cells[1].texts[0];
app.findGrepPreferences = NothingEnum.nothing;
app.changeGrepPreferences = NothingEnum.nothing;
app.findGrepPreferences.findWhat = "\\t";  
found = txtCell.findGrep();
if (found.length > 0) { // found.length > 0
    tPoz = table.rows[i].cells[1].texts[0].contents.lastIndexOf("\t");
    txtCell.characters.itemByRange(0,tPoz).remove();
    txtCell = table.rows[i].cells[1].texts[0];
    txtCell.contents = removeStartSpace(txtCell); // учёт нелепой ситуации, что после табуляции были пробелы               
    } // found.length > 0
txtCell = table.rows[i].cells[1].texts[0];
app.findGrepPreferences = NothingEnum.nothing;
app.changeGrepPreferences = NothingEnum.nothing;
app.findGrepPreferences.findWhat = "\\";  
found = txtCell.findGrep();
if (found.length > 0) { // found.length > 0
    tPoz = table.rows[i].cells[1].texts[0].contents.lastIndexOf("\\");
    txtCell.characters.itemByRange(0,tPoz).remove();
    txtCell = table.rows[i].cells[1].texts[0];
    txtCell.contents = removeStartSpace(txtCell);              
    } // found.length > 0  
} // i++
// pBar.close();
///
var sepArr = [];
var newRow;
pBar.reset("3/6 Обработка синонимов искомых терминов", tableRowsLength);
for (var i = tableRowsLength-1; i >= 0 ; i--, pBar.hit()) { // i--
txtCell = table.rows[i].cells[1].texts[0]; // тут не contents, а вся информация
app.findGrepPreferences = NothingEnum.nothing;
app.changeGrepPreferences = NothingEnum.nothing;
app.findGrepPreferences.findWhat = "\\h*;\\h*";
app.changeGrepPreferences.changeTo = ";"; 
var rz = txtCell.changeGrep(); 
//if (rz.length == 0) continue; // == 0 значит, в строке нет точки с запятой как разделителя синонимов
var txtCellCont = table.rows[i].cells[1].texts[0].contents;
while (sepArr.length > 0) sepArr.pop();
sepArr = table.rows[i].cells[1].texts[0].contents.split(";");
var ok = true;
for (var s = 0; s < sepArr.length; s++) { // s++
    if (sepArr[s].length > 0) continue;
    ok = false;
    break;
    } // s++
if (ok == false) {
    pBar.close();
    table.rows[i].cells[1].select();
    app.activeWindow.activePage = table.rows[i].cells[1].texts[0].insertionPoints[0].parentTextFrames[0].parentPage; 
    app.activeWindow.zoomPercentage = 150;   
    alert("В одной из ячеек неправильное использование разделителей синонимов. Эта ячейка выделена."); // если вдруг по привычке постаят точку с запятой в конце строки, например. Или окажутся две подряд точки с запятой. Трудно предусмотреть все слчаи защиты от дурака, это самые простые.
    exit();
    }
sepArr.sort (function (a,b) {
at = a.length;
bt = b.length;
return at < bt }
);
////
txtCell.contents = "";
if (sepArr.length == 1) txtCell.contents = "\\b(" + sepArr[0]; else txtCell.contents = "(\\b" + sepArr[0];
for (var r = 1; r < sepArr.length; r++) { txtCell.texts[0].contents += "\\b|\\b" + sepArr[r]; }
txtCell.texts[0].insertionPoints[-1].contents = "\\b)";

try { if (capitals.match(txtCell.texts[0].characters[1].contents) != null) txtCell.texts[0].insertionPoints[0].contents = "(?-i)"; else txtCell.texts[0].insertionPoints[0].contents = "(?i)"; }
catch (e) { txtCell.texts[0].insertionPoints[0].contents = "(?i)"; }
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
app.findGrepPreferences.findWhat = " ";
//app.changeGrepPreferences.changeTo = "\\h";
var rez = txtCell.texts[0].findGrep();
if (rez.length > 0) { 
    for (var ii = rez.length-1; ii>= 0; ii--) {
        a=0;
        rez[ii].contents = "\\h"; 
        }
    }

/*
table.rows[i].cells[1].texts[0].contents = sepArr[0];
for (var s = 1; s < sepArr.length; s++) { // s++
    newRow = table.rows.add(LocationOptions.AFTER, table.rows[i]);   
    newRow.autoGrow = true;
    newRow.cells[0].texts[0].contents = table.rows[i].cells[0].texts[0].contents;    
    newRow.cells[1].texts[0].contents = sepArr[s];
    }  // s++
*/
} // i--

tableRowsLength = table.rows.length; // число строк могло стать больше, если есть разделители терминов в тексте ячеек второй колонки
//var pBar = new ProgressBar(programTitul + timeS + " (число строк: " + tableRowsLength + ")");
////
function removeStartSpace(txtCell) { // removeStartSpace
app.findGrepPreferences = NothingEnum.nothing;
app.changeGrepPreferences = NothingEnum.nothing;
app.findGrepPreferences.findWhat = "^ +";
app.changeGrepPreferences.changeTo = ""; 
txtCell.changeGrep(); // удалили пробел в начале строки
return txtCell.contents;
}  // removeStartSpace
///
function testStyleName (pStyle) { // testStyleName
// часть текста могла быть оформлена стилями прежде чем обнаружилась ошибка.  
// Будет ошибкой повторно их присваивать, т.к. могли быть уже удалены символы обратной наклонной черты -- маркеры следующего уровня индексного указателя. 
var stName = pStyle.name;
if (stName == indStyle1 || stName == indStyle2 || stName == indStyle3 || stName == indStyle4) return 0;
else return null;
} // testStyleName
///

table.columns.add(LocationOptions.AFTER, table.columns[0]); // для символа № (или #, не важно)
table.columns[1].width = "9mm";
table.columns[1].cells.everyItem().texts[0].justification = Justification.CENTER_JUSTIFIED;
table.columns[1].cells.everyItem().texts[0].contents = "№";
table.columns[1].cells.everyItem().texts[0].appliedParagraphStyle = doc.paragraphStyleGroups.item(indStyleGroup).paragraphStyles.item("#PageShow");
table.columns.add(LocationOptions.AFTER, table.columns[2]); // для символьных стилей
table.columns.add(LocationOptions.AFTER, table.columns[3]); // для терминов без grep-запросов
table.columns[3].width = "10mm";
doc.documentPreferences.pageHeight = "210mm";
doc.documentPreferences.pageWidth = "297mm";
doc.marginPreferences.bottom = "10mm";
doc.marginPreferences.left = "10mm";
doc.marginPreferences.right = "10mm";
doc.marginPreferences.top = "10mm";
doc.documentPreferences.facingPages =  false;
doc.pages[0].marginPreferences.bottom = "10mm";
doc.pages[0].marginPreferences.left = "10mm";
doc.pages[0].marginPreferences.right = "10mm";
doc.pages[0].marginPreferences.top = "10mm";
///

pBar.reset("4/6 Подготовка grep-запросов для каждого термина", tableRowsLength);
var words = [];
var lastWord = [];
for (var i = 0; i < tableRowsLength; i++, pBar.hit()) { // i++
    table.rows[i].cells[4].texts[0].contents = table.rows[i].cells[2].texts[0].contents;

/*
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
app.findGrepPreferences.findWhat = "\\|";
var fr = table.rows[i].cells[2].texts[0].findGrep();
if (fr.length != 0) continue;
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
app.findGrepPreferences.findWhat = "\\b(";
var fr = table.rows[i].cells[2].texts[0].findGrep();
if (fr.length != 0) continue;
   
    while (words.length > 0) words.shift();
    words = table.rows[i].cells[2].texts[0].contents.split(" ");
    ///=>> если в разметке знаком подчёркивания и числом уже отмечены  совпадающие термины, то эта проверка исключит попадание номеров в grep-запрос
    while (lastWord.length > 0) lastWord.pop();
    lastWord = words[words.length-1].split("_");
    if (lastWord.length == 2 &&  "0123456789".match(lastWord[1]) != null) words[words.length-1] = lastWord[0]; // знака подчёркивания и номера в слове для получения grep-запроса нет
    ///=>>
    var wordsCount = words.length;
    for (w = 0; w < wordsCount; w++) { // w++
        if (words[w].length < 3) continue;
        //words[w] = getWord (words, false, false, w, 0); // последний параметр -- просто для количества: опция учета действия. theAction, в процедуре getWord появилась позже. И тут действие уточнять не надо
        words[w] = getWord (words, false, true, w, 0); // последний параметр -- просто для количества: опция учета действия. theAction, в процедуре getWord появилась позже. И тут действие уточнять не надо
        } // w++
    table.rows[i].cells[2].texts[0].contents = words.join(sepSpace);
    // если термине поиска были точки, то их надо отметить наклоными чертами, иначе они искаться не будут.
    app.findGrepPreferences = null; 
    app.changeGrepPreferences = null;
    app.findChangeGrepOptions.includeFootnotes = false;
    app.findGrepPreferences.findWhat = "\\.";
    app.changeGrepPreferences.changeTo = "\\.";
    table.rows[i].cells[2].texts[0].changeGrep();
    app.findGrepPreferences = null; 
    app.changeGrepPreferences = null;
/// поиск не работает, если \b стоит перед кавычкой, поэтому его надо убрать
    app.findGrepPreferences = null; 
    app.changeGrepPreferences = null;
    app.findChangeGrepOptions.includeFootnotes = false;
    app.findGrepPreferences.findWhat = "(\\\\b)([\\'\\\"])"; // для указания \b в grep-запросе надо четыре обратных черты
    app.changeGrepPreferences.changeTo = "$2";
    table.rows[i].cells[2].texts[0].changeGrep();
    app.findGrepPreferences = null; 
    app.changeGrepPreferences = null;
    */
    } // i++

// pBar.close();
///
var rowIndexesOfThisTerm = {}; // индексы строк с одинаковыми терминами
var nextIndexForTerm = {}; // индекс для следующего такого термина. 
var term;
var safedNum, rN, termsAreSame, startIndx, arLine, strCompare;
var indAr = [];
var sep = "!@#$%"; // думаю, не встретится терминов, именно так начинающихся. Поэтому такой разделитель можно использовать, не боясь совпаднния с текстом.
//var pBar = new ProgressBar(programTitul + " (предполагается, что термины идут во алфавиту)");
pBar.reset("5/6 Поиск одинаковых терминов. Найденные будут отмечены номерами: 'Термин=1', 'Термин=2', и т.п.", tableRowsLength);
for (var i = 0; i < tableRowsLength; i++, pBar.hit()) { // i++
    term = table.rows[i].cells[0].texts[0].contents;
    if (rowIndexesOfThisTerm[term] == undefined) { rowIndexesOfThisTerm[term] = i; continue; }    
    else { // else
        // Совпадение терминов -- это повод сравнить их запросы. Если запросы совпадают, то терминам надо добавить индексы.
        // Индексы строк с данным термином хранятся в массиве rowIndexesOfThisTerm. "Индексы строк" -- это строка номеров строк, разделённых разделителем sep.
        termsAreSame = true;
        while (indAr.length > 0) indAr.pop();
        indAr = String(rowIndexesOfThisTerm[term]).split(sep);
        indAr.push(i);
        startIndx = 0;
        for (var s = 0; s < indAr.length; s++) { // s++
            for (var d = startIndx; d < indAr.length; d++) { // d++
                if (d == s) continue;
                strCompare = table.rows[indAr[s]].cells[2].texts[0].contents == table.rows[indAr[d]].cells[2].texts[0].contents;   
                if (strCompare == true) continue;
                termsAreSame = false;
                break;
                } // d++
            if (termsAreSame) startIndx++; else break;
            } // s++
        if (termsAreSame == true) { // termsAreSame
            if (nextIndexForTerm[term] == undefined) { // undefined
                table.rows[i].cells[0].texts[0].contents = table.rows[i].cells[0].texts[0].contents + "=2";
                rN = String(rowIndexesOfThisTerm[term]).split(sep)[0];
                table.rows[rN].cells[0].texts[0].contents = table.rows[rN].cells[0].texts[0].contents + "=1";
                nextIndexForTerm[term] = 3;
                } // undefined
            else { ///-
                safedNum = nextIndexForTerm[term];
                 table.rows[i].cells[0].texts[0].contents = table.rows[i].cells[0].texts[0].contents + "=" + String(safedNum);
                 safedNum++;
                 nextIndexForTerm[term] = safedNum;
                }  ///-
            } // else
        arLine = indAr.join(sep);
        rowIndexesOfThisTerm[term] = arLine;
        }  // termsAreSame
    } // i++
///
pBar.reset("6/6 Поиск пропущенных уровней", tableRowsLength);
var prevStyleIndex = table.rows[tableRowsLength-1].cells[0].texts[0].appliedParagraphStyle.name.split(indStyleName)[1];
var diff;  
for (var i = tableRowsLength-2; i > 0; i--, pBar.hit()) { // i--
    var curStyleIndex = table.rows[i].cells[0].texts[0].appliedParagraphStyle.name.split(indStyleName)[1];
    diff = prevStyleIndex - curStyleIndex;
    if (diff <= 1) {     
        prevStyleIndex = curStyleIndex;
        continue;   
        }
    if (diff == 2) { // == 2 
         // == 2 - значит, пропущен один уровень
        var nomer1 = prevStyleIndex-1;
        var stName1 = indStyleName + nomer1;
        var newRow = table.rows.add(LocationOptions.AFTER, table.rows[i]);
        newRow.autoGrow = true;
        newRow.cells[0].texts[0].contents = noLevel;    
        newRow.cells[1].texts[0].contents = "";
        newRow.cells[0].texts[0].appliedParagraphStyle = doc.paragraphStyleGroups.item(indStyleGroup).paragraphStyles.item(stName1);
        prevStyleIndex = curStyleIndex;
        continue;
        } // == 2
    if (diff == 3) { // == 3 
         // == 3 - значит, пропущены два уровня. Тут без вариантов: второй и третий
        var newRow = table.rows.add(LocationOptions.AFTER, table.rows[i]);
        newRow.autoGrow = true;
        newRow.cells[0].texts[0].contents = noLevel;    
        newRow.cells[1].texts[0].contents = "";
        newRow.cells[0].texts[0].appliedParagraphStyle = doc.paragraphStyleGroups.item(indStyleGroup).paragraphStyles.item(indStyle3);
        var newRow = table.rows.add(LocationOptions.AFTER, table.rows[i]);
        newRow.autoGrow = true;
        newRow.cells[0].texts[0].contents = noLevel;    
        newRow.cells[1].texts[0].contents = "";
        newRow.cells[0].texts[0].appliedParagraphStyle = doc.paragraphStyleGroups.item(indStyleGroup).paragraphStyles.item(indStyle2);        
        prevStyleIndex = curStyleIndex;     
        } // == 3
    } // i--
// pBar.close();

pBar.info("Уточнение правил поиска слов, начинающихся со строчных или с прописных букв")
// все случаи указания слова со строчной буквы переделываются в поиск с учётом строчной и прописной, т.е. без учёта регистра: (?i).
// А если с прописной, то поиск только прописной, то есть с учётом регистра: (?-i).
app.findGrepPreferences = NothingEnum.nothing;
app.changeGrepPreferences = NothingEnum.nothing;
app.findTextPreferences = NothingEnum.nothing;
app.changeTextPreferences = NothingEnum.nothing;
app.findTextPreferences.findWhat = '\\b';
app.changeTextPreferences.changeTo = '@##@';
doc.changeText();
app.findTextPreferences = NothingEnum.nothing;
app.changeTextPreferences = NothingEnum.nothing;

app.findGrepPreferences.findWhat = "(@##@)(\\l)"; 
app.changeGrepPreferences.changeTo = "$1(?i)$2";
doc.changeGrep();
app.findGrepPreferences = NothingEnum.nothing;
app.changeGrepPreferences = NothingEnum.nothing;
app.findGrepPreferences.findWhat = "(@##@)(\\u)"; 
app.changeGrepPreferences.changeTo = "$1(?-i)$2";
doc.changeGrep();
app.findGrepPreferences = NothingEnum.nothing;
app.changeGrepPreferences = NothingEnum.nothing;

app.findTextPreferences.findWhat= '@##@';
app.changeTextPreferences.changeTo= '\\b';
doc.changeText();
app.findTextPreferences = NothingEnum.nothing;
app.changeTextPreferences = NothingEnum.nothing;
///> 29.11.2024
// обнаружилась ошибка: если в слове только одна падежная форма, то указатель выбора регистра обраюотки -- (?i) или (?-i) -- перед словом не ставится.
// Обойдусь без прогресс-бара, это очень редкая ошибка.
var _grep, setReg = "(?i)";
var _ar = [];
var _grCont = "";
for (var i = 0; i < tableRowsLength; i++) { // i++
    _grep = table.rows[i].cells[2].texts[0];
    if (_grep.contents.split("|").length > 1) continue;
    try { if (capitals.match(_grep.characters[7].contents) != null) setReg = "(?-i)"; else setReg = "(?i)"; }
    catch (e) { setReg = "(?i)"; }
    _ar = _grep.contents.split("(");
    _grCont = "(?i)(\\b" + setReg + _ar[2];
    table.rows[i].cells[2].texts[0].contents = _grCont;
    } // i++
///>
table.recompose();
rowIndexesOfThisTerm = null;
nextIndexForTerm = null;
///
pBar.info("Сохранение созданной таблицы IndexList, на это требуется некоторое время");
/*
var fileList = Folder (myDocPath).getFiles(searchMaskN); 
var f_List = [];
while (f_List.length > 0) f_List.pop();
if (fileList.length == 0) rez = "001";
else { /// > 0
    for (f = 0; f < fileList.length; f++) { // f++
       var fListItem = decodeURI(fileList[f]);
       var splitRez = fListItem.split("IndexList")[1].split(".indd")[0];
       var nutUsed = 1;
       if (splitRez[0] == "[") nutUsed = 3;
        rez = Number(splitRez.substring(nutUsed, splitRez.length));
        // не все файлы в этой папке, имя которых начинается с IndexList, являются рабочими таблицами, в имени которых есть номер. Поэтому нужна проверка isNaN()
        if (isNaN(rez) == false) f_List.push(rez);         
        } // f++
    if (f_List.length > 0) { // f_List.length > 0
        f_List.sort (function (a,b) { return a < b } );
        rez = f_List[0];
        rez++;
        if (rez < 10) rez = "00" + String(rez);
        else if ((rez > 9) &&  (rez < 100)) rez = "0" + String(rez);
        else rez = String(rez);
        } // f_List.length > 0
    else rez = "001";
    } /// > 0
*/
//var tblFile = "IndexList-" + rez + ".indd";
var tblFile = "IndexList-000" + ".indd"; // 26.11.2024
doc.save(File(myDocPath + "/" + tblFile));
pBar.close();

var myDateF = new Date;
var myHourF = myDateF.getHours();
var myMinuteF = myDateF.getMinutes();
var h, m, t;
h = myHourF - myHourS;
m = myMinuteF - myMinuteS;
t = Number(h*60) + Number(m);
alert("Таблица сохранена с именем '" + tblFile + "'.\r\rВремя обработки: " + t + " мин." ,programTitul);
exit();


