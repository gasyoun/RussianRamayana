// DeleteUnnecessarySign [SkipTheWord].jsx

/*
Удаление ненужных маркеров индексного указателя и изменение цвета текста на SkipTheWord.
Перед запуском надо выделить текст, чтобы в выборке были одна-две чёрные буквы до и после красного текста.
Будут удалены все маркеры предметного указателя, попавшие в область выделения, и все знаки выделения станут цвета SkipTheWord.

Переменные keepColor и keepStyle определяют, будет или нет повторён в следующем поиске данный параметр -- цвет и начертание.
Можно продолжить этот подход включением в повторяемые параметры поиска кегля, шрифта и пр.

// © Михаил Иванюшин, 2024  |  dotextok@gmail.com  |  dotextok.ru

*/

#targetengine "DeleteUnnecessarySignS"
#include "../ForIndex.jsxinc" 

//~ var keepColor = false; // запоминать или нет цвет искомого текста
//~ var keepStyle = true; // запоминать или нет начертание искомого текста

app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll; // см. http://adobeindesign.ru/2008/10/24/restore-ui/

var programTitul = "Запрет помещать термины в указатель";
if (app.documents.length == 0) {
    alert("Нет открытых документов.", programTitul);
    exit();
    }
try { 
    app.activeDocument.colors.add ({name: "SkipTheWord", model: ColorModel.SPOT, space: ColorSpace.RGB, colorValue: nilColorSample}); 
   } 
catch (e) { };
var win = new Window ("palette", ">S<");
//var findSet = "";
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
//~ findSet = app.findGrepPreferences.findWhat;
//~ findStyle = app.findGrepPreferences.fontStyle;    
//~ findColor = app.findGrepPreferences.fillColor; 
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
app.findGrepPreferences = app.changeGrepPreferences = null;
app.findGrepPreferences.findWhat = "~I"; 
app.changeGrepPreferences.changeTo = "";     
var rez = sel.findGrep();
if (rez.length == 0) {
    alert("Маркеры указателя не найдены.",programTitul);
    return;     
    }
var pos, blackFound;
for (var m = 0; m < rez.length; m++) { // m++
    blackFound = false;
    pos = rez[m].index;
    do {
        pos = pos +1;
        if (story.characters[pos].fillColor == app.activeDocument.colors.item("Black")) { 
            blackFound = true; 
            break; 
            }
        story.characters[pos].fillColor = app.activeDocument.colors.item("SkipTheWord");
        }
    while (blackFound == false);
    } // m++
app.findGrepPreferences = app.changeGrepPreferences = null;
app.findGrepPreferences.findWhat = "~I"; 
app.changeGrepPreferences.changeTo = "";     
sel.changeGrep(); 
app.findGrepPreferences = app.changeGrepPreferences = null;
//~ app.findGrepPreferences.findWhat = findSet;
//~ if (keepColor) app.findGrepPreferences.fillColor = findColor;
//~ if (keepStyle) app.findGrepPreferences.fontStyle = findStyle; 
} // delButton.onClick 
///
win.onClose = function () { // win.onClose
app.findGrepPreferences = app.changeGrepPreferences = null;    
app.activate();
} // win.onClose
///
win.show();


    