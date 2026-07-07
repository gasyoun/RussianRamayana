//  ProcStory&Doc.jsx

#targetengine "StoryAndDoc"
#include "../ForIndex.jsxinc"

// в логику разметки добавлен цвет с предустановленным именем 'SkipTheWord'.
// Сам цвет может быть любым важно имя. Текст, окрашенный этим цветом, не обрабатывается.
// Слова, окрашенные цветом 'IndexColor', тоже не обрабатываются, но тут окрашивание обработанного текста цветом 'IndexColor' --
// это защита отдельных слов ранее обработанного многословного термина от повторной обработки.
// Также не индексируются термины, окрашенные IndexStylesColor. Они обрабатываются только указанием конкретного символьного стиля.( ПРО IndexStylesColor -- ЭТО СПОРНАЯ ИДЕЯ! ) 
// А 'SkipTheWord' сразу запрещает индексировать слова. Это сделано для того, чтобы уже на этапе подготовки текста исключить из обработки слова,
// встречающиеся в других обрабатываемых терминах.

// 20.01.2023 - обработанные строки таблицы окрашиваются цветом '#ProcessedLines'. Это не имеет никакой связи с используемыми цветами, названия которых начинаются с IndexColor.

// Цвета надо готовить в момент загрузки таблицы. В функции getDataAction() готовить инфрмацию о требуемых цветах. При возврате в файл вёрстки на основе этой информации добавлять цвета, если их еще нет.

/*
И рабочего окна убрана информация о лог-файле.
Теперь он создаётся только, если встречается ситуация, что не удалось поместить маркер указателя рядом с термином.
Об этом будет информация в сообщении от окончании обработки.
Кроме того, размер окна прогресс-бара увеличен, и внизу будет выводиться сообщение о преблеме размещения маркера указателя.
*/

/*
20.01.2023    
вместо разделителей именованные поля    
.termin  .page   .grep  .id  .color  .length
*/


// © Михаил Иванюшин. 2020-2023  |  dotextok@gmail.com  |  dotextok.ru

var infoAboutScript = "Версия: 22.01.2023";

app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll; // см. http://adobeindesign.ru/2008/10/24/restore-ui/

var programTitul = "Подготовка указателя";
if (app.documents.length == 0) {
    alert("Не открыт документ для обработки.", programTitul);
    exit();
    }
if (app.documents.length != 1) {
   alert("Перед запуском скрипта должен быть открыт только обрабатываемый документ.", programTitul);  
    exit();
    }
