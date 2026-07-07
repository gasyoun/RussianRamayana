// MarkSameQueries.jsx

/*
Должно быть открыто два файла — файл вёрстки, где надо найти совпадающие термины и отметить их символьными стилями, 
и файл IndexList с именами символьных стилей в четвёртой колонке.
Проверяется, что в разных ячейках пятой колонки есть совпадающие слова.
Если такого совпадения нет, то сообщение, что для оформления слов уникальными символьными стилями надо запустить скрипт ApplySpecialStyles.jsx.
Скрипт MarkSameQueries.jsx сделает копию файла IndexList, в ней будет сделано следующее: 
а) оставлены только строки, в которых в четвёртой ячейке есть название символьного стиля, 
б) строки отсортированы по содержимому колонки с запросами, чтобы термины с одинаковыми запросами оказались в соседних строках. 
И с этом файлом дальше будет работа.
*/

// © Михаил Иванюшин, 2023  |  dotextok@gmail.com  |  dotextok.ru

#targetengine "MarkSameQueries"
#include "../ForIndex.jsxinc"

app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll; // см. http://adobeindesign.ru/2008/10/24/restore-ui/

// var usedColor = "IndexStylesColor"; // этим цветом можно отмечать добавленные слова
var zoomPercentageScale = 150; // масштаб отображения найденных терминов
var rez;
var startIndex, endIndex;
var MarkSameQueriesLoaded = false;
var programTitul = "Работа с одинаковыми запросами";
if (app.documents.length == 0) {
    alert("Нет открытых документов.", programTitul);
    exit();
    }
if (app.documents.length != 2) {
   alert("Для работы скрипта должны быть открыты два файла — файл IndexList, и файл вёрстки.", programTitul);  
    exit();
    }
