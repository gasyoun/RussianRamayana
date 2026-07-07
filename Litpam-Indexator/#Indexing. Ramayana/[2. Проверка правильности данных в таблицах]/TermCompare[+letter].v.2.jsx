//  TermCompare.jsx

#include "../ForIndex.jsxinc"

/*

В таблице IndexList ищутся строки с совпавшими grep-запросами, они в третьей колонке, и собираются в отдельный файл.
Если этот IndexList в имени имеет букву указателя, она будет перед названием символьного стиля.

*/

// © Михаил Иванюшин, 2020-2023  |  dotextok@gmail.com  |  dotextok.ru

app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll; // см. http://adobeindesign.ru/2008/10/24/restore-ui/
var termCompareLabel = "termCompareLabel";
var programTitul = "Поиск терминов с совпадающими запросами";
if (app.documents.length == 0) {
    alert("Нет открытых документов.", programTitul);
    exit();
    }
var mySel = app.selection[0];
if (mySel == null  || (mySel.constructor.name != "InsertionPoint") ||  (mySel.parent.constructor.name != "Cell")) {    
    alert("Поставьте курсор в строку таблицы.", programTitul); 
    exit(); 
    }
var doc = app.activeDocument;
var prefix = "";
var tF = doc.textFrames.everyItem().getElements();
for (var f = tF.length-1; f >= 0; f--) { if (tF[f].label == termCompareLabel) tF[f].remove(); } 
var nameArr = [];
while (nameArr.length != 0) nameArr.pop();
nameArr = doc.name.split("IndexList");
if (nameArr.length != 2) {
     alert("Предполагается, что будет обрабатываться файл, имя которого выглядит так: IndexList-nnn.indd, но открытый файл этому критерию не соответствует.",programTitul);
    exit();     
    }
///
if (nameArr[1][0] == "[") {
    if (nameArr[1][1] == "@") {
        alert("Для сводной таблицы указателей поздно собирать символьные стили этим скриптом. Это надо делать для отдельно для каждой таблицы, в имени кторой есть IndexList и маркер указателя. И только после этого собирать такие отдельные таблицы в одну общую.",programTitul);
        exit();            
        }
    prefix = nameArr[1][1] + "-"; // Если этот IndexList в имени имеет букву указателя, она будет перед названием символьного стиля
    }
var table = mySel.parent.parent;
var rows = table.rows.everyItem().getElements();
var rowsLength = rows.length;
var saveInfo = [];
var indAr = [];
var sep = "!@#$%";
var arLine;
var charStyleName = "";
var _grep;
var indx;
var notFound;
var rowIndexesOfThisGREP = {};
var keptLine = "";
var keptTerms = {};
var pBar = new ProgressBar(programTitul);
while (saveInfo.length > 0) saveInfo.pop();
var infoLine = "Поиск одинаковых grep-запросов в таблице. Число строк в таблице " + String(rowsLength);
pBar.reset(infoLine, rowsLength);
for (var r = 0; r < rowsLength; r++, pBar.hit()) { // r++
    pBar.info(infoLine + " | " + Number(r+1) + " : " + table.rows[r].cells[0].texts[0].contents);
    if (table.rows[r].cells[1].texts[0].length == 0) continue;
    _grep = table.rows[r].cells[2].texts[0].contents;
    if (rowIndexesOfThisGREP[_grep] == undefined) { rowIndexesOfThisGREP[_grep] = r; continue; }    
    else { // else
        while (indAr.length > 0) indAr.pop();
        indAr = String(rowIndexesOfThisGREP[_grep]).split(sep);
        indAr.push(r);
        startIndx = 0;
        for (var s = 0; s < indAr.length; s++) { // s++
            for (var d = startIndx; d < indAr.length; d++) { // d++
                if (d == s) continue;
                strCompare = table.rows[indAr[s]].cells[2].texts[0].contents == table.rows[indAr[d]].cells[2].texts[0].contents;   
                if (strCompare == true) { // strCompare
                    keptLine = table.rows[indAr[d]].cells[0].texts[0].contents + " : " + _grep;
                    indx = indAr[d];
                    if (table.rows[r].cells[0].texts[0].appliedParagraphStyle.name != indStyle1) { // != indStyle1       
                        for (ii = 1; ii < 39; ii++) { // ii++  ||  39 - число с большим запасом
                            notFound = true;
                            if (table.rows[indx-ii].cells[0].texts[0].appliedParagraphStyle.name != indStyle1) continue;
                            notFound = false;
                            break;
                            } // ii++
                        if (notFound) {
                            keptLine = keptLine + " > @"; /// @ - указатель, что стиль первого уровня не найден            
                            }  
                        else {
                            rii = indx-ii;
                            charStyleName = prefix + table.rows[indx].cells[0].texts[0].contents + "_" + table.rows[indx-ii].cells[0].texts[0].contents;
                            keptLine = keptLine + " > { " + charStyleName + " }";
                            table.rows[indx].cells[3].texts[0].contents = charStyleName;
                            }
                        }  // != indStyle1
                    else { 
                        charStyleName = table.rows[indAr[d]].cells[0].texts[0].contents;
                        keptLine = keptLine + " > { " + charStyleName + " }";
                        table.rows[indAr[d]].cells[3].texts[0].contents = charStyleName;                        
                        }             
                    if (keptTerms[keptLine] == undefined) { // keptLine
                        keptTerms[keptLine] = keptLine;
                        saveInfo.push(keptLine);
                        } // keptLine
                    continue;
                    } // strCompare
                } // d++
            } // s++
         arLine= indAr.join(sep);
        rowIndexesOfThisGREP[_grep] = arLine;
        }  //else
    } // r++
pBar.close();
if (saveInfo.length == 0) {
    alert("Совпадения grep-запросов не обнаружено.", programTitul);   
    }
else { // notFound = false 
    saveInfo.sort();
    var theN = doc.name.split(".indd")[0];
    var rezFileName  = theN + "@TermCompare.txt";
    var jobFolder = decodeURI(app.activeDocument.filePath);
    var myFilePath = decodeURI(jobFolder + "/" + rezFileName); 
    var rezFile = new File (myFilePath);
    rezFile.open("w");
    rezFile.encoding = "utf8";
    //rezFile.writeln("В таблице были найдены  термины, у которых одинаковые grep-запросы.\rЧисло строк таблицы " + rowsLength + ", число таких терминов " + saveInfo.length + ".\rНайденные термины надо оформить своими символьными стилями, чтобы из-за их похожего написания не было ошибки обнаружения.\rПредлагаемые названия символьных стилей заключены в фигурные скобки,\rони такие же, как в файле RightTags.txt, если будет выполняться разметка текста макросом ПиМ.\rИмена этих стилей помещены в строки четвёртой колонки.\r\r"); 
    rezFile.writeln("В таблице были найдены  термины, у которых одинаковые grep-запросы.\rЧисло строк таблицы " + rowsLength + ", число таких терминов " + saveInfo.length + ".\rНайденные термины надо оформить своими символьными стилями, чтобы из-за их похожего написания не было ошибки обнаружения.\rИмена этих стилей помещены в строки четвёртой колонки.\r\r");        
    for (i = 0; i < saveInfo.length; i++) rezFile.writeln(saveInfo[i]);
    rezFile.close();
    alert("Найдены термины, имеющие одинаковые grep-запросы поиска (" + saveInfo.length + "/" + rowsLength + ").\nИнформация сохранёна в файле '" + rezFileName + "', он в папке с файлом IndexList, из которого эти термины извлекались.\n", programTitul);    
    } // notFound = false
rowIndexesOfThisGREP = null;
keptTerms = null;
exit();
////
