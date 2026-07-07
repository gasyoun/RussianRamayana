//  UpdateNameList.jsx

/*   
Справка на кнопке [ ? ]
*/

// © Михаил Иванюшин, 2023  |  dotextok@gmail.com  |  https://dotextok.ru

#targetengine "UpdateNameList"
#include "../../ForIndex.jsxinc"

app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll; // см. http://adobeindesign.ru/2008/10/24/restore-ui/

var programTitul = "Обновление именного указателя";
if (app.documents.length == 0) {
    alert("Нет открытых документов.", programTitul);
    exit();
    }
if (app.documents.length != 2) {
   alert("Для работы скрипта должны быть открыты два файла — с приведённым в порядок указателем, и с таблицей-двухколонником, в которой первая колонка — первый вариант списка людей, где вместо имён инициалы, а вторая колонка — фамилии с именами и отчествами.", programTitul);  
    exit();
    }
var storyID;
var fileName;
var leftData = [];
var rightData = [];
var notFound = [];
//////////////
var win = new Window ("palette", programTitul);
win.alignChildren = ["fill", "fill"];
var inTableStart =  "Поставьте курсор в текст таблицы и установите флажок";
var inTableOK = "Таблица с новыми данными выбрана";
var inTable = win.add("checkbox", undefined, inTableStart);
inTable.value = false;
inTable.enabled = true;
var inListStart = "Поставьте курсор в текст указателя и установите флажок";
var inListOK = "Текст указателя указан";
var inList = win.add("checkbox", undefined, inListStart); 
inList.value = false;
inList.enabled = false;
separator1 = win.add ("panel");
separator1.minimumSize.height = separator1.maximumSize.height = 1;
var buttonsGroup = win.add("group");
buttonsGroup.orientation = "row";
buttonsGroup.alignChildren = ["center", "center"];
var buttonSize = [0,0,150,28];
var action = buttonsGroup.add("button", buttonSize,  "Заменить список");
action.enabled = false;
var info = buttonsGroup.add("button", [0,0,28,28],  "?");
var reset = buttonsGroup.add("button", buttonSize,  "Отменить выборку");
reset.enabled = false;
///
info.onClick = function () { // info.onClick
var textInfo = "\nИногда автор или редактор даёт в работу указатель, в котором нет полных имён-отчеств. Только инициалы. Возможно, нужно время на их уточнение. Конечно, для начала работы с указателем достаточно иметь только фамилии, но потенциально есть опасение, что будет потеря времени на внесение правки, если появится новый список людей с полными именами после того как указатель уже полностью готов.\nЧтобы не тратить время на ручной ввод текста, сделан этот скрипт.\n\nНужна таблица-двухколонник.\nВ левой колонке фамилии с инициалами, как они есть сейчас в подготовленном указателе.\nВ правой колонке фамилии с полными именами.\nСкрипт в строках указателя найдёт все случаи, имеющиеся в левой колонке, и заменит их на текст из правой.\nПеред началом обработки выполняется проверка — первые слова в соседних ячейках должны совпадать, поскольку предполагается, что это фамилии.\n\nВ конце обработки будет выведено сообщение о результате.\nЕсли какие-то строки не найдены, они будут помещены в файл \"@notFound.txt\", он в той же папке, где указатель.\n\nКлавишами Ctrl+Z можно вернуть состяние указателя к тому, что было до запуска этого скрипта.\n\nhttps://dotextok.ru\n";
var wn = new Window ("dialog", programTitul);
var data = wn.add("edittext", [0, 0, 850, 300], textInfo, {multiline: true});
wn.layout.layout();
wn.show();
return;
} // info.onClick
////
inTable.onClick = function () { // inTable.onClick
var sel = app.selection[0];
if (sel == null  || sel.constructor.name != "InsertionPoint" || sel.parent.constructor.name != "Cell" ) {
    inTable.value = false;
    alert("Курсор должен быть в ячейке таблицы.", programTitul);
    return; 
    }
var table = sel.parent.parent;
if (table.columns.length != 2) {
    inTable.value = false;
    alert("В таблице должно быть две колонки.", programTitul);
    return;     
    }
while (leftData.length > 0) leftData.pop();
while (rightData.length > 0) rightData.pop();
var pBar = new ProgressBar(programTitul);
pBar.reset("Проверяем информацию из выбранной таблицы и сохраняем её", table.rows.length);
var leftCont = "";
var rightCont = "";
for (var i = 0; i < table.rows.length; i++, pBar.hit()) { // i++
    leftCont = table.rows[i].cells[0].texts[0].contents;
    rightCont = table.rows[i].cells[1].texts[0].contents;  
    if (leftCont.length == 0 || rightCont.length == 0) {
        inTable.value = false;
         table.rows[i].select();
        alert("В таблице не должно быть пустых ячеек. Проблемная строка выделена.", programTitul);
        return;
        }
    if (table.rows[i].cells[0].texts[0].words[0].contents != table.rows[i].cells[1].texts[0].words[0].contents) {
        inTable.value = false;
         table.rows[i].select();
        alert("Первые слова соседних ячеек в строке должны совпадать, предполагается, что это фамилии. Проблемная строка выделена.", programTitul);
        return;        
        }
    leftData.push(leftCont);
    rightData.push(rightCont);  
    } // i++
pBar.close();
// в результате в массиве leftData[] собраны все начальные термины, а в массиве rightData []  -- все новые термины.
inTable.text = inTableOK;
inTable.enabled = false;
inList.enabled = true;
reset.enabled = true;
app.activeDocument = app.documents[1];
} // inTable.onClick
///
inList.onClick = function () { // inList.onClick   
var noName = false;
try { var myDocPath = app.documents[0].filePath; } // если документ не сохранён, маршрут не сообщается
catch(e) {
   alert("Это только что созданный и ещё ни разу не сохранённый файл.\nДайте ему имя.",programTitul);   
   noName = true;
    }
if (noName) { // noName
    try { app.documents[0].save(); }
    catch (e) {
         alert("Файл не был сохранён с новым именем");
        win.close();
        app.activate();
        exit();
        }
    } // noName
///
var sel = app.selection[0];
if (sel == null  || sel.constructor.name != "InsertionPoint" ) {
    inList.value = false;
    alert("Курсор должен быть в тексте указателя.", programTitul);
    return; 
    }
storyID = sel.parentStory.id;
fileName = decodeURI(app.activeDocument.name);
inList.text = inListOK;
inList.enabled = false;
action.enabled = true;
} // inList.onClick
///
reset.onClick = function () { // reset.onClick
inTable.value = false;
inList.value = false;
inList.text = inListStart;
inTable.text = inTableStart;
inList.enabled = false;
inTable.enabled = true;
action.enabled = false;
reset.enabled = false;
} // reset.onClick
///
action.onClick = function () { // action.onClick
var sel = app.selection[0];
if (sel == null || sel.constructor.name != "InsertionPoint") {
    inList.value = false;
    alert("Курсор должен быть в тексте указателя.", programTitul);
    return; 
    }
if (decodeURI(app.activeDocument.name) != fileName) {
        alert("Что-то пошло не так, сейчас активна не та работа, что была указана как файл указателя. Повторите выборку файлов снова.", programTitul);
        win.close();
        app.activate();        
        exit();
        } 
if (sel.parentStory.id != storyID) {
        alert("Курсор в другом материале файла указателя.", programTitul);
        return;
        } 
app.doScript(procCells, ScriptLanguage.JAVASCRIPT, [], UndoModes.FAST_ENTIRE_SCRIPT, 'procCells'); 
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
win.close();
app.activate(); 
if (notFound.length == 0) {
    alert("Все строки таблицы найдены и заменены.", programTitul);
    exit();     
    }
else { // notFound
    var fName = "@notFound.txt";
    var jobFolder = decodeURI(app.activeDocument.filePath);
    var myFilePath = decodeURI(jobFolder + "/" + fName); 
    var rezFile = new File (myFilePath);
    rezFile.open("w");
    rezFile.encoding = "utf8";
    notFound.reverse(); // реверс потому что идем от конца к началу, а показывать ненайденное надо в том порядке, что в исходном файле
    for (i = 0; i < notFound.length; i++) { rezFile.writeln(notFound[i]); }
    rezFile.close();
    alert("Ненайденные строки собраны в файле\n" + fName + ",\nон в той же папке, где указатель.", programTitul);
    exit();
    } // notFound
} // action.onClick
///
function procCells() { // procCells
var story = app.selection[0].parentStory;    
var leftContent = "";
var rightContent = "";
var pBar = new ProgressBar(programTitul);
pBar.reset("Обновляем именной указатель. Движение от конца к началу", leftData.length);
for (i = leftData.length-1; i >= 0 ; i--, pBar.hit()) { // i--
    leftContent = leftData[i];
    leftContent = leftContent.replace("\\.", "\\.\\h*", "g"); 
    leftContent = leftContent.replace("\\(", "\\(", "g");
    leftContent = leftContent.replace("\\)", "\\)", "g");
    leftContent = leftContent.replace("\\s+", " ", "g"); 
    leftContent = leftContent.replace("\\* ", "*", "g");     
    rightContent = rightData[i];
    app.findGrepPreferences = NothingEnum.nothing;
    app.changeGrepPreferences = NothingEnum.nothing;
    app.findChangeGrepOptions.includeFootnotes = false;
    app.findGrepPreferences.findWhat = "^" + leftContent;
    app.changeGrepPreferences.changeTo = rightContent + " "; // может быть, этот добавляемый пробел и лишний
    var rez = story.changeGrep(); 
    if (rez.length == 0) {
        notFound.push(leftData[i]);
        continue;
        }
    var chStyle = rez[0].texts[0].characters[0].appliedCharacterStyle;
    rez[0].texts[0].characters.itemByRange(0, rightContent.length-1).appliedCharacterStyle = chStyle;
    } // i--
pBar.close();   
} // procCells
///
win.show();
/////////////////////