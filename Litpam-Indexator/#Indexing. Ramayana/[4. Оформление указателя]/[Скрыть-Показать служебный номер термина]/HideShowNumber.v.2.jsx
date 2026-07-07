//  HideShowNumber.jsx

/*
В указателях могут быть термины, после которых идёт число. Формат один из трёх: Пифагор_1 царь-2  князь=3
Надо иметь возможность скрывать и показывать эти разделитель и номер.
= Скрыть: находятся такие номера, и их кегль делается 0,1 пт, масштаб по гризонтали 1%, и они становятся.бесцветными
= Показать: находятся тексты с оформлением "0,1 пт 1% бесцветный", узнаётся, какой кегль и цвет у знака слева, и найденный текст оформляется так же.
Скрипт работает в выдеденной области материала.

Полная информация на кнопке [?]

Если вам непонятно назначение этой программы, значит, в ваших работах нет таких замороченных случаев, когда на время индексирования номер нужен, но его надо скрыть после завершения этой работы.

// © Михаил Иванюшин, 2023  |  dotextok@gmail.com  |  dotextok.ru
*/

#targetengine "HideShowNumber"
 
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll; // см. http://adobeindesign.ru/2008/10/24/restore-ui/

var ProgressBar = function(title) { // ProgressBar
var w = new Window('palette', title, {x:0, y:0, width:740, height:40},{closeButton: true});
pb = w.add('progressbar', {x:20, y:12, width:700, height:12});
w.center();
this.reset = function(maxValue) {
    pb.value = 0;
    pb.maxvalue = maxValue;
    w.show();
    w.update();
    }
this.hit = function() {++pb.value; w.update();}
this.hide = function() {w.hide();}
this.close = function() {w.close(); }
} // ProgressBar

var programTitul = "Скрыть/Показать";
if (app.documents.length == 0) {
    alert("Нет открытых документов.", programTitul);
    exit();
    }
var sel;
var charStyle_selection_index = 0;
var charStyle_selection = "";
var charStyles = []; 
var charStylesID = [];
while (charStyles.length > 0) charStyles.pop();
while (charStylesID.length > 0) charStylesID.pop();
var myCharacterStyles = app.activeDocument.allCharacterStyles;
var myCharacterStyleName, obj;
for (var i=0; i < myCharacterStyles.length ; i++) { // i++
    myCharacterStyleName = myCharacterStyles[i].name;
    if (myCharacterStyleName[0] == "[") continue;    
    obj = myCharacterStyles[i];
    while(obj.parent instanceof CharacterStyleGroup) {
        myCharacterStyleName = obj.parent.name + ":" + myCharacterStyleName;
        obj = obj.parent;        
        }
    charStyles.push(myCharacterStyleName);
    charStylesID.push(myCharacterStyles[i].id);
    } // i++
if (charStyles.length == 0) {
    alert("Нет символьных стилей, подготовленных пользователем.", programTitul);
    exit();     
    }
