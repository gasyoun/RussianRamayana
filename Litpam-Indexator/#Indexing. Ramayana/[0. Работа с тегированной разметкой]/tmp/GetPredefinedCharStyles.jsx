// GetPredefinedCharStyles.jsx

/*
В скрипте UseReadyTable.jsx добавлено сохранение в четвёртой колонке предлагаемых символьных стилей для оформления терминов.
Этот скрипт извлекает из этой колонки названия, создаёт символьные стили, и помещает их в группу символьных стилей.
Название этой группы в переменной groupForIndexStyles (см. файл ForIndex.jsxinc). по умолчанию название этой группы 'Index styles'.
В каждом стиле определяется только цвет текста, usedColor в файле ForIndex.jsxinc. По умолчанию это 'IndexStylesColor'.

Должно быть открыто два файла — файл вёрстки и файл IndexList с именами символьных стилей в четвёртой колонке.

***

Собрать все предлагаемые стили сперва в колонке таблицы IndexList, а потом в группе символьных стилей важно в случае, если есть размеченный тегами файл.
Работа с ним выполняется при помощи скрипта FindTags.jsx

29.11.2022 - этот скрипт не используется:
1)  идея сразу собрать в четвёртой колонке все символьные стили оказалась неверной - в этой колонке должны быть стили только для случаев когда текст уже оформлен ими в тексте
Тогда мы этот текст будем искать не по grep-запросу, а по названию символьного стиля.
Так что после завершения работы UseReadyTable.jsx четверткая колонка пустая.
2) Скрипт FindTags.jsx извлекает теговую разметку, оформляет символьными стилями фрагменты текста, и все такие символьные стили собираются в группе символьных стилей 'Index styles'.
2) Для помещения в эту колонку названий символьных стилей используется скрипт GatherStyleNamesInIndexList.jsx.

*/

// © Михаил Иванюшин, 2023  |  dotextok@gmail.com  |  dotextok.ru

#targetengine "GetPredefinedCharStyles"
#include "ForIndex.jsxinc"

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
var styleNames = [];
var win = new Window ("palette", programTitul);
var jobFile, jobFileID, table, tableFileID, jobStory, tabStory, tabStoryID, tableID, jobPath, tablePath;
win.alignChildren = ["fill", "fill"];
var jobStart = "Поставьте курсор в текст вёрстки и установите флажок";
var jobOK = "Файл вёрстки выбран";
var job = win.add("checkbox", undefined, jobStart); 
job.value = false;
var  inTableStart = "Поставьте курсор в текст таблицы IndexList и установите флажок";
var inTableOK = "Таблица выбрана";
var inTable = win.add("checkbox", undefined, inTableStart);
inTable.value = false;
inTable.enabled = false;
separator1 = win.add ("panel");
separator1.minimumSize.height = separator1.maximumSize.height = 1;
///
var action = win.add("button", undefined, "Подготовить символьные стили"); 
action.enabled = false;
////
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
////
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
if (app.selection.length == 0 || app.selection[0].constructor.name != "InsertionPoint" || app.selection[0].parent.constructor.name != "Cell") {
       alert("Курсор должен быть в ячейке таблицы.", programTitul);
       inTable.value = false;       
       return;    
    }
table = app.selection[0].parent.parent;
if (table.columns.length != 5) {
    alert("В таблице 'IndexList' должно быть пять колонок, а тут их " + table.columns.length + ".", programTitul);
    inTable.value = false;   
    return;
    }
///
inTable.text = inTableOK;
inTable.value = true;
inTable.enabled = false;
tableFileID = app.activeDocument.id; 
tabStory = app.selection[0].parent.parent.parent.parentStory;
tabStoryID = tabStory.id;
tableID = table.id;
action.enabled = true;   
return;
///
} // inTable.onClick
///
action.onClick = function () { // action.onClick
if (app.activeDocument.id == jobFileID) {
    app.activeDocument = app.documents[1];
    }
doc = app.activeDocument;
var stories = doc.stories;
var storyNotFound = true;
for (var s = 0; s < stories.length; s++) {
    if (stories[s].id != tabStoryID) continue;
    storyNotFound = false;
    break;
    }
if (storyNotFound) {
    alert("Материал с таблицей не найден.");
    return;
    }
var tableNotFound = true;
var tables = stories[s].tables;
if (tables.length == 0) {
    alert("В материале нет таблиц.");
    return;
    }
for (var t = 0; t < tables.length; t++) {
    if (tables[t].id != tableID) continue;
    tableNotFound = false;
    break;
    }
if (tableNotFound) {
    alert("В материале таблица не найдена.");
    return;
    }
var table = tables[t];
while (styleNames.length > 0) styleNames.pop();
var pBar = new ProgressBar(programTitul);
pBar.reset("Извлекаем из четвёртой колонки названия символьных стилей", table.rows.length);
for (var i = 0; i < table.rows.length; i++, pBar.hit()) { // 
    styleNames.push(table.rows[i].cells[3].texts[0].contents);
    } // i++
pBar.close();
app.activeDocument = app.documents[1];
if (!app.activeDocument.colors.item(usedColor).isValid) { // ! (usedColor).isValid
    try { 
        app.activeDocument.colors.add ({name: usedColor, model:ColorModel.SPOT, space:ColorSpace.RGB, colorValue:[255, 0, 0]}) 
        } 
    catch (e) { } ; //  try / catch - цвета может уже быть в файле
    }  // ! (usedColor).isValid
if (app.activeDocument.characterStyleGroups.itemByName(groupForIndexStyles).isValid == false) { // == false
       try {
           app.activeDocument.characterStyleGroups.add({name:groupForIndexStyles});
           }
       catch (e) {
           alert("Не получилось в файле вёрстки создать группу символьных стилей '" + groupForIndexStyles + "'.", programTitul);
           return;            
           }
    } //  == false
pBar.reset("Создаём символьные стили в группе '" + groupForIndexStyles + "'", styleNames.length);
for (var c = 0; c < styleNames.length; c++, pBar.hit()) { // c++
 if (app.activeDocument.characterStyleGroups.itemByName(groupForIndexStyles).characterStyles.itemByName(String(styleNames[c])).isValid == false) app.activeDocument.characterStyleGroups.itemByName(groupForIndexStyles).characterStyles.add({name:String(styleNames[c])});
 app.activeDocument.characterStyleGroups.itemByName(groupForIndexStyles).characterStyles.itemByName(String(styleNames[c])).fillColor = usedColor;
 } // c++
pBar.close();
win.close();
app.activate();
} // action.onClick
///
win.show();
