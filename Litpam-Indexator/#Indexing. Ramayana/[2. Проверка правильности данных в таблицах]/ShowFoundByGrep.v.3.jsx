// ShowFoundByGrep.jsx

/*
Должно быть открыто два файла — файл вёрстки и файл IndexList.
Надо поместить курсор в ячейку с grep-запросом, и нажать на кнопку "Показать работу выбранного запроса".
Предварительно радиокнопками М (материал) или Ф (файл) определить область поиска.
Программа соберёт все найденные выбранным запросом слова, уберёт повторы и выведет в информационном окне строку найденных слов.
*/


// © Михаил Иванюшин, 2023  |  dotextok@gmail.com  |  dotextok.ru

#targetengine "ShowFoundByGrep"
#include "../ForIndex.jsxinc"

app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll; // см. http://adobeindesign.ru/2008/10/24/restore-ui/

var rez;
var arrayToShow = [];
var usedColumn;
var stringToShow = "";
var cellsGrep = [];
var cellsTerm = [];
var cellsFoundText = [];

var programTitul = "Результат выполнения выбранного запроса";
var programTitulAll = "Результаты выполнения всех запросов";
if (app.documents.length == 0) {
    alert("Нет открытых документов.", programTitul);
    exit();
    }
if (app.documents.length != 2) {
   alert("Для работы скрипта должны быть открыты два файла — файл IndexList, и файл вёрстки.", programTitul);  
    exit();
    }
var win = new Window ("palette", programTitul);
var jobFile, jobFileID, table, tableFileID, jobStory, tabStory, tableID, jobPath, tablePath;
win.alignChildren = ["fill", "fill"];
var jobStart = "Поставьте курсор в материал и установите флажок";
var jobOK = "Файл вёрстки выбран";
var jobGroup = win.add("group");
jobGroup.orientarion = "row";
var job = jobGroup.add("checkbox", undefined, jobStart); 
job.value = false;
var inTableStart = "Поставьте курсор в таблицу IndexList и установите флажок";
var inTableOK = "Файл IndexList выбран";
var inTable = win.add("checkbox", undefined, inTableStart);
inTable.value = false;
inTable.enabled = false;
///
separator1 = win.add ("panel");
separator1.minimumSize.height = separator1.maximumSize.height = 1;
separator1.alignment = ["fill", "fill"];
var buttons = win.add("group");
buttons.alignChildren = ["fill", "center"];
buttons.orientation = "row";
var buttonSize = [0,0,300,28];
var smallSize = [0,0,28,28];
var smallButtons = buttons.add("group");
smallButtons.orientation = "column";
var info = smallButtons.add("button", smallSize, "?");
var hide = smallButtons.add("button", smallSize, "...");

separator2 = buttons.add ("panel");
separator2.minimumSize.width = separator2.maximumSize.width = 1;
separator2.alignment = ["fill", "fill"];

var twoBigButtons =  buttons.add("group");
twoBigButtons.orientation = "column";
twoBigButtons.enabled = false;
var showRez = twoBigButtons.add("button", buttonSize, "Показать работу выбранного запроса");
var collectRez = twoBigButtons.add("button", buttonSize, "Собрать в файл результаты работы запросов");
collectRez.enabled = false;
separator3 = buttons.add ("panel");
separator3.minimumSize.width = separator3.maximumSize.width = 1;
separator3.alignment = ["fill", "fill"];

