//  #FindClipboardInStory.jsx

/*
Программа запускается и появляется в виде кнопки на экране.
Если взять текст в буфер, поставить курсор в материал, и потом нажать кнопку,
то содержимое буфера поместится в окно поиска и будет искаться этот текст в выбранном материале, начиная от выбранного текста или позиции курсора до конца статьи.
Если в обычном тексте между словами пробелы, а в вёрстке на этом месте стоят шпации, то текст найден не будет.
Поэтому в искомом тексте в образце поиска пробелы заменяются на обобщённый код шпации.

Не надо двигать по экрану окно поиска, не надо вставлять содержимое буфера, не надо снова отодвигать окно поиска, чтобы увидеть найденное.
Выбирается первый найденный фрагмент. В шапке окна выводится число найденных фрагментов: число и после него звёздочка.
Если не найдено, то в шапке знак вопроса.
Искомый текст запоминается, и если число находок больше одной, то при прежнем содержимом буфера программа переходит на следующий фрагмент.
В шапке отображается порядковый номер отображаемого найденного текста, звёздочки после номера нет.

В коде программы намеренно нет операторов сброса установок
app.findGrepPreferences = app.changeGrepPreferences = null;
поскольку может быть ситуация, что надо искать текст с определёнными уточняющими установками.
Этот скрипт меняет только искомый текст, не затрагивая другие параметры.

// © Михаил Иванюшин, 2023  |  dotextok@gmail.com  |  dotextok.ru

*/

#targetengine "FindClipboardInStory"

app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll; // см. http://adobeindesign.ru/2008/10/24/restore-ui/

var programTitul = "Помещение буфера в строку поиска";
if (app.documents.length == 0) {
    alert("Нет открытых документов.", programTitul);
    exit();
    }
var textForBuffer = "";
var indx;
var rz;
var pn;
var winLocation = [-1, -1];
var myScriptFile = myGetScriptPath();
var findButton  =  "FindClipboardInStory.ini"; 
var myScriptFolder = decodeURI(myScriptFile.path);
var findFilePath = decodeURI(myScriptFolder + "/sets/" + findButton); 
var buttonForBufferFile = new File (findFilePath);
if (buttonForBufferFile.exists) { //File.exists
    buttonForBufferFile.open("r");
    winLocation[0] = buttonForBufferFile.readln();
    winLocation[1] = buttonForBufferFile.readln();
    buttonForBufferFile.close();
    } //File.exists
var win = new Window ("palette", ">:<");
var findSet = "";
var findStyle = "";
var findColor = "";
win.margins = [1,1,1,1];
var searchButton = win.add("button", [0,0,28,28], "•");
if (winLocation[0] != -1) win.location = winLocation;
win.alignChildren = ["center", "center"];
searchButton.onClick = function() { // searchButton.onClick 
if (app.documents.length == 0) win.close();   
var sel = app.selection[0];
//if (sel == null || (sel.constructor.name != "InsertionPoint")) { // == null
if ((sel == null) || (sel.hasOwnProperty("pointSize") != true)) { // == null    
    alert("Поставьте курсор в текст.",programTitul);
    return;    
    } // == nul
sel.insertionPoints[0].select();
sel = app.selection[0];
var story = sel.parentStory;
var insPosition = sel.index;
var storyEnd = story.length-1;
var numFrame = sel.parentTextFrames[0].parentPage.textFrames.add({strokeWeight:0});
numFrame.strokeColor = app.activeDocument.swatches[0]; // это должен быть цвет [None]                
numFrame.geometricBounds = [-30,0,20,100];
numFrame.label = "FindClipboard";
numFrame.texts[0].insertionPoints[0].appliedCharacterStyle = app.activeDocument.characterStyles[0];
numFrame.texts[0].insertionPoints[0].select();
app.paste();
var frameStory = numFrame.texts[0].parentStory;
app.findGrepPreferences.findWhat = numFrame.texts[0].contents;
app.findGrepPreferences.findWhat = "\\h"; // если обычном тексте между словами пробелы, а в вёрстке на этом месте стоят шпации, то текст найден не будет.
app.changeGrepPreferences.changeTo = "\\h"; // Чтобы найти, надо в образце поиска пробелы заменить на обобщённый код шпации
frameStory.changeGrep();

if (textForBuffer == numFrame.texts[0].contents && rz.length > 1) {
    if (indx < rz.length) { indx = indx+1; pn = pn+1; }
    numFrame.remove();
    win.text = pn;
    rz[indx].select();
    app.activeWindow.activePage = app.selection[0].parentTextFrames[0].parentPage; 
    app.activeWindow.zoomPercentage = 200; 
    return;
    }
textForBuffer = numFrame.texts[0].contents;
app.findGrepPreferences.findWhat = numFrame.texts[0].contents;
numFrame.remove();
indx = 0;
story.characters.itemByRange(insPosition, storyEnd).select();
rz = app.selection[0].findGrep(); 
if (rz.length == 0) {
    win.text = "?";
    return;
    }
win.text = rz.length + "*";
rz[indx].select();
pn = 1;
app.activeWindow.activePage = app.selection[0].parentTextFrames[0].parentPage; 
app.activeWindow.zoomPercentage = 200;
} // searchButton.onClick 
///
win.onClose = function () { // win.onClose
app.findGrepPreferences = app.changeGrepPreferences = null;    
buttonForBufferFile.open("w");
buttonForBufferFile.writeln(win.location[0]);
buttonForBufferFile.writeln(win.location[1]);
buttonForBufferFile.close();
app.activate();
} // win.onClose
///
win.show();
///////////////////
function myGetScriptPath() {
	try{
		return app.activeScript;
	}
	catch(myError){
		return File(myError.fileName);
	}
} //myGetScriptPath()


    