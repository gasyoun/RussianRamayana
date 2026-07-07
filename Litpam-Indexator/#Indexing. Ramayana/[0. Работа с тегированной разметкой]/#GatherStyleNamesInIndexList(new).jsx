// #GatherStyleNamesInIndexList(new).jsx

/*
Если выполнялся перенос теговой разметки в вёрстку, эту процедуру выполняет скрипт FindTags.jsx,
то в этом файле есть группа символьных стилей 'Index styles' (переменная groupForIndexStyles в файле 'ForIndex.jsxinc').
Данный скрипт создаёт для каждой строки предполагаемое название символьного стиля и проверяет -- есть ли такое название среди стилей в группе 'Index styles'.
Если есть, то это название помещается в четвёртую ячейку строки этого термина.
*/

// © Михаил Иванюшин, 2023  |  dotextok@gmail.com  |  dotextok.ru

#targetengine "FindTags"
#include "../ForIndex.jsxinc"

app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll; // см. http://adobeindesign.ru/2008/10/24/restore-ui/

var programTitul = "Извлечение символьных стилей";
if (app.documents.length == 0) {
    alert("Нет открытых документов.", programTitul);
    exit();
    }
if (app.documents.length != 2) {
   alert("Для работы скрипта должны быть открыты два файла — файл IndexList, и файл вёрстки.", programTitul);  
    exit();
    }
var tablePath, table;
var jobPath, jobFileID;
var styleNames = {};
///
var win = new Window ("palette", programTitul);
app.toolBoxTools.currentTool = UITools.TYPE_TOOL;
win.alignChildren = ["fill", "fill"];
var jobStart = "Поставьте курсор в текст вёрстки и установите флажок";
var jobOK = "Файл вёрстки выбран";
var job = win.add("checkbox", undefined, jobStart); 
var tableStart = "Поставьте курсор в таблицу IndexList и установите флажок";
var tableOK = "Таблица выбрана";
var theTable = win.add("checkbox", undefined, tableStart);
theTable.value = false;
job.value = false;
job.enabled = true;
theTable.enabled = false;
separator1 = win.add ("panel");
separator1.minimumSize.height = separator1.maximumSize.height = 1;
///
var action = win.add("button", undefined, "Собрать в IndexList названия символьных стилей"); 
action.enabled = false;
/////
job.onClick = function() { // job.onClick  
if (app.activeDocument.characterStyleGroups.itemByName(groupForIndexStyles).isValid == false || app.activeDocument.characterStyleGroups.itemByName(groupForIndexStyles).characterStyles.length == 0) {
       alert("В открытом файле нет группы символьных стилей '" + groupForIndexStyles + "' или в этой группе ничего нет.", programTitul);
       job.value = false;       
       return;    
    }
for (var i = 0; i < app.activeDocument.characterStyleGroups.itemByName(groupForIndexStyles).characterStyles.length; i++) {
    styleNames[app.activeDocument.characterStyleGroups.itemByName(groupForIndexStyles).characterStyles[i].name] = "+";
    }
jobFileID = app.activeDocument.id;
jobPath = app.activeDocument.filePath; 
job.text = jobOK;
job.enabled = false;
theTable.enabled = true;
app.activeDocument = app.documents[1];
} // job.onClick 
////
theTable.onClick = function () { // theTable.onClick    
tablePath = app.activeDocument.filePath;  
if (app.activeDocument.id == jobFileID) {
       alert("Сейчас выбран тот же файл, что только что был указан как файл вёрстки.", programTitul);
       theTable.value = false;       
       return;
       } 
if (decodeURI(jobPath) != decodeURI(tablePath)) {
       alert("Файл вёрстки и файл IndexList должны быть в одной папке.", programTitul);
       theTable.value = false;       
       return;  
       }
var sel = app.selection[0];
if (app.selection.length == 0 || sel.constructor.name != "InsertionPoint" || sel.parent.constructor.name != "Cell") {
    alert("Курсор должен быть в ячейке таблицы.", programTitul);
    theTable.value = false;
    return;
    }
if (decodeURI(app.activeDocument.name).split("IndexList").length != 2) {
    alert("Название файла с таблицей должно начинаться с 'IndexList'.", programTitul);
    theTable.value = false;
    return;    
    }
table = sel.parent.parent;
if (table.columns.length != 5) {
    alert("В таблице IndexList пять колонок, а тут какая-то другая таблица.", programTitul);
    theTable.value = false;
    return;     
    }
if (table.parent.parentStory.overflows) {
    alert("В файле с таблицей не должно быть вытесненного текста.", programTitul);
    theTable.value = false;
    return;    
    }
///
theTable.text = tableOK;
theTable.value = true;
theTable.enabled = false; 
action.enabled = true;
return;
///
} // theTable.onClick
////
action.onClick = function () { // action.onClick
var tableRowsLength = table.rows.length;
var curTermTopLevel = "";
var term = "";
var termSum = "";
var pBar = new ProgressBar(programTitul);
pBar.reset("Помещение в четвёртую колонку названий символьных стилей", tableRowsLength);
for (var i = 0; i < tableRowsLength; i++, pBar.hit()) { // i++
  //  if (table.rows[i].cells[3].texts[0].length > 0) continue; // такой стиль уже есть
    term = table.rows[i].cells[0].texts[0].contents;
    if (term[1] == "-") term = term.split("-")[1]; // если несколько указателей, то перед каждым термином латинская буква и дефис. Надо оставить чистый термин, без служебных буквы и дефиса  
    var termLength = term.length;
    if (term[termLength-2] == "=") term = term.split("=")[0]; // знак равенства отделяет номер при нумерации совпадающих терминов. Эта нумерация выполняется скриптом UseReadyTable.jsx/
    if (table.rows[i].cells[0].texts[0].appliedParagraphStyle == app.activeDocument.paragraphStyleGroups.item(indStyleGroup).paragraphStyles.item(indStyle1)) { // indStyle1
        curTermTopLevel = term;
        if (styleNames[term] == undefined) continue;
        else {
            table.rows[i].cells[3].texts[0].contents = term;
            continue;
            }
        } // indStyle1
    else { 
        termSum = curTermTopLevel + "\\" + term;
        if (styleNames[termSum] == undefined) continue;
        else table.rows[i].cells[3].texts[0].contents = termSum; 
        }
    } // i++
pBar.close();
alert("Символьные стили из группы '" + groupForIndexStyles + "' добавлены в четвёртую колонку файла IndexList.", programTitul);
win.close();
app.activate();
} // action.onClick
///
win.show();
