// FindTagsLight.jsx

/*
В буфере должна быть полная тегированая строка: первый знак # потом термин и затем символьный стиль в фигурных скобках.
В тексте вёрстки выделяется термин. Он должен быть таким, как тот, что в буфере. Можно область выделения делать чуть больше, чем обрабатываемы термин.
И этот термин в вёрстке оформляется символьным стилем, имя которого в буфере. Или отмечается цветом, если в фигурных скобках nil
*/

// © Михаил Иванюшин, 2023  |  dotextok@gmail.com  |  dotextok.ru

#include "../ForIndex.jsxinc"

app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll; // см. http://adobeindesign.ru/2008/10/24/restore-ui/

var nilColor = "nilColor";
var programTitul = "Стилевое оформление термина";
if (app.documents.length == 0) {
    alert("Нет открытого документа.", programTitul);
    exit();
    }
if (app.activeDocument.characterStyleGroups.itemByName(groupForIndexStyles).isValid == false) {
    alert("Группа символьных стилей " + groupForIndexStyles + " должна быть создана раньше запуска этого скрипта.", programTitul); 
    exit();    
    }
var sel = app.selection[0];   
if (sel == 0 || (sel.constructor.name != "Word" && sel.constructor.name != "Text" && sel.constructor.name != "TextStyleRange" && sel.constructor.name != "Paragraph")) {
    alert("Должен быть выделен термин, выделенное сейчас - это " + sel.constructor.name + "." , programTitul);
    exit();
    }
if (sel.paragraphs.length > 1) {
    alert("В этой задаче предполагается выделение нескольких слов в пределах одного абзаца.", programTitul);
    exit();
    }
//var theFrame = app.activeDocument.pages[-1].textFrames.add({strokeWeight:0});
var theFrame = app.activeWindow.activePage.textFrames.add({strokeWeight:0});
if (theFrame.strokeWeight != 0) theFrame.strokeWeight = 0;
theFrame.textWrapPreferences.textWrapMode = TextWrapModes.NONE;
theFrame.geometricBounds = ["-40mm","-10mm","-10mm","150mm"];
theFrame.texts[0].pointSize = 3;
theFrame.bringToFront();
theFrame.texts[0].contents = "";
theFrame.texts[0].insertionPoints[0].select();
app.paste();
if (theFrame.texts[0].length == 0 || theFrame.texts[0].characters[0].contents != "#" || theFrame.texts[0].characters[-1].contents != "}") {
    alert("Содержимое буфера не подходит для решения этой задачи. Проверьте, есть ли в области выделения '#' и '}'. Они должны быть первым и последним знаками выделенного текста.", programTitul);
    theFrame.remove(); 
    backToPage();    
    exit();
    }
var story = theFrame.texts[0].parentStory;
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
app.findGrepPreferences.findWhat = "#\.+\{\.+\?\}";
var found = story.findGrep();
if (found.length == 0) {
    alert("В тексте из буфера теги ( #...{...} ) не найдены.", programTitul);   
    theFrame.remove();    
    backToPage();
    exit();
    }
var fsB = Number(found[0].contents.indexOf("{"));
var fsA = Number(found[0].contents.indexOf("}"));
if (fsB == -1 || fsA == -1) {   
    alert("Отстутствует одна из фигурных скобок.", programTitul); 
    theFrame.remove();    
    backToPage();    
    exit();      
    }
var textForSearch = String(found[0].characters.itemByRange(1,fsB-1).contents); // текст, который надо оформить символьным стилем
var styleName = found[0].characters.itemByRange(fsB+1, fsA-1).contents; // название этого символьного стиля
theFrame.remove();
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
app.findGrepPreferences.findWhat = textForSearch; 
var sampleRez = sel.findGrep();
if (sampleRez.length == 0) {
    alert("Текст '" + textForSearch + "' не найден. Возможно, перед открывающей фигурной скобкой есть ненужный пробел.", programTitul); 
    backToPage();     
    exit();
    } 
app.doScript(selAction, ScriptLanguage.JAVASCRIPT, [], UndoModes.FAST_ENTIRE_SCRIPT, 'selAction');
backToPage();
exit();
///
function backToPage() { // backToPage
sel.insertionPoints[0].select();
app.activeWindow.activePage = app.selection[0].parentTextFrames[0].parentPage; 
app.activeWindow.zoomPercentage = 150;
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
app.activate();
} // backToPage
///
function selAction() { // selAction
if (styleName == "nil") { // nil
    if (!app.activeDocument.colors.item(nilColor).isValid) { // ! (usednilColorColor).isValid
        try { 
            app.activeDocument.colors.add ({name: nilColor, model:ColorModel.SPOT, space:ColorSpace.RGB, colorValue:nilColorSample}) 
            } 
        catch (e) { } ; //  try / catch - цвета может уже быть в файле
        }  // ! (nilColor).isValid 
    sampleRez[0].fillColor = nilColor;        
    return;
    }  // nil
if (app.activeDocument.characterStyleGroups.itemByName(groupForIndexStyles).characterStyles.item(String(styleName)).isValid == false) {
    // добавляем отсутствующий символьный стиль.
    app.activeDocument.characterStyleGroups.itemByName(groupForIndexStyles).characterStyles.add({name:String(styleName)});
     app.activeDocument.characterStyleGroups.itemByName(groupForIndexStyles).characterStyles.itemByName(String(styleName)).fillColor = usedColor;        
    }
var start = sampleRez[0].index;
var end = Number(start) + Number(sampleRez[0].length) - 1;
var _appliedFont = sampleRez[0].characters[0].appliedFont;
var _pointSize = sampleRez[0].characters[0].pointSize;
var _fontStyle = sampleRez[0].characters[0].fontStyle;
var _leading = sampleRez[0].characters[0].leading;
var _alignToBaseline = sampleRez[0].characters[0].alignToBaseline;
var _justification = sampleRez[0].characters[0].justification;
sampleRez[0].texts[0].parent.characters.itemByRange(start, end).appliedCharacterStyle = app.activeDocument.characterStyleGroups.itemByName(groupForIndexStyles).characterStyles.item(String(styleName));
// если прикладывать символьный стиль, в котором определён только цвет, к тексту, ранее оформленному другим символьным стилем, то в этом тексте может потеряться часть оформления.
// Поэтому перед приложением стиля с цветом сперва были сохранены основные параметры текста - шрифт, кегль, начертание и пр., и после приложения символьного стиля запомненные параметры восстановлены.
sampleRez[0].texts[0].parent.characters.itemByRange(start, end).appliedFont = _appliedFont;
sampleRez[0].texts[0].parent.characters.itemByRange(start, end).pointSize = _pointSize;
sampleRez[0].texts[0].parent.characters.itemByRange(start, end).leading = _leading;
sampleRez[0].texts[0].parent.characters.itemByRange(start, end).alignToBaseline = _alignToBaseline;
sampleRez[0].texts[0].parent.characters.itemByRange(start, end).justification = _justification;   
 return;
 } //  selAction
