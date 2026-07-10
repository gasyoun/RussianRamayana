// AddSeeTopic.v.3.jsx

/*
    
Скрипт находит термины указанных уровней (2, 3, 4) и для каждого готовит строку поиска их в верхнем уровне упорядоченного по алфавиту указателя.
Для каждого термина формируется строка 'Термин' см. 'Термин первого уровня'.
Найденные строки сохраняются в текстовом файле.

Поскольку в одном указателе могут быть несколько указателей, то процедуру упорядочения надо проводить  в выделенной области одного указателя.
Поэтому и поиск ведётся не во всём файле, а в выделенной области. Предполагается, что выделен полностью текст одного указателя.

Потом эти строки надо поставить по месту в указателе, после уточнения для каждого найденного термина:
а) что ставить: см.  или  см. также,  или свой вариант;
б) если нужно, то исправления термина, на который адресуется эта строка;
в) указания символьного стиля оформления текста адресации

27.01.2023 -- поиск места термина: приводим к нижнему регистру и потом ищем.

05.02.2023 -- попробовать собрать все тррмины верхнего уровня, ведущие к нижнему уповню.

-----------------------
Исходный текст:
Агат  11, 23, 93, 94
Амур  218, 351
Барабек  8, 15, 68, 99 
     Акоп  354
     Алабай (зовут Азазелло)  354
    Воробей  35
Гончар 11, 77
Сапожник  130, 131, 136–139, 146, 217, 329, 330, 352
     Али (балабол)  354
     Башмачник  352
     Юла  123

Отсортированный по алфавиту массив itemsTopLevelArr
0 itemsTopLevelArr[z] = Агат @0 
1 itemsTopLevelArr[z] = Акоп # см. #Барабек 
2 itemsTopLevelArr[z] = Алабай (зовут Азазелло) # см. #Барабек
3 itemsTopLevelArr[z] = Али (балабол) # см. #Сапожник 
4 itemsTopLevelArr[z] = Амур @21
5 itemsTopLevelArr[z] = Барабек @36
6 itemsTopLevelArr[z] = Башмачник # см. #Сапожник 
7 itemsTopLevelArr[z] = Воробей # см. #Барабек 
8 itemsTopLevelArr[z] = Гончар@111
9 itemsTopLevelArr[z] = Сапожник @125
10 itemsTopLevelArr[z] = Юла# см. #Сапожник 

Обработка массива itemsTopLevelArr от конца к началу:

10 itemsTopLevelArr[z] = Юла# см. #Сапожник    - буквы Ю нет *
9 itemsTopLevelArr[z] = Сапожник @125 Первый уровень, запомнили индекс
8 itemsTopLevelArr[z] = Гончар@111 Первый уровень, запомнили индекс
7 itemsTopLevelArr[z] = Воробей # см. #Барабек   буквы В нет *
6 itemsTopLevelArr[z] = Башмачник # см. #Сапожник  - буква Б есть, помещаем перед запомненным индексом (перед Гончар) 
5 itemsTopLevelArr[z] = Барабек @36 Первый уровень, запомнили индекс
4 itemsTopLevelArr[z] = Амур @21 Первый уровень, запомнили индекс
3 itemsTopLevelArr[z] = Али (балабол) # см. #Сапожник буква А есть, помещаем перед запомненным индексом (перед Амур)
2 itemsTopLevelArr[z] = Алабай (зовут Азазелло) # см. #Барабек буква А есть, помещаем перед запомненным индексом (перед Амур)
1 itemsTopLevelArr[z] = Акоп # см. #Барабек  буква А есть, помещаем перед запомненным индексом (перед Амур)
0 itemsTopLevelArr[z] = Агат @0 Первый уровень, запомнили индекс

в 3, 2, 1 строки всегда помещаются в одну и ту же точку материала. 
Но за счёт того, что обработка в отсортированном файле от конца к началу, термины будут выстроены в алфавитном порядке.

Звёздочкой отмечены строки, для которых нельзя определить их место в указателе, т.к. нет терминов, начинающихся с той же буквы, что и это слово.

Результат:

Агат  11, 23, 93, 94
Акоп см. Барабек 
Алабай (зовут Азазелло) см. Барабек 
Али (балабол) см. Сапожник 
Амур  218, 351
Барабек  8, 15, 68, 99 
     Акоп  354
     Алабай (зовут Азазелло)  354
    Воробей  35
Башмачник см. Сапожник 
Гончар 11, 77
Сапожник  130, 131, 136–139, 146, 217, 329, 330, 352
     Али (балабол)  354
     Башмачник  352
     Юла  123
     
== см-ссылки, которым надо найти место в указателе ==
Воробей # см. #Барабек
Юла# см. #Сапожник

*/

// © Михаил Иванюшин, 2023  |  dotextok@gmail.com  |  dotextok.ru

#targetengine "AddSeeAlso"
#include "../../ForIndex.jsxinc"
var debugLog = false; // 10.07.2026 (H377): отладочный $.writeln-вывод (14 шт.) выключен по умолчанию — включать только при отладке

app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll; // см. http://adobeindesign.ru/2008/10/24/restore-ui/

var programTitul = "Оформление ссылок в указателе";
if (app.documents.length == 0) {
    alert("Нет документа для обработки.", programTitul);
    exit();
    }
if (parseInt (app.version) < 8) {
	alert ("Этот скрипт предназначен для обработки текста в InDesign CS6+.");
    exit();
    }
var itemSep = "@";
var usedLetters = {};
var interLevelSep = " • ";
var theItem;
var rezultNum = 0;
//var indLineSep = "  ";
var stopMes = "Перед запуском скрипта должен быть выделен указатель, в котором приведены в порядок номера страниц и добавлены аннотационные данные, если это предусмотрено в данном указателе. Этот указатель пока должен быть обычным, не алфавитным.";
var payAttention = false;
var infoString = "== см-ссылки, которым надо найти место в указателе ==";
var doc = app.activeDocument;
var sel = app.selection[0];
if (sel == null || (sel.constructor.name != "Paragraph" && sel.constructor.name != "Text" && sel.constructor.name != "TextColumn" && sel.constructor.name != "TextStyleRange")) {
    alert(stopMes,programTitul);
    exit();    
    }
