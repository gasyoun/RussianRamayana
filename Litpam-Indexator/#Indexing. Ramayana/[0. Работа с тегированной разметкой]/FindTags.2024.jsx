// FindTags.jsx

/*
Должно быть открыто два файла — файл вёрстки и текстовый файл с тегированной разметкой.
В файле вёрстки в группе 'Index styles' должны быть собраны все предлагаемые символьные стили. ???? - 

Если в тегированном файле есть абзацы с номерами страниц, например, такие, -8-, -77- и пр,, их надо удалить перед началом работы.
Также надо в этом файле заменить три идущие подряд точки на многоточие. (\.\.\.=>  ~e)
В тегированном файле все символы, попавшие в тегирование -- ищутся grep-запросом #[^\}]+\} -- должны быть окрашены цветом 'TagsColor'.

В файле вёрстки для случая {nil} должен быть цвет nilColor
// Также в этом файле надо до запуска этого скрипта создать цвет 'IndexStylesColor', это имя в переменной usedColor в файле  ????

Два этапа работы пограммы.
I. Программа работает с тегированным файлом.
Ищутся и сохраняются для использования в файле вёрстки
а) искомый термин
б) символьный стиль, которым этот термин будет обработан
в) фрагмент текста в файле вёрстки, который надо найти в файле вёрстки, чтобы потом в нём искать термин, сохранённый в п. (а)

В тегированном файле ищем очередной тегированный блок разметки, например:
#великий риши{Нарада\великий риши}
#потомок рода Икшваку{Рама_1\потомок Икшваку}
#Хранитель мира{nil}

Допустим, работа с #великий риши{Нарада\великий риши}

1) тег в фигурных скобках {Нарада\великий риши} - сохраняем его. Это название символьного стиля для оформления текста 'великий риши' в файле вёрстки.
2) сохраняем искомый текст -- великий риши
3) Теперь надо в тегированном тексте найти текст -- 40 знаков перед знаком #, который стоял перед искомым текстом, в нашем случае это 'великий риши',
и 40 знаков после закрывающей фигурной скобки. 
Просто так их взять бесполезно, т.к. в них могут тоже быть теги. То что могут быть теги -- не проблема, главное, чтобы граница 40 знаков не попала внуть строки тегов.
Для контроля этой ситуации используется окрашивание символов в строках тегов цветом TagsColor.
Текст до: 
в области перед знаком # и начиная от знака со смещением -40 ищется закрывающая фигурная скобка, окрашенная цветом TagsColor. 
Если скобки нет, то весь текст от знака -40 до знака перед # будет текстом перед термином ("текст до").
Если скобка найдена, то текстом перед термином будет текст, начиная со знака после последней фигурной скобки среди найденных и знака перед #.
Текст после:
в области после закрывающей фигурной скобки и знака со смещением +40 ищется #, окрашенный цветом TagsColor.
Если он не найден, то эта область поиска становится полнымтекстом после термина ("текст после").
Если знак обнаружен, то будет искаться два текста:
а) первым текстом после термина ("текст после_1") будет область от знака после закрывающей фигурной скобки до знака перед найденным #.
б) в этой же области ищется открывающая фигурная скобка, окрашенная TagsColor, и текст после #  до найденной открывающей фигурной скобки будет "текст после_2".
После этого тексты объединяются: "текст после" = "текст после_1" + "текст после_2"
В результате строка "полный текст для поиска" = "текст до" + "искомый текст" + "текст после" будет тем текстом, который надо найти в файле вёрстки, чтобы потом найти в нём искомый текст и отметить его символьным стилем.
Сохраняем 'полный текст для поиска'.

II. Работа с файлом верстки.
Для работы собраны все ситуации 'полный текст для поиска' - текст, который должен быть в этом фрагменте -- 'искомый текст' и название символьного стиля оформления имкомого текста.
Проверяем -- есть ли символьный стиль для оформления этого текста. Если нет, то создаем его.
1) ищем 'полный текст для поиска', если не найдено, сохраняем этот текст для помещения в файл отчёта об ошибках.
Если найден, то ищем в нём 'искомый текст'. Если не найден, то сохраняем этот текст для помещения в файл отчёта об ошибках.
В случае, если символьный стиль 'nil', окрашиваем искомый текст цветом nilColor.
Если текст найден, оформляем его указанным символьным стилем.

ЭТА ПРОГРАММА РАБОТАЕТ С ОТДЕЛЬНОЙ СТАТЬЁЙ.  ВАЖНО ОБЪЕДИНИТЬ ВСЕ МАТЕРИАЛЫ В ОДИН ПОТОК, ПРЕЖДЕ ЧЕМ НАЧАТЬ ПРОВЕРКУ.

*/