var doc = app.activeDocument;
var docID = doc.id;
var pRef;
var linkError = 0;
var thePage;
var pageOffset;
var nSec;
var parseIntAppVersion = parseInt (app.version);
var csID = [];
while (csID.length > 0) csID.shift();
var charStyles = getCharacterStyleNames();
var pList;
var cList;
var letAr = [];
var taskIsDone = false;
///
var actionButtonName = "Обработать выбранный текст в соответствии с заданием";
var myWin = myScriptWindow();
myWin.show();
////////////////////////////////////////////////////////
function myScriptWindow() { // myScriptWindow   
var listboxSize = [0,0,350,250];  // 0,0,400,300
var buttonSize = [0, 0, 300, 28]; // 0, 0, 400, 28
//var buttonSizeMiddle = [0, 0, 300, 28];
var buttonSizeMiddle = [0, 0, 330, 28];
var buttonSizeShort = [0, 0, 190, 28];
var buttonSizeLittle = [0,0,28,28];
var tabPrefSize = [350, 250]; // 350, 250
var dataLines = [];
var delIsEnabled;
var procCount = 0;
var ProcStoryOrDocWinName = "ProcStoryOrDocWin.ini";
var win = new Window ("palette", programTitul);
var winLocation = [-1, -1];
var myScriptFile = myGetScriptPath();
var myDefSetNameW  =  ProcStoryOrDocWinName; // это файл с информацией, где окно на экране
var myScriptFolder = decodeURI(myScriptFile.path);
var myFilePathW = decodeURI(myScriptFolder + "/sets/" + myDefSetNameW); 
var myDataFileW = new File (myFilePathW);
if (myDataFileW.exists) { //File.exists
    myDataFileW.open("r");
    winLocation[0] = myDataFileW.readln();
    winLocation[1] = myDataFileW.readln();
    myDataFileW.close();
    } //File.exists
if (winLocation[0] != -1) win.location = winLocation;
win.alignChildren = ["fill", "fill"];
var indxList = win.add ("group");
indxList.orientation = "column";
indxList.alignChildren = ["fill", "top"];
var startClearIndex = indxList.add("checkbox", undefined, "Удалить все имеющиеся записи в индексе"); 
startClearIndex.value = false;
separator_1 = indxList.add ("panel");
separator_1.minimumSize.height = separator_1.maximumSize.height = 1;
///
indxList.add("statictext", undefined, "Пространство поиска");
var findArea = indxList.add("group");
findArea.orientation = "row";
findArea.alignChildren = ["left", "fill"];
var inStory = findArea.add("radiobutton", undefined, "Материал");
inStory.value = true;
var inDoc = findArea.add("radiobutton", undefined, "Файл");
inDoc.enabled = true;
//~ var inBook = findArea.add("radiobutton", undefined, "Книга");
//~ inBook.enabled = false;
//~ inBook.helpTip = "Сбор индексного указателя книги пока не сделан.";
var lockedItems1 = indxList.add("group");
lockedItems1.alignChildren = "left";
lockedItems1.orientation = "row";
var footnotes = lockedItems1.add("checkbox", undefined, "Сноски");
footnotes.value = true;
lockedItems1.add("statictext", undefined, "\u00A0\u00A0");
var lockedStrs = lockedItems1.add("checkbox", undefined, "Заблокированные тексты");
var lockedItems2 = indxList.add("group");
lockedItems2.alignChildren = "left";
lockedItems2.orientation = "row";
var lockedLrs = lockedItems2.add("checkbox", undefined, "Заблокированные слои");
lockedItems2.add("statictext", undefined, "\u00A0\u00A0");
var hiddenLrs = lockedItems2.add("checkbox", undefined, "Скрытые слои");
separator_3 = indxList.add ("panel");
separator_3.minimumSize.height = separator_3.maximumSize.height = 1;
indxList.add("statictext", undefined, "Выбор строк для обработки"); 
var mainButtons = indxList.add("group");
//mainButtons.alignChildren = "fill";
mainButtons.alignChildren = ["center", "fill"]; ////
mainButtons.orientation = "row";
var keep = mainButtons.add("button", buttonSizeLittle, "…");
keep.helpTip = "Свернуть окно";
var stLoad = mainButtons.add("button", buttonSizeMiddle, "Загрузить таблицу");  
var info = mainButtons.add("button", buttonSizeLittle, "?");
info.helpTip = "О программе";
var buttonAndChkBx = indxList.add("group");
buttonAndChkBx.orientation = "row";
buttonAndChkBx.alignChildren = ["center", "bottom"];

var scriptLoad = buttonAndChkBx.add("checkbox");
scriptLoad.helpTip = "Запуск скрипта уточнения grep-запросов 'GetInfoForSearch.jsx'.\rРаботает только когда открыт файл с таблицей.";
scriptLoad.value = false;
var stGetData = buttonAndChkBx.add("button", buttonSizeMiddle, "Подготовить задание на работу с текстом"); // buttonSizeMiddle
var colorLinesOK = buttonAndChkBx.add("checkbox");
colorLinesOK.helpTip = "Окрашивание в таблице успешно обработанных запросов.";
colorLinesOK.value = false;
separator3 = indxList.add ("panel");
separator3.minimumSize.height = separator3.maximumSize.height = 1;
indxList.add("statictext", undefined, "Выполняемые действия");  // Подготовка индексного указателя
//////////////
var addText1 = "Добавить к имеющимся записям индекса новые";
var addText2 = "Очистить индекс и добавить в него выделенные записи";
var addRB = indxList.add("radiobutton", undefined, addText1);
var delGroup = indxList.add("group");
delGroup.orientation = "row";
delGroup.aligmment = "left";
var delRB = delGroup.add("radiobutton", undefined, "Удалить из индекса выбранную запись");
addRB.value = true;
///
addRB.onClick = function() { // addRB.onClick
delRB.value = false;
app.activate();
}  // addRB.onClick
///
delRB.onClick = function() { // delRB.onClick
addRB.value = false;
app.activate();
} //  // delRB.onClick
///
var theAction = indxList.add("button", undefined, actionButtonName);
theAction.enabled = false;
///
/////////////////////////
colorLinesOK.onClick = function() { // colorLinesOK.onClick
colorLinesOK.value = false;
var splitLength = app.activeDocument.name.split("IndexList");
if (splitLength.length == 1) {    
    alert("Эта кнопка работает, когда открыто окно с файлом 'IndexList-nnn.indd'.", programTitul);
    return;    
    } 
var curSel = app.selection[0];
if (curSel.constructor.name == "Table") {
    alert("Выделите третью колонку, если хотите отметить цветом все grep-запросы таблицы. Если надо отметить несколько строк таблицы, но не всю таблицу, то выделите эти строки.", programTitul);
    return;    
    }
if (curSel.parent.constructor.name == "Table") { // == "Table"
    var procLineColor = "#ProcessedLines"; // 20.012023
    if (!app.activeDocument.colors.item(procLineColor).isValid) { // ! (procLineColor).isValid
        try { 
            app.activeDocument.colors.add ({name: procLineColor, model:ColorModel.SPOT, space:ColorSpace.RGB, colorValue:[255, 0, 0]}) 
            } 
        catch (e) { } ; //  try / catch - цвета может уже быть в файле
        } // ! (procLineColor).isValid
    var selRows = curSel.rows.length;
    for (i = 0; i < selRows; i++) { // i++
        curSel.rows[i].cells[2].texts[0].fillColor = app.activeDocument.colors.item(procLineColor);
        } // i++
    } // == "Table"
} // colorLinesOK.onClick
/////////////////////////
scriptLoad.onClick = function() { // scriptLoad.onClick
scriptLoad.value = false;
var splitLength = app.activeDocument.name.split("IndexList");
if (splitLength.length == 1) {    
    alert("Эта кнопка работает, когда открыто окно с файлом 'IndexList-NNN.indd'.", programTitul);
    return;    
    } 
var myScriptFile = myGetScriptPath();
var myScriptFolder = decodeURI(myScriptFile.path);  
var scriptForRun = File(decodeURI(myScriptFolder + '/GetInfoForSearch.jsx')); // GetInfoForSearch
if (!scriptForRun.exists) { 
    alert("Не найден скрипт 'GetInfoForSearch.jsx'.",programTitul);
    return; 
    }
app.doScript (scriptForRun);
}  // scriptLoad.onClick
////////////
stLoad.onClick = function() { // stLoad.onClick
if (app.documents.length != 1) {
    alert("Таблица загружается, когда открыт только один документ — обрабатываемый файл.", programTitul);
    return;
    } 
var noName = false;
try { var myDocPath = app.documents[0].filePath; } // если документ не сохранён, маршрут не сообщается
catch(e) {
   alert("Это только что созданный и ещё ни разу не сохранённый файл.\nДайте ему имя.",programTitul);   
   noName = true;
    }
if (noName) { // noName
    try { app.documents[0].save(); }
    catch (e) { 
        alert("Файл не был сохранён.",programTitul);         
        return; 
        } // файл не был сохранён с новым именем
    } // noName   
var newFile = File(myDocPath).openDlg('Выберите новый файл:', searchMaskN);  // IndexList.indd -- так называется файл с информацией об индексе. Снчала это текстовый файл. Потом скрипт сделает из него таблицу.
if (newFile == null) { return; }
app.open(newFile);
 } //stLoad.onClick
/////////////////////////////////////
stGetData.onClick = function () { // stGetData.onClick   
$.level = 0;
if (app.documents.length != 2) {
    alert("Должно быть открыто два файла, обрабатываемый и таблица.", programTitul);
    return;
    } 
//theAction.enabled = false;
var splitLength = app.activeDocument.name.split("IndexList"); // 28.05.2022
if (splitLength.length == 1) {    
    alert("Предполагается, что эта кнопка нажимается, когда открыто окно с файлом 'IndexList-nnn.indd'.", programTitul);
    return;    
    }
var gDA = getDataAction();
if (gDA == 0) return; // просто возврат, сообщение на экран уже выведено
app.activeDocument = app.documents[1]; // после определения, что надо сделать, переключаемся на экран с обрабатываемым файлом
// тут надо создать нужные цвета. О них информация в letAr
if (letAr.length == 0) return;
var _item, _name, _r, _b, _g;
var _nAr = [];
for (f = 0; f < letAr.length; f++) { // f++
    _item = letAr[f];
    while (_nAr.length > 0) _nAr.pop();
    _nAr = _item.split("|");
    if (app.activeDocument.colors.item(_nAr[0]).isValid == true) continue;
    app.activeDocument.colors.add ({name: _nAr[0], model:ColorModel.SPOT, space:ColorSpace.RGB, colorValue:[Number(_nAr[1]), Number(_nAr[2]), Number(_nAr[3])]});
    } // f++
} //  stGetData.onClick 
///////////////////////////////////////////////
function getDataAction() { // getDataAction
//theAction.enabled = false;
var mySel = app.selection[0];
if ((mySel == null) || (mySel.hasOwnProperty("cells") == false)) {
    alert("Выделите нужные ячейки таблицы.", programTitul);
    return 0;
    }
var _table;
if (mySel.parent.constructor.name == "Table") _table = mySel.parent; else _table = mySel;
if (_table.columns.length !=5) {
    alert("Предполагается, что в таблице пять колонок.", programTitul);
    return 0;    
    }
var level1Text = "";
var level2Text = "";
var level3Text = "";
var level4Text = "";
var startRow = mySel.rows[0].index; // это индекс первой выделенной строки в таблице. Если выделили три строки, при этом первая строка выделения -- пятая от начала таблицы, то её индекс будет 4. Индекс последней строки будет 6.
if (startRow == 0 && mySel.rows[0].cells[0].texts[0].appliedParagraphStyle.name != indStyle1) {
    alert("Таблица индексов должна начинаться с первого уровня.", programTitul);
    return 0;    
    }
var endRow = mySel.rows[0].index + mySel.rows.length - 1; // -1 потому что это индекс. Индекс последней выделенной строки в таблице. 
var nmr = _table.rows[startRow].cells[0].texts[0].appliedParagraphStyle.name[indStyle1.length-1]; // nmr - это номер в конце имени абз. стиля #Level1,  #Level2,  #Level3, или #Level4
var d = startRow;
if (nmr != "1") { // nmr != 1
    var delta =startRow-1;
    nmrNotFound = true;
    for (d = delta; d >=0; d--) { // d--
        if (_table.rows[d].cells[0].texts[0].appliedParagraphStyle.name[indStyle1.length-1] != "1") continue;
        nmrNotFound = false;
        break;
        }  // d--
    if (nmrNotFound) {
        alert("Не найдена индексная запись первого уровня.", programTitul);
        return 0;           
        }
    } // nmr != 1
var splitLength = app.activeDocument.name.split("IndexList");
colorIndex = splitLength[1].split(".indd")[0];
if (colorIndex[0] == "-") colorIndex = colorIndex.substring(1, colorIndex.length); // чтобы в usedColor = "IndexColor" + "-" + colorIndex;   дефис был только один
var firstCells = mySel.rows.everyItem().cells[0].contents;
var letters = {};
var letter;
while (letAr.length > 0) letAr.pop();
for (var ii = 0; ii < firstCells.length; ii++) { // ii++
    if (firstCells[ii][1] != "-") { break; }  // дефиса нет, значит, этотIndexList скриптом AddMarker не обрабатывался.
    letter = firstCells[ii][0];
    if (letters[letter] != undefined) continue;
    letAr.push(letter);
    letters[letter] = letter;
    } // ii++
var bukva;
var usedColorNames = {};
var oneColor;
var new_Color_Name;
if (letAr.length == 0)  {
    letAr.push("IndexColor" + "-" + colorIndex + "|255|0|0"); // это единственный цвет, если работа с обычным IndexList
    oneColor = "IndexColor" + "-" + colorIndex;
    }
else { // else
    for (b = 0; b < letAr.length; b++) { // b++
        bukva = letAr[b];
        var not_Found = true;
        for (n = 0; n < colorsRGB.length; n++) { // n++
            if (colorsRGB[n].letter != bukva) continue;
            new_Color_Name = "IndexColor" + "-" + bukva + "-" + colorIndex;
            not_Found = false;
            break;
            } // n++
        if (not_Found) {
            alert("Буква " + bukva + " не найдена в массиве colorsRGB.", programTitul); // сообщение этапа отладки
            return;
            }
        usedColorNames[bukva] = new_Color_Name;
        letAr[b] = new_Color_Name + "|" + colorsRGB[n].r + "|" + colorsRGB[n].g + "|" + colorsRGB[n].b;
        }  // b++
    } // else
// к этому моменту в letAr информация обо всех цветах, которые нужны.
while (dataLines.length > 0) dataLines.shift();
/*
 dataLines:  .termin   .page   .grep  .id  .color  .length
Разделители только в termin для определения уровня
*/
// Важно, что в этой записи не может быть такого, что .termin начнётся не с первого уровня. Lv1 --- с этого начинаются все записи.
pBar = new ProgressBar("Обработка строк таблицы — подготовка задания"); 
pBar.reset("", Number(endRow)-Number(d));
for (i = d, ii = 0; i <= endRow; i++, ii++, pBar.hit()) { // i++
    var nmr = _table.rows[i].cells[0].texts[0].appliedParagraphStyle.name[indStyle1.length-1];
    var textLength; // чтобы упорядочить термины по убыванию длины
    if (_table.rows[i].cells[4].texts[0].characters.length != 0) textLength = _table.rows[i].cells[4].texts[0].characters.length; else textLength = _table.rows[i].cells[0].texts[0].characters.length; 
    var lineToData = {termin:"", page:"", grep:"", id:-1, length:0};
    if (nmr == "1") { // == 1
        level1Text = _table.rows[i].cells[0].texts[0].contents;
        level2Text = "";
        level3Text = "";
        level4Text = "";      
        lineToData.termin = level1Text;
        } // == 1
     else if (nmr == "2") { // == 2
        level2Text = _table.rows[i].cells[0].texts[0].contents;      
        lineToData.termin = level1Text + "||" + level2Text;
        } // == 2   
     else if (nmr == "3") { // == 3
        level3Text = _table.rows[i].cells[0].texts[0].contents;      
        lineToData.termin = level1Text + "||" + level2Text + "||" + level3Text;
        } // == 3       
     else { // == 4
        level4Text = _table.rows[i].cells[0].texts[0].contents;      
        lineToData.termin = level1Text + "||" + level2Text + "||" + level3Text + "||" + level4Text;
        } // == 4
    if (_table.rows[i].cells[1].texts[0].contents == "") { // без номера
        lineToData.page = "?";
        lineToData.grep = "Z";
        } // без номера
    else { // #@@
        lineToData.page = "№";      
        if ((_table.rows[i].cells[2].texts[0].length == 0) || (_table.rows[i].cells[2].texts[0].characters[0].fillColor.name != "Black")) lineToData.grep = "Z";
        // _table.rows[i].cells[2].texts[0].length == 0  нет grep-запроса обработки термина
        // characters[0].fiilColorName != "Black" - если цвет текста в третьей колонке отличен от чёрного (значит, эта строка уже была обработана этим скриптом ProcStoryOrDoc.jsx -- информация из неё помещена в указатель), она не обрабатывается. "Z" - такой вариант комментария, вместо // в начале строки
        else { // else1
            lineToData.grep = caseSens + _table.rows[i].cells[2].texts[0].contents;             
            if (_table.rows[i].cells[3].texts[0].length == 0) lineToData.id = "-1";
            else {  // else2
                if (doc.characterStyleGroups.item(groupForIndexStyles).isValid == false) {
                    pBar.close();
                    var scriptsNorRunned = "\rПохоже, ещё не запускались скрипты AppleSpecialStyles.jsx и MarkSameQueries.jsx.";
                    alert("Нет группы символьных стилей '" + groupForIndexStyles + "'." + scriptsNorRunned);   
                    win.close();
                    app.activate();
                    exit();
                    }
                var addedCharStyle = _table.rows[i].cells[3].texts[0].contents;
                if (doc.characterStyleGroups.item(groupForIndexStyles).characterStyles.item(addedCharStyle).isValid == false) {
                    pBar.close();
                    alert("В группе символьных стилей '" + groupForIndexStyles + "' нет стиля '" + addedCharStyle + "'." + scriptsNorRunned); // сообщение этапа отладки
                    win.close();
                    app.activate();
                    exit();                      
                    }
                lineToData.id = doc.characterStyleGroups.item(groupForIndexStyles).characterStyles.item(addedCharStyle).id; // сохранён идентификатор символьного стиля обработки данного термина
                } // else2
            } // else1
        } // #@@
    lineToData.length = textLength;
    if (lineToData.termin[1] != "-") lineToData.color = oneColor; else lineToData.color = usedColorNames[lineToData.termin[0]];
    dataLines[ii] = lineToData;
    } // i++
pBar.close();
//~ число выбранных строк = endRow - startRow + 1
//~ число лишних строк = размер массива - число выбранных строк
//
// (Размер массива будет больше числа выбранных строк, если термин первой выбранной строки оформлен абзацным стилем не первого уровня.
// Строка lineToData должна начинаться с термина, оформленного абзацным стилем первого уровня, поэтому сейчас искусственно уменьшаем индекс выбранной строки, 
// чтобы выделение начиналось с термина, оформленного абзацным стилем первого уровня.
// В предыдущем for-цикле переменная d --- это поправленный индекс первой строки. Но переменные endRow и startRow не менялись,
// и за счёт этого можно узнать, какие строки в массве dataLines не относятся к делу, и удалить их.)
//
// при помощи shift() надо убрать лишние строки
var _counter = dataLines.length - (endRow - startRow + 1);
if (_counter > 0) for (cc = 0; cc < _counter; cc++) { dataLines.shift(); }
taskIsDone = false;
if (startRow == _table.rows-1) {
    delIsEnabled = true;
    theAction.enabled = true; 
    return _table.columns.length;
    }
var nmrSel = Number(_table.rows[startRow].cells[0].texts[0].appliedParagraphStyle.name[indStyle1.length-1]);
try { var nmrNext = Number(_table.rows[startRow+1].cells[0].texts[0].appliedParagraphStyle.name[indStyle1.length-1]); } catch (e) { delIsEnabled = true;  theAction.enabled = true; return 1; } ; // это случай, когда выделена последняя строка таблицы
if (nmrNext > nmrSel) delIsEnabled = false; else delIsEnabled = true; // delIsEnabled - указатель, можно ли удалять выделенный термин из структуры указателя
theAction.enabled = true;
return _table.columns.length;
} // getDataAction
/////////////////////
theAction.onClick = function () { // theAction.onClick
if (taskIsDone) {
alert("Повторите операцию подготовки задания обработки текста.", programTitul);
return;
}
linkError = 0;    
if (app.documents.length != 2) {
   alert("На момент запуска обработки текста должно быть открыто два файла.", programTitul);  
   return;
    }
var split0 = app.documents[0].name.split("IndexList").length; // 28.05.2022
var split1 = app.documents[1].name.split("IndexList").length;
if (split0 == 1 && split1 == 1) {
   alert("Одним из открытых документов должен быть файл 'IndexList-nnn.indd'.", programTitul);  
   return;    
    }
if (addRB.value == false && delRB.value == false) {
    alert("Выберите радиокнопку выполняемого действия.", programTitul);
    return;     
    }
if (delRB.value) { // delRB.value
    if (taskIsDone) {
    alert("Повторите операцию подготовки задания обработки текста.", programTitul);
    addRB.text = addText2;
    return;             
        }
    if (dataLines.length > 1) {
        alert("За один раз можно удалить только одну запись.", programTitul);   
        theAction.enabled = false;    
        addRB.text = addText2;
        return;        
        }
    if (delIsEnabled == false) {
        alert("Выбранную строку удалять нельзя, т.к. ниже неё есть записи следующего уровня.", programTitul); 
        theAction.enabled = false;
        addRB.text = addText2;
        return;        
        }
    }  // delRB.value
if (app.activeDocument.id != docID) app.activeDocument = app.documents[1];
if (app.activeDocument.indexes.length == 0) { // indexes.length == 0
    var docIndex = app.activeDocument.indexes.add(); // новый индекс
    } // indexes.length == 0
else {
    var docIndex = app.activeDocument.indexes[0]; // текущий индекс
    docIndex.update(); // аналог выбора команды "Обновить экранную версию" в панели "Указатель"
    }
if (dataLines.length == 0) {
    alert("Ещё не подготовлено задание на работу с текстом.", programTitul);
    theAction.enabled = false;
    return;     
    }
//////////////////
function infoAboutRepeatedTask() { // infoAboutRepeatedTask
var ewn = new Window ("dialog", "Повтор задания", undefined, {closeButton: true});
ewn.alignChildren = ["fill", "fill"];   
ewn.add("statictext", undefined, "Не было подготовлено новое задание для работы с текстом");
ewn_yes = ewn.add("button", undefined, "Продолжить с этим заданием");
ewn_no = ewn.add("button", undefined, "Не продолжать, задание будет другое");
ewn_yes.onClick = function() {
    taskIsDone = false;
    ewn.close();
    return;
    }
ewn_no.onClick = function() { 
    ewn.close(); 
    return;
    }
ewn.show();
} // infoAboutRepeatedTask
///////////////////////
var mySel;
if (inStory.value == true) { // inStory.value
    mySel = app.selection[0];
    if (mySel == null  || mySel.constructor.name == "TextFrame" || mySel.hasOwnProperty("texts") == false) {
        alert("Выделите текст. Для обработки всего материала поставьте в него курсор.", programTitul);
        return;
        }
    var story = mySel.parentStory;
    if (mySel.constructor.name == "InsertionPoint") {
        story.texts[0].characters.itemByRange(0, story.texts[0].length-1).select();
        }
    mySel = app.selection[0];
    } // inStory.value
if (inDoc.value == true) { // inDoc.value 
    app.documents[0].select(NothingEnum.nothing); // снимем выделение
    } // inDoc.value 
var dataLinesLength = dataLines.length;
var levelsArray = [];
// Каждая запись об обработке состоит из частей
// .termin -- это записи уровня индекса
// .page -- информация, нужны ли номера страниц. Если № то нужны, если ? то нет
// .grep -- grep-запрос поиска, если Z - значит, запроса нет
// .id -- это id символьного стиля, которым оформлен термин. Если этой информации нет, то -1
// .length - длина текста, который ищется. Это содержимое правой ячейки.

if (startClearIndex.value) {
    docIndex.topics.everyItem().remove();
    addRB.text = addText1;
    startClearIndex.value = false;
    } 
app.findGrepPreferences = null; app.changeGrepPreferences = null; 
app.findChangeGrepOptions.includeFootnotes = footnotes.value;
app.findChangeGrepOptions.includeHiddenLayers = hiddenLrs.value;
app.findChangeGrepOptions.includeLockedLayersForFind = lockedLrs.value;
app.findChangeGrepOptions.includeLockedStoriesForFind = lockedStrs.value;

var myDateS = new Date;
var myHourS = myDateS.getHours();
if (myHourS <10) myHourS = "0" + myHourS;
var myMinuteS = myDateS.getMinutes();
if (myMinuteS <10) myMinuteS = "0" + myMinuteS;
var spInfo = "";
if (inStory.value) spInfo = " [ Материал ]"; else spInfo = " [ Файл ]"; 
pBar = new ProgressBar(programTitul + spInfo + " • [ " + myHourS + ":" + myMinuteS + " ]"); 
var notFound = true; // будет false при первом найденном термине
var theItemNotFound = false; // будет true, если встретился термин, рядом с которым не удалось поместить маркер указтеля. Об этой ситуации будет сообщение в лог-файле
procCount = 0;
var pagesOff = false;
if (app.panels.item("$ID/Pages").visible == true) {
    pagesOff = true;
    app.panels.item("$ID/Pages").visible = false;
    }
var logArray = [];
while (logArray.length > 0) logArray.shift();

dataLines.sort (function (a,b) { // в результате этой сортировки строки будут упорядочены по убыванию длины обазцов искомого текста
    an = addZero (a.length);
    bn = addZero(b.length);   
    return an < bn; }
    );
////
function addZero (nn) { // addZero
var n = Number(nn);    
var for1digt = "00000000";
var for2digt = "0000000";
var for3digt = "000000";
var for4digt = "00000";
var for5digt = "0000";
var for6digt = "000";
var for7digt = "00";
var for8digt = "0";

if (n <10) return (for1digt + String(n));
if (n >9 && n <100) return (for2digt + String(n));
if (n >99 && n <1000) return (for3digt + String(n));
if (n >999 && n <10000) return (for4digt + String(n));
if (n >9999 && n <100000) return (for5digt + String(n));
if (n >99999 && n <1000000) return (for6digt + String(n));
if (n >999999 && n <10000000) return (for7digt + String(n));
if (n >9999999 && n <100000000) return (for8digt + String(n));
return n; // очень большое число :))
} // addZero
///
/*
=>+~~>>
25.09.2022 
массив отсортирован в порядке убывания длины образцов искомого текста (содержимое крайних правых ячеек).
Надо дополнительно убрать вниз массива те строки, в которых не определен символьный стиль обработки, с сохранением иерархии по длине строк.
Это исключит случаи, что в обработку без указания символьного стиля попадет текст, который оформлен символьным стилем.
Вот пример, когда такая ошибка может появиться: в эпосе Рамаяна есть два персонажа с именем Джанака, один встречается больше 80 раз в тексте, а второй только два раза.
Очевидно, что проще отметить символьным стилем второго, а первого искать просто по grep-запросу, не указывая символьный стиль.
И если сперва будет поиск без уточнения символьного стиля, он найдёт всех Джанак, окрасит результаты поиска, и второй уже найден не будет.
А если сперва обработать случаи, когда есть символьный стиль, то такой ошибки не будет.
Это очень редкая ошибка, и надо учесть возможность её появления.
*/
var tmpString = "";
var rIndx = [];
while (rIndx.length > 0) rIndx.pop();
for (var d = 0; d < dataLinesLength; d++) { // d++
    if (dataLines[d].id != -1) continue;    
    tmpString = dataLines[d];
    rIndx.push(d);
    dataLines.push(tmpString);
    } // d++
var rIndxLength = rIndx.length;
for (var s = 0; s < rIndxLength; s++) { dataLines.splice(rIndx.pop(),1); }
// =>+~~>>
/*
app.activeDocument.save(); // это сохранение будет активно, если файл еще не сохранялся, или это файл предыдущей версии
pBar.info("Пересохранение рабочего файла, чтобы избавиться от информации о сделанных ранее действиях");
app.activeDocument.save(File(decodeURI(app.activeDocument.fullName))); 
*/
//var ht = [RUSSIAN, BASIC_LATIN]; 
var ht = [1213485685, 1213481548];
var htAr = {};
for (h = 0; h < ht.length; h++) { htAr[ht[h]] = ht[h]; }
var dhT;
for (d = 0; d < app.activeDocument.indexingSortOptions.length; d++) {
    dhT = (app.activeDocument.indexingSortOptions[d].headerType).valueOf();
    if (htAr[dhT] == undefined) continue;
    app.activeDocument.indexingSortOptions[d].include = true;
    }

pBar.reset("Cобираем индекс..." , dataLinesLength);
var nz;
for (var i = 0; i < dataLinesLength; i++,  nz++, pBar.hit()) { // i++
    nz = i; nz++;
    // $.writeln(i + " dataLines[i].termin = " + dataLines[i].termin + " | nz = " + nz); 
    while (levelsArray.length > 0) levelsArray.shift();
    levelsArray = dataLines[i].termin.split("||"); // dataLines[i].termin - информация об уровнях вложения
 //  for (var jj = 0; jj < levelsArray.length; jj++) { if (levelsArray[jj].length == 0) levelsArray[jj] = "—"; }
    //// $.writeln("docIndex .isValid= " + docIndex .isValid);
    // $.writeln(" levelsArray.length = " +  levelsArray.length); 
  //  for (var jj = 0; jj < levelsArray.length; jj++) { $.writeln(jj + "> levelsArray[j]= " + levelsArray[jj]); }
    var myTopic;
    var prevTopic;
    var tP;
    var erMs = "Ошибка обработки строк таблицы. Возможно, использован абзацный стиль, отличный от предопределённых, которые находятся в группе '#IndexStyles'.";
    for (var j = 0; j < levelsArray.length; j++) { // j++
      //  $.writeln(j + " |  myTopic = " + docIndex.topics.itemByName(levelsArray[j])); 
//~       if (levelsArray[j] == "—") {
//~           var noLevel = true;
//~           for (var jj = j; jj < levelsArray.length; jj++) if (levelsArray[jj] == "—") continue;
//~           noLevel = false;
//~           break;
//~           }
//~        if (noLevel) continue;
    //   try{  $.writeln(j + " |  myTopic = " + docIndex.topics.itemByName(levelsArray[j]).name); } catch (e) { }        
        if (docIndex.topics.itemByName(levelsArray[j]).isValid) { // .isValid
            try {
                myTopic = docIndex.topics.itemByName(levelsArray[j]);
                }
            catch (e) {
                pBar.close();
                alert(erMs + " [1]", programTitul);
                return;
                }
            } // .isValid
        else  {
            try{
       // $.writeln(j + " ||  myTopic = " + docIndex.topics.add(levelsArray[j]));
     //  try{   $.writeln(j + " ||  myTopic = " + docIndex.topics.add(levelsArray[j]).name);  } catch (e) { }         
                myTopic = docIndex.topics.add(levelsArray[j]);
                }
             catch (e) {
                pBar.close();
                alert(erMs + " [2]", programTitul);
                return;
                }                 
            }
            if (j > 0) { // j > 0
                if (prevTopic.topics.itemByName(levelsArray[j]).isValid) {
     //   $.writeln(j + " |||  myTopic = " + prevTopic.topics.itemByName(levelsArray[j])); 
      //  try{   $.writeln(j + " |||  myTopic = " + prevTopic.topics.itemByName(levelsArray[j]).name);  } catch (e) { }          
                    myTopic = prevTopic.topics.itemByName(levelsArray[j]);                   
                    }
                else {
      //  $.writeln(j + " =  myTopic = " + prevTopic.topics.add(levelsArray[j]));  
      //  try{   $.writeln(j + " =  myTopic = " + prevTopic.topics.add(levelsArray[j]).name);  } catch (e) { }         
                    myTopic =prevTopic.topics.add(levelsArray[j]);                
                    }
                } // j > 0   
            try {
                var tN = myTopic.name;
                }
            catch (e) {
                    alert("Неизвестная ошибка в данных, попробуйте подготовить IndexList ещё раз.");
                    pBar.close();
                    exit();
                    }            
// на данный момент в myTopic информация о названии текущей рубрики и её родителе. У родителя тоже может быть предок. Это всё -- из свойств topic.         
            pBar.info("Число строк задания " + dataLinesLength + ", выполняется "+ nz + " : " + myTopic.name);             
            if ((j == levelsArray.length-1) && dataLines[i].page != "?" && (dataLines[i].grep != "Z")) { // != "Z"  ||   последний цикл по уровням...                
                    //  ... тут надо  сохранить информацию о страницах, где в выбранной области текста этот термин встречается
                app.findGrepPreferences = NothingEnum.nothing; // сбрасываем установки определения символьного стиля для поиска      
                app.findGrepPreferences.findWhat = dataLines[i].grep;        
            // в четвёртой или -1, это значит, что стиль не определён, или id символьного стиля
                    if (dataLines[i].id != -1) { // != -1
                            app.findGrepPreferences.appliedCharacterStyle = app.activeDocument.characterStyles.itemByID(Number(dataLines[i].id));  
                           app.findGrepPreferences.findWhat = ".+"; // 02.09.2022 Если определён символьный стиль, что искать, то содержимое grep-запроса уже не важно
                        }  // != -1                            
                var pageFinds;
                if (inStory.value) pageFinds = mySel.findGrep();
                if (inDoc.value) pageFinds = app.activeDocument.findGrep();   
                if (pageFinds.length > 0) { // pageFinds 
                    pageFinds.sort (function (a,b) { // в результате сортировки данные будут упорядочены по увеличению значения индекса
                        an = Number(a.index);
                        bn = Number(b.index); 
                        return an > bn; } );                       
                    for (g = pageFinds.length-1; g >= 0; g--) { // g--
                        var topicInfo = pageFinds[g];
                        app.select(pageFinds[g]);
                        var myS = app.selection[0];
                        pageOffset = 0;                           
                        if (parseIntAppVersion > 6) {
                            try { nSec = myS.parentTextFrames[0].parentPage.appliedSection.index; } catch (e) {  logArray.push("\t" + myS.contents + " [ ??? ](1)"); continue; }
                             if (nSec > 0) { for (var s = 0; s < nSec; s++) pageOffset += app.activeDocument.sections[s].length; }
                            }
                        else { // else
                            try {
                                try { nSec = myS.parentTextFrames[0].parent.appliedSection.index; } catch (e) {  logArray.push("\t" + myS.contents + " [ ??? ](2)"); continue; }
                                 if (nSec > 0) { for (var s = 0; s < nSec; s++) pageOffset += app.activeDocument.sections[s].length; }                                    
                                }
                            catch (e) {  pageOffset = 0; };
                            } // else                         
                        try { 
                            if (parseIntAppVersion > 6) {
                                thePage = myS.parentTextFrames[0].parentPage.name;
                                }
                            else {
                                thePage = myS.parentTextFrames[0].parent.name; 
                                }
                            }
                        catch (e) {
                            logArray.push("\t" + myS.contents + " [ ??? ](3)");
                            continue;
                            }
                       // try { logFile.writeln ("\t" + myS.contents + " [" + thePage + "]"); } catch (e) { continue; } //  20.10 -- почему-то сюда попадаем даже если статья блокирована. 
                        var sLngth = myS.characters.length;
                        var selIndx = myS.index;
                        if (addRB.value && (mySisBlack(myS) == true)) { // addRB                                   
                           pRef = myTopic.pageReferences.add(pageFinds[g].insertionPoints[0], PageReferenceType.currentPage);                              
                            if ((pRef.sourceText.index - selIndx) > 0) { // > 0    
                                    try {
                                      pageFinds[g].parentStory.characters[pRef.sourceText.index].move(LocationOptions.AFTER, pageFinds[g].insertionPoints[0]);
                                    } catch (e) {
                                      // . . // похоже, тут try/catch лишняя. Надо будет ещё проверить этот момент.
                                    }
                                } // > 0
                            if  ((pRef.sourceText.index - selIndx) < 0) { // < 0   
                                    var unsuccessMess = "Запись '" + myTopic.name + "' на странице " + thePage + " не удалось поместить в индексный указатель.";
                                    pBar.error(unsuccessMess);
                                    logArray.push ("\r-----|   " + new Date + "   |-----\r");
                                    logArray.push(unsuccessMess + "\r"); 
                                    theItemNotFound = true;
                                    try { pRef.remove(); } catch (e) { };   // 15.11.2020
                                  } // < 0
                                myS.fillColor = app.activeDocument.colors.item(dataLines[i].color);     
                                notFound = false;
                                procCount++;
                            } // addRB                                 
                         if (delRB.value) { // delRB.                                  
                            var selIndx = myS.index;
                            if (myS.parent.characters[selIndx-1].contents == "\uFEFF") { // \uFEFF     ||   parent  - работает и для статьи и для сноски                                
                                myS.fillColor = app.activeDocument.colors.item("Black");
                                myS.parent.characters[selIndx-1].remove();                                    
                                } // \uFEFF
                             procCount++;                                
                             notFound = false;
                            } // delRB                           
                    } // g--
                    }  // pageFinds
                } // != "Z"
       prevTopic = myTopic; 
       app.activeDocument.save(File(decodeURI(app.activeDocument.fullName))); // 24.02.2023
        } // j++
   } // i++
taskIsDone = true;
pBar.close();
var myDocPath = decodeURI(app.documents[0].filePath);
var messAboutLog = "";
if (logArray.length != 0) { //logArray.length != 0
    var txtName = decodeURI(app.activeDocument.name.split(".indd")[0]) +  "=log.txt";
    var logFileName = myDocPath + "/" + app.activeDocument.name.split(".indd")[0] + "=log.txt";
    var logFile= new File (logFileName);
    logFile.open("w");
    for (var a = 0; a < logArray.length; a++) { logFile.writeln(logArray[a]); } ;
    logFile.close();
    messAboutLog = "\r\rВ текстовом файле '" + txtName + "' информация о записях, которые программа не смогла обработать.";
    } // logArray.length != 0
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;  
app.documents[0].select(NothingEnum.nothing); // снимем выделение
var myDateF = new Date;
var myHourF = myDateF.getHours();
if (myHourF <10) myHourF = "0" + myHourF;
var myMinuteF = myDateF.getMinutes();
if (myMinuteF <10) myMinuteF = "0" + myMinuteF;
if (!notFound) {
    alert("Время начала | время завершения [ч:м]  " + myHourS + ":" + myMinuteS + " | " + myHourF + ":" + myMinuteF +"\rОбработано строк " + dataLinesLength + ", найдено записей " + procCount + "." + messAboutLog, programTitul);     
    }
else alert("Ничего не найдено.\r\rВозможно, выделены строки, цвет которых был изменён при предыдущей обработке. Программа обрабатывает только оформленные чёрным цветом строки с grep-запросами.\r\rДругая возможная причина — программа не  будет искать термин, если вторая ячейка строки пустая. Ищутся только те термины, у которых в этой ячейке есть символ, обычно № или #, не принципиально.", programTitul);
taskIsDone = true;
if (pagesOff == true) app.panels.item("$ID/Pages").visible = true;
addRB.text = addText1;
return;
///
function mySisBlack (myS) { // mySisBlack
// возвращает false, если в найденном тексте найдена буква, цвет которой отличен от чёрного
// и true, если весь текст чёрный
// 08.11.2020  возвращает false, если текст буквы окрашен цветом, название которого начинается с 'IndexColor'
// Не обязательно полное имя, главное, что в имени есть 'IndexColor'. Это сделано для того, чтобы не индексировать отдельные слова в многословном термине, обработанные ранее.
// 17.12.2022 - добавлен цвет SkipTheWord, текст окрашенный им, тоже не индексируется.

var mLength = myS.characters.length;
var isBlack = true;
for (ii = 0; ii < mLength; ii++) { // ii++
    if (myS.characters[ii].fillColor.name.split("IndexColor")[0].length != 0 && myS.characters[ii].fillColor.name.split("SkipTheWord")[0].length != 0) continue;       
    // [0].length != 0 -- значит, у этого знакатакого цвета нет. Переход к следующей букве.
    isBlack = false;
    break;
    } // ii++
return isBlack;
} // mySisBlack
///
} // theAction.onClick
////////////////////////////////////
var crp = win.add("group");
crp.alignChildren = ["center", "fill"];
crp.add("statictext", undefined, " ");
crp.add("statictext", undefined, "© Михаил Иванюшин. 2020-2023  | dotextok@gmail.com | dotextok.ru");
var selRez = true;
startClearIndex.onClick = function() { // startClearIndex.onClick
var splitLength = app.activeDocument.name.split("IndexList"); // 28.05.2022
if (splitLength.length != 1) {
     alert("Эта операция выполняется для файла вёрстки, а сейчас на экране файл таблицы.",programTitul);  
     startClearIndex.value = false;
     return;
    }
if (startClearIndex.value) { // startClearIndex.value
        var exWin = new Window ("dialog","Выбран флажок удаления собранных данных для указателя");
        exWin.alignChildren = ["fill", "center"];
        var question = "Вы уверены, что хотите удалить собраные данные?";
        var myMessage = exWin.add("statictext", undefined, question, {multiline: true});
        myMessage.minimumSize.width = 500;
        var selNo = exWin.add("radiobutton", undefined, "Закрыть окно без удаления информации");
        var selYes = exWin.add("radiobutton", undefined, "Данные будут собираться заново");      
        selNo.value = true;
        var doSel = exWin.add("button", undefined, "Подтверждение выбора");
        doSel.onClick = function() { selRez = selNo.value; exWin.close(); };
        exWin.show();    
        if (selRez == true) {
            startClearIndex.value = false;
            app.activate();
            return;    
            }
        } // startClearIndex.value
if (startClearIndex.value == true) { // == true
    addRB.text = addText2; 
    var splitLength = app.activeDocument.name.split("IndexList"); // 28.05.2022
    if (splitLength.length == 1) { // == 1 
//~         for (var i = app.activeDocument.colors.length-1; i >= 0; i--) { if (app.activeDocument.colors[i].name.match(/IndexColor/) != null) app.activeDocument.colors[i].remove();};
//~         try { app.activeDocument.indexes[0].topics.everyItem().remove(); } catch (e) { }
// сделано два прогрессбара, чтобы видеть, что удаление сделанного указателя выполняется. С отображением процесса выполнения больше доверия к программе
         pBar = new ProgressBar("1/2  Удаление цветов"); 
         pBar.reset("", app.activeDocument.colors.length);
         for (var i = app.activeDocument.colors.length-1; i >= 0; i--, pBar.hit()) { if (app.activeDocument.colors[i].name.match(/IndexColor/) != null) app.activeDocument.colors[i].remove();};
         pBar = new ProgressBar("2/2  Удаление сделанного ранее указателя"); 
         pBar.reset("После исчезновения прогрессбара возможна задержка, обусловленная перекомпоновкой текста", app.activeDocument.indexes[0].topics.length);
         for (var i = app.activeDocument.indexes[0].topics.length-1; i >= 0; i--, pBar.hit()) { app.activeDocument.indexes[0].topics[i].remove()};
         pBar.close();
        app.activeDocument.recompose();
        startClearIndex.value = false;
        taskIsDone = false;
        alert("Сделанный ранее указатель удалён, служебные цвета маркировки выбранных данных,  их название начиналось с 'IndexColor', убраны.\nМожно глубоко вздохнуть и начать заново. Обычно при повторе всё получается быстрее.",programTitul);
        } // == 1
    } // == true
else addRB.text = addText1; 
app.activate();
} // startClearIndex.onClick
/////
info.onClick = function() { // info.onClick
app.pdfExportPreferences.properties.viewPDF = true;   
var myScriptFile = myGetScriptPath();
var myScriptFolder = decodeURI(myScriptFile.path);  
var infoFile = File(decodeURI(myScriptFolder + "/Info/IndexingOfRussianTexts.pdf")); // адрес, если все скрипты в одной папке
if (!infoFile.exists) { 
    alert("Не найден PDF-файл с описанием этой программы. Он называется 'IndexingOfRussianTexts.pdf' и должен быть в папке 'Info' этого скрипта.",programTitul);
    return; 
    }
else {
        var wnd = new Window ("dialog",programTitul, undefined);
        wnd.alignChildren = ["fill", "center"];
        win.hide();
        var yes_ser = wnd.add("button", undefined, "Пусть эта программа будет только на вашей машине. Спасибо за понимание.");
        yes_ser.onClick = function () { wnd.close(); win.show();};
        wnd.show();
    infoFile.execute();
    }
} // info.onClick
///////////////////////
keep.onClick = function() { // keep.onClick
win.hide();
var slaveWinLocation = [-1,-1]; // положение на экране служебного окна программы
var wn = new Window ("palette", ">•<", undefined, {closeButton: false});
wn.margins = [1,1,1,1];
var myScriptFile = myGetScriptPath();
var myDefSetName  = "ProcStory.ini"; // это файл установок программы
var myScriptFolder = decodeURI(myScriptFile.path);
var myFilePath = decodeURI(myScriptFolder + "/sets/" + myDefSetName); 
var myDataFile = new File (myFilePath);
if (myDataFile.exists) { //File.exists
    myDataFile.open("r");
    slaveWinLocation[0] = myDataFile.readln();
    slaveWinLocation[1] = myDataFile.readln();
    myDataFile.close();
    } //File.exists
if (slaveWinLocation[0] != -1) wn.location = slaveWinLocation;
var retButton = wn.add("button", [0,0,30,30], "<•>");
retButton.onClick = function() { // retButton.onClick()
try { win.show(); } catch (e) {exit() };
myDataFile.open("w");
myDataFile.writeln(wn.location[0]);
myDataFile.writeln(wn.location[1]);
myDataFile.close();
wn.close();
}
////
wn.show();
}  // keep.onClick
///////////////////////
win.onClose = function() { // win.onClose
// что делать при щелчке на крестике в шапке окна программы   
// сохранить положение окна
var myScriptFile = myGetScriptPath();
var myDefSetNameW  = ProcStoryOrDocWinName; // это файл с информацией, где окно на экране
var myScriptFolder = decodeURI(myScriptFile.path);
var myFilePathW = decodeURI(myScriptFolder + "/sets/" + myDefSetNameW); 
var myDataFileW = new File (myFilePathW);
myDataFileW.open("w");
myDataFileW.writeln(win.location[0]);
myDataFileW.writeln(win.location[1]);
myDataFileW.close();
app.activate();
} // win.onClose
//////////////////////
return win;
}  // myScriptWindow 
/////////////////
function getCharacterStyleNames() {// getCharacterStyleNames
var result = [];    
var myCharacterStyles = app.activeDocument.allCharacterStyles;
var myCharacterStyleName, obj;
for (var i=0; i < myCharacterStyles.length ; i++) { // for
    myCharacterStyleName = myCharacterStyles[i].name;
   // if (myCharacterStyleName[0] == "[") continue; // вариант [ Без стиля ] всегда должен быть, без него нельзя организовать исключение обработки текста, оформленного каким-то симв. стилем.
     csID.push(myCharacterStyles[i].id); 
    obj = myCharacterStyles[i];
    while(obj.parent instanceof CharacterStyleGroup) {
        myCharacterStyleName = obj.parent.name + ":" + myCharacterStyleName;
        obj = obj.parent;        
        }
    result.push({name:myCharacterStyleName, active: false});
    } // for
return result;
} // getCharacterStyleNames
///