var stringList = [];
var style1Selection = 0;
var style2Selection = 0;
var style3Selection = 0;
var style4Selection = 0;
//
var style1_name = "";
var style2_name = "";
var style3_name = "";
var style4_name = "";
//
var style5Selection = 0;
var style6C_Selection = 0;
var style6T_Selection = 0;
//
var style5_name = "";
var style6_Cname = "";
var style6_Tname = "";
//
var sepOpt1Value = 1;
var sepOpt2Value = 0;
var sepOpt3Value = 0;
//
var snStyle1Name;
var snStyle2Name;
var snStyle1Selection;
var snStyle2Selection;

var usedSeeSelection = 0;

//
var paraStyles = [];    
var paraStyleID = [];  
while (paraStyles.length > 0) paraStyles.shift();
while (paraStyleID.length > 0) paraStyleID.shift();
var myParagraphStyles = doc.allParagraphStyles;
var myParagraphStyleName, obj;
for (i = 0; i < myParagraphStyles.length ; i++) { // i++
    myParagraphStyleName = myParagraphStyles[i].name;
    obj = myParagraphStyles[i];
    while(obj.parent instanceof ParagraphStyleGroup) {
        myParagraphStyleName = obj.parent.name + ":" + myParagraphStyleName;
        obj = obj.parent;        
        }
    paraStyles.push(myParagraphStyleName);
    paraStyleID.push(myParagraphStyles[i].id);
    } // i++
paraStyles.shift(); // удаление стиля No Paragraph Style
paraStyleID.shift();
/////////////////////////////////////
var csID = [];
while (csID.length > 0) csID.shift();
var charStyles = [];
while (charStyles.length > 0) charStyles.shift();
var myCharacterStyles = doc.allCharacterStyles;
var myCharacterStyleName, obj;
for (var i=0; i < myCharacterStyles.length ; i++) { // for
    myCharacterStyleName = myCharacterStyles[i].name;
    obj = myCharacterStyles[i];
    while(obj.parent instanceof CharacterStyleGroup) {
        myCharacterStyleName = obj.parent.name + ":" + myCharacterStyleName;
        obj = obj.parent;        
        }
    charStyles.push(myCharacterStyleName);
    csID.push(myCharacterStyles[i].id);    
    } // for
