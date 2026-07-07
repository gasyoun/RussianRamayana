//  AddAnnotationData.jsx

/*
    
Добавление блока аннотационных сведений в указатель.
Для работы скрипта должны быть открыты два файла — с собранным и приведенным в порядок указателем,
с таблицей-двухколонником, в которой первая колонка — это термин из IndexList-xxx.indd, по которому делался этот указатель,
а вторая колонка — аннотационные сведения для каждого термина.
Вариант обособления блока аннотационной информации определяет пользователь.

*/

// © Михаил Иванюшин, 2023  |  dotextok@gmail.com  |  dotextok.ru

#targetengine "AddAnnotationData"
//#include "ForIndex.jsxinc"
//#include "../ForIndex.jsxinc"
#include "../../ForIndex.jsxinc"

app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll; // см. http://adobeindesign.ru/2008/10/24/restore-ui/

var programTitul = "Добавление аннотационных сведений в указатель";
if (app.documents.length == 0) {
    alert("Нет открытых документов.", programTitul);
    exit();
    }
if (app.documents.length != 2) {
   alert("Для работы скрипта должны быть открыты два файла — с приведённым в порядок указателем, с таблицей-двухколонником, в которой первая колонка — это термины из файла IndexList-xxx.indd, по которому делался этот указатель, а вторая колонка — аннотационные сведения для каждого термина.", programTitul);  
    exit();
    }
var storyID;
var firstFileName;
var termins = [];
var annot = [];
var termIndex = {};
var setTire_value = 1;
var setDot_value = 0;
var setSlash_value = 1;
var setSqBr_value = 1;
var setAnother_value = 1;
var leftZnakText = "";
var rightZnakText = "";
var nobreakSpace_value = 1;
var joinChars_value = 1;
var selStyle_selection_index = 0;
var selStyle_selection = "";
var fixSpace = "\u00A0";
var myDefSetName  = "#AddAnnotationData.ini"; // это файл установок программы
var myScriptFile = myGetScriptPath();
var myScriptFolder = decodeURI(myScriptFile.path);
var myFilePath = decodeURI(myScriptFolder + "/sets/" + myDefSetName); 
var myDataFile = new File (myFilePath);
if (myDataFile.open("r")) { //  r  |такой файл есть 
setTire_value = myDataFile.readln();
setDot_value = myDataFile.readln();
setSlash_value = myDataFile.readln();
setSqBr_value = myDataFile.readln();
setAnother_value = myDataFile.readln();
leftZnakText = myDataFile.readln();
rightZnakText = myDataFile.readln();
nobreakSpace_value = myDataFile.readln();
selStyle_selection_index = myDataFile.readln();
selStyle_selection = myDataFile.readln();
joinChars_value = myDataFile.readln();
myDataFile.close();
} // r
var char_Styles = []; 
var charStylesID = [];
while (char_Styles.length > 0) char_Styles.pop();
while (charStylesID.length > 0) charStylesID.pop();
//////////////
var win = new Window ("palette", programTitul);
win.alignChildren = ["fill", "fill"];
var inListStart = "Поставьте курсор в текст предметного указателя и установите флажок";
var inListOK = "Текст предметного указателя указан";
var inList = win.add("checkbox", undefined, inListStart); 
inList.value = false;
var inTableStart =  "Поставьте курсор в текст таблицы и установите флажок";
var inTableOK = "Аннотационные сведения подготовлены";
var inTable = win.add("checkbox", undefined, inTableStart);
inTable.value = false;
inTable.enabled = false;
separator1 = win.add ("panel");
separator1.minimumSize.height = separator1.maximumSize.height = 1;
var selectionGroup = win.add("group");
selectionGroup.orientation = "column";
var defaultView = selectionGroup.add("radiobutton", undefined, "Аннотационные сведения оформляются установками указателя");
defaultView.alignment = "left";
defaultView.value = false;
var newView = selectionGroup.add("radiobutton", undefined, "Аннотационные сведения выделяются в тексте указателя");
newView.alignment = "left";
selectionGroup.enabled = false;
//newView.value = true;
newView.value = false;
separator2 = win.add ("panel");
separator2.minimumSize.height = separator2.maximumSize.height = 1;
var newViewGroup = win.add("group");
newViewGroup.orientation = "column";
newViewGroup.alignChildren = ["fill", "fill"];
newViewGroup.enabled = false;
if (inTable.text == inTableOK) { if (newView.value) newViewGroup.enabled = true; else newViewGroup.enabled = false; }
///
defaultView.onClick = function () { // defaultView.onClick
    newViewGroup.enabled = false;
    if (inTable.text == inTableOK) action.enabled = true; else action.enabled = false;
    } // defaultView.onClick
