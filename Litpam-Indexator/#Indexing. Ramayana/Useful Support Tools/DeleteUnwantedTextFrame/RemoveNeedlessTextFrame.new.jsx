// RemoveNeedlessTextFrame.jsx

/*
    CS6+ (на более ранних версиях не проверялось)
    В процессе вёрстки иногда появляются фреймы сзади рабочих текстовых фреймов.
    Маркер # в левом верхнем углу указывает, что это свободный текстовый фрейм.
    Обычно это дубликаты фреймов, имеющихся на мастер-странице, и иногда эти фреймы отсоединяются от мастер-страницы и просто стоят за рабочими текстовыми боксами.
    Они бесполезны и  отвлекают внимание. Но чтобы убрать их штатными средствами, надо сделать много передвижений рабочих фреймов.
    Совершенно ненужное занятие, да ещё и ошибиться можно, возвращая фреймы обратно.
    Лучше поручить решение этой задачи скрипту.
    Два варианта обработки:
    - если курсор в тексте, то работа со страницей, на которой курсор
    - если есть выделенный текст, то с страницами выделенного текста.
    
   Скрипт ищет на странице принадлежащий мастер-странице пустой фрейм с такими же габаритами, как у текстового фрейма, в котором курсор, отсоединяет его от мастер-страницы и удаляет.
   Потом ищет на странице текстовый фрейм тоже с такими же габаритами, и если в нем нет текста, он будет удалён.
    Сопоставление габаритов фреймов выполняется с поправкой delta, по умолчанию она равна единице.
    
    Программа выведет на экран сообщение о результате работы, если переменная showRez равна true.
         
    © Михаил Иванюшин, 2021.  | dotextok@gmail.com  |  https://dotextok.ru
   
*/

var showRez = true; // true - выводится на экран сообщение о результате работы. Сделайте эту переменную false, когда оно надоест.

//////////////////////
var ProgressBar = function(title) {
var w = new Window('palette', title, {x:0, y:0, width:840, height:60},{closeButton: true}),
pb = w.add('progressbar', {x:20, y:32, width:800, height:12}),
st = w.add('statictext', {x:20, y:12, width:800, height:20});
st.justify = 'left';
w.center();
this.reset = function(msg,maxValue) {
st.text = msg;
pb.value = 0;
pb.maxvalue = maxValue;
w.show();
w.update();
};
this.info = function(msg) {
  st.text = msg;
  w.show();
  w.update();
};
this.hit = function() {++pb.value; w.update();};
this.hide = function() {w.hide();};
this.close = function() {w.close();};
} // ProgressBar
/////////////////////////////

var programTitul = "Удаление ненужных текстовых фреймов";
var delta = 1; // поправка на несовпадение округлённых до целого числа размеров текстового фрейма, в котором курсор, и бесполезного текстового фрейма с мастер-страницы
var mf = 0; // число ненужных фреймов, находящихся на мастер-странице
var pf = 0;  // число ненужных фреймов, находящихся на странице вёрстки
var infoText = "    В процессе вёрстки иногда появляются фреймы сзади рабочих текстовых фреймов.\n    Маркер # в левом верхнем углу указывает, что это свободный текстовый фрейм.\n    Обычно это дубликаты фреймов, имеющихся на мастер-странице, и иногда эти фреймы отсоединяются от мастер-страницы и просто стоят за рабочими текстовыми боксами.\n    Они бесполезны и  отвлекают внимание. Но чтобы убрать их штатными средствами, надо сделать много передвижений рабочих фреймов. Совершенно ненужное занятие, да ещё и ошибиться можно, возвращая фреймы обратно.\n    Лучше поручить решение этой задачи скрипту.\n    Два варианта обработки:\n    - если курсор в тексте, то работа со страницей, на которой курсор\n    - если есть выделенный текст, то с страницами выделенного текста.\n    \n   Скрипт ищет на странице принадлежащий мастер-странице пустой фрейм с такими же габаритами, как у текстового фрейма, в котором курсор, отсоединяет его от мастер-страницы и удаляет. Потом ищет на странице текстовый фрейм тоже с такими же габаритами, и если в нем нет текста, он будет удалён.\n    Сопоставление габаритов фреймов выполняется с поправкой delta, по умолчанию она равна единице.\n    \n    Программа выведет на экран сообщение о результате работы, если переменная showRez равна true.\n\nСкрипт работает в версиях индизайна CS6+ (на более ранних версиях программа просто не проверялась, т.к. не на чем, но расхождение в определении страницы в версиях CS4 и дальше до CS6, в коде есть, так что, возможно, что и в этих версиях будет работать.).\n         \n....................................................\n© Михаил Иванюшин, 2021\ndotextok@gmail.com  |  https://dotextok.ru";

 if (app.documents.length == 0) {
    alert("Нет открытых документов.",programTitul);
    exit();
    }