// © Михаил Иванюшин, 2023, 2024  |  dotextok@gmail.com  |  dotextok.ru

#targetengine "FindTags"
#include "../ForIndex.jsxinc"

app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll; // см. http://adobeindesign.ru/2008/10/24/restore-ui/

var programTitul = "Работа с тегированным текстом";
if (app.documents.length == 0) {
    alert("Нет открытых документов.", programTitul);
    exit();
    }
if (app.documents.length != 2) {
   alert("Для работы скрипта должны быть открыты два файла — файл тегированной разметки, и файл вёрстки.", programTitul);  
    exit();
    }
var TagsColor = "TagsColor";
var nilColor = "SkipTheWord"; 
var jobFileID, jobStoryID, jobPath;
var tagFileID, tagStoryID, tagPath;
var styleNames = [];
var found;
var selPara;
var foundIndex, foundEndIndex, selParaIndex, selParaEndIndex;
var delta = 40; // столько знаков до и после найденного текста будут определять размер текста поиска
var deltaTmp;
var textBeforeRaw = ""; // текст delta знаков до найденноготекста
var textAfterRaw = ""; // текст delta знаков сразу после найденноготекста
var textBefore = ""; // обычно это textAfterRaw, но если в textAfterRaw есть теги, то textBefore будет без этих тегов.
var textAfter = ""; // обычно это textAfterRaw ...
var textForSearch = "";
var styleName = "";
var curParaForSearch = "";
var prevPara;
var prevParaText = "";
var nextPara;
var nextParaText = "";
var fsB, fsA;
var foundP, foundN;
var taggedSample = []; // строка разметки тегами
var sampleForSearch = []; // тут будут храниться образцы текста, которые надо оформить символьным стилем
var stylesForSamples = []; // тут названия символьных стилей для каждого образца
var theTextForSearch = []; // тут большая строка поиска, в которой есть образец искомого текста
//var sameTextForSearch = {}; // ассоциативный массив для проверки, нет ли сделанной ранее такой же строки для theTextForSearch
while (taggedSample.length > 0) taggedSample.pop();
while (sampleForSearch.length > 0) sampleForSearch.pop();
while (stylesForSamples.length > 0) stylesForSamples.pop();
while (theTextForSearch.length > 0) theTextForSearch.pop();
///
var win = new Window ("palette", programTitul);
app.toolBoxTools.currentTool = UITools.TYPE_TOOL;
win.alignChildren = ["fill", "fill"];
var jobStart = "Поставьте курсор в текст вёрстки и установите флажок";
var jobOK = "Файл вёрстки выбран";
var job = win.add("checkbox", undefined, jobStart); 
job.value = false;
var tagsStart = "Выделите текст с тегированной разметкой и установите флажок";
var tagsOK = "Файл с тегами выбран";
var tags = win.add("checkbox", undefined, tagsStart);
tags.helpTip = "Надо выделить часть размеченного текста, которая должна быть перенесена в вёрстку.";
tags.value = false;
tags.enabled = false;
separator1 = win.add ("panel");
separator1.minimumSize.height = separator1.maximumSize.height = 1;
///
var buttonsGroup = win.add("group");
buttonsGroup.orientation = "row";
buttonsGroup.alignChildren = ["center", "center"];
var info = buttonsGroup.add("button", [0,0,28,28], "?");
var action = buttonsGroup.add("button", [0,0,335,28], "Перенести разметку тегами в вёрстку"); 
action.enabled = false;
////
job.onClick = function() { // job.onClick  
if (app.activeDocument.characterStyleGroups.itemByName(groupForIndexStyles).isValid == false) { // == false
       try {
           app.activeDocument.characterStyleGroups.add({name:groupForIndexStyles});
           }
       catch (e) {
           alert("Не получилось в файле вёрстки создать группу символьных стилей '" + groupForIndexStyles + "'.", programTitul);
           return;            
           }           
       }  // == false    

if (!app.activeDocument.colors.item(usedColor).isValid) { // ! (usedColor).isValid
    try { 
        app.activeDocument.colors.add ({name: usedColor, model:ColorModel.SPOT, space:ColorSpace.RGB, colorValue:usedColorSample}) 
        } 
    catch (e) { } ; //  try / catch - цвета может уже быть в файле
    }  // ! (usedColor).isValid 
   
   
if (app.selection.length == 0 || app.selection[0].constructor.name != "InsertionPoint") {
    alert("Курсор должен быть в материале.", programTitul);  
    job.value = false;
    return;
    }
if (app.selection[0].parentStory.overflows) {
    alert("В файле вёрстки не должно быть вытесненного текста.", programTitul);
    job.value = false;
    return;    
    }
var noName = false;
try { var myDocPath = app.activeDocument.filePath; } // если документ не сохранён, маршрут не сообщается
catch(e) {
   alert("Это только что созданный и ещё ни разу не сохранённый файл.\nДайте ему имя.",programTitul); 
   noName = true;
    }
if (noName) { // noName
    try { app.documents[0].save(); }
    catch (e) {
         alert("Файл не был сохранён с новым именем");
        win.close(); 
        }
    } // noName
jobPath = app.activeDocument.filePath;
jobFileID = app.activeDocument.id;
jobStoryID = app.selection[0].parent.id;
job.text = jobOK;
job.enabled = false;
tags.enabled = true;
app.activeDocument = app.documents[1];
} // job.onClick 
////

