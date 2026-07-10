//  ProcNumberLines.jsx

// скрипт обрабатывает номера страниц в указателе.
// последовательность одинаковых номеров заменяется одним номером
// последовательность различающихся на единицу номеров заменяется на интервал: 23, 24, 25, 26 будут 23-26
// Разделитель чисел берётся из массива usedDashes

// © Михаил Иванюшин, 2020-2023  |  dotextok@gmail.com  |  dotextok.ru

#targetengine "ProcNumberLine"
#include "../../ForIndex.jsxinc"

app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll; // см. http://adobeindesign.ru/2008/10/24/restore-ui/

var infoAboutPages = []; // массив с информацией об обработке страниц: "+" --  учесть номер страницы, не изменяя символьного стиля текста;  "-" -- не включать номер этой страницы;  id - идентификатор символьного стиля оформления номера этой страницы
var noInfoAboutPages = true;
var idStartMarker = "{•[";
var idEndMarker = "]•}";
var idStartMarkerSearch = "\\\{•\\\[";
var idEndMarkerSearch = "\\\]•\\\}"
var panel1isUsed = false;
var panel2isUsed = false;
var panel3isUsed = false;
var panel4isUsed = false;
var pageLimit = 2000;

var myNumber_text = "?";
var numDiv_selection_index = 1;
var termCharStyle_selection_index = 0;
var termCharStyle_selection = "";
var pS1s_text = "?";
var pS1f_text = "?";
var pS2s_text = "?";
var pS2f_text = "?";
var pS3s_text = "?";
var pS3f_text = "?";
var pS4s_text = "?";
var pS4f_text = "?";
var selChSt1_selection_index = 0;
var selChSt2_selection_index = 0;
var selChSt3_selection_index = 0;
var selChSt4_selection_index = 0;
var selChSt1_selection = "";
var selChSt2_selection = "";
var selChSt3_selection = "";
var selChSt4_selection = "";
var usedDashes = ["-", "–", "—"]; // вариант разделителя номеров. Дефис минус тире. По умолчанию используется минус, т.е. индекс 1 этого массива
var programTitul = "Оформление номеров страниц в указателе";
if (app.documents.length == 0) {
    alert("Нет открытых документов.", programTitul);
    exit();
    }
