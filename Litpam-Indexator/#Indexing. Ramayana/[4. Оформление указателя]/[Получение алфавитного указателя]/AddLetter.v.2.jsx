//  AddLetter.v,2,jsx

/*
Два варианта превращения обычного указателя в алфавитный:
- добавление прописных букв в массив выделенных строк указателя.
- первая буква слова с новой буквы оформляется выбранным символьным стилем.
   Можно добавить строку перед строкой с оформляемой символным стилем буквой.
 
 Во второй версии добавлено окно выбора, каким абзацным стилем была оформлена первая строка выделения.
 В первой версии было без вариантов, только абзацный стиль первого уровня текста для подготовки указателя (переменная indStyle1 в файле ForIndex.jsxinc)   
*/

//==== надо попробовать сделать без проверки - соответствует ли абзацный стиль первой выбранной строки определенному в jsxinc-файле стилю. Это было требованием первой версии.

// © Михаил Иванюшин, 2020-2023  |  dotextok@gmail.com  |  dotextok.ru

#targetengine "AddLetter"
#include "../../ForIndex.jsxinc"

app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll; // см. http://adobeindesign.ru/2008/10/24/restore-ui/

var letterParaStyle_selection_index = 0;
var letterParaStyle_selection = "";
var letterCharStyle_selection_index = 0;
var letterCharStyle_selection = "";
var listParaStyle_selection_index = 0;
var listParaStyle_selection = "";
var useParaStyleValue = true;
var useCharStyleValue = false;

var programTitul = "Делаем алфавитный указатель";
if (app.documents.length == 0) {
    alert("Нет открытых документов.", programTitul);
    exit();
    }
var sel = app.selection[0];
if (sel == null  || sel.constructor.name == "TextFrame" || sel.constructor.name == "InsertionPoint" || sel.hasOwnProperty("texts") == false) {
    alert("Выделите текст указателя для превращения его в алфавитный.", programTitul);
    exit(); 
    }
if (!app.activeDocument.textPreferences.smartTextReflow) {
    app.activeDocument.textPreferences.smartTextReflow = true;
    app.activeDocument.textPreferences.addPages = AddPageOptions.END_OF_STORY;
    }
if (sel.parent.overflows == true) {
    alert("В указателе не должно быть вытесненного текста.", programTitul);
    exit();     
    } 
var myStartOfFragment = sel.paragraphs[0].characters.firstItem().index;
var myEndOfFragment = sel.paragraphs[sel.paragraphs.length - 1].characters.lastItem().index;
sel.parent.characters.itemByRange(myStartOfFragment,myEndOfFragment).select();
sel = app.selection[0];

var paraStyles = []; 
var paraStylesID = [];
while (paraStyles.length > 0) paraStyles.pop();
while (paraStylesID.length > 0) paraStylesID.pop(); // 10.07.2026 (H377): было paraStyles.pop() — опустошался не тот массив, риск вечного цикла в живом targetengine
var myParagraphStyles = app.activeDocument.allParagraphStyles;
var myParagraphStyleName, obj;
for (var i=0; i < myParagraphStyles.length ; i++) { // for
    myParagraphStyleName = myParagraphStyles[i].name;
    if (myParagraphStyleName[0] == "[") continue;
    obj = myParagraphStyles[i];
    while(obj.parent instanceof ParagraphStyleGroup) {
        myParagraphStyleName = obj.parent.name + ":" + myParagraphStyleName;
        obj = obj.parent;        
        }
    paraStyles.push(myParagraphStyleName);
    paraStylesID.push(myParagraphStyles[i].id);        
    } // for
if (paraStyles.length == 0) {
    alert("Нет абзацных стилей стилей, подготовленных пользователем.", programTitul);
    exit();     
    }