//Два этапа работы программы. Это просто подробное описание того, что делает программа. Пользователю ничего самому создавать, сохраниять, искать — не надо. Задача человека — указать обрабатываемые файлы и нажать кнопку \"Перенести разметку тегами в вёрстку\". Всё остальное сделает скрипт. 
info.onClick = function () { // info.onClick 
var textInfo = "\nДолжно быть открыто два файла — файл вёрстки и текстовый файл с тегированной разметкой.\nВ файле вёрстки в группе 'Index styles' будут собраны все предлагаемые символьные стили.\n\nЕсли в тегированном файле есть абзацы с номерами страниц, например, такие, -8-, -77- и пр,, их надо удалить перед началом работы.\nТакже надо в этом файле заменить три идущие подряд точки на многоточие. (\.\.\.=>  ~e)\n\nВ тегированном файле все символы, попавшие в тегирование — ищутся grep-запросом #[^\}]+\} — должны быть окрашены цветом 'TagsColor'. Изменить их цвет надо до запуска этой программы.\n\nВ файле вёрстки для случая {nil} должен быть цвет 'SkipTheWord'.\nТакже в этом файле надо до запуска этого скрипта создать цвет 'IndexStylesColor'.\n\nДва этапа работы программы.\nI и II — это просто подробное описание того, что делает программа.\nПользователю ничего самому создавать, сохраниять, искать — не надо.\nЗадача человека — в indd-файле с разметкой отметить цветом теги, выбором флажков указать обрабатываемые файлы и нажать кнопку \"Перенести разметку тегами в вёрстку\".\nВсё остальное сделает скрипт.\n\nI. Программа работает с тегированным файлом.\nИщутся и сохраняются для использования в файле вёрстки\nа) искомый термин\nб) символьный стиль, которым этот термин будет обработан\nв) фрагмент текста в файле вёрстки, который надо найти в файле вёрстки, чтобы потом в нём искать термин, сохранённый в п. (а)\n\nВ тегированном файле ищем очередной тегированный блок разметки, например:\n#великий риши{Нарада\\великий риши}\n#потомок рода Икшваку{Рама_1\\потомок Икшваку}\n#Хранитель мира{nil}\n\nДопустим, работа с #великий риши{Нарада\\великий риши}\n\n1) тег в фигурных скобках {Нарада\\великий риши} - сохраняем его. Это название символьного стиля для оформления текста 'великий риши' в файле вёрстки.\n2) сохраняем искомый текст — великий риши\n3) Теперь надо в тегированном тексте найти текст — 40 знаков перед знаком #, который стоял перед искомым текстом, в нашем случае это 'великий риши',\nи 40 знаков после закрывающей фигурной скобки. \nПросто так их взять бесполезно, т.к. в них могут тоже быть теги. То что могут быть теги — не проблема, главное, чтобы граница 40 знаков не попала внутрь строки тегов.\nДля контроля этой ситуации используется окрашивание символов в строках тегов цветом TagsColor.\nТекст до: \nв области перед знаком # и начиная от знака со смещением -40 ищется закрывающая фигурная скобка, окрашенная цветом TagsColor. \nЕсли скобки нет, то весь текст от знака -40 до знака перед # будет текстом перед термином (\"текст до\").\nЕсли скобка найдена, то текстом перед термином будет текст, начиная со знака после последней фигурной скобки среди найденных и знака перед #.\nТекст после:\nв области после закрывающей фигурной скобки и знака со смещением +40 ищется #, окрашенный цветом TagsColor.\nЕсли он не найден, то эта область поиска становится полным текстом после термина (\"текст после\").\nЕсли знак обнаружен, то будет искаться два текста:\nа) первым текстом после термина (\"текст после_1\") будет область от знака после закрывающей фигурной скобки до знака перед найденным #.\nб) в этой же области ищется открывающая фигурная скобка, окрашенная TagsColor, и текст после #  до найденной открывающей фигурной скобки будет \"текст после_2\".\nПосле этого тексты объединяются: \"текст после\" = \"текст после_1\" + \"текст после_2\"\nВ результате строка \"полный текст для поиска\" = \"текст до\" + \"искомый текст\" + \"текст после\" будет тем текстом, который надо найти в файле вёрстки, чтобы потом найти в нём искомый текст и отметить его символьным стилем.\nСохраняем 'полный текст для поиска'.\n\nII. Работа с файлом верстки.\nДля работы собраны все ситуации 'полный текст для поиска' - текст, который должен быть в этом фрагменте — 'искомый текст' и название символьного стиля оформления искомого текста.\nПроверяем есть ли символьный стиль для оформления этого текста. Если нет, то создаем его.\n1) ищем 'полный текст для поиска', если не найдено, сохраняем этот текст для помещения в файл отчёта об ошибках.\nЕсли найден, то ищем в нём 'искомый текст'. Если не найден, то сохраняем этот текст для помещения в файл отчёта об ошибках.\nВ случае, если символьный стиль 'nil', окрашиваем искомый текст цветом nilColor.\nЕсли текст найден, оформляем его указанным символьным стилем.\n\nЭТА ПРОГРАММА РАБОТАЕТ С ОТДЕЛЬНОЙ СТАТЬЁЙ.  ВАЖНО ОБЪЕДИНИТЬ ВСЕ МАТЕРИАЛЫ В ОДИН ПОТОК, ПРЕЖДЕ ЧЕМ НАЧАТЬ ПРОВЕРКУ.\n\n\n© Михаил Иванюшин, 2023, 2024  |  dotextok@gmail.com  |  https://dotextok.ru\n";
var wn = new Window ("dialog", programTitul);
var data = wn.add("edittext", [0, 0, 1200, 600], textInfo, {multiline: true});
wn.layout.layout();
wn.show();
return;
} // info.onClick

