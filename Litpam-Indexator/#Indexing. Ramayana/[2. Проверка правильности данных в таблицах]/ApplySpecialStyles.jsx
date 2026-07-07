// ApplySpecialStyles.jsx

/*
Должно быть открыто два файла — файл вёрстки и файл IndexList с именами символьных стилей в четвёртой колонке.
Проверяется, что в разных ячейках пятой колонки есть совпадающие слова.
Если такое совпадение обнаружится, то сообщение, что для оформления совпадающих слов уникальными символьными стилями надо запустить скрипт MarkSameQueries.jsx.
Если совпадения нет, то:
1) поиск в четвёртой колонке имени символьного стиля
2) считывание из третьей колонки grep-запроса
3) поиск в тексте (Ф или М) текста по этому запросу и оформление его символьным стилем, из п.1
В конце обработки уникальные имена и стили их оформления будут зачёркнуты, чтобы эти строки не попали в обработку скриптом MarkSameQueries.jsx.
*/

// © Михаил Иванюшин, 2023  |  dotextok@gmail.com  |  dotextok.ru

#targetengine "ApplySpecialStyles"
//#include "ForIndex.jsxinc"
#include "../ForIndex.jsxinc"

app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll; // см. http://adobeindesign.ru/2008/10/24/restore-ui/

var rez;
var jobFile, jobFileID, table, tableFileID, jobStory, tabStoryID, tableID, jobPath, tablePath, stories, st;
var curStyles = [];
var styleGREPs = [];
var rIndxs = [];
var procIndxs = [];
var startIndex, endIndex;
var usedLines;
var MarkSameQueriesLoaded = false;
var usedColor = "IndexStylesColor"; // этим цветом можно отмечать добавленные слова
var programTitul = "Оформление слов символьными стилями";
if (app.documents.length == 0) {
    alert("Нет открытых документов.", programTitul);
    exit();
    }
if (app.documents.length != 2) {
   alert("Для работы скрипта должны быть открыты два файла — файл IndexList, и файл вёрстки.", programTitul);  
    exit();
    }
var win = new Window ("palette", programTitul);
win.alignChildren = ["fill", "fill"];
var inTableStart = "Поставьте курсор в текст таблицы IndexList и установите флажок";
var inTableOK = "Файл IndexList выбран";
var inTable = win.add("checkbox", undefined, inTableStart);
inTable.value = false;
inTable.enabled = true;

var jobStart = "Поставьте курсор в текст вёрстки и установите флажок";
var jobOK = "Файл вёрстки выбран";
var job = win.add("checkbox", undefined, jobStart); 
job.value = false;
job.enabled = false;
///
separator1 = win.add ("panel");
separator1.minimumSize.height = separator1.maximumSize.height = 1;
var styleColor = win.add("group");
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
styleColor.enabled = false;