/////
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
/////////
var myDefSetName  = "#AddLetter.ini"; // это файл установок программы
var myScriptFile = myGetScriptPath();
var myScriptFolder = decodeURI(myScriptFile.path);
var myFilePath = decodeURI(myScriptFolder + "/sets/" + myDefSetName); 
var myDataFile = new File (myFilePath);
if (myDataFile.open("r")) { //  r  |такой файл есть 
letterParaStyle_selection_index = myDataFile.readln();
letterParaStyle_selection = myDataFile.readln();
letterCharStyle_selection_index = myDataFile.readln();
letterCharStyle_selection = myDataFile.readln();
myDataFile.close();
if (paraStyles[letterParaStyle_selection_index] != letterParaStyle_selection) letterParaStyle_selection_index = 0;
if (charStyles[letterCharStyle_selection_index] != letterCharStyle_selection) letterCharStyle_selection_index = 0;
} // r
/////////
var win = new Window ("palette", programTitul);
win.alignChildren = ["fill", "fill"];
win.orientation = "column";
var listSize = 300;
var listParaStyle = win.add("radiobutton", undefined, "Абзацный стиль первой строки");
listParaStyle.value = listParaStyle_selection_index;
var useParaStyle = win.add("radiobutton", undefined, "Добавление абзаца с новой буквой");
useParaStyle.value = useParaStyleValue;
var usePara = win.add("group");
usePara.orientation = "column";
usePara.alignChildren = ["left", "fill"];
usePara.add("statictext", undefined, "Абзацный стиль оформления добавляемых букв");
var letterParaStyle = usePara.add ("dropdownlist", undefined, paraStyles); 
letterParaStyle.selection = letterParaStyle_selection_index; 
letterParaStyle.minimumSize.width = letterParaStyle.maximumSize.width = listSize;
///
separator1 = win.add ("panel");
separator1.minimumSize.height = separator1.maximumSize.height = 1;
separator1.alignment = ["fill", "fill"];
///
var useCharStyle = win.add("radiobutton", undefined, "Оформление буквы символьным стилем");
useCharStyle.value = useCharStyleValue;
var useChar = win.add("group");
useChar.orientation = "column";
useChar.alignChildren = ["left", "fill"];
useChar.add("statictext", undefined, "Символьный стиль оформления первой буквы слова");
var letterCharStyle = useChar.add ("dropdownlist", undefined, charStyles); 
letterCharStyle.selection = letterCharStyle_selection_index; 
letterCharStyle.minimumSize.width = letterCharStyle.maximumSize.width = listSize;
var addLine = useChar.add("checkbox", undefined, "Добавить пустую строку");
///
if (useParaStyleValue) { useChar.enabled = false; usePara.enabled = true; } else  { useChar.enabled = true; usePara.enabled = false; } 
///
useParaStyle.onClick = function() { useChar.enabled = false; usePara.enabled = true; useCharStyle.value = false; }
useCharStyle.onClick = function() { useChar.enabled = true; usePara.enabled = false; useParaStyle.value = false; }