///
tags.onClick = function () { // tags.onClick    
if (app.activeDocument.id == jobFileID) {
       alert("Сейчас выбран тот же файл, что только что был указан как файл вёрстки.", programTitul);
       tags.value = false;       
       return;
       }
var noName = false;
try { var myDocPath = app.activeDocument.filePath; } // если документ не сохранён, маршрут не сообщается
catch(e) {
   alert("Это только что созданный и ещё ни разу не сохранённый файл.\nДайте ему имя.",programTitul); 
   noName = true;
    }
if (noName) { // noName
    try { app.documents[0].save(); }
    catch (e) {
         alert("Файл не был сохранён с новым именем");
        win.close(); 
        }
    } // noName
if (decodeURI(myDocPath) != decodeURI(jobPath)) {
       alert("Файл вёрстки и файл с тегированной разметкой должны быть в одной папке.", programTitul);
       tags.value = false;       
       return;    
    }
var tagsName = decodeURI(app.activeDocument.name);
if (app.selection.length == 0 || app.selection[0].constructor.name == "TextFrame" || app.selection[0].hasOwnProperty("pointSize") != true || app.selection[0].constructor.name == "InsertionPoint") {  
    alert("Выделите нужный размеченный текст.", programTitul);    
    tags.value = false;
    return;
    }
if (app.selection[0].parentStory.overflows) {
    alert("В файле тегированной разметки не должно быть вытесненного текста.", programTitul);
    tags.value = false;
    return;    
    }
///
if (!app.activeDocument.colors.item(TagsColor).isValid) { // ! (TagsColor).isValid
    alert("В файле с тегированной разметкой должен быть служебный цвет '" + TagsColor + "', и им должны быть отмечены все тегированные фрагменты текста.\rДля поиска таких фрагментов надо использовать grep-запрос #[^}]+} и окрасить найденные фрагменты этим цветом.", programTitul);
    tags.value = false;    
    return;
    }  // ! (TagsColor).isValid 
///
tags.text = tagsOK;
tags.value = true;
tags.enabled = false;
tagFileID = app.activeDocument.id; 
tagStoryID = app.selection[0].parentStory.id;
action.enabled = true;  
tags.helpTip = "";
return;
///
} // tags.onClick
///
action.onClick = function () { // action.onClick
var sel = app.selection[0];  
var found;
if ((app.activeDocument.id == jobFileID) || (sel == null) || (sel.constructor.name != "Paragraph" && sel.constructor.name != "Text" && sel.constructor.name != "TextColumn" && sel.constructor.name != "TextStyleRange")) {
    alert("Перед нажатием этой кнопки надо в файле с тегами выделить область, разметку которой надо перенести в файл вёрстки.", programTitul);
    return;
    }
if (sel.parentStory.overflows) {
    alert("В файле разметки не должно быть вытесненного текста.", programTitul);
    job.value = false;
    return;    
    }
//>>> расширим выделенную область до кратности абзацам
var sel = app.selection[0];
var myStartOfFragment = sel.paragraphs[0].characters.firstItem().index;
var myEndOfFragment = sel.paragraphs[sel.paragraphs.length - 1].characters.lastItem().index;
sel.parent.characters.itemByRange(myStartOfFragment,myEndOfFragment).select();
sel = app.selection[0];
//>>>
var story = sel.parentStory;
var myDateS = new Date;
var myHourS = myDateS.getHours();
if (myHourS <10) myHourS = "0" + myHourS;
var myMinuteS = myDateS.getMinutes();
if (myMinuteS <10) myMinuteS = "0" + myMinuteS;
var timeS = " [" + myHourS + ":" + myMinuteS + "]";
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
app.findGrepPreferences.findWhat = "#[^\}]+\}"; // "#\.+\{\.+\?\}"; - такой поиск работает верно, только если искомый текст встречается в абзаце один раз
found = sel.findGrep();
if (found.length == 0) {
    alert("В выделенном тексте теги ( #...{...} ) не найдены.", programTitul);    
    return;
    }
var pBar = new ProgressBar(programTitul + timeS);
pBar.reset("1/2 Извлечение из тегов информации: что искать, как оформлять", found.length);
for (var i = 0; i < found.length; i++, pBar.hit()) { // i++
     pBar.error((i+1) + "/" + found.length); // .error -- это не ошибка, 
    fsB = Number(found[i].contents.indexOf("{"));
    fsA = Number(found[i].contents.indexOf("}"));
    if (fsB == -1 || fsA == -1) {
        pBar.close();  
        found[i].select();
        win.close();
        app.activate();         
        app.activeWindow.activePage = app.selection[0].parentTextFrames[0].parentPage; 
        app.activeWindow.zoomPercentage = 150;   
        alert("В выделенном тексте ошибка оформления тегов: отстутствует одна из фигурных скобок. Проблемная строка выделена, работа скрипта прекращена.", programTitul); 
        exit();      
        }
  //  textForSearch = found[i].characters.itemByRange(1,fsB-1).contents; // текст, который надо оформить символьным стилем. Его надо поместить в sampleForSearch
  // 27.11.2024
    textForSearch = "\\b" + found[i].characters.itemByRange(1,fsB-1).contents + "\\b"; // текст, который надо оформить символьным стилем. Его надо поместить в sampleForSearch    
    styleName = found[i].characters.itemByRange(fsB+1, fsA-1).contents; // название этого символьного стиля. Помещается в stylesForSamples
    foundIndex = found[i].index; // индекс начала найденного текста
    foundEndIndex = Number(foundIndex) + Number(found[i].length); // индекс последнего из найденных знаков
    /// before
    deltaTmp = Number(delta);
    var lastCharBefore_Index = foundIndex-1;
    var firstCharBefore_Index = lastCharBefore_Index - deltaTmp;
    if (firstCharBefore_Index < 0) firstCharBefore_Index = 0;
    story.characters.itemByRange(firstCharBefore_Index, lastCharBefore_Index).select();
    app.findGrepPreferences = null; 
    app.changeGrepPreferences = null;
    app.findGrepPreferences.findWhat = "\}"; 
    app.findGrepPreferences.fillColor = app.activeDocument.colors.item(TagsColor); 
    var srchRez = app.selection[0].findGrep();
    if (srchRez.length == 0) textBefore = story.characters.itemByRange(firstCharBefore_Index, lastCharBefore_Index).contents;
    else { // \} найдена
        textBefore = story.characters.itemByRange(srchRez[srchRez.length-1].index+1, lastCharBefore_Index).contents;
        } // \} найдена
    //// after
    deltaTmp = Number(delta);
    var firstCharAfter_Index = foundEndIndex;    
    var lastCharAfter_Index = firstCharAfter_Index + deltaTmp;
    if (lastCharAfter_Index > story.length) lastCharAfter_Index = story.length-1;
    story.characters.itemByRange(firstCharAfter_Index, lastCharAfter_Index).select();
    app.findGrepPreferences = null; 
    app.changeGrepPreferences = null;
    app.findGrepPreferences.findWhat = "#[^\{]+\{";  // ищем начало -- от решётки до откр. фигурной кавчки
   app.findGrepPreferences.fillColor = app.activeDocument.colors.item(TagsColor);     
    var srchRez = app.selection[0].findGrep();
    if (srchRez.length == 0) { // == 0
        if (story.characters[lastCharAfter_Index].fillColor.name == "Black")  textAfter = story.characters.itemByRange(firstCharAfter_Index, lastCharAfter_Index).contents;
        else { // TagsColor
            app.findGrepPreferences = null; 
            app.changeGrepPreferences = null;
            app.findGrepPreferences.findWhat = "#";            
            app.findGrepPreferences.fillColor = app.activeDocument.colors.item(TagsColor);     
            srchRez = app.selection[0].findGrep(); 
            if (srchRez.length != 0) {
               textAfter = story.characters.itemByRange(firstCharAfter_Index, srchRez[0].index-1).contents; 
                }
            else {
                // по идее, такой ситуации быть не может, поэтому пока просто сообщение
                alert("Похоже, что-то пошло не так, и строка\r" + story.characters.itemByRange(firstCharAfter_Index, lastCharAfter_Index).contents + "\rобработалась неверно. Нажмите ОК для продолжения работы.");    
                }
            } // TagsColor
        } // == 0
    else { // #[^\{]+\{ найден
        var textAfter1 = story.characters.itemByRange(firstCharAfter_Index, srchRez[0].index-1).contents; // текст между закрывающей скобкой и найденным знаком #
        var textAfter2 = srchRez[0].characters.itemByRange(1,srchRez[0].length-2).contents; // это термин между знаком # и открывающей фигурной скобкой
        textAfter = textAfter1 + textAfter2;
        }   // #[^\{]+\{ найден
    allTextForSearch = textBefore + textForSearch + textAfter; // полная строка поиска. Помещается в theTextForSearch
    taggedSample.push(found[i].contents);
    sampleForSearch.push(textForSearch);
    stylesForSamples.push(styleName);  
    theTextForSearch.push(allTextForSearch);
   // pBar.error((i+1) + "/" + found.length); // .error -- это не ошибка, 
    } // i++
pBar.close();
app.selection = NothingEnum.NOTHING;
// к этому моменту в массивах taggedSample, sampleForSearch, stylesForSamples, theTextForSearch собрана вся информация для организации поиска в файле вёрстки
app.activeDocument = app.documents[1];
var stories = app.activeDocument.stories;
var theStory = stories.itemByID(jobStoryID);
var serachItems = sampleForSearch.length;
var notFound = [];
var foundREz, sampleRez;
while (notFound.length > 0) notFound.pop();

var myDateF = new Date;
var myHourF = myDateF.getHours();
if (myHourF <10) myHourF = "0" + myHourF;
var myMinuteF = myDateF.getMinutes();
if (myMinuteF <10) myMinuteF = "0" + myMinuteF;
var timeF = " [" + myHourF + ":" + myMinuteF + "]";
var pBar = new ProgressBar(programTitul + timeS + " |" + timeF);
pBar.reset("2/2 Поиск в файле вёрстки фрагментов текста и оформление их символьными стилями", serachItems);
/// служебный фрейм для подготовки строки поиска
var theFrame = app.activeDocument.pages[-1].textFrames.add({strokeWeight:0});
if (theFrame.strokeWeight != 0) theFrame.strokeWeight = 0;
theFrame.textWrapPreferences.textWrapMode = TextWrapModes.NONE;
theFrame.geometricBounds = ["-40mm","-10mm","-10mm","250mm"];
theFrame.texts[0].contents = "";
theFrame.texts[0].insertionPoints[0].appliedParagraphStyle = app.activeDocument.paragraphStyles[0];
theFrame.texts[0].pointSize = 3;
theFrame.bringToFront();

///
for (var i = 0; i < serachItems; i++, pBar.hit()) { // i++
    pBar.error((i+1) + "/" + serachItems);
    app.findGrepPreferences = null; 
    app.changeGrepPreferences = null;
    convertDataToSearch(String(theTextForSearch[i]));
    ///    
    if (String(stylesForSamples[i]) != "nil" && app.activeDocument.characterStyleGroups.itemByName(groupForIndexStyles).characterStyles.item(String(stylesForSamples[i])).isValid == false) {
        // добавляем отсутствующий символьный стиль. Решено делать это сразу, раз этот стиль нужен. В первой версии он добавлялся только при нахождении текста. Но если стиля не было, приходилось его самому создавать. Это потеря времени.
        app.activeDocument.characterStyleGroups.itemByName(groupForIndexStyles).characterStyles.add({name:String(stylesForSamples[i])});
         app.activeDocument.characterStyleGroups.itemByName(groupForIndexStyles).characterStyles.itemByName(String(stylesForSamples[i])).fillColor = usedColor;        
        }       
    ////
    app.findGrepPreferences = null; 
    app.changeGrepPreferences = null;   
    var whatToFind = theFrame.texts[0].contents;
    app.findGrepPreferences.findWhat = whatToFind;
    foundREz = theStory.texts[0].findGrep();    
    if (foundREz.length == 0) {
        notFound.push("Разметка тегами: "+ taggedSample[i] + "\rИскомый текст в вёрстке: " + theTextForSearch[i] + "\rgrep: <" + theFrame.texts[0].contents + ">\r" + " [1]\r~~~~~~~~~~~\r"); // фрагмент текста с искомым текстом внутри не найден
        continue;
        }
   if (String(sampleForSearch[i]).length <2) continue;
    app.findGrepPreferences = null; 
    app.changeGrepPreferences = null;
    convertDataToSearch(String(sampleForSearch[i]));    
    app.findGrepPreferences.findWhat = theFrame.texts[0].contents;  
    sampleRez = foundREz[0].findGrep();  
    if (sampleRez.length == 0) {
        notFound.push(sampleForSearch[i] + " [2]\r"); // внутри найденного фрагмента искомый текст не найден
        continue;
        } 
    if (stylesForSamples[i] == "nil") { // nil
        if (!app.activeDocument.colors.item(nilColor).isValid) { // ! (usednilColorColor).isValid
            try { 
                app.activeDocument.colors.add ({name: nilColor, model:ColorModel.SPOT, space:ColorSpace.RGB, colorValue:nilColorSample}) 
                } 
            catch (e) { } ; //  try / catch - цвета может уже быть в файле
            }  // ! (nilColor).isValid 
        sampleRez[sampleRez.length-1].fillColor = nilColor;        
        continue;
        }
    var start = sampleRez[sampleRez.length-1].index;
    var end = Number(start) + Number(sampleRez[sampleRez.length-1].length) - 1;
    var _appliedFont = sampleRez[sampleRez.length-1].characters[0].appliedFont;
    var _pointSize = sampleRez[sampleRez.length-1].characters[0].pointSize;
    var _fontStyle = sampleRez[sampleRez.length-1].characters[0].fontStyle;
    var _leading = sampleRez[sampleRez.length-1].characters[0].leading;
    var _alignToBaseline = sampleRez[sampleRez.length-1].characters[0].alignToBaseline;
    var _justification = sampleRez[sampleRez.length-1].characters[0].justification;
    sampleRez[sampleRez.length-1].texts[0].parent.characters.itemByRange(start, end).appliedCharacterStyle = app.activeDocument.characterStyleGroups.itemByName(groupForIndexStyles).characterStyles.item(String(stylesForSamples[i]));
   // если прикладывать символьный стиль, в котором определён только цвет, к тексту, ранее оформленному другим символьным стилем, то в этом тексте может потеряться часть оформления.
   // Поэтому перед приложением стиля с цветом сперва были сохранены основные параметры текста - шрифт, кегль, начертание и пр., и после приложения символьного стиля запомненные параметры восстановлены.
   sampleRez[sampleRez.length-1].texts[0].parent.characters.itemByRange(start, end).appliedFont = _appliedFont;
    sampleRez[sampleRez.length-1].texts[0].parent.characters.itemByRange(start, end).pointSize = _pointSize;
    sampleRez[sampleRez.length-1].texts[0].parent.characters.itemByRange(start, end).leading = _leading;
    sampleRez[sampleRez.length-1].texts[0].parent.characters.itemByRange(start, end).alignToBaseline = _alignToBaseline;
    sampleRez[sampleRez.length-1].texts[0].parent.characters.itemByRange(start, end).justification = _justification;   
    } // i++
theFrame.remove();
pBar.close();

var myDateE = new Date;
var myHourE = myDateE.getHours();
if (myHourE <10) myHourE = "0" + myHourE;
var myMinuteE = myDateE.getMinutes();
if (myMinuteE <10) myMinuteE = "0" + myMinuteE;
var timeSE = " [" + myHourS + ":" + myMinuteS + " — " + myHourE + ":" + myMinuteE +  "]\r";

var rezFileName  = "TagFileProblems.txt"; // это txt-файл с информацией о проблемах обработки тегированного текста
var myFilePath = decodeURI(String(jobPath) + "/" + rezFileName); 
var rezFile = new File (myFilePath);
var rezText = "" ;
    if (notFound.length > 0) { // notFound
        rezText = rezText + "Проблемы при поиске:\r[1] фрагмент текста с искомым текстом внутри не найден\r[2] внутри найденного фрагмента искомый текст не найден\r\r"; 
        for (i = 0; i < notFound.length; i++) { rezText = rezText + notFound[i] + "\r"; }
        rezFile.open("w");
        rezFile.encoding = "utf8"; // кодировка UTF-8
        rezFile.writeln(rezText);
        rezFile.close();
        alert(timeSE + "Разметка перенесена из тегированного файла в вёрстку.\rСведения о проблемах обработки тегрованного файла, собраны в текстовом файле '" + rezFileName + "', он в той же папке, где файл вёрстки." , programTitul);   
    } // notFound
else {
    alert(timeSE + "Разметка перенесена из тегированного файла в вёрстку.", programTitul);
    }
win.close();
app.activate();
////
function convertDataToSearch (data) { // convertDataToSearch
theFrame.texts[0].contents = data;
///
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
app.findGrepPreferences.findWhat = "\\("; 
app.changeGrepPreferences.changeTo = "\\(";
theFrame.texts[0].parentStory.changeGrep(); 
///
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
app.findGrepPreferences.findWhat = "\\)"; 
app.changeGrepPreferences.changeTo = "\\)";
theFrame.texts[0].parentStory.changeGrep(); 
///
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
app.findGrepPreferences.findWhat = "\\["; 
app.changeGrepPreferences.changeTo = "\\[";
theFrame.texts[0].parentStory.changeGrep(); 
///
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
app.findGrepPreferences.findWhat = "\\]"; 
app.changeGrepPreferences.changeTo = "\\]";
theFrame.texts[0].parentStory.changeGrep(); 
///    
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
app.findGrepPreferences.findWhat = "\\x{003F}"; 
app.changeGrepPreferences.changeTo = "\\?";
theFrame.texts[0].parentStory.changeGrep();
///
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
app.findGrepPreferences.findWhat = "\\r"; 
app.changeGrepPreferences.changeTo = "\\h*\\r*\\h*";
theFrame.texts[0].parentStory.changeGrep();
///
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
app.findGrepPreferences.findWhat = "\\x{00AD}"; 
app.changeGrepPreferences.changeTo = "\\x{00AD}*"; // для обработки переносов в тексте, взятом из PDF
theFrame.texts[0].parentStory.changeGrep();
///
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
//app.findGrepPreferences.findWhat = "(?<=[[:blank:]])[-–—](?=\\s)"; 
//app.findGrepPreferences.findWhat = "(?<=\\h)[-–—‑](?=\\s)"; 
app.findGrepPreferences.findWhat = "[-–—‑]"; 
app.changeGrepPreferences.changeTo = "[-–—‑]";
theFrame.texts[0].parentStory.changeGrep();
///
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
app.findGrepPreferences.findWhat = "[[:blank:]]+"; 
app.changeGrepPreferences.changeTo = "\\h+"; //  для индизайна CS6+.
//app.changeGrepPreferences.changeTo = "[[:blank:]]+"; // для всех версий, начиная с CS4
theFrame.texts[0].parentStory.changeGrep();
///
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
app.findGrepPreferences.findWhat = "[«»„“”\"‘’]"; 
//app.changeGrepPreferences.changeTo = "[«»„“”\"]";
app.changeGrepPreferences.changeTo = "[«»„“”\"‘’]*"; // 6.11 -- кавычки может и не быть.
theFrame.texts[0].parentStory.changeGrep(); 
///
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
app.findGrepPreferences.findWhat = "\\."; 
app.changeGrepPreferences.changeTo = "\\.";
theFrame.texts[0].parentStory.changeGrep(); 
///
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
app.findGrepPreferences.findWhat = "([IVX\\d\\l])([-–—‑])([\\d\\lIVX])"; 
app.changeGrepPreferences.changeTo = "$1[-–—‑]\\x{00AD}*$3";
theFrame.texts[0].parentStory.changeGrep();
///
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
app.findGrepPreferences.findWhat = "(т\\.)(п\\.)"; 
app.changeGrepPreferences.changeTo = "$1\\h*$2";
theFrame.texts[0].parentStory.changeGrep();
///
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
app.findGrepPreferences.findWhat = "(\\u\\.)(\\u\\.)"; 
app.changeGrepPreferences.changeTo = "$1\\h*$2";
theFrame.texts[0].parentStory.changeGrep();
///
/*
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
app.findGrepPreferences.findWhat = "([-–—‑])"; 
app.changeGrepPreferences.changeTo = "[-–—‑]";
theFrame.texts[0].parentStory.changeGrep();
*/
///
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
app.findGrepPreferences.findWhat = "\\Q\\h+\\h*\\E";  // нивелируем расхождение в сыром тексте, по которому могли одновременно с вёрсткой делать разметку, могли остаться пробелы в конце абзаца. Тут предполагается, что после перевода строки возможен знак табуляции, или шпация: \h* И когда в запросе встанут рядом \h+ и \h*, текст найден не  будет. Замена \h+\h* на \h* эту проблему снимает.
app.changeGrepPreferences.changeTo = "\\h*";
theFrame.texts[0].parentStory.changeGrep();
app.findGrepPreferences = null; 
app.changeGrepPreferences = null;
} // convertDataToSearch
////
} // action.onClick
///
win.show();
