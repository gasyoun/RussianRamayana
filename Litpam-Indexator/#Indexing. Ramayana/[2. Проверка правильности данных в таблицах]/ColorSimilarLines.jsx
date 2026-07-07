// ColorSimilarLines.jsx

/* 
Программа окрашивает в  IndexList-файле текст строк с одинаковыми или похожими терминами     
Другая программа, помогающая найти одинаковые запросы -- TermCompare.jsx
*/
    
// © Михаил Иванюшин. 2023  |   dotextok.ru   |   dotextok@gmail.com

/////////////////////////

#include "../ForIndex.jsxinc"

programTitul = "Одинаковые и похожие строки в таблице";  

var repeated = 0; // число повторяющихся записей
var wasCoincidence = false; // true - если было совпадение
var cur, prev, curN, prevN;

if (app.documents.length == 0) {
    alert("Нет открытых документов.", programTitul);
    exit();
    }
if (app.activeDocument.name.match("IndexList") == null) {
    alert("Это не IndexList-файл.", programTitul);
    exit();
    }
var SimilarItemsColor = "SimilarItemsColor";
if (!app.activeDocument.colors.item(SimilarItemsColor).isValid) { // ! (SimilarItemsColor).isValid
    try { 
        app.activeDocument.colors.add ({name: SimilarItemsColor, model:ColorModel.SPOT, space:ColorSpace.RGB, colorValue:[0, 155, 0]}) 
        } 
    catch (e) { } ; //  try / catch - цвета может уже быть в файле
    } // ! (SimilarItemsColor).isValid
var mySel = app.selection[0];
if (mySel == null  || (mySel.parent.constructor.name != "Cell")) {    
    alert("Поставьте курсор в таблицу.", programTitul); 
    exit(); 
    }
var table = mySel.parent.parent;
if (table.columns.length != 3) {
    alert("Скрипт обрабатывает таблицу с терминами, в ней должно быть три колонки, а это какая-то другая таблица.", programTitul); 
    exit();     
    }
var longTermin, shortTermin, partOfWord, rz;
var rows = table.rows.everyItem().getElements();
var rowsLength = rows.length;
var pBar = new ProgressBar(programTitul);
var searchMode = "Поиск одинаковых и похожих терминов в ячейках соседних строк";
pBar.reset(searchMode, rowsLength);
for (var r = 1; r < rowsLength; r++, pBar.hit()) { // r++
    if (rows[r].cells[2].texts[0].length == 0) continue;
    // поиск одинаковых терминов
    cur = rows[r].cells[2].texts[0].contents;
    prev = rows[r-1].cells[2].texts[0].contents;
    if (cur != prev) { // cur != prev
        // они не совпали. Но может быть похожи?
        // поиск похожих терминов
        curN = rows[r].cells[0].texts[0].contents;
        prevN = rows[r-1].cells[0].texts[0].contents;  
        if (curN.length == prevN.length) { // ==
            partOfWord = curN.substring(0, curN.length-1);
            rz = prevN.match(partOfWord); 
            if (rz != null) { // -- есть совпадение
                repeated++;       
                for (var c = 0; c < 3; c++) rows[r-1].cells[c].texts[0].fillColor = SimilarItemsColor;
                for (var c = 0; c < 3; c++) rows[r].cells[c].texts[0].fillColor = SimilarItemsColor;        
                continue;            
                } 
            } // ==
        else if (Math.abs(curN.length - prevN.length) == 1) { // == 1
            if (curN.length > prevN.length) { longTermin = curN; shortTermin = prevN; }
            else { shortTermin = curN; longTermin = prevN; }
            rz = longTermin.match(shortTermin);
             if (rz != null) { // -- есть совпадение
                repeated++;       
                for (var c = 0; c < 3; c++) rows[r-1].cells[c].texts[0].fillColor = SimilarItemsColor;
                for (var c = 0; c < 3; c++) rows[r].cells[c].texts[0].fillColor = SimilarItemsColor;        
                continue;            
                } 
            }  // == 1  
        // завершение поиска похожих терминов
        if (wasCoincidence) {
            repeated++; 
            }
        wasCoincidence = false;
        continue;
        } //  // cur != prev
    else { // cur == prev
        repeated++;    
        wasCoincidence = true;    
        for (var c = 0; c < 3; c++) rows[r-1].cells[c].texts[0].fillColor = SimilarItemsColor;
        for (var c = 0; c < 3; c++) rows[r].cells[c].texts[0].fillColor = SimilarItemsColor;        
        continue;
        } // cur == prev
    } // r++
pBar.close();
if (wasCoincidence) { repeated++; }
var rezText = "";
if (repeated > 0) rezText = "В таблице есть строки с одинаковыми или похожими терминами, они отмечены зелёным цветом (SimilarItemsColor)."; else rezText = "В таблице проблемных строк нет.";
alert(rezText, programTitul);
exit();



