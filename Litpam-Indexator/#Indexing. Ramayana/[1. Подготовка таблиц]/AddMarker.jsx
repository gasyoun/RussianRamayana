//  AddMarker.jsx

#targetengine "AddMarker"
#include "../ForIndex.jsxinc"


// © Михаил Иванюшин, 2023  |  dotextok@gmail.com  |  dotextok.ru

app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll; // см. http://adobeindesign.ru/2008/10/24/restore-ui/

// буквы для маркировки терминов разных указателей
//var markLetters = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];

var m1value = markLetters[0];
var m2value = markLetters[1];
var m3value = markLetters[2];
var m4value = markLetters[3];
var m5value = markLetters[4];
var m6value = markLetters[5];
var m7value = markLetters[6];
var m8value = markLetters[7];
var m9value = markLetters[8];

var programTitul = "Маркеры для разных указателей";
if (app.documents.length == 0) {
    alert("Нет открытых документов.", programTitul);
    exit();
    }
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
        exit(); 
        }
    }
var doc = app.activeDocument;
var docFullName = doc.fullName;
var nameArr = [];
while (nameArr.length != 0) nameArr.pop();
nameArr = doc.name.split("IndexList");
if (nameArr.length != 2) {
     alert("Предполагается, что будет обрабатываться файл, имя которого выглядит так: IndexList-nnn.indd, но открытый файл этому критерию не соответствует.",programTitul);
    exit();     
    }
if (nameArr[1][0] != "-") {
     alert("Если в имени файла после 'IndexList' идёт дефис, то это признак, что данному файлу маркер ещё не назначен. Но в данном случае дефис не найден, похоже, что этот файл уже имеет маркер.",programTitul);
    exit();     
    }
var sel = app.selection[0];
if (sel == null || (sel.parent.constructor.name != "Cell" || sel.parent.parentColumn.index != 0)) {
    alert("Курсор должен быть в левой колонке таблицы.", programTitul);
    exit();
    }
var endName = nameArr[1].substring(1, nameArr[1].length);
///
var win = new Window ("palette", programTitul);
win.alignChildren = ["fill", "fill"];
var buttonSize = [0, 0, 300, 28];
win.add("statictext", undefined, "Маркеры для терминов этого варианта указателя");
var markerGroup = win.add("group");
markerGroup.orientation = "row";
markerGroup.alignChildren = ["left", "bottom"];
var m1 = markerGroup.add("radiobutton", undefined, m1value);
m1.value = true;
var m2 = markerGroup.add("radiobutton", undefined, m2value);
var m3 = markerGroup.add("radiobutton", undefined, m3value);
var m4 = markerGroup.add("radiobutton", undefined, m4value);
var m5 = markerGroup.add("radiobutton", undefined, m5value);
var m6 = markerGroup.add("radiobutton", undefined, m6value);
var m7 = markerGroup.add("radiobutton", undefined, m7value);
var m8 = markerGroup.add("radiobutton", undefined, m8value);
var m9 = markerGroup.add("radiobutton", undefined, m9value);
separator = win.add ("panel");
separator.minimumSize.height = separator.maximumSize.height = 1;
var buttons = win.add("group");
markerGroup.orientation = "row";
buttons.alignChildren = ["center", "center"];
var mOK = buttons.add("button", buttonSize, "Маркер выбран");
var info = buttons.add("button", [0,0,28,28], "?");
///
mOK.onClick = function () { // mOK.onClick 
var sel = app.selection[0];
if (sel == null || (sel.parent.constructor.name != "Cell" || sel.parent.parentColumn.index != 0)) {
    alert("Курсор должен быть в левой колонке таблицы.", programTitul);
    return;
    }
var marker = m1value;
if (m2.value) marker = m2value;
if (m3.value) marker = m3value;
if (m4.value) marker = m4value;
if (m5.value) marker = m5value;
if (m6.value) marker = m6value;
if (m7.value) marker = m7value;
if (m8.value) marker = m8value;
if (m9.value) marker = m9value;
var pBar = new ProgressBar(programTitul);
pBar.reset("Добавляем маркер и дефис в начало каждого термина", sel.parent.parentColumn.rows.length);
for (var c = 0; c < sel.parent.parentColumn.rows.length; c++, pBar.hit()) { // c++
    sel.parent.parentColumn.rows[c].cells[0].contents = marker + "-" + sel.parent.parentColumn.rows[c].cells[0].contents;
    } // c++
pBar.info("В имени файла между 'IndexList' и номером вместо дефиса будет маркер в квадратных скобках.");
var newName = "IndexList[" + marker + "]" +  endName;
doc.close(SaveOptions.YES);
File(docFullName).rename(newName);
pBar.close();
win.close();
alert("Маркер '" + marker + "' и дефис добавлен перед каждым термином в левой колонке. Файл сохранён с именем '" + newName + "'.", programTitul);
app.activate();
exit();
} // mOK.onClick 
///
info.onClick = function () { // info.onClick 
var infoText = "В документации к индизайну https://helpx.adobe.com/ru/indesign/using/creating-index.html\nрусским по-белому сказано, что «В документе или книге можно создать только один указатель.»\nНо иногда их надо иметь несколько. Например, в одном издании требуются именной и географический указатели.\n\nУпомянутое ограничение индизайна можно обойти, добавляя маркеры к терминам, относящимся к разным указателям. Решено ставить перед терминами строчные латинские буквы и отделять от термина дефисом. Текущий набор букв задан в ForIndex.jsxinc (markLetters):  a  b  c  d  e  f  g  h  i .\n\nМаркеры добавляются не перед словами в документе, а в инструментарий формирования предметного указателя.\nПри обработке словника указателя программа 'TextToTable.jsx' создаёт файл с таким вариантом имени: IndexList-nnn.indd, тут nnn — это порядковый номер файла. \nТакой файл был открыт перед запуском используемого сейчас скрипта, и этот скрипт поместит выбранный маркер и дефис в начало каждой строки. Имя файла тоже изменится: перед номером вместо дефиса будет выбранный маркер в квадратных скобках. Например, открыт файл IndexList-001.indd. При выборе маркера d название этого файла станет IndexList[d]001.indd.\n\nПри обработке документа программой ' ProcStoryOrDoс.jsx' будет создан цвет для окрашивания найденных терминов текущего указателя. Название цвета будет начинаться с 'IndexColor', и в нём будут маркер и номер файла, например, 'IndexColor-[d]001'.\nПо умолчанию это красный цвет в формате RGB.\n\nGREP-запросы для терминов готовит программа 'GetInfoForSearch.jsx', она работает, когда активен файл, название которого начинается с 'IndexList'.  Эта программа проверяет наличие маркера в названии файла, и если он есть, то при генерации grep-запроса она убирает из термина маркер и дефис.\n\nИндизайн на основе имеющихся терминов соберёт свой единственный указатель, но поскольку термины разных указателей начинаются с неодинаковых знаков, то это обусловит, что даже в формально одном указателе термины с совпадающими маркерами будут собраны вместе. Для удаления маркеров можно использовать grep-запрос со строкой поиска ^[a-i]- , в поле замены ничего нет. И потом понадобится уже определённая работа по оформлению этих указателей.\n\nПосле обработки файлов словников всех указателей в документе будет очень много цветовой разметки, но ей можно управлять: сделайте на время все IndexColor-цвета чёрными, кроме того цвета, что относится к указателю, с которым сейчас будет работа.\n\n";
alert(infoText, programTitul);
} // info.onClick 
///
win.show();
/////////////////////////////////////
