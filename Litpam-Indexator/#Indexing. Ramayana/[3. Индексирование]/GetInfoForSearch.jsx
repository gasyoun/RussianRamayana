//  GetInfoForSearch.jsx.

#targetengine "GetInfoForSearch"
#include "../ForIndex.jsxinc" 

// добавлены флажки установки учета регистра
// 29.11.2022 убран флажок textForSearch

// © Михаил Иванюшин, 2020-2023  |  dotextok@gmail.com  |  dotextok.ru

app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll; // см. http://adobeindesign.ru/2008/10/24/restore-ui/

var programTitul = "Уточнение grep-запросов";
if (app.documents.length == 0) {
    alert("Нет открытых документов.", programTitul);
    exit();
    }
var mySel = app.selection[0];
if (mySel == null  || ((mySel.parent.constructor.name != "Cell") && (mySel.constructor.name != "Cell")  && (mySel.constructor.name != "Table"))) {
    alert("Поставьте курсор в ячейку таблицы.", programTitul);
    exit();
    }
var haveMarker = false;
var doc = app.activeDocument;
var nameArr = [];
while (nameArr.length != 0) nameArr.pop();
nameArr = doc.name.split("IndexList");
if (nameArr.length != 2) {
     alert("Предполагается, что будет обрабатываться файл, имя которого выглядит так: IndexList-nnn.indd, но открытый файл этому критерию не соответствует.",programTitul);
    exit();     
    }