sel = app.selection[0];
if (sel == null  || sel.constructor.name == "TextFrame" || sel.constructor.name == "InsertionPoint" || sel.hasOwnProperty("texts") == false) {
    alert("Выделите текст указателя, в котором надо привести в порядок номера страниц.", programTitul);
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
var charStyles = []; 
var charStylesID = [];
while (charStyles.length > 0) charStyles.pop();
while (charStylesID.length > 0) charStylesID.pop();
var myCharacterStyles = app.activeDocument.allCharacterStyles;
var myCharacterStyleName, obj;
for (var i=0; i < myCharacterStyles.length ; i++) { // i++
    myCharacterStyleName = myCharacterStyles[i].name;
    obj = myCharacterStyles[i];
    while(obj.parent instanceof CharacterStyleGroup) {
        myCharacterStyleName = obj.parent.name + ":" + myCharacterStyleName;
        obj = obj.parent;        
        }
    charStyles.push(myCharacterStyleName);
    charStylesID.push(myCharacterStyles[i].id);
    } // i++

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
/////////
var myDefSetName  = "#ProcNumberLine.ini"; // это файл установок программы
var myScriptFile = myGetScriptPath();
var myScriptFolder = decodeURI(myScriptFile.path);
var myFilePath = decodeURI(myScriptFolder + "/sets/" + myDefSetName); 
var myDataFile = new File (myFilePath);
if (myDataFile.open("r")) { //  r  |такой файл есть 
numDiv_selection_index = myDataFile.readln();
termCharStyle_selection_index = myDataFile.readln();
termCharStyle_selection = myDataFile.readln();
pS1s_text = myDataFile.readln();
pS1f_text = myDataFile.readln();
pS2s_text = myDataFile.readln();
pS2f_text = myDataFile.readln();
pS3s_text = myDataFile.readln();
pS3f_text = myDataFile.readln();
pS4s_text = myDataFile.readln();
pS4f_text = myDataFile.readln();
selChSt1_selection_index = myDataFile.readln();
selChSt2_selection_index = myDataFile.readln();
selChSt3_selection_index = myDataFile.readln();
selChSt4_selection_index = myDataFile.readln();
selChSt1_selection = myDataFile.readln();
selChSt2_selection = myDataFile.readln();
selChSt3_selection = myDataFile.readln();
selChSt4_selection = myDataFile.readln();
myDataFile.close();
if (charStyles[termCharStyle_selection_index] != termCharStyle_selection) termCharStyle_selection_index = 0;
if (charStyles[selChSt1_selection_index] != selChSt1_selection) selChSt1_selection_index = 0;
if (charStyles[selChSt2_selection_index] != selChSt2_selection) selChSt2_selection_index = 0;
if (charStyles[selChSt3_selection_index] != selChSt3_selection) selChSt3_selection_index = 0;
if (charStyles[selChSt4_selection_index] != selChSt4_selection) selChSt4_selection_index = 0;
} // r
/////////
var win = new Window ("palette", programTitul);
win.alignChildren = ["fill", "fill"];
win.orientation = "column";
var setNum = win.add("group");
setNum.orientation = "row";
var myNumber = setNum.add ("edittext {justify: 'center'}", undefined); 
myNumber.characters = 6;
myNumber.text = myNumber_text;
myNumber.helpTip = "Во время приведения строк указателя в порядок можно определить, на какое число изменить все номера страниц. Для этого надо ввести тут положительное или отрицательное целое число. При введении отрицательного числа сперва вводится число, а потом перед ним ставится знак минус.";
var numDiv =setNum.add("dropdownlist", undefined, ["Дефис" ,"Минус", "Тире"]);
numDiv.selection = numDiv_selection_index;
numDiv.helpTip = "Выбор разделителя чисел для случаев, когда последовательность номеров 11, 12, 13, 14, 15 будет преобразовываться в 11-15."
///
var okStart = "Обработать";
var okAction = "Оформление";
var listLength = 250; // 160
var myOKButon = setNum.add("button", [0,0,180,28], okStart);
myOKButon.enabled = true;
var theInfo = setNum.add("button", [0,0,28,28], "?");
separator1 = win.add ("panel");
separator1.minimumSize.height = separator1.maximumSize.height = 1;
var defCS = win.add("statictext", undefined, "Определите символьный стиль для оформления терминов");
var termCharStyle = win.add ("dropdownlist", undefined, charStyles);
termCharStyle.alignment = "left";
termCharStyle.selection = termCharStyle_selection_index; 
termCharStyle.minimumSize.width = termCharStyle.maximumSize.width = listLength;
///
separator2 = win.add ("panel");
separator2.minimumSize.height = separator2.maximumSize.height = 1;
var pagediapGroup = win.add("group");
pagediapGroup.orientation = "row";
pagediapGroup.alignChildren = ["left", "fill"];
var activePageDiap = pagediapGroup.add("checkbox", undefined, "Особый диапазон страниц");
var theRB = pagediapGroup.add("group");
theRB.orientation = "row";
theRB.alignChildren = ["left", "fill"];
var space = "\u00A0";
var dot = "•";
var buttonSpace = [0,0,28,28];
var rb1 = theRB.add("radiobutton", buttonSpace, space);
rb1.value = true;
var rb2 = theRB.add("radiobutton", buttonSpace, space);
rb2.value = false;
var rb3 = theRB.add("radiobutton", buttonSpace, space);
rb3.value = false;
var rb4 = theRB.add("radiobutton", buttonSpace, space);
rb4.value = false;
theRB.enabled = false;
activePageDiap.value = false;
///---
var pFfieldLength = 4;
var skipText = "Не учитывать в указателе эти страницы";
var specText = "Оформить символьным стилем номера страниц в указателе";
///---
////// stackGroup.orientation = "stack"
var stackGroup = win.add("group");
stackGroup.orientation = "stack";
///===
var pageSet1 = stackGroup.add("group");
pageSet1.visible = true;
pageSet1.orientation = "column";
pageSet1.alignChildren = ["fill", "fill"];
var usePanel1 = pageSet1.add("checkbox", undefined, "Использовать в обработке текста панель [1]");
usePanel1.value = false;
var variants1 = pageSet1.add("group");
variants1.alignChildren = ["left", "fill"];
variants1.orientation = "column";
var psSkip1 = variants1.add("radiobutton", undefined, skipText);
psSkip1.value = true;
var psSpec1 = variants1.add("radiobutton", undefined, specText);
psSpec1.value = false;
variants1.enabled = false;
///
var pgNumAndStyle1 = pageSet1.add("group");
pgNumAndStyle1.orientation = "row";
pgNumAndStyle1.alignChildren = ["left", "fill"];
var pS1s = pgNumAndStyle1.add("edittext {justify: 'center'}", undefined);
pS1s.characters = pFfieldLength; 
pS1s.text = pS1s_text;
var pS1f = pgNumAndStyle1.add("edittext {justify: 'center'}", undefined);
pS1f.characters = pFfieldLength;
pS1f.text = pS1f_text;
var selChSt1 = pgNumAndStyle1.add ("dropdownlist", undefined, charStyles);
selChSt1.selection = selChSt1_selection_index; 
selChSt1.enabled = false;
selChSt1.minimumSize.width = selChSt1.maximumSize.width = listLength;
pgNumAndStyle1.enabled = false;
pageSet1.enabled = false;
usePanel1.onClick = function () { // usePanel1.onClick
if (usePanel1.value) { variants1.enabled = true; pgNumAndStyle1.enabled = true; rb1.text = dot;} else {  variants1.enabled = false; pgNumAndStyle1.enabled = false; rb1.text = space;}
} // usePanel1.onClick
///
///=== 
var pageSet2 = stackGroup.add("group");
pageSet2.visible = false;
pageSet2.orientation = "column";
pageSet2.alignChildren = ["fill", "fill"];
var usePanel2 = pageSet2.add("checkbox", undefined, "Использовать в обработке текста панель [2]");
usePanel2.value = false;
var variants2 = pageSet2.add("group");
variants2.alignChildren = ["left", "fill"];
variants2.orientation = "column";
var psSkip2 = variants2.add("radiobutton", undefined, skipText);
psSkip2.value = true;
var psSpec2 = variants2.add("radiobutton", undefined, specText);
psSpec2.value = false;
variants2.enabled = false;
///
var pgNumAndStyle2 = pageSet2.add("group");
pgNumAndStyle2.orientation = "row";
pgNumAndStyle2.alignChildren = ["left", "fill"];
var pS2s = pgNumAndStyle2.add("edittext {justify: 'center'}", undefined);
pS2s.characters = pFfieldLength; 
pS2s.text = pS2s_text;
var pS2f = pgNumAndStyle2.add("edittext {justify: 'center'}", undefined);
pS2f.characters = pFfieldLength;
pS2f.text = pS2f_text;
var selChSt2 = pgNumAndStyle2.add ("dropdownlist", undefined, charStyles);
selChSt2.selection = selChSt2_selection_index; 
selChSt2.enabled = false;
selChSt2.minimumSize.width = selChSt2.maximumSize.width = listLength;
pgNumAndStyle2.enabled = false;
pageSet2.enabled = false;
usePanel2.onClick = function () { // usePanel2.onClick
if (usePanel2.value) { variants2.enabled = true; pgNumAndStyle2.enabled = true; rb2.text = dot;} else {  variants2.enabled = false; pgNumAndStyle2.enabled = false; rb2.text = space;}
} // usePanel2.onClick
///===
var pageSet3 = stackGroup.add("group");
pageSet3.visible = false;
pageSet3.orientation = "column";
pageSet3.alignChildren = ["fill", "fill"];
var usePanel3 = pageSet3.add("checkbox", undefined, "Использовать в обработке текста панель [3]");
usePanel3.value = false;
var variants3 = pageSet3.add("group");
variants3.alignChildren = ["left", "fill"];
variants3.orientation = "column";
var psSkip3 = variants3.add("radiobutton", undefined, skipText);
psSkip3.value = true;
var psSpec3 = variants3.add("radiobutton", undefined, specText);
psSpec3.value = false;
variants3.enabled = false;
///
var pgNumAndStyle3 = pageSet3.add("group");
pgNumAndStyle3.orientation = "row";
pgNumAndStyle3.alignChildren = ["left", "fill"];
var pS3s = pgNumAndStyle3.add("edittext {justify: 'center'}", undefined);
pS3s.characters = pFfieldLength; 
pS3s.text = pS3s_text;
var pS3f = pgNumAndStyle3.add("edittext {justify: 'center'}", undefined);
pS3f.characters = pFfieldLength;
pS3f.text = pS3f_text;
var selChSt3 = pgNumAndStyle3.add ("dropdownlist", undefined, charStyles);
selChSt3.selection = selChSt3_selection_index; 
selChSt3.enabled = false;
selChSt3.minimumSize.width = selChSt3.maximumSize.width = listLength;
pgNumAndStyle3.enabled = false;
pageSet3.enabled = false;
usePanel3.onClick = function () { // usePanel3.onClick
if (usePanel3.value) { variants3.enabled = true; pgNumAndStyle3.enabled = true; rb3.text = dot;} else {  variants3.enabled = false; pgNumAndStyle3.enabled = false; rb3.text = space; }
} // usePanel3.onClick
///===
var pageSet4 = stackGroup.add("group");
pageSet4.visible = false;
pageSet4.orientation = "column";
pageSet4.alignChildren = ["fill", "fill"];
var usePanel4 = pageSet4.add("checkbox", undefined, "Использовать в обработке текста панель [4]");
usePanel4.value = false;
var variants4 = pageSet4.add("group");
variants4.alignChildren = ["left", "fill"];
variants4.orientation = "column";
var psSkip4 = variants4.add("radiobutton", undefined, skipText);
psSkip4.value = true;
var psSpec4 = variants4.add("radiobutton", undefined, specText);
psSpec4.value = false;
variants4.enabled = false;
///
var pgNumAndStyle4 = pageSet4.add("group");
pgNumAndStyle4.orientation = "row";
pgNumAndStyle4.alignChildren = ["left", "fill"];
var pS4s = pgNumAndStyle4.add("edittext {justify: 'center'}", undefined);
pS4s.characters = pFfieldLength; 
pS4s.text = pS4s_text;
var pS4f = pgNumAndStyle4.add("edittext {justify: 'center'}", undefined);
pS4f.characters = pFfieldLength;
pS4f.text = pS4f_text;
var selChSt4 = pgNumAndStyle4.add ("dropdownlist", undefined, charStyles);
selChSt4.selection = selChSt4_selection_index; 
selChSt4.enabled = false;
selChSt4.minimumSize.width = selChSt4.maximumSize.width = listLength;
pgNumAndStyle4.enabled = false;
pageSet4.enabled = false;
usePanel4.onClick = function () { // usePanel4.onClick
if (usePanel4.value) { variants4.enabled = true; pgNumAndStyle4.enabled = true; rb4.text = dot; } else { variants4.enabled = false; pgNumAndStyle4.enabled = false; rb4.text = space; }
} // usePanel4.onClick
///
psSkip1.onClick = function () { selChSt1.enabled = false; }
psSpec1.onClick = function () { selChSt1.enabled = true; }
///
psSkip2.onClick = function () { selChSt2.enabled = false; }
psSpec2.onClick = function () { selChSt2.enabled = true; }
///
psSkip3.onClick = function () { selChSt3.enabled = false; }
psSpec3.onClick = function () { selChSt3.enabled = true; }
///
psSkip4.onClick = function () { selChSt4.enabled = false; }
psSpec4.onClick = function () { selChSt4.enabled = true; }
///===
///
activePageDiap.onClick = function () { // activePageDiap
if (activePageDiap.value) {
    set_array ();
    theRB.enabled = true; 
    pageSet1.enabled = true;
    pageSet2.enabled = true;  
    pageSet3.enabled = true;
    pageSet4.enabled = true;     
    }
else {
    theRB.enabled = false;
    pageSet1.enabled = false;
    pageSet2.enabled = false;    
    pageSet3.enabled = false;
    pageSet4.enabled = false;     
    }
} // activePageDiap
///
rb1.onClick = function () { // rb1.onClick     
pageSet1.visible = true;
pageSet2.visible = false;
pageSet3.visible = false;
pageSet4.visible = false;
} // rb1.onClick
///
rb2.onClick = function () { // rb2.onClick         
pageSet1.visible = false;
pageSet2.visible = true;
pageSet3.visible = false;
pageSet4.visible = false;
} // rb2.onClick
///
rb3.onClick = function () { // rb3.onClick           
pageSet1.visible = false;
pageSet2.visible = false;
pageSet3.visible = true;
pageSet4.visible = false;
} // rb3.onClick
///
rb4.onClick = function () { // rb4.onClick         
pageSet1.visible = false;
pageSet2.visible = false;
pageSet3.visible = false;
pageSet4.visible = true;
} // rb4.onClick
///====
myNumber.onChanging = function () { // myNumber.onChanging 
var valid = /^[-+\d]+$/.test (myNumber.text) && !isNaN(myNumber.text) && !Number(myNumber.text) == 0;
if (!valid == true) myNumber.text = "?";
} // myNumber.onChanging 
//////
theInfo.onClick = function() {
var wn = new Window ("dialog", programTitul);
var textInfo = "Программа работает с выделенным текстом, предполагается, что это текст указателя, подготовленного в программе индизайн.\nПриводятся в порядок номера страниц в указателе — удаляются повторы одинаковых номеров, группы последовательных номеров заменяются на их диапазон. Например, последовательность номеров 17, 17, 17, 19, 20, 21, 21, 22, 22, 23, 25, 26, 27, 27, 30 будет заменена на 17, 19-23, 25-27, 30. Есть выпадающий список для выбора, какой знак использовать между первым и последним номером диапазона.\n\nМожно изменить значение всех номеров в указателе (например, в последний момент изменилось число страниц предисловия, и все номера в указателе стали неверными). Для этого предусмотрено поле ввода величины поправки. Когда там знак вопроса, номера не меняются, а если положительное или отрицательное число, то все номера будут изменены в соответствии с этой поправкой.\nПри вводе отрицательного числа надо сперва ввести значение, а потом перед ним знак минус. В шапке прогрессбара появится информация, если номера страниц будут изменяться при обработке указателя.\n\nПоле \«Определите символьный стиль для оформления терминов\» предназначено для выбора символьного стиля оформления терминов предметного указателя.\nВариант 'Без стиля' уберёт стилевое символьное оформление всех знаков указателя, самый простой, если не сказать примитивный выбор. Но если в дальнейшем предполагается работать именно с терминами, например, использовать скрипты AddSeeTopic.jsx или NameAndNick.jsx, то для них потребуется оформление символьным стилем, который подготовлен пользователем.\nЛучше сделать привычкой всегда определять символьный стиль терминов. Это даст больше возможностей на завершающем этапе оформления указателя.\n\nФлажок \«Особый диапазон страниц\» делает доступными четыре служебных панели, переключаемые радиокнопками. Будет или нет использоваться данная панель, определяется состоянием флажка \«Использовать в обработке текста панель\». Когда этот флажок активен, рядом с радиокнопкой данной панели будет стоять чёрная точка. \nНа каждой панели указываются номера страниц, требующие другой обработки, и есть флажки, определяющие, что надо сделать:\n= флажок \«Не учитывать в указателе эти страницы\» — позволяет исключить из указателя случайно попавшие в него номера страниц, например, для терминов с титула или из содержания. \n= флажок \«Оформить символьным стилем номера страниц в указателе\» — для получения визуального различия номеров страниц из разных частей книги. Например, термин в основном тексте — его номера страниц можно оставить светлым (если это стандартное начертание), а номера страниц, где данный термин в комментариях, выделить полужирным. Для этого достаточно определить диапазон страниц и выбрать нужный символьный стиль.\nЕсли определена поправка изменения номеров , она учитывается при обработке этих диапазонов страниц.\n\nПрограмма проверяет на используемых панелях правильность ввода номеров страниц.\nПоля ввода номеров обрабатываться не будут, если они одинаковые, такие что или оба пустые, или в обоих стоит знак вопроса.\nПрограмма сообщит, что в панели не всё в порядке с указанием номеров страниц, если:\n- одно из полей не определено;\n- в поле не число;\n- число отрицательное или больше чем pageLimit (переменная 'pageLimit' определена в тексте этой программы, по умолчанию её значение равно 2000, если у вас будет книга с количеством страниц, превосходящим это число, то измените значение данной переменной);\n- начальный номер больше конечного;\n- обнаружено перекрытие диапазонов номеров страниц.\n\nПосле нажатия на кнопку \«Обработать\» её название меняется на \«Оформление\», и это название будет до тех пор, пока не исчезнет прогрессбар.\n\nЕсли результат работы не совпал с ожиданиями, можно вернуться к состоянию работы, которое было до запуска скрипта, нажав клавиши Ctrl+Z.\n\n";
var data = wn.add("edittext", [0, 0, 1050, 600], textInfo, {multiline: true});
wn.layout.layout();
wn.show();
return;
} // info.onClick
/////////
myOKButon.onClick = function() { // myOKButon.onClick
sel = app.selection[0];
if (sel == null || sel.constructor.name == "TextFrame" || sel.constructor.name == "InsertionPoint" || sel.hasOwnProperty("texts") == false) {
    alert("Выделите текст, в котором надо привести в порядок номера страниц.", programTitul);
    return; 
    }  
if (activePageDiapTest() == null) return;
myOKButon.text = okAction;
app.doScript(procNums, ScriptLanguage.JAVASCRIPT, [], UndoModes.FAST_ENTIRE_SCRIPT, 'procNums'); 
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
if (procNumsRez == 0) app.activeDocument.select(NothingEnum.nothing); 
myOKButon.text = okStart;
myDataFile.open("w");
myDataFile.writeln(numDiv.selection.index);
myDataFile.writeln(termCharStyle.selection.index);
myDataFile.writeln(termCharStyle.selection);
myDataFile.writeln(pS1s.text);
myDataFile.writeln(pS1f.text);
myDataFile.writeln(pS2s.text);
myDataFile.writeln(pS2f.text);
myDataFile.writeln(pS3s.text);
myDataFile.writeln(pS3f.text);
myDataFile.writeln(pS4s.text);
myDataFile.writeln(pS4f.text);
myDataFile.writeln(selChSt1.selection.index);
myDataFile.writeln(selChSt2.selection.index);
myDataFile.writeln(selChSt3.selection.index);
myDataFile.writeln(selChSt4.selection.index);
myDataFile.writeln(selChSt1.selection);
myDataFile.writeln(selChSt2.selection);
myDataFile.writeln(selChSt3.selection);
myDataFile.writeln(selChSt4.selection);
myDataFile.close();
return;
//////
function procNums() { // procNums
procNumsRez = 0;    
var myStartOfFragment = sel.paragraphs[0].characters.firstItem().index;
var pCount = sel.paragraphs.length;
var story = sel.parentStory;
myEndOfFragment = sel.paragraphs[pCount - 1].characters.lastItem().index;
var notProceessedSpace = story.texts[0].characters.length - myEndOfFragment; // число знаков от последнего выделенного  знака до конца материала позводит найти последнюю выделенную точку, даже если в процессе обработки объём материала изменится.
story.characters.itemByRange(myStartOfFragment,myEndOfFragment).select();
sel = app.selection[0];
if (story.characters[myStartOfFragment].paragraphs[0].length == 1 || story.characters[myEndOfFragment].paragraphs[0].length == 1) {
    alert("В начале и конце выделения не должно быть пустых абзацев.",programTitul);
    procNumsRez = 1;  
    return;    
    }
//=>> 31-08.2022 Обнаружилось, что если в термине последние символы -- цифры, то они, похоже, могут интерпретироваться как номера страниц.
// Для обхода этой ситуации ищем:
// цифра-пробел-пробел-цифра 
// и заменяем на:
// цифра-точка (dot)-пробел-пробел-цифра
// После замены восстанавливаем область выделения, т.к. объем текста сог стать больше
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
app.findGrepPreferences.findWhat = "(\\d)(  \\d)"; // второй образец поиска: два пробела \\d
app.changeGrepPreferences.changeTo = "$1" + dot + "$2";
var rez =sel.changeGrep();
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
myEndOfFragment = story.texts[0].length - notProceessedSpace;
story.characters.itemByRange(myStartOfFragment,myEndOfFragment).select();
sel = app.selection[0];
//=>>
if (story.characters[myEndOfFragment].contents != "\r") {
    myEndOfFragment = myEndOfFragment + 1;
    story.insertionPoints[myEndOfFragment].contents = "\r";
    story.characters.itemByRange(myStartOfFragment,myEndOfFragment).select();
    sel = app.selection[0];
    }
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
app.findGrepPreferences.findWhat = "\\d$";
var rez =sel.findGrep();
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;

var myDateS = new Date;
var myHourS = myDateS.getHours();
if (myHourS <10) myHourS = "0" + myHourS;
var myMinuteS = myDateS.getMinutes();
if (myMinuteS <10) myMinuteS = "0" + myMinuteS;

var pBText = "Оформление номеров страниц в указателе"+ "  [ " + myHourS + ":" + myMinuteS + " ]";
if (myNumber.text == "?") pBText = pBText;
else pBText = pBText + "   [ поправка на изменение номера страницы: " + myNumber.text + " ] ";
var selIndex = sel.characters[0].index;
story.characters.itemByRange(selIndex, selIndex + Number(sel.length)-1).appliedCharacterStyle = app.activeDocument.characterStyles[0];
story.characters.itemByRange(selIndex, selIndex + Number(sel.length)-1).fillColor = app.activeDocument.colors.item("Black");
var usedParaID = sel.characters[0].appliedParagraphStyle.id;
pBar = new ProgressBar(pBText);
var usedPara = story.texts[0].characters[myEndOfFragment].paragraphs[0];
pBar.reset("", pCount);
for (var i = pCount-1; i >= 0; i--, pBar.hit()) { // i--
    var n = pCount - i;
    pBar.info("1/4 Поиск терминов с номерами страниц: " + n + "/" + pCount);
    var pagesLine = usedPara.contents; // строка с номерами страниц
    usedPara.select();
    var firstSelIndex = app.selection[0].characters[0].index;
    firstSelIndex--; // теперь он указывает на последний символ предыдущего абзаца...
    var prevItemLink = story.texts[0].characters[firstSelIndex].paragraphs[0]; // ... и это уже ссылка на предыдущий абзац
    var mS = app.selection[0];
    app.findGrepPreferences = null; 
    app.changeGrepPreferences = null;
    app.findGrepPreferences.findWhat = "(?<=\\h)\\h*\\b\\d+[-–—\\d,\\h]*$"; // перед строкой номеров один пробел. \\b обязательно, иначе можно взять цифру в конце слова
    var rez = mS.findGrep();   
    if (rez.length == 0) {
        usedPara = prevItemLink;
        continue;
        }
    var index = rez[0].index;
    var string = rez[0].contents;
    var pgNmrAr = [];
    while (pgNmrAr.length > 0) pgNmrAr.shift();
    pgNmrAr = string.split(",");
    if ((activePageDiap.value == true) && ((panel1isUsed && psSkip1.value) || (panel2isUsed && psSkip2.value) || (panel3isUsed && psSkip3.value) || (panel4isUsed && psSkip4.value))) { // activePageDiap
        // удалим из массива номера страниц, которые не надо учитывать
        for (var p = pgNmrAr.length-1; p >=0; p--) { // p--
            if (infoAboutPages[Number(pgNmrAr[p])] == "-")  pgNmrAr.splice(p, 1); 
            } // p--
        } // activePageDiap
    string = makeNumberLine(pgNmrAr); 
    story.texts[0].insertionPoints[index].contents = " " + string; // восстановили пробел между термином и строкой номеров
    var termIndex = termCharStyle.selection.index;
    var termStyleID = charStylesID[termIndex];
    var paraIndex = rez[0].paragraphs[0].index;
    story.characters.itemByRange(paraIndex,index-1).appliedCharacterStyle = app.activeDocument.characterStyles.itemByID(Number(termStyleID));
    rez[0].remove();
    usedPara = prevItemLink;
    } // i--
//////////////
// могут быть термины без номеров страниц. Их тоже надо отметить символьным стилем 
myEndOfFragment = story.texts[0].length - notProceessedSpace;
usedPara = story.texts[0].characters[myEndOfFragment].paragraphs[0];
pBar.reset("", pCount);
for (var i = pCount-1; i >= 0; i--, pBar.hit()) { // i--
        var n = pCount - i;
        pBar.info("2/4 Поиск терминов без номеров страниц: " + n + "/" + pCount);
        usedPara.select();
        lineProc(app.selection[0].texts[0]);    
        var firstSelIndex = app.selection[0].characters[0].index;
        firstSelIndex--; // теперь он указывает на последний символ предыдущего абзаца...
        var prevItemLink = story.texts[0].characters[firstSelIndex].paragraphs[0]; // ... и это уже ссылка на предыдущий абзац
       usedPara = prevItemLink;
        } // i--
 ///
function lineProc(sel) { // lineProc
var thePara = sel.paragraphs[0].texts[0];
if (thePara.characters[0].appliedCharacterStyle.id == Number(termStyleID)) return;
if (thePara.characters[0].appliedParagraphStyle.name != indStyle1 && thePara.characters[0].appliedParagraphStyle.name != indStyle2 && thePara.characters[0].appliedParagraphStyle.name != indStyle3 && thePara.characters[0].appliedParagraphStyle.name != indStyle4) return;
else {
    thePara.characters.itemByRange(0, thePara.texts[0].length-1).appliedCharacterStyle = app.activeDocument.characterStyles.itemByID(Number(termStyleID)); 
    return;
    }
} // lineProc
///
pBar.close();
// 31.08.2022 Убираем служебную точку после термина
story.characters.itemByRange(myStartOfFragment,myEndOfFragment).select();
app.findGrepPreferences = null;
app.changeGrepPreferences = null;
app.findGrepPreferences.findWhat = "(\\d)(" + dot + ")";
app.changeGrepPreferences.changeTo = "$1";
var rez =app.selection[0].changeGrep();
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
///////
myEndOfFragment = story.texts[0].length - notProceessedSpace;
story.characters.itemByRange(myStartOfFragment,myEndOfFragment).select();
sel = app.selection[0];
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
app.findGrepPreferences.findWhat = "(" + idStartMarkerSearch + idEndMarkerSearch + ")(\\d+)(" + idStartMarkerSearch + ")(\\d+)(" + idEndMarkerSearch + ")";
var rezAll = sel.findGrep();  
if (rezAll.length != 0) { // rezAll.length != 0 
pBar = new ProgressBar("Особое оформление номеров страниц" + "  [ " + myHourS + ":" + myMinuteS + " ]");
pBar.reset("3/4 Тегами были отмечены номера страниц, у которых должно быть иное оформление. Сейчас они обрабатываются", rezAll.length);
for (var f = rezAll.length-1; f >= 0; f--, pBar.hit()) { // f--
    var start = rezAll[f].index;
    var end = Number(start) + Number(rezAll[f].length)-1;
    story.characters.itemByRange(start,end).select();
    var partSel = app.selection[0];
    app.findGrepPreferences = null; 
    app.changeGrepPreferences = null;
    app.findGrepPreferences.findWhat = "(?<=" + idStartMarkerSearch + ")(\\d+)(?=" + idEndMarkerSearch + ")";    
    var getChID = partSel.findGrep();  
    if (getChID.length == 0) continue;
    var chID = getChID[0];
    var numEndIndex = getChID[0].index - idStartMarker.length -1; // -1 --- сразу учтём, что в itemByRange индекс завершения должен быть на единицу меньше
    var numStrtIndex = Number(start) + Number(idStartMarker.length) + Number(idEndMarker.length); // перед числом -- идентификатором символьного стиля стоят два тега idStartMarker и idEndMarker. numStrtIndex -- это индекс начала номера, который надо оформить символьным стилем, имеющим данный идентификатор
    story.characters.itemByRange(numStrtIndex,numEndIndex).appliedCharacterStyle = app.activeDocument.characterStyles.itemByID(Number(chID.contents));
    } // f--
pBar.reset("4/4 Удаление вспомогательных тегов. После завершения обработки возможна задержка на обновление файла.", 3);
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
app.findGrepPreferences.findWhat = "(" + idStartMarkerSearch + ")(\\d+)(" + idEndMarkerSearch + ")"; // это информация об идентификаторе символьного стиля
app.changeGrepPreferences.changeTo = "";
story.changeGrep();
pBar.hit();
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
app.findGrepPreferences.findWhat = idStartMarkerSearch + idEndMarkerSearch; // это теги перед номером страницы, который к этому моменту уже оформлен символьным стилем
app.changeGrepPreferences.changeTo = "";
story.changeGrep();
pBar.hit();
app.findGrepPreferences.findWhat = "  {2,}"; // три и больше подряд идущих пробела ...     
app.changeGrepPreferences.changeTo = "  "; // ... заменим на два       
var rez = story.changeGrep(); 
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
pBar.close();
} // rezAll.length != 0
return; 
} //  procNums
///////////////////////////////////////////
function makeNumberLine(tmpArray) { // makeNumberLine
// в строках уже могут быть указаны диапазоны чисел.
// Избавимся от них, чтобы сделать их вновь.
// Ведь при объединении разных строк диапазоны могут измениться,
// поэтому их надо убрать.
var tmpArrayLength = tmpArray.length;
for (a = 0; a < tmpArrayLength; a++) { // a++
    tmpItem = tmpArray[a];
    splitShift = tmpItem.search(/[-–—]/); // дефис минус тире
    if (splitShift == -1) continue;
    twoNumbers = tmpItem.split(tmpItem[splitShift]);
    tmpArray[a] = twoNumbers[0];
    arDelta = Math.abs(twoNumbers[1]-twoNumbers[0]);
    for (s = 0; s < arDelta; s++) { // s++
        twoNumbers[0]++;
        tmpArray.push(twoNumbers[0]);
        } // s++
    } // a++
///
var tmpLine = tmpArray.join(",");
var regExp2 = new RegExp(" +","g");            
tmpLine =  tmpLine.replace(regExp2, ""); // избавимся от пробелов перед числами
tmpArr = tmpLine.split(","); // теперь в массиве только числа в текстовом представлении
if (myNumber.text != "?") { //  != "?"
    for (var ii = 0; ii < tmpArr.length; ii++) { // ii++
        var item = Number(tmpArr[ii]) + Number(myNumber.text);
        tmpArr[ii] = String(item);
        } // ii++
    } //  != "?"
tmpArr.sort ( function (a,b) { return Number (a) > Number (b)} );
var rezNumberLine = "";
var lastN = -1;
minusIsPlaced = false;
usedDash = usedDashes[numDiv.selection.index];
firstCase = true;
for (n = 0; n < tmpArr.length; n++) { // n++
    if (tmpArr[n] == lastN) continue;
    else lastN = tmpArr[n];
    if (firstCase == true) {
        firstCase = false;
        rezNumberLine += lastN;        
        }
    else rezNumberLine += ", " + lastN;
    } // n++
var rezNumberLineArr = rezNumberLine.split(",");
// добавим два фиктивных элемента. Они нужны для корректного завершения цикла r++, но в результат не попадут.
rezNumberLineArr.push(-1);
rezNumberLineArr.push(-1);
var lastRezNumberLine = "";
firstCase = true;
for (r = 0, delta = 0; r < rezNumberLineArr.length-2; r = r+1+delta) { // r++
    delta = 0;
    d1 = Number(rezNumberLineArr[r])+1;
    d2 = rezNumberLineArr[r+1];
    d3 = Number(rezNumberLineArr[r+1])+1;
    d4 = Number(rezNumberLineArr[r+2]);
    if (d1 != d2 || d3 != d4) { // d1 d2 d3
        if (firstCase == true) { // firstCase
            lastRezNumberLine += getNumberWithStyleID(rezNumberLineArr[r]);  
            firstCase = false;            
            } // firstCase
        else lastRezNumberLine += ", " + getNumberWithStyleID(rezNumberLineArr[r]);
        continue;
        } // d1 d2 d3
    frstN = getNumberWithStyleID(rezNumberLineArr[r]);
    delta = 2;
    while (Number(rezNumberLineArr[r+delta])+1 == rezNumberLineArr[r+1+ delta]) delta++;
    scndN = getNumberWithStyleID(rezNumberLineArr[r+delta]);
    if (firstCase == true) { /// firstCase == true
        lastRezNumberLine += frstN + usedDash + scndN;        
        firstCase = false;
        } /// firstCase == true
    else { /// ! firstCase
        lastRezNumberLine += ", " + frstN + usedDash + scndN;
        } ///  !firstCase
    } // r++
var regExp1 = new RegExp(usedDash+" +","g"); // при создании диапазонов страниц после дефиса(минуса/тире) есть пробелы. Их надо удалить.
var regExp2 = new RegExp(" +","g");            
lastRezNumberLine =  lastRezNumberLine.replace(regExp1, usedDash);
lastRezNumberLine =  lastRezNumberLine.replace(regExp2, " ");
// к этому моменту в lastRezNumberLine подготовлена строка упорядоченных номеров страниц. Все идущие подряд страницы обработаны так, что есть номер первой и последней, и между ними минус.
// Одиночные номера идут четез запятую. Очевидно, что не может быть случая, что идут один за другим  три номера последовательных страниц, Если это и было, то это уже обработано.
// Значит, в этой последовательности чисел могут быть только по два номера соседних страниц. Найдём их и поставим между ними минус.
//
if (lastRezNumberLine.indexOf(",") == -1) return lastRezNumberLine;
// $.writeln("lastRezNumberLine = " + lastRezNumberLine);
while (rezNumberLineArr.length > 0) rezNumberLineArr.pop();
rezNumberLineArr = lastRezNumberLine.split(", ");
// $.writeln(rezNumberLineArr.length);
// $.writeln(rezNumberLineArr);
var theNumberArr = [];
while (theNumberArr.length > 0) theNumberArr.pop();
var num01, num02, kept1, kept2;
for (var i = 1; i < rezNumberLineArr.length; i++) { // i++
    kept1 = false;
    kept2 = false;
    num01 = rezNumberLineArr[i-1];
    num02 = rezNumberLineArr[i];   
    // $.writeln(i + " | num01 = " + num01 + " | num02 = " + num02);
    if (num01.indexOf(usedDash) != -1) {
         theNumberArr.push(num01); 
         kept1 = true;
         continue;
        }
    if (num02.indexOf(usedDash) != -1) {
         theNumberArr.push(num01); 
         theNumberArr.push(num02);   
         kept1 = true;
         kept2 = true;         
         i = i+1;
        continue;
        }    
    if (Number(num02) - Number(num01) == 1) {
         theNumberArr.push(num01 + usedDash + num02);   
         kept1 = true;
         kept2 = true;            
         i = i+1;         
        continue;        
        }
    else {
         theNumberArr.push(num01);    
         kept1 = true;         
        continue;        
        }
    } // i++
if (kept2 == false)  theNumberArr.push(num02); 
lastRezNumberLine = theNumberArr.join(", ");
// $.writeln(lastRezNumberLine);
return lastRezNumberLine;
} // makeNumberLine
} //  // myOKButon.onClick
////
function activePageDiapTest() { // activePageDiapTest
if (activePageDiap.value == false) return 0;
var theError = false;
///>> 1. проверка корректности указания номеров страниц
if (usePanel1.value) { // usePanel1
var nQ = 0;
if (pS1s.text.match("\\?") != null) nQ++;
if (pS1f.text.match("\\?") != null) nQ++;
if (nQ == 0 && pS1s.text.length != 0 && pS1f.text.length != 0) panel1isUsed = true;
if (nQ == 1) theError = true;
if (nQ == 0 && testTextField (pS1s.text, pS1f.text) == false) theError = true;
if (theError) { alert("В первой панели указания особого диапазона страниц не всё в порядке с указанием номеров страниц.", programTitul); return null;}
} // usePanel1
///
if (usePanel2.value) { // usePanel2
nQ = 0;
if (pS2s.text.match("\\?") != null) nQ++;
if (pS2f.text.match("\\?") != null) nQ++;
if (nQ == 0 && pS2s.text.length != 0 && pS2f.text.length != 0) panel2isUsed = true;
if (nQ == 1) theError = true;
if (nQ == 0 && testTextField (pS2s.text, pS2f.text) == false) theError = true;
if (theError) { alert("Во второй панели указания особого диапазона страниц не всё в порядке с указанием номеров страниц.", programTitul); return null;}
} // usePanel2
///
if (usePanel3.value) { // usePanel3
nQ = 0;
if (pS3s.text.match("\\?") != null) nQ++;
if (pS3f.text.match("\\?") != null) nQ++;
if (nQ == 0 && pS3s.text.length != 0 && pS3f.text.length != 0) panel3isUsed = true;
if (nQ == 1) theError = true;
if (nQ == 0 && testTextField (pS3s.text, pS3f.text) == false) theError = true;
if (theError) { alert("В третьей панели указания особого диапазона страниц не всё в порядке с указанием номеров страниц.", programTitul); return null;}
}  // usePanel3
///
if (usePanel4.value) { // usePanel4
nQ = 0;
if (pS4s.text.match("\\?") != null) nQ++;
if (pS4f.text.match("\\?") != null) nQ++;
if (nQ == 0 && pS4s.text.length != 0 && pS4f.text.length != 0) panel4isUsed = true;
if (nQ == 1) theError = true;
if (nQ == 0 && testTextField (pS4s.text, pS4f.text) == false) theError = true;
if (theError) { alert("В четвёртой панели указания особого диапазона страниц не всё в порядке с указанием номеров страниц.", programTitul); return null;}
}  // usePanel4
///>> 1.
///
/// >> 2. Проверка, что указанные диапазоны не перекрываются.
nQ = 0;
if (usePanel1.value) { // usePanel1
    if (pS1s.text.match("\\?") != null) nQ++;
    if (pS1f.text.match("\\?") != null) nQ++;
    if (nQ == 0) { // 1 окно | == 0 - означает, что в первой панели установлены два значения номеров страниц
        var p1s = Number(pS1s.text);
        var p1f = Number(pS1f.text);   
        nQ = 0;
        if (usePanel2.value) { // usePanel2
            if (pS2s.text.match("\\?") != null) nQ++;
            if (pS2f.text.match("\\?") != null) nQ++;
            } // usePanel2
        else nQ = 2; // эквивалентно тому, что в панели в полях ввода номеров страниц стоят знаки вопроса
        if (nQ == 0) { // 2 окно, сравнение
            var p2s = Number(pS2s.text);
            var p2f = Number(pS2f.text);  
            if ((p1f == p2s) || (p2f == p1s) || (p1f == p2f) || (p2s == p1s)) { alert("Совпадение номеров страниц в первой и второй панели указания особого диапазона страниц.", programTitul); return null; }
            if (((p1s < p2s) && (p1f > p2s)) || ((p2s < p1s) && (p2f > p1s)))  { alert("Перекрытие номеров страниц в первой и второй панели указания особого диапазона страниц.", programTitul); return null; }
            }  // 2 окно, сравнение
        nQ = 0;
        if (usePanel3.value) { // usePanel3    
            if (pS3s.text.match("\\?") != null) nQ++;
            if (pS3f.text.match("\\?") != null) nQ++;
            } // usePanel3
        else nQ = 2;
        if (nQ == 0) { // 3 окно, сравнение
            var p3s = Number(pS3s.text);
            var p3f = Number(pS3f.text);  
            if ((p1f == p3s) || (p3f == p1s) || (p1f == p3f) || (p3s == p1s)) { alert("Совпадение номеров страниц в первой и третьей панели указания особого диапазона страниц.", programTitul); return null; }
            if (((p1s < p3s) && (p1f > p3s)) || ((p3s < p1s) && (p3f > p1s)))  { alert("Перекрытие номеров страниц в первой и третьей панели указания особого диапазона страниц.", programTitul); return null; }
            }  // 3 окно, сравнение   
        nQ = 0;
        if (usePanel4.value) { // usePanel4        
            if (pS4s.text.match("\\?") != null) nQ++;
            if (pS4f.text.match("\\?") != null) nQ++;
            } // usePanel4
        else nQ = 2;
        if (nQ == 0) { // 4 окно, сравнение
            var p4s = Number(pS4s.text);
            var p4f = Number(pS4f.text);  
            if ((p1f == p4s) || (p4f == p1s) || (p1f == p4f) || (p4s == p1s)) { alert("Совпадение номеров страниц в первой и четвёртой панели указания особого диапазона страниц.", programTitul); return null; }
            if (((p1s < p4s) && (p1f > p4s)) || ((p4s < p1s) && (p4f > p1s)))  { alert("Перекрытие номеров страниц в первой и четвёртой панели указания особого диапазона страниц.", programTitul); return null; }
            }  // 4 окно, сравнение      
        }  // 1 окно
    } // usePanel1
nQ = 0;
if (usePanel2.value) { // usePanel2
    if (pS2s.text.match("\\?") != null) nQ++;
    if (pS2f.text.match("\\?") != null) nQ++;
    if (nQ == 0) { // 2 окно
        var p2s = Number(pS2s.text);
        var p2f = Number(pS2f.text);   
        nQ = 0;
        if (usePanel3.value) { // usePanel3
            if (pS3s.text.match("\\?") != null) nQ++;
            if (pS3f.text.match("\\?") != null) nQ++;
            }  // usePanel3
        else nQ = 2;
        if (nQ == 0) { // 3 окно, сравнение
            var p3s = Number(pS3s.text);
            var p3f = Number(pS3f.text);  
            if ((p3f == p2s) || (p2f == p3s) || (p3f == p2f) || (p2s == p3s)) { alert("Совпадение номеров страниц во второй и третьей панели указания особого диапазона страниц.", programTitul); return null; }
            if (((p2s < p3s) && (p2f > p3s)) || ((p3s < p2s) && (p3f > p2s)))  { alert("Перекрытие номеров страниц во второй и третьей панели указания особого диапазона страниц.", programTitul); return null; }
            }  // 3 окно, сравнение   
        nQ = 0;
        if (usePanel4.value) { // usePanel4    
            if (pS4s.text.match("\\?") != null) nQ++;
            if (pS4f.text.match("\\?") != null) nQ++;
            } // usePanel4
        else nQ = 2;
        if (nQ == 0) { // 4 окно, сравнение
            var p4s = Number(pS4s.text);
            var p4f = Number(pS4f.text);  
            if ((p4f == p2s) || (p2f == p4s) || (p4f == p2f) || (p2s == p4s)) { alert("Совпадение номеров страниц во второй и четвёртой панели указания особого диапазона страниц.", programTitul); return null; }
            if (((p2s < p4s) && (p2f > p4s)) || ((p4s < p2s) && (p4f > p2s)))  { alert("Перекрытие номеров страниц во второй и четвёртой панели указания особого диапазона страниц.", programTitul); return null; }
            }  // 4 окно, сравнение      
        }  // 2 окно
    } // usePanel2
nQ = 0;
if (usePanel3.value) { // usePanel3
    if (pS3s.text.match("\\?") != null) nQ++;
    if (pS3f.text.match("\\?") != null) nQ++;
    if (nQ == 0) { // 3 окно | 10.07.2026 (H377): было nQ == 2 — проверка перекрытия панелей 3-4 никогда не выполнялась (везде выше шаблон nQ == 0 = оба номера заданы)
        var p3s = Number(pS3s.text);
        var p3f = Number(pS3f.text);      
        nQ = 0;
        if (usePanel4.value) { // usePanel4
            if (pS4s.text.match("\\?") != null) nQ++;
            if (pS4f.text.match("\\?") != null) nQ++;
            }  // usePanel4
        else nQ = 2;
        if (nQ == 0) { // 4 окно, сравнение
            var p4s = Number(pS4s.text);
            var p4f = Number(pS4f.text);  
            if ((p4f == p3s) || (p3f == p4s) || (p4f == p3f) || (p3s == p4s)) { alert("Совпадение номеров страниц в третьей и четвёртой панели указания особого диапазона страниц.", programTitul); return null; }
            if (((p3s < p4s) && (p3f > p4s)) || ((p4s < p3s) && (p4f > p3s)))  { alert("Перекрытие номеров страниц в третьей и четвёртой панели указания особого диапазона страниц.", programTitul); return null; }
            }  // 4 окно, сравнение      
        }  // 3 окно
    } // usePanel3
///>> 2.
///
var sdvig;
if (myNumber.text != "?") sdvig = Number(myNumber.text); else sdvig = 0;
/// >> 3. Сохранение информации об исключаемых номерах страниц
if (panel1isUsed == true && psSkip1.value == true) { for (var p = Number(pS1s.text) + Number(sdvig); p <= Number(pS1f.text) + Number(sdvig); p++) infoAboutPages[p] = "-";  }  // =1=
if (panel2isUsed == true && psSkip2.value == true) { for (var p = Number(pS2s.text) + Number(sdvig); p <= Number(pS2f.text) + Number(sdvig); p++) infoAboutPages[p] = "-";  }  // =2=
if (panel3isUsed == true && psSkip3.value == true) { for (var p = Number(pS3s.text) + Number(sdvig); p <= Number(pS3f.text) + Number(sdvig); p++) infoAboutPages[p] = "-";  }  // =3=
if (panel4isUsed == true && psSkip4.value == true) { for (var p = Number(pS4s.text) + Number(sdvig); p <= Number(pS4f.text) + Number(sdvig); p++) infoAboutPages[p] = "-";  }  // =4=
///>> 3.
///
///>> 4. Сохранение id символьных стилей, выбранных для оформления номеров.
var indx;
if (panel1isUsed == true && psSpec1.value == true) { for (var p = Number(pS1s.text) + Number(sdvig); p <= Number(pS1f.text) + Number(sdvig); p++) { indx = selChSt1.selection.index; infoAboutPages[p] = charStylesID[indx]; } }  // =1=
if (panel2isUsed == true && psSpec2.value == true) { for (var p = Number(pS2s.text) + Number(sdvig); p <= Number(pS2f.text) + Number(sdvig); p++) { indx = selChSt2.selection.index; infoAboutPages[p] = charStylesID[indx]; } }  // =2=
if (panel3isUsed == true && psSpec3.value == true) { for (var p = Number(pS3s.text) + Number(sdvig); p <= Number(pS3f.text) + Number(sdvig); p++) { indx = selChSt3.selection.index; infoAboutPages[p] = charStylesID[indx]; } }  // =3=
if (panel4isUsed == true && psSpec4.value == true) { for (var p = Number(pS4s.text) + Number(sdvig); p <= Number(pS4f.text) + Number(sdvig); p++) { indx = selChSt4.selection.index; infoAboutPages[p] = charStylesID[indx]; } }  // =4=
///>> 4.
return 0;
} // activePageDiapTest
/////
function set_array() { // set_array
if (noInfoAboutPages) { // noInfoAboutPages 
    // наполнение объекта infoAboutPages начальной информацией о страницах. Выполняется один раз.
    for (var p = 0; p <= pageLimit; p++) { infoAboutPages[p] = "+"; }
    noInfoAboutPages = false;
    } // noInfoAboutPages
} // set_array
////
function testTextField (text1, text2) { // testTextField
if (text1.length == 0 && text2.length == 0) return true;
var valid1 = /^[\d]+$/.test(text1) && (!isNaN(text1)) && (!(Number(text1) <= 0) && !(Number(text1) >pageLimit)); 
var valid2 = /^[\d]+$/.test(text2) && (!isNaN(text2)) && (!(Number(text2) <= 0) && !(Number(text2) > pageLimit));  
if (valid1 == false || valid2 == false) return false;
if (Number(text1) > Number(text2)) return false; else return true;
} // testTextField  
///
function getNumberWithStyleID (number) { // getNumberWithStyleID
var numPlusID, item;   
if ((activePageDiap.value == false) || (psSpec1.value == false && psSpec2.value == false && psSpec3.value == false && psSpec4.value == false)) return number;
item = infoAboutPages[Number(number)];
if (item == "+") return number;
numPlusID = idStartMarker + idEndMarker + Number(number) + idStartMarker + item + idEndMarker; // item тут -- это id символьного стиля для оформления номера. 
// После завершения основной обработки (прогрессбар исчезнет) будет поиск маркеров idStartMarker и idEndMarker, извлечение id символьного стиля, оформление этим стилем номера, и в конце удаление всех этих маркеров.
return numPlusID;
}
///
win.onClose = function() { // win.onClose
app.activate();
} // win.onClose
win.show();
///////////////////////