///
var myDefSetName  = "#AddSeeTopic.ini"; //  файл установок программы
var myScriptFile = myGetScriptPath();
var myScriptFolder = decodeURI(myScriptFile.path);
var myFilePath = decodeURI(myScriptFolder + "/sets/" + myDefSetName); 
var myDataFile = new File (myFilePath);
if (myDataFile.open("r")) { //  r  | такой файл есть 
style1Selection = myDataFile.readln(); 
style1_name = myDataFile.readln(); 
style2Selection = myDataFile.readln(); 
style2_name = myDataFile.readln();
style3Selection = myDataFile.readln(); 
style3_name = myDataFile.readln();
style4Selection = myDataFile.readln(); 
style4_name = myDataFile.readln();
style5Selection = myDataFile.readln(); 
style5_name = myDataFile.readln();
style6C_Selection = myDataFile.readln(); 
style6_Cname = myDataFile.readln();
style6T_Selection = myDataFile.readln(); 
style6_Tname = myDataFile.readln();
sepOpt1Value = myDataFile.readln(); 
sepOpt2Value = myDataFile.readln();
sepOpt3Value = myDataFile.readln();
usedSeeSelection = myDataFile.readln();
myDataFile.close();
var indx;
indx = setItems (paraStyles, style1_name, style1Selection);
style1Selection = indx;
style1_name = paraStyles[indx];
//
indx = setItems (paraStyles, style2_name, style2Selection);
style2Selection = indx;
style2_name = paraStyles[indx];
//
indx = setItems (paraStyles, style3_name, style3Selection);
style3Selection = indx;
style3_name = paraStyles[indx];
//
indx = setItems (paraStyles, style4_name, style4Selection);
style4Selection = indx;
style4_name = paraStyles[indx];
//
indx = setItems (charStyles, style5_name, style5Selection);
style5Selection = indx;
style5_name = charStyles[indx];
//
indx = setItems (charStyles, style6_Cname, style6C_Selection);
style6C_Selection = indx;
style6_Cname = charStyles[indx];
//
indx = setItems (charStyles, style6_Tname, style6T_Selection);
style6T_Selection = indx;
style6_Tname = charStyles[indx];
///
indx = setItems (charStyles, snStyle1Name, snStyle1Selection);
snStyle1Selection = indx;
snStyle1Name = charStyles[indx];
///
indx = setItems (charStyles, snStyle2Name, snStyle2Selection);
snStyle2Selection = indx;
snStyle2Name = charStyles[indx];
///
textPointer = String(seeTopicArray[usedSeeSelection]);
///
function setItems (list, listSelection, listSelectionIndex) { // setItems
try { if (list.length <= listSelectionIndex || list[listSelectionIndex] != listSelection) listSelectionIndex = 0; } catch (e) { listSelectionIndex = 0; }
return listSelectionIndex;
}  // setItems
} // r
/////////
var titleUsedSettings = "Укажите, какие стилевые установки используются в этом указателе";
//var seeNextSettings = "Требуемое оформление ссылки '" + textPointer + "' и термина после неё";
//var seeNextSettings = "Требуемое оформление 'см.' ссылки и термина после неё";
var seeNextSettings = "Оформление 'см.' ссылки и термина после неё.\u00A0\u00A0Сокращение слова 'смотри'";
///////
var win = new Window ("palette", programTitul);
win.alignChildren = ["fill", "fill"];
var curSets = win.add("statictext", undefined, titleUsedSettings);
var listAndRadiobuttons = win.add("group");
listAndRadiobuttons.orientation = "row";
listAndRadiobuttons.alignChildren = ["left", "bottom"];
var style = listAndRadiobuttons.add("dropdownlist",undefined, paraStyles);
var styleListLength = 160;
style.minimumSize.width = style.maximumSize.width = styleListLength;
style.selection = style1Selection;
var styleNameSize = [0,0,220,28];
var st1Name = "Абзацный стиль 1-го уровня индекса";
var st2Name = "Абзацный стиль 2-го уровня индекса";
var st3Name = "Абзацный стиль 3-го уровня индекса";
var st4Name = "Абзацный стиль 4-го уровня индекса";
var styleNameInfo = listAndRadiobuttons.add("statictext", styleNameSize, st1Name);
var styleRB = listAndRadiobuttons.add("group");
styleRB.orientation = "row";
styleRB.alignChildren = ["left", "center"];
var selStyle1 = styleRB.add("radiobutton", undefined, "1"); selStyle1.value = true;
var selStyle2 = styleRB.add("radiobutton", undefined, "2");
var selStyle3 = styleRB.add("radiobutton", undefined, "3");
var selStyle4 = styleRB.add("radiobutton", undefined, "4");
////
selStyle1.onClick = function() { styleNameInfo.text = st1Name; style.selection = style1Selection; }
selStyle2.onClick = function() { styleNameInfo.text = st2Name; style.selection = style2Selection; }
selStyle3.onClick = function() { styleNameInfo.text = st3Name; style.selection = style3Selection; }
selStyle4.onClick = function() { styleNameInfo.text = st4Name; style.selection = style4Selection; }
///
style.onActivate = function () { // style.onActivate
if (selStyle1.value) { style1Selection = style.selection.index; style1_name = String(style.selection); }
if (selStyle2.value) { style2Selection = style.selection.index; style2_name = String(style.selection); }
if (selStyle3.value) { style3Selection = style.selection.index; style3_name = String(style.selection); }
if (selStyle4.value) { style4Selection = style.selection.index; style4_name = String(style.selection); }
} // style.onActivate
////
var lineStyle5 = win.add("group");
lineStyle5.orientation = "row";
var style5 = lineStyle5.add("dropdownlist",undefined, charStyles);
style5.minimumSize.width = style5.maximumSize.width = styleListLength;
style5.selection = style5Selection;
var useStyleForTerm = lineStyle5.add("statictext", undefined, "Символьный стиль оформления терминов");
separator1 = win.add ("panel");
separator1.minimumSize.height = separator1.maximumSize.height = 1;
///
var selSeeGroup = win.add("group");
selSeeGroup.orientation = "row";
var seeSets = selSeeGroup.add("statictext", undefined, seeNextSettings);
var usedSee = selSeeGroup.add("dropdownlist",undefined, seeTopicArray);
usedSee.selection = usedSeeSelection;
var selChStyle1 = "Символьный стиль ссылки";
var selChStyle2 = "Стиль термина после ссылки";
var selChStyleSize = [0,0,175,28];
var lineStyle6 = win.add("group");
lineStyle6.orientation = "row";
lineStyle6.alignChildren = ["left", "bottom"];
var style6 = lineStyle6.add("dropdownlist",undefined, charStyles);
style6.minimumSize.width = style6.maximumSize.width = styleListLength;
style6.selection = style6C_Selection;
var selChStyleName = lineStyle6.add("statictext", selChStyleSize, selChStyle1);
var selChStyle1RB = lineStyle6.add("radiobutton", undefined, "C"); 
selChStyle1RB.value = true;
var selChStyle2RB = lineStyle6.add("radiobutton", undefined, "T");
selChStyle2RB.value = false;
///
separatorL1 = win.add ("panel");
separatorL1.minimumSize.height = separatorL1.maximumSize.height = 1;
separatorL1.minimumSize.width = styleListLength;
separatorL1.alignment = ["left", "fill"];
///
var sepOption = win.add("group");
sepOption.orientation = "row";
sepOption.alignChildren = ["left", "center"]
var rbGroup = sepOption.add("group");
rbGroup.alignChildren = ["lelft", "bottom"];
var sepOpt1 = rbGroup.add("radiobutton", undefined, "только ссылка");
sepOpt1Value == 1 ? sepOpt1.value = true : sepOpt1.value = false;
var sepOpt2 = rbGroup.add("radiobutton", undefined, "ссылка и термин стилем ссылки");
sepOpt2Value == 1 ? sepOpt2.value = true : sepOpt2.value = false;
var sepOpt3 = rbGroup.add("radiobutton", undefined, "ссылка и термин своими стилями");
sepOpt3Value == 1 ? sepOpt3.value = true : sepOpt3.value = false;
if (!sepOpt1.value && !sepOpt2.value && !sepOpt3.value) sepOpt1.value = true;
///
usedSee.onActivate = function () { // usedSee.onActivate
textPointer = String(usedSee.selection);
} // usedSee.onActivate
////
style6.onActivate = function () { // style6.onActivate
if (selChStyle1RB.value) { style6C_Selection = style6.selection.index; style6_Cname = String(style6.selection); }
if (selChStyle2RB.value) { style6T_Selection = style6.selection.index; style6_Tname = String(style6.selection); }
} // style6.onActivate
///
selChStyle1RB.onClick = function() { selChStyleName.text = selChStyle1; style6.selection = style6C_Selection; }
selChStyle2RB.onClick = function() { selChStyleName.text = selChStyle2; style6.selection = style6T_Selection; }
//
separator3 = win.add ("panel");
separator3.minimumSize.height = separator3.maximumSize.height = 1;
var buttons = win.add("group");
buttons.orientation = "row";
buttons.alignChildren = ["center", "center"];
var buttonSize = [0,0,100,28];
var theAction = buttons.add ("button", [0,0,340,28], "Выполнить и закрыть");
var noAction = buttons.add ("button", [0,0,200,28], "Закрыть");
///
noAction.onClick = function () { saveSettings (); win.close(); app.activate(); }
///
function saveSettings () { // saveSettings
myDataFile.open("w");
myDataFile.writeln(style1Selection);
myDataFile.writeln(style1_name);
myDataFile.writeln(style2Selection);
myDataFile.writeln(style2_name);
myDataFile.writeln(style3Selection);
myDataFile.writeln(style3_name);
myDataFile.writeln(style4Selection);
myDataFile.writeln(style4_name);
//
myDataFile.writeln(style5.selection.index);
myDataFile.writeln(String(style5.selection));
//
myDataFile.writeln(style6C_Selection);
myDataFile.writeln(style6_Cname);
//
myDataFile.writeln(style6T_Selection);
myDataFile.writeln(style6_Tname);
//
if (sepOpt1.value) myDataFile.writeln(1) else myDataFile.writeln(0); 
if (sepOpt2.value) myDataFile.writeln(1) else myDataFile.writeln(0); 
if (sepOpt3.value) myDataFile.writeln(1) else myDataFile.writeln(0); 
//
myDataFile.writeln(usedSee.selection.index);
///
myDataFile.close();
} // saveSettings
///
theAction.onClick = function () { // theAction.onClick
if (style1_name[0] == "[" || style2_name[0] == "[") {
    alert("Абзацные стили первого и второго уровней не могут быть служебными стилями.", programTitul);
    return;
    }
if  (String(style5.selection)[0] == "[") {
    alert("Символьный стиль оформления термина первого уровня не должен быть служебным стилем.", programTitul);
    return;
    }
if (style3_name[0] != "[" || style4_name[0] != "[") {
    if (style1_name == style2_name || style1_name == style3_name || style1_name == style4_name || style2_name == style3_name || style2_name == style4_name /* || style3_name == style4_name*/) {
        alert("Абзацные стили не должны быть одинаковыми.", programTitul);
        return;    
        }
    }
if (style3_name[0] != "[" && style4_name[0] != "[" &&  style3_name == style4_name) {
        alert("Абзацные стили третьего и четвёртого уровня не должны быть одинаковыми.", programTitul);
        return;    
    }
if (style3_name[0] == "[" && style4_name[0] != "[") {
    alert("Нельзя искать термин четвёртого уровня, у которого нет третьего уровня.", programTitul);
    return;
    }
if ((String(style5.selection) == style6_Cname)) {
    alert("Символьный стиль для ссылки не должен быть таким же, как символьный стиль оформления термина первого уровня.", programTitul);
    return;
    }
if ((sepOpt3.value == true) && style6_Tname[0] == "[") {
    alert("Символьный стиль оформления термина после ссылки не должен быть служебным стилем.", programTitul);
    return;
    }   
sel = app.selection[0];
if (sel == null || (sel.constructor.name != "Paragraph" && sel.constructor.name != "Text" && sel.constructor.name != "TextColumn" && sel.constructor.name != "TextStyleRange")) {
    alert(stopMes,programTitul);
    return;    
    }
app.doScript(placePointerAction, ScriptLanguage.JAVASCRIPT, [], UndoModes.ENTIRE_SCRIPT, 'placePointerAction');
///
var rezTextInfo = "Число упорядоченных по алфавиту записей с ссылками '" + textPointer + "', помещённых на верхний уровень: " + rezultNum + ".";  
var aboutProblem = "";
if (payAttention) {
    aboutProblem = "\n\nВ конце указателя есть строка\n" + infoString + "\nпосле которой идут абзацы, для которых нет информации, где их разместить. Сделайте это сами."; 
    }
alert(rezTextInfo + aboutProblem, programTitul);
payAttention = false;
rezultNum = 0;
saveSettings ();
win.close();
app.activate();
return;
//////////////
function placePointerAction () { // placePointerAction
// расширим выделенную область до кратности абзацам
var mySel = app.selection[0];
var myStartOfFragment = mySel.paragraphs[0].characters.firstItem().index;
var myEndOfFragment = mySel.paragraphs[mySel.paragraphs.length - 1].characters.lastItem().index;
mySel.parent.characters.itemByRange(myStartOfFragment,myEndOfFragment).select();
sel = app.selection[0];

var level1ID = paraStyleID[style1Selection];
var level2ID = paraStyleID[style2Selection];
var level3ID = paraStyleID[style3Selection];
var level4ID = paraStyleID[style4Selection];

var findCharStyleID = csID[style5.selection.index];
var rez;
var rezData = [];
while (rezData.length > 0) rezData.pop();
var wordsLineTop = "";
var wordsLine = "";
var paraInSel;
var level1name = "";
var level2name = "";
var level3name = "";
var level4name = "";
var paraLength = app.selection[0].paragraphs.length;
if (paraLength.length == 1) {
    alert("Для поиска терминов нижнего уровня число выделенных абзацев должно быть больше одного.", programTitul);
    return;
    }
var continueFound = false;
var found3 = true;
if (style3_name[0] == "[") found3 = false;
var found4 = true;
if (style4_name[0] == "[") found4 = false;
// поиск термина второго уровня обязателен. 
// Третий и четвёртый ищутся, если выбранные символьные стили не являются служебными. 
var pBar = new ProgressBar(programTitul);
pBar.reset("1/4 Просмотр выделенных абзацев, подготовка задания на обработку", paraLength);
for (var p = 0; p < paraLength; p++, pBar.hit()) { // p++
    paraInSel = app.selection[0].paragraphs[p];
    app.findGrepPreferences = NothingEnum.nothing;
    app.changeGrepPreferences = NothingEnum.nothing; 
    app.findGrepPreferences.appliedParagraphStyle= doc.paragraphStyles.itemByID(level1ID); // первый уровень
    app.findGrepPreferences.appliedCharacterStyle = doc.characterStyles.itemByID(findCharStyleID); // символьный стиль оформления терминов   
    app.findGrepPreferences.findWhat = "^.+"; 
    rez = paraInSel.findGrep();   
    if (rez.length == 0) {
        // попробуем найти записи, где есть абзацный стиль, без учёта символьного стиля.
        app.findGrepPreferences = NothingEnum.nothing;
        app.changeGrepPreferences = NothingEnum.nothing; 
        app.findGrepPreferences.appliedParagraphStyle= doc.paragraphStyles.itemByID(level1ID); // первый уровень
        //app.findGrepPreferences.appliedCharacterStyle = doc.characterStyles.itemByID(findCharStyleID); // символьный стиль оформления терминов   
        app.findGrepPreferences.findWhat = "^.+"; 
        rez = paraInSel.findGrep(); 
        }
    if (rez.length == 0 && continueFound == false) {    
        wordsLineTop = "";
        continue;
        }
    if (rez.length == 1)  { // == 1
        // найден термин верхнего уровня.
        usedLetters[rez[0].characters[0].contents.toLowerCase()] = rez[0].index; // запомнили, что есть слова, начинающиеся с этой буквы
        wordsLineTop = rez[0].contents.split(indLineSep)[0]; // если перед термином есть последовательность номеров страниц, то эти номера в wordsLineTop не попадут
        continueFound = true;      
        if (debugLog) $.writeln("1: wordsLineTop = " + wordsLineTop);
        level1name = wordsLineTop;
        continue;
        } // == 1
    if (rez.length == 0 && continueFound) { //  == 0 && continueFound
        // ищем в этом абзаце термин второго уровня. К этому моменту в переменной wordsLineTop уже есть термин верхнего уровня
        app.findGrepPreferences = NothingEnum.nothing;
        app.changeGrepPreferences = NothingEnum.nothing; 
        app.findGrepPreferences.appliedParagraphStyle= doc.paragraphStyles.itemByID(level2ID);
        app.findGrepPreferences.appliedCharacterStyle = doc.characterStyles.itemByID(findCharStyleID);    
        app.findGrepPreferences.findWhat = "^.+"; 
        rez = paraInSel.findGrep();  
        if (rez.length == 0) {
            app.findGrepPreferences = NothingEnum.nothing;
            app.changeGrepPreferences = NothingEnum.nothing; 
            app.findGrepPreferences.appliedParagraphStyle= doc.paragraphStyles.itemByID(level2ID);   
            app.findGrepPreferences.findWhat = "^.+";    
            rez = paraInSel.findGrep();              
            }
        if (rez.length == 1) { ///== 1 (2ур)
            if (rez[0].contents  == SpecialCharacters.emDash) {
                level2name = "";
                continue; //  noLevel
                }
            if (debugLog) $.writeln("2: rez[0].contents = " +rez[0].contents);            
          //  wordsLine = get_wordsLine(rez[0].contents.split(indLineSep)[0], wordsLineTop);    
            wordsLine = get_wordsLine(rez[0].contents.split(indLineSep)[0], level1name);             
           // $.writeln("2: wordsLineTop = " + wordsLineTop);    
            if (debugLog) $.writeln("2: level2name = " + rez[0].contents.split(indLineSep)[0]);
            level2name = rez[0].contents.split(indLineSep)[0];
          //  wordsLineTop = wordsLineTop + interLevelSep + rez[0].contents.split(indLineSep)[0];
            wordsLineTop = level1name + interLevelSep + level2name;            
            if (debugLog) $.writeln("2: > wordsLineTop = " + wordsLineTop);
            rezData.push(wordsLine);       
            continue;
            }  ///== 1 (2ур)
        if (found3) { // found3
            // ищем в этом абзаце термин третьего уровня. Независимо от уровней индексов ссылка будет на термин верхнего уровня, и он уже есть в переменной wordsLineTop
            app.findGrepPreferences = NothingEnum.nothing;
            app.changeGrepPreferences = NothingEnum.nothing; 
            app.findGrepPreferences.appliedParagraphStyle= doc.paragraphStyles.itemByID(level3ID);
            app.findGrepPreferences.appliedCharacterStyle = doc.characterStyles.itemByID(findCharStyleID);    
            app.findGrepPreferences.findWhat = "^.+"; 
            rez = paraInSel.findGrep();  
            if (rez.length == 0) {
                app.findGrepPreferences = NothingEnum.nothing;
                app.changeGrepPreferences = NothingEnum.nothing; 
                app.findGrepPreferences.appliedParagraphStyle= doc.paragraphStyles.itemByID(level3ID);   
                app.findGrepPreferences.findWhat = "^.+"; 
                rez = paraInSel.findGrep(); 
                }
            if (rez.length == 1)  { ///== 1 (3ур) 
                if (rez[0].contents  == SpecialCharacters.emDash) {
                    level2name = "";
                    continue; // noLevel
                    }
            if (debugLog) $.writeln("3: rez[0].contents = " +rez[0].contents);                      
              //  wordsLine = get_wordsLine(rez[0].contents.split(indLineSep)[0], wordsLineTop); 
                wordsLine = get_wordsLine(rez[0].contents.split(indLineSep)[0], level1name + interLevelSep + level2name);             
            //$.writeln("3: wordsLineTop = " + wordsLineTop);    
            if (debugLog) $.writeln("3: level3name = " + rez[0].contents.split(indLineSep)[0]);    
           // wordsLineTop = wordsLineTop + interLevelSep + rez[0].contents.split(indLineSep)[0];
            level3name = rez[0].contents.split(indLineSep)[0];
            if (level2name.length != 0) wordsLineTop = level1name + interLevelSep + level2name + interLevelSep + level3name; 
            else wordsLineTop = level1name + interLevelSep + level3name; 
            if (debugLog) $.writeln("3: > wordsLineTop = " + wordsLineTop);            
                rezData.push(wordsLine);           
                continue;
                }  ///== 1 (3ур)            
            } //  found3
        if (found4) { // found4
             // ищем в этом абзаце термин четвёртого уровня. Тут та же логика, что для предыдущих двух.
            app.findGrepPreferences = NothingEnum.nothing;
            app.changeGrepPreferences = NothingEnum.nothing; 
            app.findGrepPreferences.appliedParagraphStyle= doc.paragraphStyles.itemByID(level4ID);
            app.findGrepPreferences.appliedCharacterStyle = doc.characterStyles.itemByID(findCharStyleID);    
            app.findGrepPreferences.findWhat = "^.+"; 
            rez = paraInSel.findGrep();   
            if (rez.length == 0) {
                app.findGrepPreferences = NothingEnum.nothing;
                app.changeGrepPreferences = NothingEnum.nothing; 
                app.findGrepPreferences.appliedParagraphStyle= doc.paragraphStyles.itemByID(level4ID); 
                app.findGrepPreferences.findWhat = "^.+"; 
                rez = paraInSel.findGrep();                  
                }
            if (rez.length == 1)  { ///== 1 (4ур)  
                wordsLine = get_wordsLine(rez[0].contents.split(indLineSep)[0], wordsLineTop);  
            if (debugLog) $.writeln("4: rez[0].contents = " +rez[0].contents);                      
            if (debugLog) $.writeln("4: wordsLineTop = " + wordsLineTop);    
            if (debugLog) $.writeln("4: wordsLine = " + wordsLine);           
                rezData.push(wordsLine);
                continue;
                }  ///== 1 (4ур)             
            }  // found4
        // к этому моменту для термина верхнего уровня, имеющего в своём гнезде термины низших уровней в массиве rezData подготовлено столько записей, сколько есть таких терминов.
        // Каждая запись оформлена с учётом одной из трёх радиокнопок варианта оформления строки со ссылкой.
        // Если только одно вложение и символьным стилем оформлется только ссылка, то эта запись будет такой: термин_верхнего_уровня  разделитель  ссылка  разделитель  термин_второго_уровня
        // Так же в нём информация о фамилиях, если при запуске был установлен флажок их обработки.
        } //   == 0 && continueFound
    }  // p++
pBar.close();
rezData.sort();
for (var s = 0; s < rezData.length; s++) { if (debugLog) $.writeln(s + " | rezData[s] = " + rezData[s]); }
// В массиве rezData число разделителей около слова-ссылки 'см.' зависит от выбранной радиокнопки. 
// если активна радиокнопка "только ссылка", то разделители (переменная sepChar) до и после этого слова, 
// Если выбрана радиокнопка "ссылка и термин одним стилем ссылки", то есть один разделитель слева от этого слова. 
// Кнопка "ссылка и термин своими стилями" -- слева слова-ссылки один разделитель, а справа два.
var level1ID = paraStyleID[style1Selection];
var changeCharStyleC_ID = csID[style6C_Selection]; // символьный стиль оформления ссылки
var changeCharStyleT_ID = csID[style6T_Selection]; // символьный стиль оформления термина
// ищем 
app.findGrepPreferences = NothingEnum.nothing;
app.changeGrepPreferences = NothingEnum.nothing; 
app.findGrepPreferences.appliedParagraphStyle= doc.paragraphStyles.itemByID(level1ID);
//app.findGrepPreferences.appliedCharacterStyle = doc.characterStyles.itemByID(findCharStyleID);
app.findGrepPreferences.findWhat = "^.+"; 
var rez1 = sel.findGrep();
var rez = [];
while (rez.length > 0) rez.pop();
if (rez1.length > 0) for (z = 0; z < rez1.length; z++) rez.push(rez1[z]);
var wordsLine = "";
var itemsTopLevelArr = []; // в этом массиве будут термины верхнего уровня из выделенной области с указанием индекса термина в материале.     
while (itemsTopLevelArr.length > 0) itemsTopLevelArr.pop();
pBar.reset("2/4 Сбор слов первого уровня, имеющихся в выделенном тексте ", rez.length); 
for (z = 0; z < rez.length; z++, pBar.hit()) { // z++
    if (rez[z].words.length == 1) wordsLine = rez[z].contents;
    else if (rez[z].words.length == 2) wordsLine = rez[z].words.itemByRange(0,1).contents;
    else if (rez[z].words.length == 3) wordsLine = rez[z].words.itemByRange(0,2).contents;  
    else wordsLine = rez[z].words.itemByRange(0,3).contents;   
    // идея предыдущих строк if - else if else --- вряд ли могут быть термины, совпадающие более чем в четырёх словах
    itemsTopLevelArr.push(wordsLine + itemSep + rez[z].index); 
    }  // z++
pBar.close();
for (var s = 0; s < itemsTopLevelArr.length; s++) { if (debugLog) $.writeln(s + " | itemsTopLevelArr[s] = " + itemsTopLevelArr[s]); }
// к этому моменту в itemsTopLevelArr все первые слова терминов верхнего уровня и индексы их начала в материале
pBar.reset("3/4 Работа с терминами, которые должны иметь см-ссылки", rezData.length); 
for (var a = 0; a < rezData.length; a++, pBar.hit()) {  // a++
    var topicLine = String(rezData[a]); 
    itemsTopLevelArr.push(topicLine); // добавили этот термин&ссылка в массив терминов верхнего уровня  
    }  // a++
pBar.close();
// к этому моменту в массиве  itemsTopLevelArr все слова терминов верхнего уровня и индексы их начала в материале и термины со ссылками, которые надо поднять.
// отсортируем этот массив  в порядке возрастания таким образом, чтобы слова, начинающиеся со строчной и прописной буквы, стояли рядом.
itemsTopLevelArr.sort (function (a,b) {
    an = a.toLowerCase();
    bn = b.toLowerCase();   
    return an > bn; }
    );
for (var s = 0; s < itemsTopLevelArr.length; s++) { if (debugLog) $.writeln(s + " || itemsTopLevelArr[s] = " + itemsTopLevelArr[s]); }    
rezultNum = 0;
var placeIndex = -1;
var prev_placeIndex;
payAttention = false;
var story = sel.parentStory;
//while (problemLines.length > 0) problemLines.pop();
var top1Index = [];
var mess = "4/4 Помещение строк с см-ссылками на верхний уровень";
pBar.reset(mess, itemsTopLevelArr.length); 
for (var i = itemsTopLevelArr.length-1; i >= 0; i-- , pBar.hit()) {   // i--
    // идём по массиву itemsTopLevelArr снизу вверх.
    // каждая строка -- это один из двух вариантов:
    // а) это термин первого уровня, и тогда в нём есть разделитель itemSep (@), или
    // б) это строка с см-ссылкой, и тогда в ней есть хотя бы один разделитель sepChar (#)
    // Если это термин первого уровня, то сохраняем его индекс.
    // Если строка с см-ссылкой, то проверяем, есть ли термины первого уровня на такую букву -- массив usedLetters.
    // если нет, то строка со ссылкой оформляется и помезается в конец указателя. После этого переход к чередному циклу.
    // Если такая буква есть, то строка помещается по месту сохранённого индекса:
    // к строке добавляется перевод строки, она оформляется абзацным стилем индекса первого уровня, ссылка  оформляется символьным стилем, удаляются разделители sepChar.
   var termLine = itemsTopLevelArr[i];
   if (debugLog) $.writeln(i + " > termLine = itemsTopLevelArr[i] = " + termLine);       
   while (top1Index.length > 0) top1Index.pop();
   top1Index = termLine.split(itemSep);
   if (top1Index.length ==2) {
       placeIndex = Number(top1Index[1]);
       continue;
       }
   else { // else
      while (top1Index.length > 0) top1Index.pop();
      top1Index = termLine.split(sepChar);
      if (top1Index.length == 1) { // == 1
        var confRez = confirm ("Ожидалось, что строка " + termLine + " будет см-ссылкой, но что-то пошло иначе.\nПродолжить обработку?", undefined, programTitul);
        if (confRez == false) {
            pBar.close();
            exit();
            }
        else continue;
        } // == 1
    if (placeIndex == -1 || placeIndex == undefined) { // -1
     //   pBar.error(termLine + " — строка помещена в конец указателя, т.к. недостаточно информации, где она должна размещаться.");    
        pBar.error(termLine + " — строка помещена в конец указателя.");           
        keepProblemLine ();
        continue;      
        } // -1    
    var frstLttr = top1Index[0][0];    
    if (usedLetters[frstLttr.toLowerCase()] == undefined) { //  == undefined
      //  pBar.error(termLine + "— строка помещена в конец указателя, т.к. среди терминов первого уровня нет таких, чтобы начинались с буквы " + frstLttr);
        pBar.error(termLine + " — строка помещена в конец указателя.");           
        keepProblemLine ();
        continue;
        } //  == undefined
     placeSeeTermin();
    } // else
    } // i--
app.findGrepPreferences = NothingEnum.nothing;
app.changeGrepPreferences = NothingEnum.nothing; 
pBar.close();
/////
function keepProblemLine () { // keepProblemLine
if (payAttention == false) story.insertionPoints[-1].contents = infoString + "\r\r";
prev_placeIndex = placeIndex;
app.findGrepPreferences = NothingEnum.nothing;
app.changeGrepPreferences = NothingEnum.nothing;    
app.findGrepPreferences.findWhat = infoString; 
rez = story.findGrep();
if (rez.length == 0) {  
    alert("Не найдена строка infoString. [1]");
    //continue;
    return;
    }
placeIndex = rez[0].index + Number(infoString.length) + Number(1); 
placeSeeTermin();
placeIndex = prev_placeIndex;
payAttention = true;
    //continue;
    return;
} // keepProblemLine
///
function placeSeeTermin() { // placeSeeTermin
 story.insertionPoints[placeIndex].contents = termLine + "\r";     
 story.insertionPoints[placeIndex].paragraphs[0].appliedParagraphStyle = doc.paragraphStyles.itemByID(level1ID);
 story.insertionPoints[placeIndex].paragraphs[0].select();
 app.selection[0].appliedCharacterStyle = doc.characterStyles[0];
 app.selection[0].clearOverrides(OverrideType.ALL);
if (sepOpt1.value == true) { // sepOpt1
    ///==>> символьный стиль только для ссылки (два разделителя)
    app.findGrepPreferences = NothingEnum.nothing;
    app.changeGrepPreferences = NothingEnum.nothing;    
    app.findGrepPreferences.findWhat = "(?<=.)(" + sepChar + sp + "*" + textPointer  + sp + "*" + sepChar + ")(?=.)"; 
    rez = app.selection[0].findGrep();
    if (rez.length == 0) {
        alert ("В строке " + topicLine + " ссылка не найдена. [1]", programTitul);
       // continue;
        return;
        }
    rez[0].appliedCharacterStyle = doc.characterStyles.itemByID(changeCharStyleC_ID);
    story.characters.itemByRange(placeIndex, rez[0].index).appliedCharacterStyle = doc.characterStyles.itemByID(findCharStyleID); // термин второго уровня перед см. оформляется стилем искомого термина    
    story.insertionPoints[placeIndex].paragraphs[0].select();
    app.findGrepPreferences = NothingEnum.nothing;
    app.changeGrepPreferences = NothingEnum.nothing;    
    app.findGrepPreferences.findWhat = sepChar; 
    app.changeGrepPreferences.changeTo = " ";     
    rez = app.selection[0].changeGrep(); 
    story.insertionPoints[placeIndex].paragraphs[0].select();
    app.findGrepPreferences = NothingEnum.nothing;
    app.changeGrepPreferences = NothingEnum.nothing;    
    app.findGrepPreferences.findWhat = "\\h+"; 
    app.changeGrepPreferences.changeTo = " ";     
    rez = app.selection[0].changeGrep();
    } // sepOpt1
///==>>
if (sepOpt2.value == true) { // sepOpt2
//#@#>> символьный стиль для ссылки и термина (один разделитель)
    app.findGrepPreferences = NothingEnum.nothing;
    app.changeGrepPreferences = NothingEnum.nothing;    
    app.findGrepPreferences.findWhat = ".+" +sepChar + "\\K" + sp + "*" + textPointer + ".+"; 
    rez = app.selection[0].findGrep();
    if (rez.length == 0) {
        alert ("В строке " + topicLine + " разделитель не найден.", programTitul);
       // continue;
        return;
        }
    rez[0].select();
    app.selection[0].appliedCharacterStyle = doc.characterStyles.itemByID(changeCharStyleC_ID);
    story.characters.itemByRange(placeIndex, rez[0].index).appliedCharacterStyle = doc.characterStyles.itemByID(findCharStyleID); // термин второго уровня перед см. оформляется стилем искомого термина       
    story.insertionPoints[placeIndex].paragraphs[0].select();
    app.findGrepPreferences = NothingEnum.nothing;
    app.changeGrepPreferences = NothingEnum.nothing;    
    app.findGrepPreferences.findWhat = sepChar; 
    app.changeGrepPreferences.changeTo = " ";     
    rez = app.selection[0].changeGrep(); 
    story.insertionPoints[placeIndex].paragraphs[0].select();
    app.findGrepPreferences = NothingEnum.nothing;
    app.changeGrepPreferences = NothingEnum.nothing;    
    app.findGrepPreferences.findWhat = "\\h+"; 
    app.changeGrepPreferences.changeTo = " ";     
    app.selection[0].changeGrep();
    //#@#>> 
    }  // sepOpt2
if (sepOpt3.value == true) { // sepOpt3
    ///==>> символьный стиль для ссылки  термина (три разделителя)
    app.findGrepPreferences = NothingEnum.nothing;
    app.changeGrepPreferences = NothingEnum.nothing;    
    app.findGrepPreferences.findWhat = "(?<=.)(" + sepChar + sp + "*" + textPointer  + sp + "*" + sepChar + sepChar + ")(?=.)"; 
    rez = app.selection[0].findGrep();
    if (rez.length == 0) {
        alert ("В строке " + topicLine + " ссылка не найдена. [2]", programTitul);
       // continue;
        return;
        }
    rez[0].appliedCharacterStyle = doc.characterStyles.itemByID(changeCharStyleC_ID);
    story.characters.itemByRange(placeIndex, rez[0].index).appliedCharacterStyle = doc.characterStyles.itemByID(findCharStyleID); // термин второго уровня перед см. оформляется стилем искомого термина       
    story.insertionPoints[placeIndex].paragraphs[0].select();
    app.findGrepPreferences = NothingEnum.nothing;
    app.changeGrepPreferences = NothingEnum.nothing; 
    app.findGrepPreferences.findWhat = "(?<=" + sepChar + sepChar + ")(.+)"; 
    rez = app.selection[0].findGrep();
    if (rez.length == 0) {
        alert ("В строке " + topicLine + " не найден термин после разделителей.", programTitul);
       // continue;
        return;
        }    
    rez[0].appliedCharacterStyle = doc.characterStyles.itemByID(changeCharStyleT_ID);
    story.insertionPoints[placeIndex].paragraphs[0].select();
    app.findGrepPreferences = NothingEnum.nothing;
    app.changeGrepPreferences = NothingEnum.nothing;    
    app.findGrepPreferences.findWhat = sepChar; 
    app.changeGrepPreferences.changeTo = " ";     
    rez = app.selection[0].changeGrep(); 
    story.insertionPoints[placeIndex].paragraphs[0].select();
    app.findGrepPreferences = NothingEnum.nothing;
    app.changeGrepPreferences = NothingEnum.nothing;    
    app.findGrepPreferences.findWhat = "\\h+"; 
    app.changeGrepPreferences.changeTo = " ";     
    rez = app.selection[0].changeGrep();   
    } // sepOpt3
story.recompose();
doc.select(NothingEnum.nothing); 
rezultNum++;
} // placeSeeTermin
} // placePointerAction
}  // theAction.onClick
///
function get_wordsLine(foundedContents, wordsLineTop) { // get_wordsLine
var wordsLine;
if (sepOpt1.value == true) wordsLine = foundedContents + sepChar + sp + textPointer + sp + sepChar + wordsLineTop; // выбрана первая радиокнопка -- в строке два разделителя
else if (sepOpt2.value == true) wordsLine = foundedContents + sepChar + sp + textPointer + sp +wordsLineTop; // активна вторая радиокнопка -- в строке один разделитель
else /* (sepOpt3.value == true) */ wordsLine = foundedContents + sepChar + sp + textPointer + sp +sepChar + sepChar + wordsLineTop; // при третьей радиокнопке в строке три разделителя
// Переменная wordsLine попадёт в массив rezData.
// В массиве rezData число разделителей около слова-ссылки 'см.' зависит от выбранной радиокнопки. 
// если активна радиокнопка "только ссылка", то разделители (переменная sepChar) до и после этого слова, 
// Если выбрана радиокнопка "ссылка и термин одним стилем ссылки", то есть один разделитель слева от этого слова. 
// Кнопка "ссылка и термин своими стилями" -- слева слова-ссылки один разделитель, а справа два.
return wordsLine;
} // get_wordsLine
///
win.show();
////