var myDoc = app.activeDocument;   
var parseIntAppVersion = parseInt (app.version);
if (parseIntAppVersion < 6) { // app.version
	alert ("Этот скрипт предназначен для обработки текста в InDesign CS6+, возможно, будет и в CS4+, но это не проверялось.");
    exit();
    } // app.version
var mySel = app.selection[0];
if(mySel == null) {  
    alert(infoText, programTitul);
    exit();
    }
if (mySel.hasOwnProperty("pointSize") != true) {
    alert("Надо выделить текст для обработки, если курсор в строке, то будет проверен только фрейм этой страницы. \rЕсли ничего не выбрано, то на экран будет выведена справка о программе.",programTitul); 
    exit();
    }
var story = mySel.parentStory;
if ( mySel.constructor.name == "InsertionPoint") { // InsertionPoint
var tF = mySel.parentTextFrames[0].id;
var iRez = procTextFrame(story, tF);
myDoc.recompose();
app.activeWindow.zoom (ZoomOptions.fitPage);
if (iRez == 0) { 
    alert("Курсор в фрейме на рабочем столе, а не на странице.",programTitul); 
    exit();
    }
if (showRez) rezInfo("p");
app.documents[0].select(NothingEnum.nothing);
exit();
}  // InsertionPoint
else { // text is selected
    var begin = [];
    var end = [];
    while (begin.length > 0) begin.shift();
    while (end.length > 0) end.shift();
    var start = mySel.characters[0].index;
    var finish = mySel.characters[-1].index;
    pBar = new ProgressBar(programTitul); 
    pBar.reset("1/2 Подготовка массива идентификаторов текстовых фреймов", story.textContainers.length);
    for (var i = 0; i < story.textContainers.length; i++, pBar.hit()) { // i++
        var tc = story.textContainers[i];
        if (tc.characters.length == 0) continue; // 12.10.2021
        begin[i] = tc.lines[0].characters[0].index;
        end[i] = tc.lines[-1].characters[-1].index;    
        } // i++

    pBar.close();
    var tfa = [];
    var save = false;
    while (tfa.length > 0) tfa.shift();
    for (var i = 0; i < begin.length; i++) { // i++
        var st = begin[i];
        var fn = end[i];
        var id = story.textContainers[i].id;
        if ((st <= start) && (start <= fn)) { save = true; }
            if (save) { tfa.push(id); }
      if ((st <= finish) && (finish <= fn)) { save = false; }
        } // i++
    if (tfa.length == 0) {
        alert("Ошибка выполнения программы. [3]", programTitul); // не сохранён ни один id фрейма
        exit();
        }
    pBar.reset("2/2 Просмотр текстовых фреймов", tfa.length);    
    for (var i = 0; i < tfa.length; i++, pBar.hit()) { // i++
        var tfID = tfa[i];
        var r = procTextFrame(story, tfID);
        if (r == -1) {
            pBar.close();    
            alert("Ошибка выполнения программы. [2]", programTitul); // не найден фрейм, id которого сообщён
            exit();
            }
        } // i++
    pBar.close();
    myDoc.recompose();
    app.activeWindow.zoom (ZoomOptions.fitPage);    
   if (showRez) rezInfo("s");
   app.documents[0].select(NothingEnum.nothing);
   exit();
   } // text is selected