if (nameArr[1][0] != "-") haveMarker = true; // два варианта названия IndexList файла: IndexList-001.jsx и IndexList[R]001.jsx. Когда дефиса нет, то в названии файла есть маркер, т.е. haveMarker = true
var stepToShow = 20; // на прогресс-баре будет отображаться не каждое изменение параметра, а с шагом 20 ||  30.10  или 50, если число строк в диапазоне 501-1000, если больше, то шаг будет 100
///
var pR = -1;
var rN = -1;
var cN;
var cellText;
var text;
var myWin = myScriptWindow();
myWin.show();
///////////////////////////////////////////////////////
function myScriptWindow() { // myScriptWindow   
var buttonSize = [0, 0, 380, 28];
var buttonSizeLittle = [0, 0, 350, 28];
//var buttonSizeShort = [0, 0, 250, 28];
var myDefSetNameWName = "SearchMainWindow.ini";
var win = new Window ("palette", programTitul);
var winLocation = [-1, -1];
useFamily = false;
var myScriptFile = myGetScriptPath();
var myDefSetNameW  =  myDefSetNameWName; // где окно программы на экране
var myScriptFolder = decodeURI(myScriptFile.path);
var myFilePathW = decodeURI(myScriptFolder + "/sets/" + myDefSetNameW); 
var myDataFileW = new File (myFilePathW);
if (myDataFileW.exists) { //File.exists
    myDataFileW.open("r");
    winLocation[0] = myDataFileW.readln();
    winLocation[1] = myDataFileW.readln();
    myDataFileW.close();
    } //File.exists
if (winLocation[0] != -1) win.location = winLocation;
win.alignChildren = ["fill", "fill"];
var padezhGroup = win.add("group");
padezhGroup.orientation = "row";
padezhGroup.alignChildren = ["fill", "center"];
var hideWin = padezhGroup.add("button", [0,0,28,28], "…");
hideWin.helpTip = "Свернуть окно";
var onePadezh = padezhGroup.add("radiobutton", undefined, "Именительный падеж");
var allPadezh = padezhGroup.add("radiobutton", undefined, "Все падежные формы");
allPadezh.value = true;
separator_q = padezhGroup.add ("panel");
separator_q.minimumSize.width = separator_q.maximumSize.width = 0;
separator_q.alignment = ["fill", "fill"];
var grChRb = padezhGroup.add ("group");
grChRb.orientation = "column";
var chGroup = grChRb.add("group");
chGroup.orientation = "row";
var rbGroup = grChRb.add("group"); 
rbGroup.orientation = "row";
rbGroup.enabled = false;
var useAccent = chGroup.add("checkbox");
useAccent.helpTip = "Флажок надо устанавливать только если в данном термине есть знак ударения. Флажок устанавливается перед нажатием кнопки \"Изменить в grep-запросе вариант учёта падежа\"";
var setUpDown = chGroup.add("checkbox");
//setUpDown.helpTip = "Этот флажок-кнопка для выбранных строк с grep-запросами изменяет вариант учёта регистра при поиске или удаляет эту команду:\r(?-i) — с учётом регистра,\r(?i)  —  без учёта регистра,\rкоманда удалена.\rПри каждом нажатии переключение в следующее из трёх возможных состояний. Переключение учёта регистра выполнятся, начиная с текущей установки этого флажка в ячейке с grep-запросом.";
setUpDown.helpTip = "Флажок-кнопка для того, чтобы сделать доступными радиокнопки выбора варианта учёта регистра. Эти кнопки определяют вариант учёта регистра во всех выбранных ячейках в колонке с grep-запросами.";
var caseNo = rbGroup.add("radiobutton");
caseNo.value = true;
caseNo.helpTip = "Проверка без учёта регистра, обозначается (?i). Это стандартная установка выполнения grep-запросов.";
var caseYes = rbGroup.add("radiobutton");
caseYes.helpTip = "Проверка с учётом регистра, (?-i).";
separator_0 = win.add ("panel");
separator_0.minimumSize.height = separator_0.maximumSize.height = 1;
var btnAndChkbx = win.add("group");
btnAndChkbx.orientation = "row";
btnAndChkbx.alignChildren = ["right", "center"]; // bottom
// 29.11.2022 флажок textForSearch убран. При наличии исходного текста в правой ячейке в нём нужды уже нет. А возможность включить/выключить только путает.
//~ var textForSearch = btnAndChkbx.add("checkbox");
//~ textForSearch.value = true;
//~ textForSearch.helpTip = "Если флажок сброшен, то сначала в ячейку третьей колонки копируется текст из ячейки первой колонки, а потом формируется grep-запрос. Если этот флажок установлен, то в ячейку третьей колонки копируется текст из крайней правой колонки, и после этого изменяется grep-запрос текста.";
var changePadezh = btnAndChkbx.add("button", buttonSizeLittle, "Изменить в grep-запросе вариант учёта падежа"); // theAction = 0
//var usePunct = btnAndChkbx.add("checkbox", undefined, ".,:;?!…");
var usePunct = btnAndChkbx.add("checkbox");
usePunct.value = false;
usePunct.helpTip = "Когда этот флажок сброшен, это стандартное состояние, из grep-запроса исключаются знаки пунктуации. Они могут быть в тексте термина, но только мешают при поиске.\rЕсли эти символы всё же нужны, то надо установить этот флажок и подготовить grep-запрос заново.";
var buttonAndCheckbox = win.add("group");
buttonAndCheckbox.orientation = "row";
buttonAndCheckbox.alignChildren = ["fill", "center"];
var family = buttonAndCheckbox.add("checkbox");
family.value = useFamily;
if (simpleSearch) family.enabled = false;
family.helpTip = "Когда этот флажок установлен, кнопка 'Слово — обычный текст' меняет название на 'Слово — это фамилия'. После этого щелчок на кнопке 'Слово — это фамилия' добавит окончания к словам, исходя из предположения, что это фамилии.\rЕсли в файле установок 'ForIndex.jsxinc' выбран режим обработки simpleSearch = true, то этот флажок не работает.";
var firstWordContent = buttonAndCheckbox.add("button", buttonSizeLittle, "Слово — обычный текст");// theAction = 1
var fwOnly = buttonAndCheckbox.add("checkbox");
fwOnly.value = false;
fwOnly.helpTip = "Этот флажок-кнопка оставляет в выбранных ячейках колонки с grep-запросами только первое слово.";
/////
setUpDown.onClick = function () { // setUpDown.onClick
if (setUpDown.value) rbGroup.enabled = true; else rbGroup.enabled = false;
}  // setUpDown.onClick
////
var caseNoState = false;
var caseYesState = false;
var pRprev = -10;
var rNprev = -10;
var caseMes = "Для определения учёта регистра надо выбрать ячейки в колонке с grep-запросами.";
caseNo.onClick = function () { // caseNo.onClick
var cells = app.selection[0];
if (cells.constructor.name == "InsertionPoint" && cells.parent.constructor.name == "Cell") {
    cells.parent.select();
    cells = app.selection[0];
    }
if (cells.constructor.name != "Cell" || cells.columns.length !=1) {
    alert(caseMes, programTitul);
    return;
    }
pR = cells.cells[0].parentRow.index;
rN = cells.rows.length;
cN = cells.parentColumn.index;
if (caseNoState == true && pRprev == pR && rNprev == rN) return; // повторное нажатие на ту же кнопку, без изменения выборки ячеек для обработки
pBar = new ProgressBar(programTitul); 
pBar.reset("", rN);
for (var i = 0; i < rN; i++, pBar.hit()) { // i++
    cellText = cells.rows[i].cells[cN].texts[0].contents;
    if (cellText.indexOf("(?-i)") != -1) { // "?-i"      
        text = cellText.split("(?-i)")[1];
        cells.rows[i].cells[cN].texts[0].contents = "(?i)" + text;
        continue;
        } // "?-i"
    else if (cellText.indexOf("(?i)") != -1) { continue; }      
    else { cells.rows[i].cells[cN].texts[0].contents ="(?i)" + cellText; }    
    } // i++
pBar.close();
caseNoState = true;
caseYesState = false;
pRprev = pR;
rNprev = rN;
} // caseNo.onClick
/////
caseYes.onClick = function () { // caseYes.onClick
var cells = app.selection[0];
if (cells.constructor.name == "InsertionPoint" && cells.parent.constructor.name == "Cell") {
    cells.parent.select();
    cells = app.selection[0];
    }
if (cells.constructor.name != "Cell" || cells.columns.length !=1) {
    alert(caseMes, programTitul);
    return;
    }
pR = cells.cells[0].parentRow.index;
rN = cells.rows.length;
cN = cells.parentColumn.index;
if (caseYesState == true && pRprev == pR && rNprev == rN) return;
pBar = new ProgressBar(programTitul); 
pBar.reset("", rN);
for (var i = 0; i < rN; i++, pBar.hit()) { // i++
    cellText = cells.rows[i].cells[cN].texts[0].contents;
    if (cellText.indexOf("(?i)") != -1) { // "?-"        
        text = cellText.split("(?i)")[1];
        cells.rows[i].cells[cN].texts[0].contents = "(?-i)" + text;
        continue;
        } // "?i"
    else if (cellText.indexOf("(?-i)") != -1) { continue; }      
    else { cells.rows[i].cells[cN].texts[0].contents ="(?-i)" + cellText; }
    } // i++
pBar.close();
caseNoState = false;
caseYesState = true;
pRprev = pR;
rNprev = rN;
} // caseYes.onClick
//////
family.onClick = function() { // family.onClick
if (family.value) {    
    useFamily = true;
    firstWordContent.text = "Слово — это фамилия";
    return;
    }
else { 
    useFamily = false;
    firstWordContent.text = "Слово — обычный текст";    
    return;   
    }
} // family.onClick
/////
fwOnly.onClick = function() { // fwOnly.onClick
fwOnly.value = false;    
mySel = specialSel();
if (mySel == null) return; 
app.doScript(theFirstWord, ScriptLanguage.JAVASCRIPT, [], UndoModes.FAST_ENTIRE_SCRIPT, 'theFirstWord');   
return;
///
function theFirstWord () { // theFirstWord
 var cells = mySel.cells.everyItem().getElements();
var wordAr = [];
for (var c = 0; c < cells.length; c++) { // c++
    while (wordAr.length > 0) wordAr.shift();
    var curCell = cells[c];
    var cellText = curCell.contents;
    if (cellText.length == 0) continue;
    wordAr = cellText.split(sepSpace);
    if (wordAr.length == 1) continue;
    curCell.contents = wordAr[0]; 
    } // c++
} // theFirstWord 
///
} // fwOnly.onClick    
///
separator_1 = win.add ("panel");
separator_1.minimumSize.height = separator_1.maximumSize.height = 1;

var splitCellGroup = win.add("group");
splitCellGroup.orientation = "row";
splitCellGroup.alignChildren = ["left", "bottom"];
var HiddenText = splitCellGroup.add("checkbox");
HiddenText.value = true;
HiddenText.helpTip = "Когда этот флажок установлен, это стандартное значение, при добавлении строки для нового варианта термина содержимое левой ячейки будет скрыто.";
var splitCell = splitCellGroup.add("button", buttonSizeLittle, "Добавить строку для нового варианта термина"); 
separator_2 = win.add ("panel");
separator_2.minimumSize.height = separator_2.maximumSize.height = 1;
var wordPlace = win.add("group");
wordPlace.orientation = "row";
wordPlace.alignChildren = ["fill", "bottom"];
//wordPlace.alignChildren = ["fill", "fill"];
var moveWordAllow = wordPlace.add("checkbox");
moveWordAllow.helpTip = "Флажок разрешения переноса слова в grep-запросе. Установка этого флажка сделает активными обе радиокнопки и флажок-кнопку перемещения слова. Разделитель строки на слова — текст '" + sepSpace + "'.";
moveWordAllow.value = false;
var fwToEnd = wordPlace.add("radiobutton", undefined, "Первое слово в конец");
fwToEnd.value = true;
fwToEnd.enabled = false;
var lwToStart = wordPlace.add("radiobutton", undefined, "Последнее слово в начало");
lwToStart.value = false;
lwToStart.enabled = false;
var moveWordAction = wordPlace.add("checkbox");
moveWordAction.value = false;
moveWordAction.enabled = false;
moveWordAction.helpTip = "Этот флажок работает как кнопка для перемещения слова, доступен только когда установлен флажок разрешения переноса слова в grep-запросе.";
///
separator_3 = win.add ("panel");
separator_3.minimumSize.height = separator_3.maximumSize.height = 1;
var shortNamePlace = win.add("group");
shortNamePlace.orientation = "row";
shortNamePlace.alignChildren = ["fill", "bottom"];
//shortNamePlace.alignChildren = ["fill", "fill"];
var shortNameAllow = shortNamePlace.add("checkbox");
shortNameAllow.helpTip = "Флажок разрешения замены имени и отчества на инициалы. Установка этого флажка сделает активными обе радиокнопки и флажок-кнопку преобразования имён в инициалы.";
shortNameAllow.value = false;
var famin = shortNamePlace.add("radiobutton", undefined, "Фамилия Инициалы");
famin.value = true;
famin.enabled = false;
var infam = shortNamePlace.add("radiobutton", undefined, "Инициалы Фамилия");
infam.value = false;
infam.enabled = false;
var shortNameAction = shortNamePlace.add("checkbox");
shortNameAction.value = false;
shortNameAction.enabled = false;
shortNameAction.helpTip = "Этот флажок работает как кнопка преобразования имён в инициалы, доступен только если установлен флажок разрешения замены имени и отчества на инициалы. Когда в тексте одно слово или больше трёх слов, эта ячейка пропускается. Если два слова, то предполагаем, что одно из слов имя, а другое фамилия.";
///
moveWordAllow.onClick = function () { // moveWordAllow.onClick
if (moveWordAllow.value == true) { // moveWordAllow.value
    fwToEnd.enabled = true;
    lwToStart.enabled = true;
    moveWordAction.enabled = true;
    } // moveWordAllow.value
else {
    fwToEnd.enabled = false;
    lwToStart.enabled = false;
    moveWordAction.enabled = false;    
    }
} // moveWordAllow.onClick    
///
moveWordAction.onClick = function() { // moveWordAction.onClick 
mySel = specialSel(); //  mySel глобальная переменная
if (mySel == null) return; 
app.doScript(wordMove, ScriptLanguage.JAVASCRIPT, [], UndoModes.FAST_ENTIRE_SCRIPT, 'wordMove');   
return;
///
function wordMove () { // wordMove
 var cells = mySel.cells.everyItem().getElements();
var wordAr = [];
for (var c = 0; c < cells.length; c++) { // c++
    while (wordAr.length > 0) wordAr.shift();
    var curCell = cells[c];
    var cellText = curCell.contents;
    if (cellText.length == 0) continue;
    wordAr = cellText.split(sepSpace);
    if (wordAr.length == 1) continue;
    if (fwToEnd.value == true) { // fwToEnd.value
        var shiftRez = wordAr.shift(); // элемент начала массива
        wordAr.push(shiftRez); // помещает данные в конец массива
        curCell.contents = wordAr.join(sepSpace);
        continue;
        } // fwToEnd.value
    else { // lwToStart.value
        var popRez = wordAr.pop();  // элемент конца массива
        wordAr.unshift(popRez); // помещает данные в начало массива
        curCell.contents = wordAr.join(sepSpace);
        } // lwToStart.value
    } // c++   
moveWordAction.value = false;
} // wordMove
} // moveWordAction.onClick     
///
function specialSel() { // specialSel
var mySel = app.selection[0];
if (mySel == null || ((mySel.parent.constructor.name != "Cell") && (mySel.constructor.name != "Cell"))) {   
    alert("Выделите нужные ячейки.", programTitul); 
    moveWordAction.value = false;
    shortNameAction.value = false;
    return null; 
    }
if ((mySel.hasOwnProperty("texts")) && (mySel.parent.constructor.name == "Cell")) { 
    mySel.parent.select();
    mySel = app.selection[0];
    }
if (mySel.columns.length != 1) {
    alert("В выделении не должно быть нескольких колонок, только нужные ячейки с grep-запросами.", programTitul); 
    moveWordAction.value = false;
    shortNameAction.value = false;
    return null;     
    }
if (mySel.cells[0].parentColumn.index != 2) {
    alert("В выделении должны быть только нужные ячейки колонки с grep-запросами.", programTitul); 
    moveWordAction.value = false;
    shortNameAction.value = false;
    return null;      
    }
return mySel;
} // specialSel
///
shortNameAllow.onClick = function () { // shortNameAllow.onClick
if (shortNameAllow.value == true) { // shortNameAllow.value
    famin.enabled = true;
    infam.enabled = true;
    shortNameAction.enabled = true;
    } // shortNameAllow.value
else {
    famin.enabled = false;
    infam.enabled = false;
    shortNameAction.enabled = false;    
    }
} // shortNameAllow.onClick    
////
shortNameAction.onClick = function() { // shortNameAction.onClick 
mySel = specialSel(); //  mySel глобальная переменная
if (mySel == null) return; 
app.doScript(doInit, ScriptLanguage.JAVASCRIPT, [], UndoModes.FAST_ENTIRE_SCRIPT, 'wordMove');   
shortNameAction.value = false;
return;
///
function doInit () { // doInit
 var cells = mySel.cells.everyItem().getElements();
var wordAr = [];
var procWords;
var curShortName;
for (var c = 0; c < cells.length; c++) { // c++
    while (wordAr.length > 0) wordAr.shift();
    var curCell = cells[c];
    var cellText = curCell.contents;
    cellText = cellText.substring(2,cellText.length-2); // убрали \b до и после текста
    if (cellText.length == 0) continue;
    wordAr = cellText.split("\\b" + sepSpace + "\\b");    
    if (wordAr.length == 1 || wordAr.length > 3) continue;   
    if (infam.value == true) { // infam.value
        procWords = wordAr.length-1;         
        for (var w = 0; w < procWords; w++) { // w++
            curShortName = wordAr[w][0] + "\\.";
            wordAr[w] = curShortName;
            } // w++ 
        curCell.contents = wordAr.join(sepSpace);             
        continue;
        } // infam.value
    else { // famin.value
        for (var w = 1; w < wordAr.length; w++) { // w++
            curShortName = wordAr[w][0] + "\\.";
            wordAr[w] = curShortName;
            } // w++
        curCell.contents = wordAr.join(sepSpace);        
        } // famin.value
    } // c++   
} // doInit
} // shortNameAction.onClick     
////
function getSelection () { // getSelection
var mySel = app.selection[0];
if (mySel == null  || ((mySel.parent.constructor.name != "Cell") && (mySel.constructor.name != "Cell")  && (mySel.constructor.name != "Table"))) {    
    alert("Выделите нужные ячейки.", programTitul); 
    return null; 
    }
if ((mySel.hasOwnProperty("texts")) && (mySel.parent.constructor.name == "Cell")) { 
    mySel.parent.parentRow.select();
    mySel = app.selection[0];
    }
return mySel;
} // getSelection
///
changePadezh.onClick = function () { // changePadezh.onClick
var mySel = getSelection();
if (mySel == null) return;

shortNameAllow.value = false;
famin.enabled = false;
infam.enabled = false;
shortNameAction.enabled = false;

moveWordAllow.value = false;
fwToEnd.enabled = false;
lwToStart.enabled = false;
moveWordAction.enabled = false;

var rowsN = mySel.rows.length;
if (rowsN > 1000) stepToShow = 100;
if (rowsN > 500) stepToShow = 50;
app.doScript(cP, ScriptLanguage.JAVASCRIPT, [], UndoModes.FAST_ENTIRE_SCRIPT, 'cP');   
function cP () { // cP
var pBar = new ProgressBar(programTitul);
pBar.reset( "Изменить в grep-запросе вариант учёта падежа", parseInt(rowsN/stepToShow));
for (var r = 0; r < rowsN; r++) { // r++    
    procTextInCell (mySel.rows[r], 0, onePadezh.value);
     if (r%stepToShow == 0) pBar.hit();
    } // r++
pBar.close();
} // cP
} // changePadezh.onClick
///
firstWordContent.onClick = function () { // firstWordContent.onClick
var mySel = getSelection();    
if (mySel == null) return;
var rowsN = mySel.rows.length;
if (rowsN > 1000) stepToShow = 100;
if (rowsN > 500) stepToShow = 50;
app.doScript(fWO, ScriptLanguage.JAVASCRIPT, [], UndoModes.FAST_ENTIRE_SCRIPT, 'fWO');   
function fWO () { // fWO
var pBar = new ProgressBar(programTitul);
pBar.reset(firstWordContent.text, parseInt(rowsN/stepToShow));
for (var r = 0; r < rowsN; r++) { // r++
     procTextInCell (mySel.rows[r], 1, onePadezh.value);
     if (r%stepToShow == 0) pBar.hit();    
    } // r++
pBar.close();
} // fWO
} // firstWordContent.onClick
////
function procTextInCell (row, theAction, imPad) { // procTextInCell
// row - ссылка на строку
// theAction - вариант действия
// imPad - будет true, если выбрано, что только именительный падеж
var table = row.parent;
var usedCell = row.cells[2];
//~ if (textForSearch.value == false) { // ! textForSearch.value
//~     if (haveMarker == false) row.cells[2].texts[0].contents = row.cells[0].texts[0].contents; 
//~     else row.cells[2].texts[0].contents = row.cells[0].texts[0].contents.substring(2, row.cells[0].texts[0].contents.length); // 2 -- буква-маркер и дефис не должны быть в grep-запросе
//~     } // ! textForSearch.value
//~ else { // textForSearch.value  == true
    if (row.cells[4].texts[0].length == 0) {
            alert ("В правой ячейке должен быть текст, для поиска которого программа подготовит grep-запрос.", programTitul);
            return;            
            }
    else { 
        // коприруем данные из пятой ячейки в третью ячейку
        usedCell.texts[0].contents = row.cells[4].texts[0].contents; 
        }
//~     } // textForSearch.value  == true
var textInCell = row.cells[2].texts[0].contents;
///>>> если последние знаки термина --- знак подчёркивания и цифра, они исключаются из текста, для которого будет создаваться grep-запрос
var textInCellLength = textInCell.length;
var prevChar = textInCell[textInCellLength-2];
var lastChar = textInCell[textInCellLength-1];
if ((prevChar == "_") && ("0123456789".match(lastChar) != null)) {
    row.cells[2].texts[0].contents = textInCell.substring(0, textInCellLength-2);
    }
///>>>
var words = [];
while (words.length > 0) words.shift();
var wordsR = [];
while (wordsR.length > 0) wordsR.shift();
words = row.cells[2].texts[0].contents.split(" ");
var wordsCount = words.length;
var rw;
for (w = 0; w < wordsCount; w++) { // w++
   var usePunctValue = false;
    if (usePunct.value /* || textForSearch.value*/) usePunctValue = true;
    rw = getWord (words, imPad, usePunctValue, w, theAction);   
  //  rw = getWord (words, imPad, usePunct.value, w, theAction);    
    if (useFamily) {
        wordsR[w] = rw; // дефис был исследован при определении какая фамилия -- двойная или одиночная
        continue;
        }
    else { // !useFamily
        var splitAr = [];
        while (splitAr.length > 0) splitAr.shift();
        var splitAr2 = [];
        while (splitAr2.length > 0) splitAr2.shift();
        splitAr = rw.split("-"); // обычный дефис 0x2D
        splitAr2 = rw.split("‑"); // неразрывный дефис 0x2011    
        if (splitAr.length == 1 && splitAr2.length == 1) {
            wordsR[w] = rw;
            continue;
            }
         // слово из двух частей. Для поиска замена обычного дефиса на вариант из двух нужна для того, чтобы обойти случай, что в тексте в какой-то момент обычный дефис был заменён на неразделяемый, а в тексте словника стоит обычный дефис
        var tD = "[-‑]"; // два варианта дефиса
        if (rw.length == 5) { // == 5
            // это дефис в обрамлении \b. От них надо избавиться.
            wordsR[w] = tD;
            }  // == 5
        else { // >5
            if (splitAr.length != 1) { // splitAr 
               wordsR[w] = splitAr[0]  + tD + splitAr[1];
               continue;
                } // splitAr
            else { // splitAr2
               wordsR[w] = splitAr2[0]  + tD + splitAr2[1];
                } // splitAr2 
            } // > 5
        } // !useFamily
    } // w++
var rezTerm = wordsR.join(sepSpace);
row.cells[2].texts[0].contents = rezTerm;
// 28.07.2022  -- если термине поиска были точки, то их надо отметить наклоными чертами, иначе они искаться не будут.
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
app.findChangeGrepOptions.includeFootnotes = false;
app.findGrepPreferences.findWhat = "\\.";
app.changeGrepPreferences.changeTo = "\\.";
row.cells[2].texts[0].changeGrep();
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
/// поиск не работает, если \b стоит перед кавычкой, поэтому его надо убрать
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
app.findChangeGrepOptions.includeFootnotes = false;
    app.findGrepPreferences.findWhat = "(\\\\b)([\\'\\\"])"; // для указания \b в grep-запросе надо четыре обратных черты
app.changeGrepPreferences.changeTo = "$2";
row.cells[2].texts[0].changeGrep();
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
///
if (useAccent.value) { // useAccent
    //var _vowel = "аеёиоуыэюяАЕЁИОУЫЭЮЯ";    
    var _vowel = "аеиоуыэюяАЕИОУЫЭЮЯ";
    var windx;
    var accent = "\u0301";
    for (var i = 0; i < _vowel.length; i++) { // i++
        cell_Text = row.cells[2].texts[0];
        app.findGrepPreferences = null; 
        app.changeGrepPreferences = null;
        app.findChangeGrepOptions.includeFootnotes = false;
        app.findGrepPreferences.findWhat = _vowel[i];
        var fnd = cell_Text.findGrep();
        if (fnd.length == 0) continue;
        for (var f = fnd.length-1; f >= 0; f--) { // f--
            windx = fnd[f].index;
            cell_Text.insertionPoints[windx+1].contents = accent + "*";
            } // f--
        } // i++
    app.findGrepPreferences = null; 
    app.changeGrepPreferences = null;     
    } // useAccent
app.selection = null;
row.cells[2].select(); // 21.02.2023
//row.cells[2].texts[0].contents = wordsR.join(sepSpace);
} // procTextInCell
/////////////////////////////
splitCell.onClick = function() { // splitCell.onClick
var mySel = app.selection[0];
var doc  = app.activeDocument;
//var split0 = app.documents[0].name.split("IndexList-").length;
var split0 = app.documents[0].name.split("IndexList").length;
if (split0 == 1) {
    alert("Эта команда выполняется в таблице файла 'IndexList-NNN.indd'.", programTitul);
    return;    
    }
if (mySel == null  || mySel.parent.constructor.name != "Cell") {
    alert("Поставьте курсор в строку таблицы, для добавления другого варианта термина.", programTitul); // <<
    return;
    }
var theCell = mySel.parent;
var pR = theCell.parentRow.index;
var t0 = theCell.parentRow.cells[0].texts[0].contents;
var t1 = theCell.parentRow.cells[1].texts[0].contents;
var t2 = theCell.parentRow.cells[2].texts[0].contents;
var t4 = theCell.parentRow.cells[4].texts[0].contents;
var _tbl = theCell.parent;
theCell.parentRow.split(HorizontalOrVertical.HORIZONTAL);
var newRow = _tbl.rows[pR+1];
newRow.cells[0].texts[0].contents = t0;
newRow.cells[1].texts[0].contents = t1;
newRow.cells[2].texts[0].contents = t2;
newRow.cells[4].texts[0].contents = t4;
//newRow.cells[0].bottomEdgeStrokeWeight = 0;
//newRow.cells[1].bottomEdgeStrokeWeight = 0;
if (HiddenText.value) { 
    // если определено флажком, то в добавленной строке текст первой и второй ячеек делаем бесцветным: doc.swatches[0] -  цвета нет
    newRow.cells[0].texts[0].fillColor = doc.swatches[0];
    newRow.cells[1].texts[0].fillColor = doc.swatches[0]; 
    }
app.activate();
} // splitCell.onClick
////
hideWin.onClick = function() { // hideWin.onClick
win.hide();
var slaveWinLocation = [-1,-1]; // положение на экране служебного окна программы
var wn = new Window ("palette", ">I<", undefined, {closeButton: false});
wn.margins = [1,1,1,1];
var myScriptFile = myGetScriptPath();
var myDefSetName  = "InfoForSearch.ini"; // это файл установок программы
var myScriptFolder = decodeURI(myScriptFile.path);
var myFilePath = decodeURI(myScriptFolder + "/sets/" + myDefSetName); 
var myDataFile = new File (myFilePath);
if (myDataFile.exists) { //File.exists
    myDataFile.open("r");
    slaveWinLocation[0] = myDataFile.readln();
    slaveWinLocation[1] = myDataFile.readln();
    myDataFile.close();
    } //File.exists
if (slaveWinLocation[0] != -1) wn.location = slaveWinLocation;
var ret_Button = wn.add("button", [0,0,30,30], "<I>");
ret_Button.onClick = function() { // ret_Button.onClick()
try { win.show(); } catch (e) {exit() };
myDataFile.open("w");
myDataFile.writeln(wn.location[0]);
myDataFile.writeln(wn.location[1]);
myDataFile.close();
wn.close();
} // ret_Button.onClick()
///
wn.show();
}  // hideWin.onClick
////
win.onClose = function() { // win.onClose
// что делать при щелчке на крестике в шапке окна программы    
var myScriptFile = myGetScriptPath();
var myDefSetNameW  = myDefSetNameWName; // это файл с информацией, где окно программы
var myScriptFolder = decodeURI(myScriptFile.path);
var myFilePathW = decodeURI(myScriptFolder + "/sets/" + myDefSetNameW); 
var myDataFileW = new File (myFilePathW);
myDataFileW.open("w");
myDataFileW.writeln(win.location[0]);
myDataFileW.writeln(win.location[1]);
myDataFileW.close();
app.activate();
} // win.onClose
////
return win;
}  // myScriptWindow 
////