separator2 = win.add ("panel");
separator2.minimumSize.height = separator2.maximumSize.height = 1;
separator2.alignment = ["fill", "fill"];
var buttons = win.add("group");
buttons.orientation = "row";
buttons.alignChildren = ["center", "center"];
var buttonSize = [0,0,250,28];
var action = buttons.add("button", buttonSize, "Изменить оформление");
var info = buttons.add("button", [0,0,28,28], "?");
///
info.onClick = function () { 
var infoText = "Выделите текст подготовленного указателя, чтобы преобразовать его в алфавитный. Первая строка выделения должна быть оформлена абзацным стилем первого уровня (имя определено в переменной indStyle1 в файле ForIndex.jsxinc).\nДва варианта превращения обычного указателя в алфавитный:\n- добавление прописной буквы перед каждым блоком терминов, начинающимся с новой буквы.\n- первая буква первого слова с новой буквы оформляется выбранным символьным стилем, в нём в установках регистра должен быть выбран вариант 'Все прописные', это обязательно. Можно попробовать усилить визуальный акцент, установив в настройках символьного стиля полужирное начертание.\nПеред строкой с оформляемой символьным стилем буквой можно добавить пустую строку, для управления этим есть флажок.\nДругой возможный вариант отбивки блоков слов, у которых первые буквы не совпадают — в символьном стиле оформления первой буквы сделать интерлиньяж заметно больше того, что в строках указателя.\n";
alert(infoText, programTitul);
}
///
action.onClick = function () { // action.onClick
sel = app.selection[0];
if (sel == null  || sel.constructor.name == "TextFrame" || sel.constructor.name == "InsertionPoint" || sel.hasOwnProperty("texts") == false) {
    alert("Выделите текст указателя для преобразования его в алфавитный.", programTitul);
    return; 
    } 
if (sel.paragraphs[0].characters[0].appliedParagraphStyle.name != indStyle1) {
    alert("Для преобразования обычного указателя в алфавитный первый абзац в выделении должен быть оформлен абзацным стилем первого уровня индексов.\rНазвания всех абзацных стилей для уровей индексов должны совпадать с теми, что определены в переменных indStyle1, indStyle2, indStyle3, indStyle4 в файле ForIndex.jsxinc.", programTitul);
    return;     
    }
var usedParaID = sel.characters[0].appliedParagraphStyle.id;
var myStartOfFragment = sel.paragraphs[0].characters.firstItem().index;
var pCount = sel.paragraphs.length;
var story = sel.parentStory;
myEndOfFragment = sel.paragraphs[pCount - 1].characters.lastItem().index;
story.characters.itemByRange(myStartOfFragment,myEndOfFragment).select();
sel = app.selection[0];  
if (story.overflows) {
    alert("В указателе не должно быть вытесненного текста.",programTitul);
    return;     
    }
var selIndex = sel.characters[0].index;
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
app.findGrepPreferences.findWhat = "^.";    
var rez = sel.findGrep(); 
var rezLength = rez.length;
if (rezLength == 0) {
    alert("Ошибка обработки - не найдено ни одного абзаца.",programTitul); // сообщение этапа отладки
    return;     
    }
if (story.characters[myStartOfFragment].paragraphs[0].length == 1 || story.characters[myEndOfFragment].paragraphs[0].length == 1) {
    alert("В начале и конце выделения не должно быть пустых абзацев.",programTitul);
    procNumsRez = 1; 
    return;    
    }  
app.doScript(addLettersAction, ScriptLanguage.JAVASCRIPT, [], UndoModes.FAST_ENTIRE_SCRIPT, 'addLettersAction');
myDataFile.open("w");
myDataFile.writeln(letterParaStyle.selection.index);
myDataFile.writeln(letterParaStyle.selection);
myDataFile.writeln(letterCharStyle.selection.index);
myDataFile.writeln(letterCharStyle.selection);
myDataFile.close();
return; 
////////////////
function addLettersAction() { // addLettersAction
var addedLetter;
var rezIndex;
var skipLine = false;
var letter_i;
if (useParaStyle.value == true) { // useParaStyle
    var addedLetter = sel.paragraphs[-1].characters[0].contents.toLowerCase();
    pBar = new ProgressBar(programTitul);
    pBar.reset("Добавление букв, чтобы последовательность терминов стала алфавитным указателем", rezLength);    
    for (var i = rezLength-1; i >= 0; i--, pBar.hit()) { // i--
        if (rez[i].appliedParagraphStyle.id != usedParaID) { //  != usedParaID || это термин не первого уровня
            if (skipLine == false) {skipLine = true; letter_i = i;  continue; }
            if (rez[i-1].appliedParagraphStyle.id == usedParaID && rez[i-1].contents.toLowerCase() == addedLetter) {skipLine = false; continue; }
            if (rez[i-1].appliedParagraphStyle.id == usedParaID && rez[i-1].contents.toLowerCase() != addedLetter) { // i-1 || строка над текущей строкой -- термин первого уровня с другой буквой: надо ставить букву над найденной ранее строкой первого уровня
                try {
                    rezIndex = rez[letter_i+1].index;
                    addLetterAndStyleIt(story, rezIndex, addedLetter);
                    }
                catch (e) { } // последняя строка выделения -- термин не верхнего уровня
                addedLetter = rez[i-1].contents.toLowerCase(); // теперь это буква, с которой будут сравниваться начала терминов
                skipLine = false;
                i = i-1;
                continue;
                } // i-1
            continue;
            } //  != usedParaID 
        if (rez[i].contents.toLowerCase() == addedLetter) continue;
        else {
            rezIndex = rez[i+1].index;
            addLetterAndStyleIt(story, rezIndex, addedLetter);
            addedLetter = rez[i].contents.toLowerCase();
            }
        skipLine = false;
        } // i--
    addedLetter = rez[0].contents.toLowerCase();
    rezIndex = rez[0].index;
    addLetterAndStyleIt(story, rezIndex, addedLetter);
    pBar.close();
    return;
    } // useParaStyle
   else { // useCharStyle  
    var addedLetter = sel.paragraphs[-1].characters[0].contents.toLowerCase();
    pBar = new ProgressBar(programTitul);
    pBar.reset("Оформление символьным стилем первой буквы", rezLength);
    for (var i = rezLength-1; i >= 0; i--, pBar.hit()) { // i--
        if (rez[i].appliedParagraphStyle.id != usedParaID) { //  != usedParaID || это термин не первого уровня
            if (skipLine == false) {skipLine = true; letter_i = i;  continue; }
            if (rez[i-1].appliedParagraphStyle.id == usedParaID && rez[i-1].contents.toLowerCase() == addedLetter) {skipLine = false; continue; }
            if (rez[i-1].appliedParagraphStyle.id == usedParaID && rez[i-1].contents.toLowerCase() != addedLetter) { // i-1 || строка над текущей строкой -- термин первого уровня с другой буквой: надо ставить букву над найденной ранее строкой первого уровня
                try {
                    rezIndex = rez[letter_i+1].index;
                    changeFirstLetterStyle(story, rezIndex, addedLetter);
                    }
                catch (e) { } // последняя строка выделения -- термин не верхнего уровня
                addedLetter = rez[i-1].contents.toLowerCase(); // теперь это буква, с которой будут сравниваться начала терминов
                skipLine = false;
                i = i-1;
                continue;
                } // i-1
            continue;
            } //  != usedParaID 
        if (rez[i].contents.toLowerCase() == addedLetter) continue;
        else {
            rezIndex = rez[i+1].index;
            changeFirstLetterStyle(story, rezIndex, addedLetter);
            addedLetter = rez[i].contents.toLowerCase();          
            }
        skipLine = false;
        } // i--
    addedLetter = rez[0].contents.toLowerCase();      
    rezIndex = rez[0].index;
    changeFirstLetterStyle(story, rezIndex, addedLetter);
    pBar.close();
    return;
    } // useCharStyle
} // addLettersAction
///
function addLetterAndStyleIt(story, rezIndex, addedLetter) { // addLetterAndStyleIt
var para_Index = letterParaStyle.selection.index;
var para_StyleID = paraStylesID[para_Index];
var paraIndex = rez[0].paragraphs[0].index;
story.insertionPoints[rezIndex].contents = addedLetter.toUpperCase() + "\r";
story.insertionPoints[rezIndex].paragraphs[0].appliedCharacterStyle = app.activeDocument.characterStyles[0];
story.insertionPoints[rezIndex].paragraphs[0].appliedParagraphStyle = app.activeDocument.paragraphStyles.itemByID(Number(para_StyleID));
} // addLetterAndStyleIt
////
function changeFirstLetterStyle(story, rezIndex, addedLetter) { // changeFirstLetterStyle
var char_Index = letterCharStyle.selection.index;
var char_StyleID = charStylesID[char_Index]; 
story.insertionPoints[rezIndex].paragraphs[0].characters[0].appliedCharacterStyle = app.activeDocument.characterStyles.itemByID(Number(char_StyleID)); 
if (addLine.value) {
    story.insertionPoints[rezIndex].contents = "\r";
    story.insertionPoints[rezIndex].paragraphs[0].appliedCharacterStyle = app.activeDocument.characterStyles[0];
    story.insertionPoints[rezIndex].appliedParagraphStyle = app.activeDocument.paragraphStyles.itemByID(Number(usedParaID));
    }
} // changeFirstLetterStyle    
///
}  // action.onClick
/////
win.onClose = function() { // win.onClose
app.activate();
} // win.onClose
////
win.show();
///////////////////////