/////
var win = new Window ("palette", programTitul);
win.alignChildren = ["fill", "fill"];
var groupRbCkbx = win.add("group");
groupRbCkbx.orientation = "row";
groupRbCkbx.alignChildren = ["fill", "center"];
var rb = groupRbCkbx.add("group");
rb.alignChildren = ["left", "fill"];
rb.orientation = "column";
var hidden = rb.add("radiobutton", undefined, "Скрыть номер"); 
var shown = rb.add("radiobutton", undefined, "Показать номер");
separatorV = groupRbCkbx.add ("panel");
separatorV.minimumSize.width = separatorV.maximumSize.width = 1;
separatorV.alignment = ["fill", "fill"];
var ckbx = groupRbCkbx.add("group");
ckbx.orientation = "column";
var var1 = ckbx.add("checkbox", undefined, "_1");
var var2 = ckbx.add("checkbox", undefined, "-2");
var var3 = ckbx.add("checkbox", undefined, "=3");
separator1 = win.add ("panel");
separator1.minimumSize.height = separator1.maximumSize.height = 1;
separator1.alignment = ["fill", "fill"];
var useCharStyle = win.add("checkbox", undefined, "Символьный стиль оформления");
var letterCharStyle = win.add ("dropdownlist", undefined, charStyles); 
letterCharStyle.selection = charStyle_selection_index; 
letterCharStyle.minimumSize.width = letterCharStyle.maximumSize.width = 200;
letterCharStyle.enabled = false;
separator2 = win.add ("panel");
separator2.minimumSize.height = separator2.maximumSize.height = 1;
separator2.alignment = ["fill", "fill"];
var buttons = win.add("group");
buttons.orientation = "row";
buttons.alignChildren = ["center", "fill"];
var action = buttons.add("button", [0,0,170,28], "Выполнить");
action.enabled = false;
hidden.onClick = function () { if (var1.value || var2.value || var3.value) action.enabled = true; else action.enabled = false; }
///
shown.onClick = function () { if (var1.value || var2.value || var3.value) action.enabled = true; else action.enabled = false; }
///
useCharStyle.onClick = function () { if (useCharStyle.value) letterCharStyle.enabled = true; else letterCharStyle.enabled = false; }
///
var1.onClick = function () { // var1.onClick
if ((var1.value) && (hidden.value || shown.value)) action.enabled = true; 
 else if (!var2.value && !var3.value) action.enabled = false; 
} // var1.onClick
///
var2.onClick = function () { // var2.onClick
if ((var2.value) && (hidden.value || shown.value)) action.enabled = true; 
 else if (!var1.value && !var3.value) action.enabled = false; 
} // var2.onClick
///
var3.onClick = function () { // var3.onClick
if ((var3.value) && (hidden.value || shown.value)) action.enabled = true; 
 else if (!var1.value  && !var2.value) action.enabled = false; 
} // var3.onClick
///
var info = buttons.add("button", [0,0,28,28],"?");
///
info.onClick = function() {
var text = "В указателях могут быть термины, после которых идёт число, например, Зенон_1, царь-2 или поэт=3, т.е. варианты различаются используемым разделителем между словом и числом.\nДефис — один из двух: обычный или неразделяемый.\nСкрипт предоставляет возможность скрывать эти разделитель и номер, и делать их вновь видимыми. При этом можно определить символьный стиль текста, где будет выполняться поиск.\n\n> Скрыть: находятся такие номера, и их кегль делается 0,1 пт, масштаб по горизонтали 1%, и они становятся бесцветными.\n\n> Показать: находятся тексты с оформлением «0,1пт 1% бесцветный», узнаётся, какой кегль, масштаб по горизонтали и цвет у знака слева, и найденный текст оформляется так же.\n\nСкрипт работает в выдеденной области материала.\nЕсли результаты работы не совпали с ожиданиями, поставьте курсор в текст и нажмите Ctrl+Z, вёрстка вернётся к состоянию до запуска программы.";
alert(text, "Скрыть номер / показать номер"); 
}
///
action.onClick = function () { // action.onClick
var sampleAr = []; 
var sample = "";
var num;
var rez;
if (testSelection() == -1) return;
sel = app.selection[0];
if (hidden.value) { // hidden
    while (sampleAr.length > 0) sampleAr.pop();    
    if (var1.value) sampleAr.push("_\\d+");
    if (var2.value) sampleAr.push("[-‑]\\d+");   
    if (var3.value) sampleAr.push("=\\d+");
    if (sampleAr.length == 0) {
        alert("Флажки не установлены, непонятно, что скрывать.",programTitul);
        return;        
        }
    else  sample = "(" + sampleAr.join("|") + ")";
    app.findGrepPreferences = null; 
    app.changeGrepPreferences = null;
    app.findGrepPreferences.findWhat = sample;   
    if (useCharStyle.value) app.findGrepPreferences.appliedCharacterStyle = app.activeDocument.characterStyles.itemByID(Number(charStylesID[letterCharStyle.selection.index]));
    rez = sel.findGrep(); 
    var rezLength = rez.length;
    if (rezLength == 0) {
        alert("Ничего не найдено.",programTitul);
        return;     
        }
    app.doScript(hideAction, ScriptLanguage.JAVASCRIPT, [], UndoModes.FAST_ENTIRE_SCRIPT, 'hideAction');
    alert("Число скрытых от глаза номеров: " + rezLength, programTitul);
    app.findGrepPreferences = null; 
    app.changeGrepPreferences = null;   
    return;
    }  // hidden
if (shown.value) { // shown
    while (sampleAr.length > 0) sampleAr.pop();
    if (var1.value) sampleAr.push("_\\d+");
    if (var2.value) sampleAr.push("[-‑]\\d+");   
    if (var3.value) sampleAr.push("=\\d+");
    if (sampleAr.length == 0) {
        alert("Флажки не установлены, непонятно, что показывать.",programTitul);
        return;        
        }
    else  sample = "(" + sampleAr.join("|") + ")";
    app.findGrepPreferences = null; 
    app.changeGrepPreferences = null;
    app.findGrepPreferences.findWhat = sample;   
    app.findGrepPreferences.pointSize = 0.1;  
    app.findGrepPreferences.horizontalScale = 1;  
    app.findGrepPreferences.fillColor = "None";      
    if (useCharStyle.value) app.findGrepPreferences.appliedCharacterStyle = app.activeDocument.characterStyles.itemByID(Number(charStylesID[letterCharStyle.selection.index]));
    rez = sel.findGrep(); 
    var rezLength = rez.length;
    if (rezLength == 0) {
        alert("Ничего не найдено.",programTitul);
        return;     
        }
    app.doScript(shownAction, ScriptLanguage.JAVASCRIPT, [], UndoModes.FAST_ENTIRE_SCRIPT, 'hideAction');
    alert("Число вновь доступных для чтения номеров: " + rezLength, programTitul);
    app.findGrepPreferences = null; 
    app.changeGrepPreferences = null;  
    return;    
    } // shown
///
function hideAction() { // hideAction
var pBar = new ProgressBar("Отображение номеров скрывается");
pBar.reset(rez.length);    
for (var i = 0; i < rez.length; i++, pBar.hit()) { // i++
    num = rez[i];
    num.pointSize = 0.1;
    num.horizontalScale = 1;  
    num.fillColor = "None";         
    } // i++
pBar.close();
} // hideAction
///
function shownAction() { // shownAction
var prevChar; 
var story = rez[0].parentStory;
var pBar = new ProgressBar("Номера вновь становятся видимы");
pBar.reset(rez.length);  
for (var i = 0; i < rez.length; i++, pBar.hit()) { // i++
    num = rez[i];
    prevChar = story.characters[num.index-1];
    a=0;
    for (var c = 0; c < num.length; c++) { // c++
        story.characters[num.index+c].pointSize = prevChar.pointSize;
        story.characters[num.index+c].horizontalScale = prevChar.horizontalScale;  
        story.characters[num.index+c].fillColor = prevChar.fillColor;          
        } // c++        
    } // i++
pBar.close();
} // shownAction
}  // action.onClick
///
win.show();
///
function testSelection () { // testSelection
sel = app.selection[0];
if (sel == null || (sel.constructor.name != "Word" && sel.constructor.name != "Paragraph" && sel.constructor.name != "Text" && sel.constructor.name != "TextColumn" && sel.constructor.name != "TextStyleRange")) {
    alert("Выделите текст для обработки.",programTitul);
    return -1;    
    }
if (sel.parentStory.overflows) {
    alert("В материале есть вытесненный текст.",programTitul);
    return -1;        
    }
return 0;
} // testSelection