var buttons = win.add("group");
buttons.orientation = "row";
buttons.alignChildren = ["left", "center"];
var spaceM = buttons.add("radiobutton", undefined, "М");
spaceM.helpTip = "M — обработка материала";
spaceM.value = true;
var spaceF = buttons.add("radiobutton", undefined, "Ф");
spaceF.helpTip = "Ф — обработка файла";
spaceF.value = false;
var theAction = buttons.add("button", [0,0,340,28], "Оформить слова символьными стилями");
//theAction.enabled = false;
buttons.enabled = false;
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
//////////
inTable.onClick = function () { // inTable.onClick
var noName = false;
try { tablePath = app.activeDocument.filePath; } // если документ не сохранён, маршрут не сообщается
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
tablePath = app.activeDocument.filePath;
tableFileID = app.activeDocument.id;
var tableName = decodeURI(app.activeDocument.name);
if (tableName.match("IndexList") == null) {
        alert("Название файла с таблицей должно начинаться с 'IndexList'.", programTitul);
        inTable.value = false; 
        return;
//~         win.close();
//~         app.activate();
       // exit();  
    }
if (app.selection.length == 0 || app.selection[0].constructor.name != "InsertionPoint" || app.selection[0].parent.constructor.name != "Cell") {
       alert("Курсор должен быть в ячейке таблицы.", programTitul);
       inTable.value = false;       
       return;    
    }
table = app.selection[0].parent.parent;
tableID = table.id;
tabStoryID = table.parent.parentStory.id;
if (table.columns.length != 5) {
    alert("В таблице 'IndexList' должно быть пять колонок, а тут их " + table.columns.length + ".\rВозможно, остался открыт служебный файл, в имени которого есть " + nameSample + ".", programTitul);
    inTable.value = false;  
    return;
    }
var words = {};
var theWord = "";
var wordCont = [];
while (wordCont.length > 0) wordCont.pop();
for (var t = 0; t < table.rows.length; t++) { // t++
    theWord = table.rows[t].cells[4].texts[0].contents;
    if (theWord.length == 0) continue;
    if (words[theWord] == undefined) { // undefined
        words[theWord] = t;
        wordCont.push(theWord);
        } // undefined
    else words[theWord] = "#";
    } // t++
// К этому моменту в ассоциативном массиве words для слов, которые в последней ячейке встречаются один раз, будет номер строки с таким словом в таблице tables 
// Если слово встречается несколько раз, то вместо номера будет символ #
var nomer = "";
rIndxs = [];
while (rIndxs.length > 0) rIndxs.pop();
for (var w = 0; w < wordCont.length; w++) { // w++
    nomer = words[wordCont[w]];
    if (nomer == "#") continue;
    rIndxs.push(nomer);
    } // w++
if (rIndxs.length == 0) {
    alert ("В правой колонке этой таблицы нет слов, встречающихся один раз.", programTitul);
    win.close();
    app.activate();    
    }
//  к этому моменту в массиве rIndxs индексы строк, в которых слово в правой колонке встречается один раз
var notFound = true;
while (curStyles.length > 0) curStyles.pop();
while (styleGREPs.length > 0) styleGREPs.pop();
while (procIndxs.length > 0) procIndxs.pop();
usedLines = 0;
var pBar = new ProgressBar(programTitul);  
pBar.reset("Сохранение grep-запросов и названий стилей", table.rows.length);
// сохраняю их в массивах, чтобы не переключаться каждый раз на другой файл перед обработкой очередного слова
for (var t = 0; t < rIndxs.length; t++, pBar.hit()) { // t++
    var ii = rIndxs[t];
    if (table.rows[ii].cells[3].texts[0].length == 0) continue;
    if ((table.rows[ii].cells[3].texts[0].length == 0) || (table.rows[ii].cells[2].texts[0].length == 0)) continue;
    procIndxs.push(ii);
    curStyles.push(table.rows[ii].cells[3].texts[0].contents);
    styleGREPs.push(table.rows[ii].cells[2].texts[0].contents);
    usedLines++;
    notFound = false;
    } // t++
// В массиве procIndxs индексы строк, в которых уникальное слово в правой ячейке и определён особый стиль его обработки. 
// В конце работы этого скрипта эти строки в файле IndexList-nnn.indd будут зачёркнуты, чтобы они не попали в обработку скриптом MarkSameQueries.jsx
pBar.close();
if (notFound) { // notFound
    alert("В строках таблицы не найдено ни одного случая одновременного наличия названия символьного стиля (ячейка четвёртой колонки) и уникального слова (ячейка пятой колонки).", programTitul);         
    win.close();
    app.activate();
   // exit();    
    } // notFound
///// к этому моменту в массивах curStyles собраны все имена специальных символьных стилей, в styleGREPs - используемые grep-запросы
inTable.text = inTableOK;
inTable.value = true;
inTable.enabled = false;
job.enabled = true;
app.activeDocument = app.documents[1];
} // inTable.onClick
////
job.onClick = function () { // job.onClick
if (app.selection.length == 0 || app.selection[0].constructor.name != "InsertionPoint") {
    alert("Курсор должен быть в материале.", programTitul);
    job.value = false;
    return;
    }    
var noName = false;
try { jobPath = app.activeDocument.filePath; } // если документ не сохранён, маршрут не сообщается
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
jobPath = app.activeDocument.filePath;
jobFileID = app.activeDocument.id;
jobStory = app.selection[0].parent.id;

if (tableFileID == jobFileID) {
       alert("Сейчас выбран тот же файл, что только что был указан как файл с таблицей.", programTitul);
       job.value = false;       
       return;
       }  
if (decodeURI(tablePath) != decodeURI(jobPath)) {
       alert("Файл вёрстки и таблица 'IndexList' должны быть в одной папке.", programTitul);
       job.value = false;       
       return;    
    }
/// теперь надо сделать группу символьных стилей, и в ней подготовить стили, имена которых в массиве curStyles
if (app.activeDocument.characterStyleGroups.itemByName(groupForIndexStyles).isValid == false) { // == false
       try {
           app.activeDocument.characterStyleGroups.add({name:groupForIndexStyles});
           }
       catch (e) {
           alert("Не получилось в файле вёрстки создать группу символьных стилей '" + groupForIndexStyles + "'.", programTitul);
           job.value = false;
           return;            
           }
    } //  == false
for (var c = 0; c < curStyles.length; c++) { // c++
 if (app.activeDocument.characterStyleGroups.itemByName(groupForIndexStyles).characterStyles.itemByName(String(curStyles[c])).isValid == false) app.activeDocument.characterStyleGroups.itemByName(groupForIndexStyles).characterStyles.add({name:String(curStyles[c])});
 if (colorRed.value) app.activeDocument.characterStyleGroups.itemByName(groupForIndexStyles).characterStyles.itemByName(String(curStyles[c])).fillColor = usedColor;
 else app.activeDocument.characterStyleGroups.itemByName(groupForIndexStyles).characterStyles.itemByName(String(curStyles[c])).fillColor = app.activeDocument.swatches.itemByName("Black");
 } // c++
job.text = jobOK;
job.value = true;
job.enabled = false;
styleColor.enabled = true;
buttons.enabled = true;
} // job.onClick
////
theAction.onClick = function () { // theAction.onClick 
if (app.activeDocument.id == tableID) app.activeDocument = app.documents[1];    
if (spaceM.value) { // spaceM.value
    if (app.selection.length == 0 || app.selection[0].constructor.name != "InsertionPoint") { // !=
        alert("Курсор должен быть в материале.", programTitul);
        return;
        } // !=
    else { jobStory = app.selection[0].parent.id; }
    } // spaceM.value
var styleNum = curStyles.length;
var theSpace;
var uGREP, uStyle;
var theRez;
app.doScript(wordStyling, ScriptLanguage.JAVASCRIPT, [], UndoModes.FAST_ENTIRE_SCRIPT, 'wordStyling'); 
alert("Слова оформлены символьными стилями.\rЧисло строк с такими словами: " + usedLines + ", последние две ячейки этих строк зачёркнуты.\rКлавишами Ctrl+Z можно вернуть вёрстку к состоянию, которое было до запуска этой программы.", programTitul);
win.close();
app.activate();
////////////////
function wordStyling () { // wordStyling
spaceM.value ? theSpace = "Материал: " : "Файл: ";
var pBar = new ProgressBar(programTitul);  
pBar.reset(theSpace + "поиск слов и оформление их символьными стилями", styleNum);
for (var ii = 0; ii < styleGREPs.length; ii++, pBar.hit()) { // ii++
    uGREP = styleGREPs[ii];
    uStyle = curStyles[ii];
    if (uGREP == undefined || uStyle == undefined) continue;    

    app.findGrepPreferences = null; 
    app.changeGrepPreferences = null; 
    app.findChangeGrepOptions.includeFootnotes = true;
    app.findGrepPreferences.findWhat = uGREP;
    if (spaceM.value) {
        stories = app.activeDocument.stories;
        st = stories.itemByID(Number(jobStory));        
        theRez = st.findGrep(); 
        }
    else theRez = app.activeDocument.findGrep();
    if (theRez.length == 0) continue;
    for (var r = theRez.length-1; r >= 0; r-- ) { // r--
        theRez[r].select();
        var start = app.selection[0].index;
        var end = Number(start) + Number(app.selection[0].length) - 1;
        var _appliedFont = app.selection[0].characters[0].appliedFont;
        var _pointSize = app.selection[0].characters[0].pointSize;
        var _fontStyle = app.selection[0].characters[0].fontStyle;
        var _leading = app.selection[0].characters[0].leading;
        var _alignToBaseline = app.selection[0].characters[0].alignToBaseline;
        var _justification = app.selection[0].characters[0].justification;
        app.selection[0].parent.texts[0].characters.itemByRange(start, end).appliedCharacterStyle = app.activeDocument.characterStyleGroups.itemByName(groupForIndexStyles).characterStyles.itemByName(uStyle);
        ///
        app.selection[0].parent.texts[0].characters.itemByRange(start, end).appliedFont = _appliedFont;
        app.selection[0].parent.texts[0].characters.itemByRange(start, end).pointSize = _pointSize;
        app.selection[0].parent.texts[0].characters.itemByRange(start, end).leading = _leading;
        app.selection[0].parent.texts[0].characters.itemByRange(start, end).alignToBaseline = _alignToBaseline;
        app.selection[0].parent.texts[0].characters.itemByRange(start, end).justification = _justification;        
        }  // r--
    } // ii++
pBar.close();
app.activeDocument.select(NothingEnum.nothing);
app.activeDocument = app.documents[1];
var stories = app.activeDocument.stories;
var st = stories.itemByID(Number(tabStoryID));
var table = st.tables.itemByID(Number(tableID));
var ii;
for (var i = 0; i < procIndxs.length; i++) {
    ii = procIndxs[i];
    // ячейки с уникальным словом и символьным стилем для его оформления зачёркиваются. Этот файл сохраняется, чтобы зачеркивание сохранилось.
    table.rows[ii].cells[3].texts[0].characters.itemByRange(0, table.rows[ii].cells[3].texts[0].length-1).strikeThru = true; 
    table.rows[ii].cells[3].texts[0].characters.itemByRange(0, table.rows[ii].cells[3].texts[0].length-1).strikeThroughWeight = 1.5;   
    table.rows[ii].cells[3].texts[0].characters.itemByRange(0, table.rows[ii].cells[3].texts[0].length-1).strikeThroughOffset = 4;       
    table.rows[ii].cells[4].texts[0].characters.itemByRange(0, table.rows[ii].cells[4].texts[0].length-1).strikeThru = true; 
    table.rows[ii].cells[4].texts[0].characters.itemByRange(0, table.rows[ii].cells[4].texts[0].length-1).strikeThroughWeight = 1.5;   
    table.rows[ii].cells[4].texts[0].characters.itemByRange(0, table.rows[ii].cells[4].texts[0].length-1).strikeThroughOffset = 4;     
    }  
app.activeDocument.select(NothingEnum.nothing);
app.activeDocument.save();
} // wordStyling
} // theAction.onClick
///
win.onClose = function () { app.activate(); }
///
win.show();
///////////////////////