// export_print_evidence.jsx — additive, read-only-on-the-document evidence export (H2589).
//
// Never edits or re-saves the active document in place. Exports IDML + proof-PDF into
// outputDir and writes a plain key=value / pipe-delimited report (ExtendScript is ES3 —
// no native JSON — Python on the driving side parses this format) covering: product
// version, page count, sections, font status, link status, and which stories overflow
// (overset) — the live facts only InDesign itself can determine, complementing the
// static IDML/PDF audits in tools/print_ready/.
//
// Params come from app.scriptArgs (set by the Python COM driver before app.doScript):
//   outputDir   — folder to write into (must already exist)
//   baseName    — file stem for the exported .idml/.pdf/.report.txt
//   pdfPreset   — name of an installed PDF export preset (default "[High Quality Print]")
//
// _Автор инструмента: Dr. Mārcis Gasūns · создан 14-08-2026 (H2589).

#targetengine "print_ready_evidence"

function getArg(name, fallback) {
    var v = app.scriptArgs.isDefined(name) ? app.scriptArgs.getValue(name) : "";
    return (v === "") ? fallback : v;
}

function esc(s) {
    s = String(s);
    var out = "";
    for (var i = 0; i < s.length; i++) {
        var c = s.charAt(i);
        if (c === "\n" || c === "\r" || c === "|") {
            out += " ";
        } else {
            out += c;
        }
    }
    return out;
}

function main() {
    if (app.documents.length === 0) {
        throw new Error("export_print_evidence: no document open");
    }
    var doc = app.activeDocument;

    var outputDir = new Folder(getArg("outputDir", "~/Desktop"));
    if (!outputDir.exists) {
        outputDir.create();
    }
    var baseName = getArg("baseName", "evidence");
    var pdfPresetName = getArg("pdfPreset", "[High Quality Print]");

    var lines = [];
    lines.push("SCHEMA=print_ready_evidence.v1");
    lines.push("DOC_NAME=" + esc(doc.name));
    var docFullName = "";
    try {
        docFullName = doc.fullName.fsName;
    } catch (eFullName) {
        docFullName = "(unsaved)";
    }
    lines.push("DOC_FULL_NAME=" + esc(docFullName));
    lines.push("APP_VERSION=" + esc(app.version));
    lines.push("APP_NAME=" + esc(app.name));
    lines.push("PAGE_COUNT=" + doc.pages.length);
    lines.push("STORY_COUNT=" + doc.stories.length);

    // --- sections -----------------------------------------------------------
    for (var s = 0; s < doc.sections.length; s++) {
        var sec = doc.sections[s];
        try {
            lines.push(
                "SECTION|" + esc(sec.name) + "|" +
                sec.pageNumberStart + "|" +
                esc(sec.pageNumberStyle) + "|" +
                (sec.continueNumbering ? "continue" : "restart")
            );
        } catch (eSec) {
            lines.push("SECTION_ERROR|" + esc(eSec.message));
        }
    }

    // --- fonts (live resolution status) --------------------------------------
    for (var f = 0; f < doc.fonts.length; f++) {
        var fnt = doc.fonts[f];
        try {
            lines.push("FONT|" + esc(fnt.name) + "|" + esc(fnt.status.toString()) + "|" + esc(fnt.fontFamily));
        } catch (eFont) {
            lines.push("FONT_ERROR|" + esc(eFont.message));
        }
    }

    // --- links (live resolution status) --------------------------------------
    for (var l = 0; l < doc.links.length; l++) {
        var lnk = doc.links[l];
        try {
            lines.push("LINK|" + esc(lnk.name) + "|" + esc(lnk.status.toString()));
        } catch (eLink) {
            lines.push("LINK_ERROR|" + esc(eLink.message));
        }
    }

    // --- overset stories (only InDesign itself can tell) ---------------------
    var oversetCount = 0;
    for (var st = 0; st < doc.stories.length; st++) {
        var story = doc.stories[st];
        try {
            if (story.overflows) {
                oversetCount++;
                lines.push("OVERSET_STORY|" + esc(story.id) + "|" + esc(story.contents.toString().substr(0, 60)));
            }
        } catch (eStory) {
            lines.push("STORY_ERROR|" + esc(eStory.message));
        }
    }
    lines.push("OVERSET_COUNT=" + oversetCount);

    // --- preflight (best-effort; a failure here does not abort the export) ---
    try {
        var profile = null;
        for (var pp = 0; pp < app.preflightProfiles.length; pp++) {
            if (app.preflightProfiles[pp].name === "[Basic]") {
                profile = app.preflightProfiles[pp];
                break;
            }
        }
        if (!profile) {
            throw new Error("preflight profile '[Basic]' not found by index scan");
        }
        var process = app.preflightProcesses.add(doc, profile);
        process.waitForProcess();
        lines.push("PREFLIGHT_ERROR_COUNT=" + process.processResults.length);
        process.remove();
    } catch (ePreflight) {
        lines.push("PREFLIGHT_ERROR=" + esc(ePreflight.message));
    }

    // --- exports (additive only; original document is never re-saved) --------
    try {
        var idmlFile = new File(outputDir.fsName + "/" + baseName + ".idml");
        doc.exportFile(ExportFormat.INDESIGN_MARKUP, idmlFile);
        lines.push("EXPORTED_IDML=" + esc(idmlFile.fsName));
    } catch (eIdml) {
        lines.push("EXPORT_IDML_ERROR=" + esc(eIdml.message));
    }

    try {
        var pdfFile = new File(outputDir.fsName + "/" + baseName + ".pdf");
        var preset = null;
        try {
            preset = app.pdfExportPresets.item(pdfPresetName);
            if (!preset.isValid) {
                preset = null;
            }
        } catch (ePreset) {
            preset = null;
        }
        if (preset) {
            doc.exportFile(ExportFormat.PDF_TYPE, pdfFile, false, preset);
        } else {
            doc.exportFile(ExportFormat.PDF_TYPE, pdfFile, false);
        }
        lines.push("EXPORTED_PDF=" + esc(pdfFile.fsName));
    } catch (ePdf) {
        lines.push("EXPORT_PDF_ERROR=" + esc(ePdf.message));
    }

    var reportFile = new File(outputDir.fsName + "/" + baseName + ".report.txt");
    reportFile.encoding = "UTF-8";
    reportFile.open("w");
    reportFile.write(lines.join("\n"));
    reportFile.close();

    return reportFile.fsName;
}

main();
