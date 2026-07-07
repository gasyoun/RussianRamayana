// MergeTwoIndexListTables.jsx

/*
Программа объединяет две IndexList таблицы в одну таблицу.
Эти таблицы должны относиться к отдельным указателям, т.е. в  названиях терминов сперва буква указателя, потом дефис, и затем термин.
Важно, чтобы эти таблицы уже имели в четвёртой колонке необходимые символьные стили.
Прежде чем объединять, надо изменить название таблицы,в которую будут добавляться новые строки.
Теперь в квадратных скобках должен быть символ '@', например, IndexList[@]123.indd.
Это делает пользователь.
В конец таблицы, что в активном файле, добавляется таблица второго файла.
Термины добавляемой таблицы сохранят свою иерархию стилевого оформления, которое было в исходном файле.
*/
// 19.01.2023
// © Михаил Иванюшин, 2023  |  dotextok@gmail.com  |  dotextok.ru

#targetengine "MergeIndexListTables"
#include "../ForIndex.jsxinc"

app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll; // см. http://adobeindesign.ru/2008/10/24/restore-ui/

var programTitul = "Объединение двух таблиц";
if (app.documents.length == 0) {
    alert("Нет открытых документов.", programTitul);
    exit();
    }
var docNum = app.documents.length;
if (docNum != 2) {
   alert("Открытых файлов должно быть два.", programTitul);  
    exit();
    }
if (app.activeDocument.name.split("[@]").length == 1) {
   alert("Имя активного файла должно начинаться так: IndexList[@]", programTitul);  
    exit();    
    }
if (decodeURI(app.documents[0].filePath) != decodeURI(app.documents[1].filePath)) {
    alert("Файлы должны быть в одной папке.", programTitul);  
    exit();   
    }
var curDoc;
var docName;
var stories;
var curSt;
var tables;
var curTab;
var tableNotFound;
var docID = [];
var storyID = [];
var tableID = [];
var cellStyles = [];
while (docID.length > 0) docID.pop();
while (storyID.length > 0) storyID.pop();
while (tableID.length > 0) tableID.pop();
while (cellStyles.length > 0) cellStyles.pop();
var pBar = new ProgressBar(programTitul);
pBar.reset("1/3 Поиск таблиц в открытых файлах", docNum);
for (d = 0; d < docNum; d++, pBar.hit()) { // d++
    curDoc = app.documents[d];
    docID.push(curDoc.id);
    docName = decodeURI(curDoc.name);
    if (docName.split("IndexList").length == 1) {
        pBar.close();
        alert("В имени одного из открытых файлов нет 'IndexList'.", programTitul);  
        exit();       
        }
    stories = curDoc.stories;
    if (stories.length == 0) {
        pBar.close();        
        alert("В файле " + curDoc.name + " нет текста.", programTitul);  
        exit();  
        }
    tableNotFound = true;
    for (s = 0; s < stories.length; s++) { // s++
        curSt = stories[s];
        if (curSt.tables.length == 0) continue;
        for (t = 0; t < curSt.tables.length; t++) { // t++
            curTab = curSt.tables[t];
            if (curTab.columns.length != 5) continue;
          //  if (curTab.rows[0].cells[0].texts[0].characters[1].contents != "-") continue; // если в пятистолбцовой таблице второй символ первой ячейки -- это дефис, то считаем, что это та таблица, что требуется.
            tableNotFound = false;
            break;
            } // t++
        if (!tableNotFound) {
            storyID.push(curSt.id);
            tableID.push(curTab.id);  
            cellStyles.push(curTab.rows[0].cells[0].texts[0].insertionPoints[0].appliedParagraphStyle.name);
            cellStyles.push(curTab.rows[0].cells[0].texts[0].insertionPoints[0].appliedParagraphStyle.parent.name);            
            if (curTab.rows[0].cells[0].texts[0].characters[1].contents != "-") {
            pBar.close();   
            alert("Эта программа для объединения таблиц, в которых термины в левой колонке предваряются буквой и дефисом.\nТо есть это таблицы отдельных указателей, а не просто созданные IndexList файлы.", programTitul);  
            exit();                
                }
            break;
            }
        } // s++
    if (tableNotFound) {
        pBar.close();        
        alert("В файле " + curDoc.name + " нет таблицы.", programTitul);  
        exit();          
        }
    } // d++
app.activeDocument = app.documents.itemByID(docID[0]);
var doc = app.activeDocument;
var table = doc.stories.itemByID(storyID[0]).tables.itemByID(tableID[0]);
var nextTable;
if (cellStyles[0] != indStyle1 || cellStyles[2]  != indStyle1 || cellStyles[1] != indStyleGroup || cellStyles[3]  != indStyleGroup) {
    pBar.close();
    alert("Что-то не так с названиями абзацных стилей первых ячеек объединяемых таблиц. Они должны называться " + indStyle1 + ", и каждый стиль должен быть в группе " + indStyleGroup + ".", programTitul);  
    exit();      
    }
for (var dd = 1; dd < docID.length; dd++) { // dd++
    nextTable = app.documents.itemByID(docID[dd]).stories.itemByID(storyID[dd]).tables.itemByID(tableID[dd]);
    MergeTable (table, nextTable)
    }  // dd++
pBar.close();
alert("Таблица добавлена.", programTitul);
exit();
////////
function MergeTable (table1,table2) {// MergeTable
 var pBar = new ProgressBar(programTitul); 
var table2ColumnNumber = table2.columns.length;
var table2RowNumber = table2.rows.length;
pBar.reset("2/3 Объединение таблиц: добавление строк", table2RowNumber);  
for(var i=0; i<table2RowNumber; i++, pBar.hit()){
    table1.rows.add();
    }
var i=0;
var cellTextStyleName;
pBar.reset("3/3 Объединение таблиц: копирование текста ячеек", table2RowNumber);
for(var j=table2RowNumber-1;j>=0;j--, pBar.hit()){
    table1.rows[-1-i].contents=table2.rows[j].contents;
    cellTextStyleName = table2.rows[j].cells[0].texts[0].insertionPoints[0].appliedParagraphStyle.name;
    table1.rows[-1-i].cells[0].texts[0].appliedParagraphStyle = app.activeDocument.paragraphStyleGroups.itemByName(indStyleGroup).paragraphStyles.itemByName(cellTextStyleName); // сохранение иерархии стилевого оформления
    i++;
    }
pBar.close();
} // MergeTable



