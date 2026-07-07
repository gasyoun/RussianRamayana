// #FindNextTag.jsx

/*
Программа Находит в тексте очередной тег, начиная с той позиции, где сейчас курсор, выделяет абзац над ним, и берёт его в буфер.

// © Михаил Иванюшин, 2023  |  dotextok@gmail.com  |  dotextok.ru

*/

#targetengine "FindNextTag"

app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll; // см. http://adobeindesign.ru/2008/10/24/restore-ui/

var programTitul = "Поиск очередного тега";
if (app.documents.length == 0) {
    alert("Нет открытых документов.", programTitul);
    exit();
    }
var textForBuffer = "";
var indx;
var rz;
var winLocation = [-1, -1];
var myScriptFile = myGetScriptPath();
var findButton  =  "FindNextTag.ini"; 
var myScriptFolder = decodeURI(myScriptFile.path);
var findFilePath = decodeURI(myScriptFolder + "/sets/" + findButton); 
var buttonForBufferFile = new File (findFilePath);
if (buttonForBufferFile.exists) { //File.exists
    buttonForBufferFile.open("r");
    winLocation[0] = buttonForBufferFile.readln();
    winLocation[1] = buttonForBufferFile.readln();
    buttonForBufferFile.close();
    } //File.exists
var win = new Window ("palette", ">*<");
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
if ((sel == null) || (sel.hasOwnProperty("pointSize") != true)) { // == null    
    alert("Поставьте курсор в текст.",programTitul);
    return;    
    } // == nul
var selLength = sel.length;
var sindx = sel.index;
sel.parentStory.insertionPoints[sindx + selLength+3].select();
sel = app.selection[0];
var story = sel.parentStory;
var insPosition = sel.index;
var storyEnd = story.length-1;
story.characters.itemByRange(insPosition, storyEnd).select();
app.findGrepPreferences.findWhat = "#[^\}]+\}";
var rz = app.selection[0].findGrep(); 
if (rz.length == 0) {
   alert("Тег не найден");
    return;
    }
var prevParaIndex = rz[0].index;
prevParaIndex = prevParaIndex-2;
story.characters[prevParaIndex].paragraphs[0].select();
app.copy();
app.activeWindow.activePage = app.selection[0].parentTextFrames[0].parentPage; 
//app.activeWindow.zoomPercentage = 200;
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
////////////////////
function myGetScriptPath() {
	try{
		return app.activeScript;
	}
	catch(myError){
		return File(myError.fileName);
	}
} //myGetScriptPath()


    