var twoRadiobuttons = buttons.add("group");
twoRadiobuttons.orientation = "column";
var selM = twoRadiobuttons.add("radiobutton", undefined, "M");
selM.helpTip = "M — поиск в материале";
selM.value = true;
var selF = twoRadiobuttons.add("radiobutton", undefined, "Ф");
selF.helpTip = "Ф — поиск в файле";
///
var myInfoLine = "Это окно отображения информации о выполнении выбранного grep-запроса: для каждого фрагмента текста, соответствующего запросу поиска, в круглых скобках будет указано, сколько раз такой текст был найден.";
var dHeight = 100;
var data = win.add("edittext", [0, 0, undefined, dHeight], "", {multiline: true});
///
job.onClick = function() { // job.onClick 
if (app.selection.length == 0 || app.selection[0].constructor.name != "InsertionPoint") {
    alert("Курсор должен быть в материале.", programTitul);
    job.value = false;
    return;
    }

var noName = false;
try { var doc_Name = decodeURI(app.activeDocument.fullName); } 
catch(e) {
   alert("Это ещё ни разу не сохранённый файл.",programTitul);   
   noName = true;
    }
if (noName) { // noName
    try { app.activeDocument.save(); }
    catch (e) { 
        alert("Файл не был сохранён.",programTitul);         
       job.value = false;    
       return; 
        }
    } // noName

var jobName = decodeURI(app.activeDocument.name);
if (jobName.match("IndexList") != null) {
       alert("В названии файла вёрстки не должно быть 'IndexList'.", programTitul);
       job.value = false;    
       return;    
    }
jobFile = app.activeDocument;
jobFileID = app.activeDocument.id;
jobStory = app.selection[0].parent.id;
job.text = jobOK;
job.enabled = false;
inTable.enabled = true;
app.activeDocument = app.documents[1];
} // job.onClick
///
info.onClick = function () { // info
var iMes = "Должны быть открыты файл вёрстки и таблица IndexList-nnn.indd. Выбираете запрос, нажимаете кнопку «Показать работу выбранного запроса», и в окне будут выведены всё слова, найденные в вёрстке с использованием этого запроса с указанием, сколько раз данный вариант был найден. Радиокнопка М — поиск в материале, радиокнопка Ф — поиск в файле.\nПосле первого показа результата кнопкой «Показать работу выбранного запроса» станет доступной кнопка «Собрать в файл результаты работы», она сделает обычный текстовый файл, в котором для каждой строки будет такая информация:\nТермин указателя | искомый текст | grep-запрос\nРезультаты поиска\nЕсли вёрстка называется kniga.indd, то этот файл будет называться kniga@foundByGrep.txt, он в той же папке, что и таблица.\n";
alert(iMes, programTitul);
} // info
///
inTable.onClick = function () { // inTable.onClick  
if (app.activeDocument.id == jobFileID) {
       alert("Сейчас выбран тот же файл, что только что был указан как файл вёрстки.", programTitul);
       inTable.value = false;       
       return;
       }
   
var noName = false;
try { var doc_Name = decodeURI(app.activeDocument.fullName); } 
catch(e) {
   alert("Это ещё ни разу не сохранённый файл.",programTitul);   
   noName = true;
    }
if (noName) { // noName
    try { app.activeDocument.save(); }
    catch (e) { 
        alert("Файл не был сохранён.",programTitul);         
       job.value = false;    
       return; 
        }
    } // noName   
   
var tableName = decodeURI(app.activeDocument.name);
if (tableName.match("IndexList") == null) {
       alert("Название файла должно начинаться с 'IndexList'.", programTitul);
       inTable.value = false;       
       return;    
    }
if (app.selection.length == 0 || app.selection[0].constructor.name != "InsertionPoint" || app.selection[0].parent.constructor.name != "Cell") {
       alert("Курсор должен быть в ячейке таблицы.", programTitul);
       inTable.value = false;       
       return;    
    }
tableID = app.selection[0].parent.parent.id;
tabStory = app.selection[0].parent.parent.parent.parentStory;
inTable.enabled = false;          
twoBigButtons.enabled = true;
data.text = myInfoLine;
} // inTable.onClick
///
showRez.onClick = function() { // showRez.onClick    
if (app.selection.length == 0 || app.selection[0].constructor.name != "InsertionPoint" || app.selection[0].parent.constructor.name != "Cell" || app.selection[0].parent.parentColumn.name != 2) {
   alert("Курсор должен быть в третьей ячейке строки таблицы таблицы, это колонка grep-запросов.", programTitul);    
   return null;
       }
usedColumn = app.selection[0].parent.parentColumn.name;
//~ if (usedColumn != 2) {
//~    alert("При запуске скрипта курсор должен быть в третьей ячейке строки.", programTitul);    
//~    return null;        
//~     }
if (app.selection[0].parent.texts[0].length == 0) {
   alert("Ячейка не должна быть пустой.", programTitul);    
   return null;    
    }
var cellText = app.selection[0].parent.texts[0].contents;
data.text = "";
var curGrep = cellText;
getFindRezults (curGrep);
} // showRez.onClick
///
function getFindRezults (grepText) { // getFindRezults
var rezArr = {};  // для случаев без учёта регистра  
var rezArr_Y = {};    // для случаев с учётом регистра  
if (grepText.match(/\(\?/) != null) { //  != null    
// в запросе определено, как использовать регистр   
    app.activeDocument = app.documents[1];
    app.findGrepPreferences = null; 
    app.changeGrepPreferences = null; 
    app.findChangeGrepOptions.includeFootnotes = true;
    app.findGrepPreferences.findWhat = grepText;
    var stories = app.activeDocument.stories;
    var st = stories.itemByID(Number(jobStory));
    if (selM.value) rez = st.findGrep(); else rez = app.activeDocument.findGrep();
    if (rez.length == 0) { // == 0
        app.activeDocument = app.documents[1];
        var exTxt = "";
        if (selM.value) exTxt = "\nМожет быть, надо искать не в материале, а в файле?";
        alert("Выбранный grep-запрос не нашел текста." + exTxt + "\r(В grep-запросе использование регистра определено.)", programTitul);
        collectRez.enabled = true;
        return null;
        } // == 0
    while (arrayToShow.length > 0) arrayToShow.shift();
    var term;
    var num;
    var count;
    data.text = "С определённым в grep-запросе вариантом учёта регистра:";    
    for (var i = 0; i < rez.length; i++) { // i++
        term = rez[i].contents;
        if (rezArr[term] != undefined) {
            num = Number(rezArr[term]);
            num++;
            rezArr[term] = num;
            continue;
            }
        rezArr[term] = 1;
        arrayToShow.push(term);
        } // i++
    for (n = 0; n < arrayToShow.length; n++) { // n++
        count = rezArr[arrayToShow[n]];
        arrayToShow[n] = arrayToShow[n] + " (" + count + ")";
        } // n++
    stringToShow = "";
    stringToShow = arrayToShow.join(", ");
    data.text = data.text + "\r" + stringToShow;
    app.activeDocument = app.documents[1];
    rezArr = null;
    collectRez.enabled = true;
    return 0;
    }  //  != null
else { ///
    /// поиск с двумя вариантами управления регистром
    while (arrayToShow.length > 0) arrayToShow.shift();
    var term;
    var num;
    var count;    
    app.activeDocument = app.documents[1];
    app.findGrepPreferences = null; 
    app.changeGrepPreferences = null; 
    app.findChangeGrepOptions.includeFootnotes = true;
    app.findGrepPreferences.findWhat = "\(?i\)" + grepText;
    var stories = app.activeDocument.stories;
    var st = stories.itemByID(Number(jobStory));
    if (selM.value) rez = st.findGrep(); else rez = app.activeDocument.findGrep();
    if (rez.length == 0) { // == 0
        data.text = data.text + "\rБез учёта регистра — ничего не найдено.";
        } // == 0
    else { // rez.length > 0
        data.text = data.text + "\rБез учёта регистра:"    
        for (var i = 0; i < rez.length; i++) { // i++
            term = rez[i].contents;
            if (rezArr[term] != undefined) {
                num = Number(rezArr[term]);
                num++;
                rezArr[term] = num;
                continue;
                }
            rezArr[term] = 1;
            arrayToShow.push(term);
            } // i++
        for (n = 0; n < arrayToShow.length; n++) { // n++
            count = rezArr[arrayToShow[n]];
            arrayToShow[n] = arrayToShow[n] + " (" + count + ")";
            } // n++
        stringToShow = "";
        stringToShow = arrayToShow.join(", ");
        data.text = data.text + "\r" + stringToShow;
        } //  // rez.length > 0
   // app.activeDocument = app.documents[1];
    rezArr = null;
    collectRez.enabled = true;
   // return 0;
////////////////////////
    while (arrayToShow.length > 0) arrayToShow.shift();
    app.findGrepPreferences = null; 
    app.changeGrepPreferences = null; 
    app.findChangeGrepOptions.includeFootnotes = true;
    app.findGrepPreferences.findWhat = "\(?-i\)" + grepText;
    var stories = app.activeDocument.stories;
    var st = stories.itemByID(Number(jobStory));
    if (selM.value) rez = st.findGrep(); else rez = app.activeDocument.findGrep();
    if (rez.length == 0) { // == 0
        data.text = data.text + "\rС учётом регистра — ничего не найдено.";
        } // == 0
    else { // rez.length > 0
    data.text = data.text + "\r" + "С учётом регистра:";        
    for (var i = 0; i < rez.length; i++) { // i++
        term = rez[i].contents;
        if (rezArr_Y[term] != undefined) {
            num = Number(rezArr_Y[term]);
            num++;
            rezArr_Y[term] = num;
            continue;
            }
        rezArr_Y[term] = 1;
        arrayToShow.push(term);
        } // i++
    for (n = 0; n < arrayToShow.length; n++) { // n++
        count = rezArr_Y[arrayToShow[n]];
        arrayToShow[n] = arrayToShow[n] + " (" + count + ")";
        } // n++
    stringToShow = "";    
    stringToShow = arrayToShow.join(", ");
    data.text = data.text + "\r" + stringToShow;
    } //  // rez.length > 0
   app.activeDocument = app.documents[1];
    rezArr_Y = null;
    collectRez.enabled = true;
   return 0;
    } ///
}  // getFindRezults
////
collectRez.onClick = function () { // collectRez.onClick
if (app.selection.length == 0 || app.selection[0].constructor.name != "InsertionPoint" || app.selection[0].parent.constructor.name != "Cell") {
   alert("Курсор должен быть в ячейке таблицы.", programTitul);    
   return null;
       }
var oneName = decodeURI(app.activeDocument.name);
var anotherName = decodeURI(app.documents[1].name);
var fName = decodeURI(app.activeDocument.name.split(".indd")[0] + "@foundByGrep.txt");
var jobFolder = decodeURI(app.activeDocument.filePath);
var myFilePath = decodeURI(jobFolder + "/" + fName); 
var rezFile = new File (myFilePath);
rezFile.open("w");
rezFile.encoding = "utf8";
rezFile.writeln("Файл вёрстки: " +anotherName + "\r");
rezFile.writeln("Файл с таблицей: " +oneName + "\r");
if (selM.value) rezFile.writeln("Пространство поиска — материал. \r\r"); else rezFile.writeln("Пространство поиска — файл. \r\r");
rezFile.writeln("Формат представления данных: Термин указателя | искомый текст | используемый grep-запрос.\rСледующие две строки — что найдено этим запросом с разными вариантами учёта регистра.\rЕсли вариант учёта регистра определён в grep-запросе, то показано, что найдено именно этим запросом.\rДля каждого результата в скобках указано, сколько раз такой вариант был найден.\r\r");

var searchPlace;
if (selM.value) searchPlace = "Результаты поиска в материале "; else searchPlace = "Результаты поиска в файле ";
data.text = searchPlace + "с использованием всех grep-запросов будут помещены в текстовый файл " + fName;
var rezArr = {};
var rezArr_Y = {};
var stringToShow;
var table = app.selection[0].parent.parent;
var rowsNum = table.rows.length;
var term;
var foundText;
var numCol = table.columns.length-1;
var tableLine = "";
var myDateS = new Date;
var myHourS = myDateS.getHours();
if (myHourS <10) myHourS = "0" + myHourS;
var myMinuteS = myDateS.getMinutes();
if (myMinuteS <10) myMinuteS = "0" + myMinuteS;
var pBar = new ProgressBar(programTitulAll + "  [ " + myHourS + ":" + myMinuteS + " ]"); 
pBar.reset("1/2 Подготовка к сбору результатов выполнения grep-запросов", rowsNum);
while (cellsTerm.length > 0) cellsTerm.pop();
while (cellsGrep.length > 0) cellsGrep.pop();
while (cellsFoundText.length > 0) cellsFoundText.pop();
for (var r = 0; r < rowsNum; r++, pBar.hit()) { // r++
    cellsTerm.push(table.rows[r].cells[0].texts[0].contents);
    cellsGrep.push(table.rows[r].cells[usedColumn].texts[0].contents);   
    cellsFoundText.push(table.rows[r].cells[numCol].texts[0].contents);    
    }  // r++
pBar.reset("2/2 Сбор результатов выполнения grep-запросов", rowsNum);
app.activeDocument = app.documents[1];
for (var r = 0; r < rowsNum; r++, pBar.hit()) { // r++
    if (cellsGrep[r].length == 0) { continue; }
    var cellText = cellsGrep[r];  
   if (cellText.match(/\(\?/) != null) { //  != null  
    var curGrep = cellText;
    procCurGrep1 (rezArr, curGrep, cellsTerm[r], cellsFoundText[r], rezFile);
    stringToShow = "==================\r\r";   
    rezFile.writeln(stringToShow);    
    } //  //  != null
else { //// else
    procCurGrep2 (rezArr, rezArr_Y, cellText, cellsTerm[r], cellsFoundText[r], rezFile);    
    stringToShow = "==================\r\r";   
    rezFile.writeln(stringToShow);     
    }  //// else
} // r++
pBar.close();
app.activeDocument = app.documents[1];
rezArr = null;
rezArr_Y = null;
collectRez.enabled = true;
rezFile.close();
var myDateF = new Date;
var myHourF = myDateF.getHours();
if (myHourF <10) myHourF = "0" + myHourF;
var myMinuteF = myDateF.getMinutes();
if (myMinuteF <10) myMinuteF = "0" + myMinuteF;
var timing = myHourS + ":" + myMinuteS + " — " + myHourF + ":" + myMinuteF;
alert (timing + "\rРезультаты работы всех запросов собраны в файле '" + fName + "', он в той же папке, где таблица.", programTitul);
return 0;
} // collectRez.onClick
////
function procCurGrep1 (rez_Arr,curGrep, _term, _foundText, rezFile) { // procCurGrep1
app.findGrepPreferences = null; 
app.changeGrepPreferences = null; 
app.findChangeGrepOptions.includeFootnotes = true;
app.findGrepPreferences.findWhat = curGrep;
var stories = app.activeDocument.stories;
var st = stories.itemByID(Number(jobStory));
if (selM.value) rez = st.findGrep(); else rez = app.activeDocument.findGrep();
if (rez.length == 0) { // == 0
    stringToShow = ">>>> Ничего не найдено.";
    } // == 0
else { // != 0
    while (arrayToShow.length > 0) arrayToShow.shift();
    var term;
    var num;
    var count;
    for (var i = 0; i < rez.length; i++) { // i++
        term = rez[i].contents;
        if (rez_Arr[term] != undefined) {
            num = Number(rez_Arr[term]);
            num++;
            rez_Arr[term] = num;
            continue;
            }
        rez_Arr[term] = 1;
        arrayToShow.push(term);
        } // i++
    for (n = 0; n < arrayToShow.length; n++) { // n++
        count = rez_Arr[arrayToShow[n]];
        arrayToShow[n] = arrayToShow[n] + " (" + count + ")";
        } // n++
    stringToShow = "";
    stringToShow = arrayToShow.join(", ");
    if (stringToShow.length == 0) stringToShow = "Такой grep-запрос был проверен ранее.";
    }  // != 0
term = _term;
foundText = _foundText;
tableLine = term + " | " + foundText + "\r~~~~~~~~~~~~~~~~~~\r";
rezFile.writeln(tableLine);
tableLine = "Управление регистром определено в grep-запросе: " + curGrep + "\r";
rezFile.writeln(tableLine);
rezFile.writeln(stringToShow + "\r");  
} // procCurGrep1
////
function procCurGrep2 (rez_Arr, rez_Arr_Y, curGrep, _term, _foundText, rezFile) { // procCurGrep2
app.findGrepPreferences = null; 
app.changeGrepPreferences = null; 
app.findChangeGrepOptions.includeFootnotes = true;
app.findGrepPreferences.findWhat = "\(?i\)" + curGrep;
var stories = app.activeDocument.stories;
var st = stories.itemByID(Number(jobStory));
if (selM.value) rez = st.findGrep(); else rez = app.activeDocument.findGrep();
if (rez.length == 0) { // == 0
    stringToShow = ">>>> Ничего не найдено.";
    } // == 0
else { // != 0
    while (arrayToShow.length > 0) arrayToShow.shift();
    var term;
    var num;
    var count;
    for (var i = 0; i < rez.length; i++) { // i++
        term = rez[i].contents;
        if (rez_Arr[term] != undefined) {
            num = Number(rez_Arr[term]);
            num++;
            rez_Arr[term] = num;
            continue;
            }
        rez_Arr[term] = 1;
        arrayToShow.push(term);
        } // i++
    for (n = 0; n < arrayToShow.length; n++) { // n++
        count = rez_Arr[arrayToShow[n]];
        arrayToShow[n] = arrayToShow[n] + " (" + count + ")";
        } // n++
    stringToShow = "";
    stringToShow = arrayToShow.join(", ");
    if (stringToShow.length == 0) stringToShow = "Такой grep-запрос был проверен ранее.";
    }  // != 0
term = _term;
foundText = _foundText;
tableLine = term + " | " + foundText + " | " + curGrep + "\r~~~~~~~~~~~~\r";
rezFile.writeln(tableLine);
tableLine = "без учёта регистра: " + "(?i)" + curGrep + "\r";
rezFile.writeln(tableLine);
rezFile.writeln(stringToShow + "\r-----\r");
//////////////////
app.findGrepPreferences = null; 
app.changeGrepPreferences = null; 
app.findChangeGrepOptions.includeFootnotes = true;
app.findGrepPreferences.findWhat = "\(?-i\)" + curGrep;
var stories = app.activeDocument.stories;
var st = stories.itemByID(Number(jobStory));
if (selM.value) rez = st.findGrep(); else rez = app.activeDocument.findGrep();
if (rez.length == 0) { // == 0
    stringToShow = ">>>> Ничего не найдено.";
    } // == 0
else { // != 0
    while (arrayToShow.length > 0) arrayToShow.shift();
    var term;
    var num;
    var count;
    for (var i = 0; i < rez.length; i++) { // i++
        term = rez[i].contents;
        if (rez_Arr_Y[term] != undefined) {
            num = Number(rez_Arr_Y[term]);
            num++;
            rez_Arr_Y[term] = num;
            continue;
            }
        rez_Arr_Y[term] = 1;
        arrayToShow.push(term);
        } // i++
    for (n = 0; n < arrayToShow.length; n++) { // n++
        count = rez_Arr_Y[arrayToShow[n]];
        arrayToShow[n] = arrayToShow[n] + " (" + count + ")";
        } // n++
    stringToShow = "";
    stringToShow = arrayToShow.join(", ");
    if (stringToShow.length == 0) stringToShow = "Такой grep-запрос был проверен ранее.";
    }  // != 0
tableLine = "с учётом регистра: " + "(?-i)" + curGrep + "\r";
rezFile.writeln(tableLine);
rezFile.writeln(stringToShow + "\r");
} // procCurGrep2
////
hide.onClick = function() { // hide.onClick
win.hide();
var slaveWinLocation = [-1,-1]; // положение на экране служебного окна программы
var wn = new Window ("palette", ">?<", undefined, {closeButton: false});
wn.margins = [1,1,1,1];
var myScriptFile = myGetScriptPath();
var myDefSetName  = "FoundByGrep.ini"; // это файл установок программы
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
var ret_Button = wn.add("button", [0,0,28,28], "<?>");
ret_Button.onClick = function() { // ret_Button.onClick()
try { win.show(); } catch (e) {exit() };
myDataFile.open("w");
myDataFile.writeln(wn.location[0]);
myDataFile.writeln(wn.location[1]);
myDataFile.close();
wn.close();
} // ret_Button.onClick()
///
wn.show();
}  // hide.onClick
////
win.show();