//
newView.onClick = function () { // newView.onClick
    newViewGroup.enabled = true; 
    if (useZnaks.value == false) znaks.enabled = false;   
    if (useStyle.value == false) selStyle.enabled = false;
    if (inTable.text != inTableOK) action.enabled = false; 
    else {
        if (useZnaks.value || useStyle.value) action.enabled = true;  else action.enabled = false; 
        }
    } // newView.onClick
///
var useZnaks = newViewGroup.add("checkbox", undefined, "Добавить знаки до и после аннотационных данных");
useZnaks.value = false;
var znaks = newViewGroup.add("group");
znaks.orientation = "row";
//znaks.alignment = "left";
var setTire = znaks.add("radiobutton", undefined, "—...—");
setTire_value == 1 ? setTire.value = true : setTire.value = false;
var setDot = znaks.add("radiobutton", undefined, "•...•");
setDot_value == 1 ? setDot.value = true : setDot.value = false;
var setSlash = znaks.add("radiobutton", undefined, "/.../");
setSlash_value == 1 ? setSlash.value = true : setSlash.value = false;
var setSqBr = znaks.add("radiobutton", undefined, "[...]");   
setSqBr_value == 1 ? setSqBr.value = true : setSqBr.value = false;
var setAnother = znaks.add("radiobutton", undefined, "Свой вариант");
setAnother_value == 1 ? setAnother.value = true : setAnother.value = false;
var znLength = 2;
var leftZnak = znaks.add("edittext {justify: 'center'}", undefined);
leftZnak.characters = znLength;
leftZnak.text = leftZnakText;
if (!setAnother.value) leftZnak.enabled = false;
znaks.add("statictext", undefined, "...");
var rightZnak = znaks.add("edittext {justify: 'center'}", undefined);
rightZnak.characters = znLength;
rightZnak.text = rightZnakText;
if (!setAnother.value) rightZnak.enabled = false;
if (setTire.value) { leftZnak.text = "—";  rightZnak.text = "—"; }
else if (setDot.value) { leftZnak.text  ="•";  rightZnak.text = "•"; }
else if (setSlash.value) { leftZnak.text = "/";  rightZnak.text = "/"; }
else if (setSqBr.value) { leftZnak.text = "[";  rightZnak.text = "]"; }
///
setTire.onClick = function () { leftZnak.enabled = false; rightZnak.enabled = false; leftZnak.text = "—";  rightZnak.text = "—"; }
setDot.onClick = function () { leftZnak.enabled = false; rightZnak.enabled = false; leftZnak.text  ="•";  rightZnak.text = "•";  }
setSlash.onClick = function () { leftZnak.enabled = false; rightZnak.enabled = false; leftZnak.text = "/";  rightZnak.text = "/"; }
setSqBr.onClick = function (){ leftZnak.enabled = false; rightZnak.enabled = false; leftZnak.text = "[";  rightZnak.text = "]"; }
setAnother.onClick = function () { leftZnak.enabled = true; rightZnak.enabled = true; }
var useStyle = newViewGroup.add("checkbox", undefined, "Оформить аннотационные данные символьным стилем");
useStyle.value = false;
var selStyle = newViewGroup.add ("dropdownlist");
selStyle.alignment = "left";
selStyle.enabled = false;
selStyle.minimumSize.width = selStyle.maximumSize.width = 340;
///
var listMayBeEmpty = true;
useStyle.onClick = function () { // useStyle.onClick   
if (useStyle.value) { // == true   
    if (listMayBeEmpty) {
        for (var t = 0; t < char_Styles.length; t++) selStyle.add("item", char_Styles[t]);
        if (String(selStyle.items[selStyle_selection_index]) == selStyle_selection) selStyle.selection = selStyle_selection_index; else selStyle.selection = 0; 
        listMayBeEmpty = false;
        }
    selStyle.enabled = true;
    if (inTable.text == inTableOK) action.enabled = true; else action.enabled = false;    
    } // == true
else { // == false
    selStyle.enabled = false;    
    if ((inTable.text == inTableOK) && (useZnaks.value == true)) action.enabled = true; else action.enabled = false;
    } // == false
} // useStyle.onClick
///
useZnaks.onClick = function () { // useZnaks.onClick
if (useZnaks.value) { // == true  
    znaks.enabled = true;    
    if (inTable.text == inTableOK) action.enabled = true; else action.enabled = false;
    } // == true 
else { // == false
    znaks.enabled = false;    
    if ((inTable.text == inTableOK) && (useStyle.value == true)) action.enabled = true; else action.enabled = false;
    } // == false
} // useZnaks.onClick
///
separator2 = win.add ("panel");
separator2.minimumSize.height = separator2.maximumSize.height = 1;
///
var nobreakSpace = win.add("checkbox", undefined, "Заменить обычный пробел перед тире на неразрывный");
var joinChars = win.add("checkbox", undefined, "Не оставлять первый и последний знаки аннотации на другой строке");
nobreakSpace_value == 1 ? nobreakSpace.value = true : nobreakSpace.value = false;
joinChars_value == 1 ? joinChars.value = true : joinChars.value = false;
nobreakSpace.enabled = false;
joinChars.enabled = false;
var buttonsGroup = win.add("group");
buttonsGroup.orientation = "row";
buttonsGroup.alignChildren = ["center", "center"];
var buttonSize = [0,0,190,28];
var action = buttonsGroup.add("button", buttonSize,  "Добавить аннотации");
action.enabled = false;
var info = buttonsGroup.add("button", [0,0,28,28],  "?");
var reset = buttonsGroup.add("button", buttonSize,  "Отменить выборку");
reset.enabled = false;
///
inList.onClick = function () { // inList.onClick   
var noName = false;
try { var myDocPath = app.documents[0].filePath; } // если документ не сохранён, маршрут не сообщается
catch(e) {
   alert("Это только что созданный и ещё ни разу не сохранённый файл.\nДайте ему имя.",programTitul);   
   noName = true;
    }
if (noName) {
    try { app.documents[0].save(); }
    catch (e) {
         alert("Файл не был сохранён с новым именем");
        win.close(); 
        }
    }
///
var sel = app.selection[0];
if (sel == null  || sel.constructor.name != "InsertionPoint" ) {
    inList.value = false;
    alert("Курсор должен быть в тексте предметного указателя.", programTitul);
    return; 
    }
storyID = sel.parentStory.id;
firstFileName = decodeURI(app.activeDocument.name);
inList.text = inListOK;
inList.enabled = false;
inTable.enabled = true;

var myCharacterStyles = app.activeDocument.allCharacterStyles;
var myCharacterStyleName, obj;
for (var i=0; i < myCharacterStyles.length ; i++) { // i++
    myCharacterStyleName = myCharacterStyles[i].name;
    obj = myCharacterStyles[i];
    while(obj.parent instanceof CharacterStyleGroup) {
        myCharacterStyleName = obj.parent.name + ":" + myCharacterStyleName;
        obj = obj.parent;        
        }
    char_Styles.push(myCharacterStyleName);
    charStylesID.push(myCharacterStyles[i].id);
    } // i++
app.activeDocument = app.documents[1];
reset.enabled = true;
} // inList.onClick
///
inTable.onClick = function () { // inTable.onClick
var sel = app.selection[0];
if (sel == null  || sel.constructor.name != "InsertionPoint" || sel.parent.constructor.name != "Cell" ) {
    inTable.value = false;
    alert("Курсор должен быть в ячейке таблицы.", programTitul);
    return; 
    }
var table = sel.parent.parent;
var prevText = "1234567890-=@ScriptingCadabra"; // такой билебирды в термине быть не может :))
while (termins.length > 0) termins.pop();
while (annot.length > 0) annot.pop();
var pBar = new ProgressBar(programTitul);
pBar.reset("Сохраняем аннотационные сведения к терминам выбранной таблицы", table.rows.length);
var termIndexValue = 0;
var termCont = "";
for (var i = 0; i < table.rows.length; i++, pBar.hit()) { // i++
    if (table.rows[i].cells[0].texts[0].contents == prevText) continue; // учитываем редкий случай, когда термины соседних ячеек одинаковые. См. в описании программы главу "Поиск вариантов одного термина", с. 7, 8.
    termCont = table.rows[i].cells[0].texts[0].contents;
    termins.push(termCont);
    annot.push(table.rows[i].cells[1].texts[0].contents);  
    termIndex[termCont] = termIndexValue;
    termIndexValue = termIndexValue++;
    prevText = table.rows[i].cells[0].texts[0].contents;
    } // i++
pBar.close();
// в результате в массиве termins[] собраны все термины, а в массиве annot []  -- все аннотации к ним.
// в массиве termIndex - индексы текстов аннотаций для конкретных терминов.
inTable.text = inTableOK;
inTable.enabled = false;
if (defaultView.value) action.enabled = true;
else if (useZnaks.value || useStyle.value) action.enabled = true;
selectionGroup.enabled = true;
nobreakSpace.enabled = true;
joinChars.enabled = true;
app.activeDocument = app.documents[1];
reset.enabled = true;
} // inTable.onClick
///
reset.onClick = function () { // reset.onClick
inTable.value = false;
inList.value = false;
inList.text = inListStart;
inTable.text = inTableStart;
inList.enabled = true;
inTable.enabled = false;
action.enabled = false;
selectionGroup.enabled = false;
defaultView.value = false;
useZnaks.value = false;
useStyle.value = false;
newView.value = false;
newViewGroup.enabled = false;
nobreakSpace.enabled = false;
joinChars.enabled = false;
reset.enabled = false;
} // reset.onClick
///
info.onClick = function () { // info.onClick
var infoText = "Для работы скрипта должны быть открыты два файла — с приведённым в порядок указателем (для этого есть скрипт 'ProcNumberLine.jsx' ), с таблицей-двухколонником, в которой левая колонка — это термин из файла 'IndexList-xxx.indd', по которому делался этот указатель, а правая колонка — аннотационные сведения для каждого термина.\n\nВариант обособления блока аннотационной информации определяет пользователь. В книгах по подготовке предметных указателей нет конкретных рекомендаций, как оформлять аннотационный блок. Поскольку он размещается между термином и последовательностью номеров страниц, то предполагается, что до и после этого блока должны быть какие-то разграничители. Первое, что приходит в голову, это использовать тире для таких знаков. Но в тексте аннотационных сведений тоже может быть много тире, и поставленные программой тире как границы аннотационного блока потеряются.\nКоль скоро тут важно единообразие оформления, то программа предлагает несколько вариантов на выбор, и можно указать свои маркеры до и после аннотационного блока, такие, что отсутствуют в аннотационных текстах.\n\n> Особенность указания границ аннотационных сведений.\nПри выборе предустановленных вариантов \"—...—\"  \"•...•\"  \"/.../\"  \"[...]\" знаки указания границ блока аннотационной информации отображаются в полях ввода текста, но эти поля будут доступны только при выборе радиокнопки \"Свой вариант\". И если используется любой из предустановленных вариантов, когда не выбрана радиокнопка \"Свой вариант\", то скрипт до и после каждого знака ставит пробелы. Когда выбрана кнопка \"Свой вариант\", в полях ввода текста только эти знаки, и вы можете сами определить — где нужны пробелы до / после этих знаков, или указать свой вариант, например, < ... >.\n\nЕсли установлен флажок \"Заменить обычный пробел перед тире на неразрывный\", то будут обработаны пробелы перед обоими вариантами тире, длинным и коротким.\n\nЕсли результат работы не совпал с ожиданиями, можно вернуться к состоянию работы, которое было до запуска скрипта, нажав клавиши Ctrl+Z.";
alert(infoText, programTitul);
} //  info.onClick
///
action.onClick = function () { // action.onClick
if (decodeURI(app.activeDocument.name) != firstFileName) { // 1
    app.activeDocument = app.documents[1];
    if (decodeURI(app.activeDocument.name) != firstFileName) { // 2
        alert("Что-то пошло не так, не найден файл с текстом указателя.");
        win.close();
        } // 2
    } // 1
app.doScript(procCells, ScriptLanguage.JAVASCRIPT, [], UndoModes.FAST_ENTIRE_SCRIPT, 'procCells'); 
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
return;
//////
function procCells() { // procCells
var theTerm, theAnnotationText, findRez, indStart, indEnd, annotLength, annotEnd, chStyleID, noBreakLeftStart, nobreakLeftEnd, noBreakRightStart, noBreakRightEnd;
var indexFile = app.activeDocument.stories.itemByID(storyID); //это материал (статья) предметного указателя
var pBar = new ProgressBar(programTitul);
var sp = " ";
//var sp = "";
pBar.reset("Добавляем аннотационные сведения к терминам, движение по тексту от конца к началу", termins.length);
for (var i = termins.length-1; i >= 0 ; i--, pBar.hit()) { // i--
    if (annot[i].length == 0) continue;
    theTerm = termins[i];
    if (defaultView.value) { // defaultView.value
       //  theAnnotationText = theTerm + sp + annot[i] + sp;
         app.findGrepPreferences = null; 
        app.changeGrepPreferences = null;
      //  app.findGrepPreferences.findWhat = "^" + theTerm + "\\s+"; 
       // app.findGrepPreferences.findWhat = "^(?i)" + theTerm; 
        app.findGrepPreferences.findWhat = "^(?i)\\b" + theTerm + "\\b"; // 10.10.2023         
        var rFnd = indexFile.texts[0].findGrep();
        if (rFnd.length == 0) continue; else theAnnotationText = rFnd[0].contents + sp + annot[i] + "." + sp; // 30/10
        app.changeGrepPreferences.changeTo = theAnnotationText;
        indexFile.texts[0].changeGrep();   
        continue;
        } // defaultView.value
///
        if (useZnaks.value) { // useZnaks
            if (setAnother.value == false) theAnnotationText = sp + leftZnak.text + sp + annot[i] + sp + rightZnak.text; else theAnnotationText = leftZnak.text + annot[i]+ rightZnak.text;
            }  // useZnaks
        else theAnnotationText = sp + annot[i]; // это вариант, когда аннотация помещается между текстом и номерами и оформляется символьным стилем. Никаких знаков до / после не добавляется.
        app.findGrepPreferences = null; 
       app.changeGrepPreferences = null;
       app.findGrepPreferences.findWhat = "^(?i)" + theTerm; 
       findRez = indexFile.texts[0].findGrep(); 
       a=0;
       if (findRez.length == 0) continue;
       indStart = findRez[0].index;
       indEnd = Number(indStart) + Number(theTerm.length);
       indexFile.insertionPoints[indEnd].contents = theAnnotationText;
       if (joinChars.value == true) { // joinChars.value
           // чтобы знаки, обрамляющие аннотационный блок, были всегда вместе с этим блоком, пять знаков в начале и конце аннотационного блока получат атрибут "Без переносов" (No break).
           noBreakLeftStart = indEnd;
           nobreakLeftEnd = indEnd + Number(4);
           noBreakRightEnd = Number(indEnd) + Number(theAnnotationText.length);
           noBreakRightStart = noBreakRightEnd - 4;
           indexFile.characters.itemByRange(noBreakLeftStart,nobreakLeftEnd).noBreak = true;
           indexFile.characters.itemByRange(noBreakRightStart,noBreakRightEnd).noBreak = true;
           } // joinChars.value
       if (useStyle.value) { // useStyle.value
           annotLength = theAnnotationText.length;
           annotEnd = Number(indEnd) + Number(annotLength);
           chStyleID = charStylesID[selStyle.selection.index];
           indexFile.characters.itemByRange(indEnd, annotEnd).appliedCharacterStyle = app.activeDocument.characterStyles.itemByID(Number(chStyleID));
           } // useStyle.value
       } // i--
if (nobreakSpace.value) { // nobreakSpace
    pBar.info("Заменяем обычный пробел перед тире на неразрывный");
    app.changeGrepPreferences = null;
    app.findGrepPreferences.findWhat = "( )([—–])"; // знак с кодом 0x2212 не обрабатывается (это минус в некоторых шрифтах) 
    app.changeGrepPreferences.changeTo = fixSpace + "$2";
    indexFile.texts[0].changeGrep();     
    } // nobreakSpace
pBar.close();
action.enabled = false;
myDataFile.open("w");
if (setTire.value == true) { myDataFile.writeln(1); } else { myDataFile.writeln(0); } 
if (setDot.value == true) { myDataFile.writeln(1); } else { myDataFile.writeln(0); } 
if (setSlash.value == true) { myDataFile.writeln(1); } else { myDataFile.writeln(0); } 
if (setSqBr.value == true) { myDataFile.writeln(1); } else { myDataFile.writeln(0); } 
if (setAnother.value == true) { myDataFile.writeln(1); } else { myDataFile.writeln(0); } 
myDataFile.writeln(String(leftZnak.text));
myDataFile.writeln(String(rightZnak.text));
if (nobreakSpace.value == true) { myDataFile.writeln(1); } else { myDataFile.writeln(0); } 
try { myDataFile.writeln(String(selStyle.selection.index)); } catch (e) { myDataFile.writeln(String(selStyle_selection_index)); }
try {myDataFile.writeln(String(selStyle.selection)); } catch (e) { myDataFile.writeln(String(selStyle_selection)); }
if (joinChars.value == true) { myDataFile.writeln(1); } else { myDataFile.writeln(0); } 
win.close();
return;
}  // procCells
} // action.onClick
///
win.onClose = function () {app.activate(); }
///
win.show();
/////////////////
function myGetScriptPath() {
	try{
		return app.activeScript;
	}
	catch(myError) {
		return File(myError.fileName);
	}
}