////////////    
function procTextFrame(story, id) { // procTextFrame 
var tF = story.textFrames.itemByID(id);
if (tF.isValid == false) {
    return -1; // не найден фрейм, id которого сообщён
    }
var tfGB = tF.geometricBounds;
tfGB[0] = tfGB[0].toFixed(0); // округление до целой части (это, скорее, отбрасывание дробной части числа)
tfGB[1] = tfGB[1].toFixed(0);
tfGB[2] = tfGB[2].toFixed(0);
tfGB[3] = tfGB[3].toFixed(0);
var page;
if (parseIntAppVersion > 6) { page = tF.parentPage; };
else { page = tF.parent; }
if (page == null) { 
   return 0; // курсор в фрейме на рабочем столе, а не на странице
    }
// сначала проверим текстовые фреймы мастер-страницы...
var mpItems = page.masterPageItems;
for (var i = mpItems.length-1; i >= 0 ; i--) { // i--
    var item = mpItems[i];
    if (item.constructor.name != "TextFrame") continue;
    if (item.texts[0].isValid == false) continue;
    var itemGB = item.geometricBounds;
    itemGB[0] = itemGB[0].toFixed(0); // Y верх
    itemGB[1] = itemGB[1].toFixed(0); // Х верх
    itemGB[2] = itemGB[2].toFixed(0); // Y низ  
    itemGB[3] = itemGB[3].toFixed(0); // Х низ 
    var cnt = "";
    if (item.texts[0].length > 0) cnt = "+"; else cnt = "-";           
    if ((cnt == "-") && (Math.abs(tfGB[1] - itemGB[1]) <= delta /* Xt */ && Math.abs(tfGB[3] - itemGB[3]) <= delta /* Xb */) || (Math.abs(tfGB[0] - itemGB[0]) <= delta /* Yt */) || (Math.abs(tfGB[2] - itemGB[2]) <= delta /* Yb*/)) { // cnt == "-"  
        var removedItem = item.override(page); // отсоединяем...
        removedItem.remove(); // ...удаляем. Если не отсоединить, то будет удален текстовый фрейм и на мастер-странице.    
        mf++;
        } // cnt == "-"
    } // i--
// ... теперь исследуем обычные текстовые фреймы
var pageTextFrames = page.textFrames;
if (pageTextFrames.length > 1) { // > 1
    for (var i = pageTextFrames.length-1; i >= 0 ; i--) { // i--
    var ptf = pageTextFrames[i];
    if (ptf.texts[0].length > 0) continue; // 12.10.2021
    if (ptf.id == id) continue;
    var ptfGB = ptf.geometricBounds;
    ptfGB[0] = ptfGB[0].toFixed(0);
    ptfGB[1] = ptfGB[1].toFixed(0);    
    ptfGB[2] = ptfGB[2].toFixed(0);   
    ptfGB[3] = ptfGB[3].toFixed(0);      
    var cnt = "";
    try { var tl = ptf.texts[0].length; } catch (e) { continue; } // если в пространстве одного из контейнеров есть группа, то эта проверка позволяет пройти такую ситуацию. Решение найдено методом проб и ошибок.
    if (ptf.texts[0].length > 0) cnt = "+"; else cnt = "-";   
   // if ((cnt == "-") && (Math.abs(tfGB[1] - ptfGB[1]) <= delta /* Xt */ && Math.abs(tfGB[3] - ptfGB[3]) <= delta /* Xb */) || (Math.abs(tfGB[0] - ptfGB[0]) <= delta /* Yt */) || (Math.abs(tfGB[2] - ptfGB[2]) <= delta /* Yb*/)) { // cnt == "-"          
    // 12.10.2021   
   if ((cnt == "-") && (Math.abs(tfGB[1] - ptfGB[1]) <= delta /* Xt */ && Math.abs(tfGB[3] - ptfGB[3]) <= delta /* Xb */) && (Math.abs(tfGB[0] - ptfGB[0]) <= delta /* Yt */) && (Math.abs(tfGB[2] - ptfGB[2]) <= delta /* Yb*/)) { // cnt == "-"                  
        ptf.remove();
        pf++;
        } //  // cnt == "-"  
    } // i--
} // > 1
return 1;
}  // procTextFrame
////
function rezInfo(i) { // rezInfo
var place = "";    
if (i == "p") place = " на странице";
if (i == "s") place = " в выделенной области";
var text1 = "Что найдено и удалено" + place;
var text2 = ":\rфреймы с мастер-страницы | обычные текстовые фреймы : " + mf+ " | " + pf + ".";
alert (text1+text2, programTitul);
} // rezInfo
