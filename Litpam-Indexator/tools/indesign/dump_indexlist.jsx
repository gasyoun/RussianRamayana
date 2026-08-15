// dump_indexlist.jsx — read-only dump of an IndexList table (H2776).
// Writes one line per row to outPath (UTF-8 TSV):
//   rowIndex \t paraStyleName \t colA-contents \t colB-contents
// Params via app.scriptArgs: targetPath, outPath

(function () {
    function arg(n) { return app.scriptArgs.isDefined(n) ? app.scriptArgs.getValue(n) : ""; }
    var doc = app.open(new File(arg("targetPath")));
    var tbl = null;
    for (var s = 0; s < doc.stories.length && tbl == null; s++)
        if (doc.stories[s].tables.length > 0) tbl = doc.stories[s].tables[0];
    if (tbl == null) { doc.close(SaveOptions.NO); throw new Error("no table"); }
    var out = [];
    var n = tbl.rows.length;
    for (var i = 0; i < n; i++) {
        var c0 = tbl.rows[i].cells[0].texts[0];
        var c1 = tbl.rows[i].cells[1].texts[0];
        var st = "";
        try { st = c0.insertionPoints[0].appliedParagraphStyle.name; } catch (e) {}
        out.push(i + "\t" + st + "\t" +
            String(c0.contents).replace(/[\t\r\n]+/g, " ") + "\t" +
            String(c1.contents).replace(/[\t\r\n]+/g, " "));
    }
    var f = new File(arg("outPath"));
    f.encoding = "UTF-8";
    f.open("w");
    f.write(out.join("\n") + "\n");
    f.close();
    var cols = tbl.columns.length;
    doc.close(SaveOptions.NO);
    return "rows=" + n + "|cols=" + cols;
})();