var win = new Window ("palette", programTitul);
var jobFile, jobFileID, table, tableFileID, jobStory, tabStory, tabStoryID, tableID, jobPath, tablePath;
var startRow, endRow, nextTermin;
win.alignChildren = ["fill", "fill"];
var jobStart = "Поставьте курсор в текст вёрстки и установите флажок";
var jobOK = "Файл вёрстки выбран";
var job = win.add("checkbox", undefined, jobStart); 
job.value = false;
var  inTableStart = "Поставьте курсор в текст таблицы IndexList и установите флажок";
var inTableOK = "Копия файла IndexList сделана";
var inTableCont = "Продолжить работу  с этой таблицей";
var inTable = win.add("checkbox", undefined, inTableStart);
var usePrevTable = win.add("checkbox", undefined, inTableCont);
usePrevTable.value = false;
usePrevTable.enabled = false;
inTable.value = false;
inTable.enabled = false;
separator1 = win.add ("panel");
separator1.minimumSize.height = separator1.maximumSize.height = 1;
///
//var buttonSize = [0,0,100,28];
var buttonSize = undefined;
var actionButtons = win.add("group");
actionButtons.orientation = "row";
//var runMarking = win.add("button", buttonSize, "Оформить разными стилями одинаковые слова"); 
var runMarking = actionButtons.add("button", undefined, "Оформить разными стилями одинаковые слова"); 
var addColor = actionButtons.add("button", undefined, "Цвет"); 
addColor.helpTip = "Кнопка изменения цвета обработанных строк. В момент возврата из другого окна эти строки выделены.";
runMarking.enabled = false;
addColor.enabled = false;
var curTermin;
var curGrep;
var curStyles = [];
var cellSel;
var buttonMess = "Эта кнопка должна нажиматься при открытом файле с таблицей.";
var cellMess = "Курсор должен быть в ячейке с необработанным термином.";
////
function testSelection () { // testSelection
var cellSel = app.selection[0];
if (cellSel == null) {
    alert(cellMess, programTitul);
    if (activeDocument.id != tableFileID) app.activeDocument = app.documents[1];
    return null;
    }
    if (app.activeDocument.id != tableFileID) {
    alert(buttonMess, programTitul);
    return null;
    }
if (cellSel.constructor.name != "InsertionPoint" || cellSel.parent.constructor.name != "Cell") {
    alert(cellMess, programTitul);
    if (app.activeDocument.id != tableFileID) app.activeDocument = app.documents[1];    
    return null;    
    }
var rowN = cellSel.parent.parentRow.index;
var table = cellSel.parent.parent;
var colN = table.columns.length;
if (table.rows[rowN].cells[colN-1].texts[0].characters[0].strikeThru == true) {
    // на уровне осмысления "нужно/не нужно" вариант отмечать обработанные строки зачёркиванием их
    alert("Это обработанный термин.", programTitul);
    return null;  
    }
var termn = table.rows[rowN].cells[colN-1].texts[0].contents;
if (termn.length == 0) {
    alert("Обрабатываемое слово не может быть нулевой длины.", programTitul); // сообщение этапа отладки
    return null;     
    }
//var startRow, endRow, nextTermin;
startRow = rowN;
if (rowN < table.rows.length-1) { // <
    for (var i = rowN+1; i < table.rows.length; i++) { // i++
        nextTermin = table.rows[i].cells[colN-1].texts[0].contents;
        if (termn == nextTermin) continue;
        break;
        } // i++
    endRow = i -1;
    } // <
else endRow = rowN;
app.selection = NothingEnum.NOTHING;
app.select(table.rows[startRow]);
app.select(table.rows[endRow], SelectionOptions.ADD_TO);

var allTheSame = true;
for (var i = startRow; i < endRow-1;  i++) { /// i++
    if (table.rows[i].cells[1].texts[0].contents == table.rows[i+1].cells[1].texts[0].contents) continue;
    allTheSame = false;
    break;
    }  /// i++
if (allTheSame == false) {
    alert("В выделении строки с разными grep-запросами.", programTitul);
    return null;     
    }

curTermin = termn;
curGrep = table.rows[startRow].cells[1].texts[0].contents;
while (curStyles.length > 0) curStyles.pop();
for (var i = startRow; i <= endRow;  i++) { curStyles.push(table.rows[i].cells[2].texts[0].contents); }
return 0;
}  // testSelection
//////
runMarking.onClick = function () { // runMarking.onClick
if (testSelection () == null) {
    return;
    }
if (curTermin.length == 0) {
    alert("Не определён термин поиска.", programTitul);
    return;     
    }
if (curGrep.length == 0) {
    alert("Строка grep-запроса не определена (она нулевой длины).", programTitul);
    return;     
    }
if (curStyles.length == 0) {
    alert("Не подготовлен массив символьных стилей.", programTitul);
    return;     
    }
var w = new Window ("palette", programTitul);
w.alignChildren = ["fill", "fill"];
w.add("statictext", undefined, curTermin);
var dropAndNumber = w.add("group");
dropAndNumber.orientation = "row";
var selStyle = dropAndNumber.add ("dropdownlist");
var fieldSize = 270;
selStyle.minimumSize.width = selStyle.maximumSize.width = fieldSize;
for (var t = 0; t < curStyles.length; t++) selStyle.add("item", curStyles[t]);
selStyle.selection = 0;

var styleColor = w.add("group");
styleColor.orientation = "row";
styleColor.alignChildren = ["left", "fill"];
styleColor.add("statictext", undefined, "Цвет символьных стилей в группе " + groupForIndexStyles);
var twoColors = styleColor.add("group");
twoColors.orientation = "row";
twoColors.margins = [0, 6, 0, 0];
twoColors.alignChildren = ["left", "bottom"];
var colorRed = twoColors.add("radiobutton", undefined, "красный");
colorRed.value = false; // красный сначала должен быть false, цвет usedColor добавится при переключении этой радиокнопки
var colorBlack = twoColors.add("radiobutton", undefined, "чёрный");
colorBlack.value = true;
styleColor.enabled = true;
////
colorRed.onClick = function () { // colorRed.onClick   
app.activeDocument = app.documents.itemByID(jobFileID); 
if (!app.activeDocument.colors.item(usedColor).isValid) { // ! (usedColor).isValid
    try { 
        app.activeDocument.colors.add ({name: usedColor, model:ColorModel.SPOT, space:ColorSpace.RGB, colorValue:[255, 0, 0]}) 
        } 
    catch (e) { } ; //  try / catch - цвета может уже быть в файле
    }  // ! (usedColor).isValid
if (app.activeDocument.characterStyleGroups.itemByName(groupForIndexStyles).isValid == false) return;
if (app.activeDocument.characterStyleGroups.itemByName(groupForIndexStyles).characterStyles.length == 0) return;
var chStLength = app.activeDocument.characterStyleGroups.itemByName(groupForIndexStyles).characterStyles.length;
changeStyleColor(chStLength, usedColor);
} // colorRed.onClick
////
colorBlack.onClick = function () { // colorBlack.onClick
app.activeDocument = app.documents.itemByID(jobFileID); 
if (app.activeDocument.characterStyleGroups.itemByName(groupForIndexStyles).isValid == false) return;
if (app.activeDocument.characterStyleGroups.itemByName(groupForIndexStyles).characterStyles.length == 0) return;
var chStLength = app.activeDocument.characterStyleGroups.itemByName(groupForIndexStyles).characterStyles.length;
changeStyleColor(chStLength, "Black");
} // colorBlack.onClick
////
function changeStyleColor(chStLength, color) { // changeStyleColor
var pBar = new ProgressBar("Изменение цвета в символьных стилях оформления терминов с одинаковыми grep-запросами");
pBar.reset("Если символьных стилей много, сейчас их " + chStLength + ", то смена цвета займёт какое-то время", chStLength);
for (var c = 0; c < chStLength; c++, pBar.hit()) { // c++
    app.activeDocument.characterStyleGroups.itemByName(groupForIndexStyles).characterStyles[c].fillColor = color;
    } // c++
pBar.close();
} // changeStyleColor
////
var curNum = dropAndNumber.add("statictext {justify: 'center'}", [0,0,30, 28], undefined); 
curNum.text = "—";
var sepSign = dropAndNumber.add("statictext", [0,0,12, 28], "|");
var found = dropAndNumber.add("statictext {justify: 'center'}", [0,0,30, 28], undefined); 
found.text = "—";
separator1 = w.add ("panel");
separator1.minimumSize.height = separator1.maximumSize.height = 1;
separator1.alignment = ["fill", "fill"];
var buttons = w.add("group");
buttons.orientation = "row";
buttons.alignChildren = ["center", "fill"];
var smallButtonSize = [0,0,28,28];
var bigButtonSize = [0,0,100,28];
var info = buttons.add("button", smallButtonSize, "?");
var rbGroup = buttons.add("group");
rbGroup.alignChildren = ["lelft", "fill"];
rbGroup.margins = [0, 6, 0, 0]; // margins для сдвига линии радиокнопок на линию текста "Найти", "Отметить"
var jobM = rbGroup.add("radiobutton", undefined, "М"); // материал
jobM.value = true;
//jobM.helpTip = "М — поиск в материале";
var jobF = rbGroup.add("radiobutton", undefined, "Ф"); // файл
//jobF.helpTip = "Ф — поиск в файле";

var findItems = buttons.add("button", bigButtonSize, "Найти");
buttons.alignChildren = ["fill", "center"];
var down = buttons.add("button", smallButtonSize, "<");
down.enabled = false;
var up = buttons.add("button", smallButtonSize, ">");
up.enabled = false;
var markItem = buttons.add("button", bigButtonSize, "Отметить");
markItem.enabled = false;
var changeMarkAndFindAction = buttons.add("checkbox");
changeMarkAndFindAction.value = false;
changeMarkAndFindAction.helpTip = "Флажок-кнопка для объединения дейстивия кнопки 'Отметить' и выбора слова. По умолчанию кнопки перемещения на следующее / предыдущее слово такие: '>' и '<', и надо сперва выбрать слово, а потом нажать кнопку 'Отметить'. Этот флажок переключает вид кнопок перемещения, и когда, например, кнопка выбора следующего слова станет такой: '>>', то после нажатия на кнопку 'Отметить' будет сразу переход к следующему слову.";
var startText = "Текущий символьный стиль найденного текста";
var usedCharStyle = w.add("statictext", [0,0,fieldSize,28], startText);
///
changeMarkAndFindAction.onClick = function () { // changeMarkAndFindAction.onClick
changeMarkAndFindAction.value = false;    
a=0;    
if (up.text == '>' && down.text == '<') { up.text = '>>'; return; }
if (up.text == '>>' && down.text == '<') { up.text = '>'; down.text = '<<';  return; }
if (up.text == '>' && down.text == '<<') { up.text = '>'; down.text = '<';  return; }
} // changeMarkAndFindAction.onClick
///
info.onClick = function () { // info.onClick
var infoText = "Верхняя строка — это искомый текст.\nВыпадающий список — варианты символьных стилей для найденной строки.\nСправа от выпадающего списка два поля, левое для отображения номера текущего найденного слова, правое показывает число найденных слов. Пока ничего не найдено, в этих полях прочерки.\nСимвольные стили создаёт скрипт, они все в группе. Имя этой группы определяется в переменной groupForIndexStyles, она в файле ForIndex.jsxinc, по умолчанию группа называется \"Index styles\".\nЭти стили имеют только имя, в них ничего не определяется, кроме цвета, они нужны скрипту подготовки указателя для поиска слов, относящихся к разным терминам.\nИзменив активный цвет в  данных стилях, можно отметить в вёрстке найденные слова красным цветом, по умолчанию этот цвет называется \"IndexStylesColor\".\nРадиокнопки 'М' и 'Ф' определяют область поиска: если выбрана 'М', то поиск в материале, если 'Ф', то в файле. После нажатия на кнопку \"Найти\" станут доступны кнопки движения по выбранным словам \"<\" и \">\" и кнопка \"Отметить\".\nВ нижней строке отображается символьный стиль выбранного кнопкой \"<\" или \">\" слова.\nКнопка \"Отметить\" для оформления выбранного слова активным символьным стилем из выпадающего списка. \nДанная кнопка не обязательно именно для найденных слов: можно выделить нужное слово в тексте и при помощи этой кнопки отметить символьным стилем.\nЩелчок на красном крестике в шапке окна закроет данное окно и вернёт окно работы со строками таблицы.\n";    
alert(infoText, programTitul);
} // info.onClick
///
findItems.onClick = function () { // findItems.onClick    
usedCharStyle.text = startText;    
if (app.activeDocument.id != jobFileID) app.activeDocument = app.documents[1];   
findItems.enabled = false;
if (app.activeDocument.characterStyleGroups.itemByName(groupForIndexStyles).isValid == false) { // == false
       try {
           app.activeDocument.characterStyleGroups.add({name:groupForIndexStyles});
           }
       catch (e) {
           alert("Не получилось в файле вёрстки создать группу символьных стилей '" + groupForIndexStyles + "'.", programTitul);
           return;            
           }
    } //  == false
for (var c = 0; c < curStyles.length; c++) { // c++
 if (app.activeDocument.characterStyleGroups.itemByName(groupForIndexStyles).characterStyles.itemByName(String(curStyles[c])).isValid == false) app.activeDocument.characterStyleGroups.itemByName(groupForIndexStyles).characterStyles.add({name:String(curStyles[c])});
 if (colorRed.value) app.activeDocument.characterStyleGroups.itemByName(groupForIndexStyles).characterStyles.itemByName(String(curStyles[c])).fillColor = usedColor;
 else app.activeDocument.characterStyleGroups.itemByName(groupForIndexStyles).characterStyles.itemByName(String(curStyles[c])).fillColor = app.activeDocument.swatches.itemByName("Black");
 } // c++
app.findGrepPreferences = null; 
app.changeGrepPreferences = null; 
app.findChangeGrepOptions.includeFootnotes = true;
app.findGrepPreferences.findWhat = curGrep;
var stories = app.activeDocument.stories;
var st = stories.itemByID(Number(jobStory));
if (jobM.value) rez = st.findGrep(); else rez = app.activeDocument.findGrep();
if (rez.length == 0) {
    alert("Этот текст не найден.", programTitul);
    curNum.text = "—";
    found.text = "—";
    down.enabled = false;
    up.enabled = false;
    }
else {
    found.text = rez.length;
    curNum.text = "?";
    down.enabled = true;
    up.enabled = true;  
    //markItem.enabled = true;
    }
jobM.enabled = false;
jobF.enabled = false;
} // findItems.onClick
///
down.onClick = function () { // down.onClick 
downAction();    
//~ markItem.enabled = true;    
//~ var num;    
//~ if (curNum.text == "?") {
//~     curNum.text = 1;   
//~     }
//~ num = Number(curNum.text);
//~ if ( num > 1) { num = num-1;
//~      curNum.text = num;
//~      }
//~ numShow (num);
} // down.onClick
///
function downAction() { // downAction
markItem.enabled = true;    
var num;    
if (curNum.text == "?") {
    curNum.text = 1;   
    }
num = Number(curNum.text);
if ( num > 1) { num = num-1;
     curNum.text = num;
     }
numShow (num);    
} // downAction    
///
up.onClick = function () { // up.onClick 
upAction();    
//~ markItem.enabled = true;    
//~ var num; 
//~ if (curNum.text == "?") {
//~     curNum.text = 0;
//~     }
//~ num = Number(curNum.text);
//~ if (num < rez.length) {
//~     num = num+1; 
//~     curNum.text = num;
//~     }
//~ numShow (num);
}  // up.onClick
////
function upAction() { // upAction
markItem.enabled = true;    
var num; 
if (curNum.text == "?") {
    curNum.text = 0;
    }
num = Number(curNum.text);
if (num < rez.length) {
    num = num+1; 
    curNum.text = num;
    }
numShow (num);
} // upAction
///
function numShow(num) { // numShow
var _num = num-1; // теперь это не номер, а индекс
if (_num == 0 || num == rez.length) sepSign.text = "|"; else sepSign.text = "•";
rez[_num].select();
var stName = rez[_num].characters[0].appliedCharacterStyle.name;
usedCharStyle.text = stName;
if (app.selection[0].parentStory.overflows == true) {
    alert("Найденный текст с номером " + num + " находится в вытесненном за пределы фрейма материале.", programTitul);
    return;
    }
app.activeWindow.activePage = app.selection[0].parentTextFrames[0].parentPage; 
app.activeWindow.zoomPercentage = zoomPercentageScale;
} // numShow
/////
markItem.onClick = function () { // markItem.onClick
var start = app.selection[0].index;
var end = Number(start) + Number(app.selection[0].length) - 1;
savedStyle = String(selStyle.selection);
var _appliedFont = app.selection[0].characters[0].appliedFont;
var _pointSize = app.selection[0].characters[0].pointSize;
var _fontStyle = app.selection[0].characters[0].fontStyle;
var _leading = app.selection[0].characters[0].leading;
var _alignToBaseline = app.selection[0].characters[0].alignToBaseline;
var _justification = app.selection[0].characters[0].justification;
app.selection[0].parent.texts[0].characters.itemByRange(start, end).appliedCharacterStyle = app.activeDocument.characterStyleGroups.itemByName(groupForIndexStyles).characterStyles.itemByName(savedStyle);
usedCharStyle.text = savedStyle;
///
app.selection[0].parent.texts[0].characters.itemByRange(start, end).appliedFont = _appliedFont;
app.selection[0].parent.texts[0].characters.itemByRange(start, end).pointSize = _pointSize;
app.selection[0].parent.texts[0].characters.itemByRange(start, end).leading = _leading;
app.selection[0].parent.texts[0].characters.itemByRange(start, end).alignToBaseline = _alignToBaseline;
app.selection[0].parent.texts[0].characters.itemByRange(start, end).justification = _justification;

if (up.text == '>>') upAction();
if (down.text == '<<') downAction();
} // markItem.onClick
/////
win.hide();
w.show();  
w.onClose = function () {
    if (app.activeDocument.id == jobFileID) {
        app.activeDocument.select(NothingEnum.nothing);
        app.activeDocument = app.documents[1];
        }
    try { win.show(); } catch (e) {alert ("?? " + e) };
    runMarking.enabled = true;
    addColor.enabled = true;
    app.activate(); 
    }
} // runMarking.onClick    
//////
addColor.onClick = function() { // addColor.onClick
var st = app.activeDocument.stories;
try {
    var uStory = st.itemByID(tabStoryID);
    }
catch (e) {
    alert("Не найдена статья с таблицей.");
    return;
    }
if (uStory.tables.length == 0) {
    alert("В найденной статье нет таблиц.");
    return;    
    }
try {
    var uTable = uStory.tables.itemByID(tableID);
    }
catch (e) {
    alert("Нужной таблицы не найдено.");
    return;      
    }
var MarkColor = "MarkColor";
if (!app.activeDocument.colors.item(MarkColor).isValid) { // !isValid
    try { 
        app.activeDocument.colors.add ({name: MarkColor, model:ColorModel.SPOT, space:ColorSpace.RGB, colorValue:[255, 0, 255]}) 
        } 
    catch (e) { } ; //  try / catch - цвета может уже быть в файле
    } // !isValid    
app.doScript(changeColor, ScriptLanguage.JAVASCRIPT, [], UndoModes.FAST_ENTIRE_SCRIPT, 'changeColor'); 
return;
////
function changeColor() { // changeColor
var cellsN = uTable.rows[0].cells.length;    
try {
    for (var r = startRow; r <= endRow; r++) { // r++
        for (var c = 0; c < cellsN; c++) { // c++
            uTable.rows[r].cells[c].texts[0].fillColor = MarkColor
            } // c++
        } // r++
    }
catch (e) {
       alert("Что-то пошло не так с окрашиванием текста выделенных строк."); 
    }
} // changeColor
////
} // addColor.onClick
///
job.onClick = function() { // job.onClick 
if (app.selection.length == 0 || app.selection[0].constructor.name != "InsertionPoint") {
    alert("Курсор должен быть в материале.", programTitul);
    job.value = false;
    return;
    }

var noName = false;
try { var myDocPath = app.activeDocument.filePath; } // если документ не сохранён, маршрут не сообщается
catch(e) {
   alert("Это только что созданный и ещё ни разу не сохранённый файл.\nДайте ему имя.",programTitul); 
   noName = true;
    }
if (noName) { // noName
    try { app.documents[0].save(); }
    catch (e) {
         alert("Файл не был сохранён с новым именем");
        win.close(); 
        }
    } // noName

jobFile = app.activeDocument;
jobPath = app.activeDocument.filePath;
jobFileID = app.activeDocument.id;
jobStory = app.selection[0].parent.id;
job.text = jobOK;
job.enabled = false;
inTable.enabled = true;
app.activeDocument = app.documents[1];
} // job.onClick 
///
inTable.onClick = function () { // inTable.onClick
if (app.activeDocument.id == jobFileID) {
       alert("Сейчас выбран тот же файл, что только что был указан как файл вёрстки.", programTitul);
       inTable.value = false;       
       return;
       }
var noName = false;
try { var myDocPath = app.activeDocument.filePath; } // если документ не сохранён, маршрут не сообщается
catch(e) {
   alert("Это только что созданный и ещё ни разу не сохранённый файл.\nДайте ему имя.",programTitul); 
   noName = true;
    }
if (noName) { // noName
    try { app.documents[0].save(); }
    catch (e) {
         alert("Файл не был сохранён с новым именем");
        win.close(); 
        }
    } // noName
if (decodeURI(myDocPath) != decodeURI(jobPath)) {
       alert("Файл вёрстки и таблица 'IndexList' должны быть в одной папке.", programTitul);
       inTable.value = false;       
       return;    
    }
var tableName = decodeURI(app.activeDocument.name);
if (tableName.match("IndexList") == null) {
       alert("Название файла должно начинаться с 'IndexList'.", programTitul);
       inTable.value = false;       
       return;    
    }
if (tableName.match(nameSample) != null && usePrevTable.value == false) {
       alert("В имени этого файла есть '" + nameSample + "', значит, на экране служебный файл, возможно, оставшийся открытым после предыдущей обработки.\nЕсли это так, то закройте его, откройте нужный файл IndexList-nnn.indd и продолжите работу.\r\rИли установите флажок '" + inTableCont + "' и снова выберите '" + inTableStart + "'.\rПосле этого программа продолжит работу, используя открытый сейчас файл " + tableName + "." , programTitul);
       usePrevTable.enabled = true;
       inTable.value = false;       
       return;    
    }
if (app.selection.length == 0 || app.selection[0].constructor.name != "InsertionPoint" || app.selection[0].parent.constructor.name != "Cell") {
       alert("Курсор должен быть в ячейке таблицы.", programTitul);
       inTable.value = false;       
       return;    
    }
table = app.selection[0].parent.parent;
///
if (usePrevTable.value == true) {
    usePrevTable.enabled = false;
    inTable.text = inTableOK;
    inTable.value = true;
    inTable.enabled = false;
    tableFileID = app.activeDocument.id; 
    tabStory = app.selection[0].parent.parent.parent.parentStory;
    tabStoryID = tabStory.id;
    tableID = table.id;
    runMarking.enabled = true;   
    return;
    }
///
if (table.columns.length != 5) {
    alert("В таблице 'IndexList' должно быть пять колонок, а тут их " + table.columns.length + ".", programTitul);
    inTable.value = false;   
    return;
    }
var notFound = true;
var words = {};
var theWord = "";
for (var t = 0; t < table.rows.length; t++) { // t++
    theWord = table.rows[t].cells[4].texts[0].contents;
    if (words[theWord] == undefined) { // undefined
        words[theWord] = theWord;
        continue;
        } // undefined
     notFound = false;
     words = null;
     break;
    } // t++
if (notFound) { // notFound
    alert("В ячейках пятой колонки таблицы не найдено одинаковых слов.\rЕсли нужно оформить слова уникальными символьными стилями, то надо запустить скрипт ApplySpecialStyles.jsx.", programTitul); 
    w.close();
    app.activate();
    exit();    
    } // notFound
tableFileID = app.selection[0].parent.parent.id;
tabStory = app.selection[0].parent.parent.parent.parentStory;
tabStoryID = tabStory.id;
tableID = table.id;
var sampleName = tableName.split(".indd")[0] + nameSample;    
inTable.text = inTableOK;
inTable.value = true;
inTable.enabled = false;
if (MarkSameQueriesLoaded == false) app.activeDocument.save(File(myDocPath + "/" + sampleName)); 
deleteRows(table);  // теперь надо удалить ненужные строки...
delEmptyPages(tabStory); // ... а затем пустые страницы
tableFileID = app.activeDocument.id; 
runMarking.enabled = true;
} // inTable.onClick
//////////////////////////////////////
function delEmptyPages(story) { // delEmptyPages
var lastPage;    
var parseIntAppVersion = parseInt (app.version);
try { 
if (parseIntAppVersion > 6) lastPage = story.texts[0].characters[-1].parentTextFrames[0].parentPage.name;
else lastPage = story.texts[0].characters[-1].parentTextFrames[0].parent;
var allPages = app.activeDocument.pages.length;
var toDel = allPages - lastPage;
if (toDel == 0) return;
for (i = 0; i < toDel; i++) app.activeDocument.pages[-1].remove();
}
catch (e) { };
} // delEmptyPages
///////////////////
function deleteRows(table) { // deleteRows
var pBar = new ProgressBar(programTitul);   
var rowsN = table.rows.length;
var rR = 0;
var tmp;
app.doScript(remRows, ScriptLanguage.JAVASCRIPT, [], UndoModes.FAST_ENTIRE_SCRIPT, 'remRows'); 
if (rR == rowsN) {
    alert("Похоже, что-то делается неправильно, т.к. были удалены все строки. Возможно, ещё не запускался скрипт TermCompare.jsx. Клавиши Ctrl+Z вернут прежний вид таблицы.", programTitul);  
    return;    
    }
else { // else
pBar.reset("Группировка строк по совпадению запросов 1/3", rowsN);
var _sep = "{@}";
rowsN = table.rows.length;
for (r = rowsN-1; r >=0; r--, pBar.hit()) { // r--
    tmp = table.rows[r].cells[0].texts[0].contents + _sep + table.rows[r].cells[0].texts[0].appliedParagraphStyle.id;
    table.rows[r].cells[0].texts[0].contents = table.rows[r].cells[2].texts[0].contents;
    table.rows[r].cells[2].texts[0].contents = tmp;
    }  // r--
table.cells.everyItem().texts[0].appliedParagraphStyle = app.activeDocument.paragraphStyles[0];
tabStory = table.parent.parentStory;
table.convertToText("\t","\r");
if (tabStory.characters[-1].contents != "\r") tabStory.insertionPoints[-1].contents = "\r";
var stringArray = [];
while (stringArray.length > 0) stringArray.pop();
pBar.reset("Группировка строк по совпадению запросов 2/3", tabStory.paragraphs.length);
for (var s = tabStory.paragraphs.length-1; s >= 0 ; s--, pBar.hit()) { stringArray[s] = tabStory.paragraphs[s].contents; }
stringArray.sort();
tabStory.characters.itemByRange(0, tabStory.length-1).select();
app.selection[0].remove();
tabStory.texts[0].contents = stringArray.join("");
tabStory.characters.itemByRange(0, tabStory.length-1).select();
var _table = app.selection[0].convertToTable("\t","\r");
if (_table.rows[-1].cells[0].texts[0].length == 0) _table.rows[-1].remove();
rowsN = _table.rows.length;
for (r = rowsN-1; r >=0; r--) { // r--
_table.rows[r].autoGrow = true;
}  // r-
var tmpAr = [];
pBar.reset("Группировка строк по совпадению запросов 3/3", rowsN);
for (r = rowsN-1; r >=0; r--) { // r--
    while (tmpAr.length > 0) tmpAr.pop();
    tmpAr = _table.rows[r].cells[2].texts[0].contents.split(_sep);
    tmp = _table.rows[r].cells[0].texts[0].contents;
    _table.rows[r].cells[0].texts[0].contents = tmpAr[0];
    _table.rows[r].cells[0].texts[0].appliedParagraphStyle = app.activeDocument.paragraphStyles.itemByID(Number(tmpAr[1]));
    _table.rows[r].cells[2].texts[0].contents = tmp;
    }  // r--
_table.columns[1].remove();
pBar.close();
return;
}  // else
///
function remRows() { // remRows
pBar.reset("Удаление строк, в которых не указан особый символьный стиль оформления или строка зачёркнута", rowsN);
for (r = rowsN-1; r >=0; r--, pBar.hit()) { // r--
    if (table.rows[r].cells[3].texts[0].length == 0) {
        rR++; 
        table.rows[r].remove(); 
        continue;
        }
    if ((table.rows[r].cells[4].texts[0].length != 0) && (table.rows[r].cells[4].texts[0].characters[0].strikeThru == true)) { // strikeThru
        // зачеркнутые строки не обрабатываем, принятие решения по первому знаку. 
        // Предполагается, что они были зачёркнуты в файле IndexList-nnn.indd во время работы скрипта ApplySpecialStyles.jsx
        rR++; 
        table.rows[r].remove(); 
        continue;  
        } // strikeThru
    } // r--
pBar.close();
} // remRows
}  // deleteRows
///
win.show();
