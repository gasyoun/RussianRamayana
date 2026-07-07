// DeleteUnnecessarySign [Black].jsx

/*
Удаление ненужных маркеров индексного указателя и изменение цвета текста на чёрный.
Перед запуском надо выделить текст, чтобы в выборке были одна-две чёрные буквы до и после красного текста.
Будут удалены все маркеры предметного указателя, попавшие в область выделения, и все знаки выделения станут чёрного цвета.

Переменные keepColor и keepStyle определяют, будет или нет повторён в следующем поиске данный параметр -- цвет и начертание.
Можно продолжить этот подход включением в повторяемые параметры поиска кегля, шрифта и пр.

// © Михаил Иванюшин, 2024  |  dotextok@gmail.com  |  dotextok.ru

*/

#targetengine "DeleteUnnecessarySignB"
#include "../ForIndex.jsxinc" 

var keepColor = true; // запоминать или нет цвет искомого текста
var keepStyle = true; // запоминать или нет начертание искомого текста

app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll; // см. http://adobeindesign.ru/2008/10/24/restore-ui/

var programTitul = "Удаление случайных записей в указателе";
if (app.documents.length == 0) {
    alert("Нет открытых документов.", programTitul);
    exit();
    }
var win = new Window ("palette", ">B<");
var findSet = "";
var findStyle = "";
var findColor = "";
win.margins = [1,1,1,1];
var buttonsGroup = win.add("group");
buttonsGroup.orientation = "row";
buttonsGroup.add("statictext", [0,0,7,28], "");
var delButton = buttonsGroup.add("button", [0,0,28,28], "•");
buttonsGroup.add("statictext", [0,0,7,28], "");
win.alignChildren = ["center", "center"];
delButton.onClick = function() { // delButton.onClick 
findSet = app.findGrepPreferences.findWhat;
findStyle = app.findGrepPreferences.fontStyle;    
findColor = app.findGrepPreferences.fillColor; 
if (app.documents.length == 0) win.close();   
var sel = app.selection[0];
if (sel == null || (sel.constructor.name != "Word" && sel.constructor.name != "Paragraph" && sel.constructor.name != "Text" && sel.constructor.name != "TextColumn" && sel.constructor.name != "TextStyleRange")) { // == null
    alert("Выделите текст для обработки.",programTitul);
    return;    
    } // == nul
if (sel.characters[0].fillColor.name != "Black" || sel.characters[-1].fillColor.name != "Black") {
    alert("В области выделения первый и последний знак должны быть чёрного цвета.",programTitul);
    return; 
    }
var length = sel.length;
var story = sel.parentStory;
var selIndex = sel.index;
var lastCharInSelIndex = Number(selIndex) + Number(length) - 1;
story.characters.itemByRange(selIndex, lastCharInSelIndex).fillColor = "Black";
app.findGrepPreferences = app.changeGrepPreferences = null;
app.findGrepPreferences.findWhat = "~I"; 
app.changeGrepPreferences.changeTo = "";     
sel.changeGrep(); 
app.findGrepPreferences = app.changeGrepPreferences = null;
app.findGrepPreferences.findWhat = findSet;
if (keepColor) app.findGrepPreferences.fillColor = findColor;
if (keepStyle) app.findGrepPreferences.fontStyle = findStyle; 
} // delButton.onClick 
///
win.onClose = function () { // win.onClose
app.findGrepPreferences = app.changeGrepPreferences = null;    
app.activate();
} // win.onClose
///
win.show();


    