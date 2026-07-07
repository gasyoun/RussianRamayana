unit fMain;

{$mode objfpc}{$H+}

interface

uses
  Classes, SysUtils, Forms, Controls, Graphics, Dialogs, Menus, StdCtrls,
  ComCtrls, comobj;

type

  TArr2 = Array of Array of String;

  { TMainForm }

  TMainForm = class(TForm)
    ExtraTagsMemo: TMemo;
    MainMenu1: TMainMenu;
    Memo1: TMemo;
    MenuItem10: TMenuItem;
    MenuItem11: TMenuItem;
    MenuItem12: TMenuItem;
    MenuItem13: TMenuItem;
    MenuItem14: TMenuItem;
    MenuItem15: TMenuItem;
    MenuItem16: TMenuItem;
    MenuItem17: TMenuItem;
    MenuItem18: TMenuItem;
    MenuItem19: TMenuItem;
    N3: TMenuItem;
    N2: TMenuItem;
    MenuItem8: TMenuItem;
    TabSheet4: TTabSheet;
    TextTagsMemo: TMemo;
    MenuItem9: TMenuItem;
    N1: TMenuItem;
    ExcelTagsMemo: TMemo;
    MenuItem1: TMenuItem;
    MenuItem2: TMenuItem;
    MenuItem3: TMenuItem;
    MenuItem4: TMenuItem;
    MenuItem5: TMenuItem;
    MenuItem6: TMenuItem;
    MenuItem7: TMenuItem;
    OpenDialog1: TOpenDialog;
    PageControl1: TPageControl;
    SaveDialog1: TSaveDialog;
    StatusBar1: TStatusBar;
    TabSheet1: TTabSheet;
    TabSheet2: TTabSheet;
    TabSheet3: TTabSheet;
    procedure ExtraTagsMemoChange(Sender: TObject);
    procedure MenuItem10Click(Sender: TObject);
    procedure MenuItem11Click(Sender: TObject);
    procedure MenuItem12Click(Sender: TObject);
    procedure MenuItem13Click(Sender: TObject);
    procedure MenuItem14Click(Sender: TObject);
    procedure MenuItem15Click(Sender: TObject);
    procedure MenuItem16Click(Sender: TObject);
    procedure MenuItem17Click(Sender: TObject);
    procedure MenuItem18Click(Sender: TObject);
    procedure MenuItem19Click(Sender: TObject);
    procedure MenuItem8Click(Sender: TObject);
    procedure TextTagsMemoChange(Sender: TObject);
    procedure FormCreate(Sender: TObject);
    procedure FormDestroy(Sender: TObject);
    procedure MenuItem2Click(Sender: TObject);
    procedure MenuItem4Click(Sender: TObject);
    procedure MenuItem5Click(Sender: TObject);
    procedure MenuItem6Click(Sender: TObject);
    procedure MenuItem7Click(Sender: TObject);
    procedure MenuItem9Click(Sender: TObject);
  private
   Ukazatel_List_tag:TStringList;
   Ukazatel_List_name:TStringList;
    procedure ReadUkazatelFile(FileName: string; SheetNum: integer; var List: TStringList);
    procedure ReadUkazatelFile2(FileName: string; SheetNum: integer; var List: TStringList);
    procedure ReadUkazatelFile3(FileName: string; SheetNum: integer;
      var List: TStringList);
   procedure ReadUkazatelFileCol(FileName: string; SheetNum: integer; var List1,List2: TStringList);
  public

  end;

var
  MainForm: TMainForm;

implementation

{$R *.lfm}

{ TMainForm }
//procedure ReadExcelFile(FileName, SheetName: String; ColCount, RowCount: Integer; var Region: TArr2);
procedure ReadExcelFile(FileName, SheetName: String; RowCount: Integer; var Region: TArr2);
var
  Excel, Books, Sheet, Matrix : Variant;
  i, j: Integer;
begin
  Excel := CreateOleObject('Excel.Application');
  Books := Excel.Workbooks.Open(WideString(FileName));
//  Sheet := Books.WorkSheets[WideString(SheetName)];
  Sheet := Books.Sheets.Item[1];
  Excel.DisplayAlerts := False; // отключаем сообщения
  Excel.EnableEvents := False; // отключаем обработку событий
  Excel.ScreenUpdating := False; // отключаем перерисовку объектов на экране
  Excel.DisplayStatusBar := False; // отключаем вывод в строку статуса
  for j := 0 to RowCount-1 do
    Region[i, j] := Sheet.Cells[j+1, 2].Value;
{  Matrix := Excel.Range['A1', Excel.Cells.Item[ColCount, RowCount]].Value;
  for i := 0 to ColCount-1 do
  for j := 0 to RowCount-1 do
    Region[i, j] := Matrix[j+1, i+1];}
  Excel.Quit;
end;

procedure TMainForm.ReadUkazatelFile(FileName:string; SheetNum:integer; var List: TStringList);
var
  Excel, Books, Sheet, Matrix : Variant;
  i: Integer;
  S1, S2:string;
begin
  Excel := CreateOleObject('Excel.Application');
  Books := Excel.Workbooks.Open(WideString(FileName));
  Sheet := Books.Sheets.Item[SheetNum];
  Excel.DisplayAlerts := False; // отключаем сообщения
  Excel.EnableEvents := False; // отключаем обработку событий
  Excel.ScreenUpdating := False; // отключаем перерисовку объектов на экране
  Excel.DisplayStatusBar := False; // отключаем вывод в строку статуса
  for i := 1 to 65535 do
  begin
   S1:=Sheet.Cells[i+1, 1].Value;
   S2:=Sheet.Cells[i+1, 2].Value;
    StatusBar1.Panels[0].Text:='Чтение из файла: лист '+IntToStr(SheetNum)+', строка '+IntTostr(i);
    Application.ProcessMessages;
    if S1='' then
     break else begin if S2='' then List.Add(S1) else List.Add(S2) end;
  end;
  Excel.Quit;
end;

procedure TMainForm.ReadUkazatelFile2(FileName: string; SheetNum: integer;
  var List: TStringList);
var
  Excel, Books, Sheet, Matrix : Variant;
  i: Integer;
  S1, S2:string;
begin
  Excel := CreateOleObject('Excel.Application');
  Books := Excel.Workbooks.Open (WideString(FileName));
  Sheet := Books.Sheets.Item[SheetNum];
  Excel.DisplayAlerts := False; // отключаем сообщения
  Excel.EnableEvents := False; // отключаем обработку событий
  Excel.ScreenUpdating := False; // отключаем перерисовку объектов на экране
  Excel.DisplayStatusBar := False; // отключаем вывод в строку статуса
  for i := 1 to 65535 do
  begin
   S1:=Sheet.Cells[i+1, 1].Value;
   S2:=Sheet.Cells[i+1, 2].Value;
    StatusBar1.Panels[0].Text:='Чтение из файла: лист '+IntToStr(SheetNum)+', строка '+IntTostr(i);
    Application.ProcessMessages;
   if S1='' then break;
   if (S2<>'')and (Pos('_',S2)=0)and (S1<>S2)
     then
      begin
       List.Add(S1+#9+S2);
      end;
  end;
  Excel.Quit;
end;

procedure TMainForm.ReadUkazatelFile3(FileName: string; SheetNum: integer;
  var List: TStringList);
var
  Excel, Books, Sheet, Matrix : Variant;
  i: Integer;
  S1, S2:string;
begin
  Excel := CreateOleObject('Excel.Application');
  Books := Excel.Workbooks.Open (WideString(FileName));
  Sheet := Books.Sheets.Item[SheetNum];
  Excel.DisplayAlerts := False; // отключаем сообщения
  Excel.EnableEvents := False; // отключаем обработку событий
  Excel.ScreenUpdating := False; // отключаем перерисовку объектов на экране
  Excel.DisplayStatusBar := False; // отключаем вывод в строку статуса
  for i := 1 to 65535 do
  begin
   S1:=Sheet.Cells[i+1, 1].Value;
   S2:=Sheet.Cells[i+1, 2].Value;
    StatusBar1.Panels[0].Text:='Чтение из файла: лист '+IntToStr(SheetNum)+', строка '+IntTostr(i);
    Application.ProcessMessages;
   if S1='' then break;
   if (S2<>'')and (Pos('_',S2)=0)and (S1<>S2)
     then
      begin
       List.Add(S1+#9+S1);
      end else List.Add(S1+#9+S2);
  end;
  Excel.Quit;
end;

procedure TMainForm.ReadUkazatelFileCol(FileName: string; SheetNum: integer;
  var List1, List2: TStringList);
var
  Excel, Books, Sheet, Matrix : Variant;
  i: Integer;
  S1, S2:string;
begin
  Excel := CreateOleObject('Excel.Application');
  Books := Excel.Workbooks.Open(WideString(FileName));
  Sheet := Books.Sheets.Item[SheetNum];
  Excel.DisplayAlerts := False; // отключаем сообщения
  Excel.EnableEvents := False; // отключаем обработку событий
  Excel.ScreenUpdating := False; // отключаем перерисовку объектов на экране
  Excel.DisplayStatusBar := False; // отключаем вывод в строку статуса
  for i := 1 to 65535 do
  begin
   S1:=Sheet.Cells[i+1, 1].Value;
   S2:=Sheet.Cells[i+1, 2].Value;
   StatusBar1.Panels[0].Text:='Чтение из файла: лист '+IntToStr(SheetNum)+', строка '+IntTostr(i);
   Application.ProcessMessages;
   if S1='' then break;
   List1.Add(S1);
   List2.Add(S2);
  end;
  Excel.Quit;
end;


procedure TMainForm.MenuItem2Click(Sender: TObject);
begin
  if OpenDialog1.Execute then
  begin
   Memo1.Lines.LoadFromFile(OpenDialog1.FileName);
   TabSheet1.Caption:=ExtractFileName(OpenDialog1.FileName);
   SaveDialog1.FileName:=OpenDialog1.FileName;
  end;
end;

procedure TMainForm.TextTagsMemoChange(Sender: TObject);
begin

end;

procedure TMainForm.MenuItem8Click(Sender: TObject);
var
 i:integer;
begin
 Ukazatel_List_tag.Clear;
 Ukazatel_List_Name.Clear;
 OpenDialog1.FilterIndex:=2;
 if OpenDialog1.Execute then
 begin
  for i:=1 to 4 do ReadUkazatelFileCol (OpenDialog1.FileName, i, Ukazatel_List_name,Ukazatel_List_tag);
//  for i:=1 to 4 do ReadUkazatelFile(OpenDialog1.FileName, i, Ukazatel_List_tag);
  ExcelTagsMemo.Lines.Clear;
  ExcelTagsMemo.Lines.AddStrings(Ukazatel_List_tag);
 end;
end;

procedure TMainForm.MenuItem10Click(Sender: TObject);
var
 i:integer;
begin
 ExtraTagsMemo.Lines.Clear;
 for i:=1 to TextTagsMemo.Lines.Count do
 begin
  if ExcelTagsMemo.Lines.IndexOf(TextTagsMemo.Lines[i-1])=-1 then ExtraTagsMemo.Lines.Add(TextTagsMemo.Lines[i-1]);
  StatusBar1.Panels[0].Text:='Проверка:  '+IntToStr(i)+'/'+IntTostr(TextTagsMemo.Lines.Count);
  Application.ProcessMessages;
 end;
 StatusBar1.Panels[0].Text:='Найдено '+IntToStr(ExtraTagsMemo.Lines.Count)+' тегов';
 PageControl1.ActivePageIndex:=3;
end;

procedure TMainForm.MenuItem11Click(Sender: TObject);
var
 i:integer;
 List:TStringList;
 S_Cur, S_prev:string;
 Pos1:integer;
begin
 List:=TStringList.Create;
 List.AddStrings(ExcelTagsMemo.Lines);
 ExtraTagsMemo.Lines.Clear;
 for i:=1 to List.Count do
  begin
   Pos1:=Pos('\',List[i-1],1);
   if Pos1>0 then S_Cur:=Copy (List[i-1],1,Pos1-1) else S_Cur:=List[i-1];
   if (Pos1>0)and(S_Cur <> S_Prev) then ExtraTagsMemo.Lines.Add(List[i-1]);
   StatusBar1.Panels[0].Text:='Проверка:  '+IntToStr(i)+'/'+IntTostr(ExcelTagsMemo.Lines.Count);
   Application.ProcessMessages;
   S_Prev:=S_Cur;
  end;
 StatusBar1.Panels[0].Text:='Найдено '+IntToStr(ExtraTagsMemo.Lines.Count)+' тегов';
 PageControl1.ActivePageIndex:=3;
 List.Free;
end;

procedure TMainForm.MenuItem12Click(Sender: TObject);
var
 i,j:integer;
 S,S1:string;
 i1,i2, i3 :integer; // #{}
 F:textFile;
 List:TstringList;
 label 1,2;
begin
 List:=TstringList.Create;
 List.Sorted:=True;
 AssignFile(F, SaveDialog1.FileName);
 Reset(F);
 i:=0;
 Repeat
   Readln(F,S);
   inc(i);
   1:
   i1:=Pos('#',S);
   i2:=Pos('{',S);
   i3:=Pos('}',S);
   if (i2=0) or (i3=0) then goto 2;
   if ((i2>i1) and (i3>i2))
    then
    begin
     S1:=Copy(S,i1+1,i3-i1);
     if Pos ('{nil}',S1)>0 then List.Add(S1);
    end
    else TextTagsMemo.Lines.Add('$error '+intToStr(i)+' '+S);
   Delete (S,1,i3+1);
   if S<>'' then Goto 1;
   2:
   StatusBar1.Panels[0].Text:='строка '+IntTostr(i)+'/'+IntTostr(Memo1.Lines.Count);
   Application.ProcessMessages;
 Until EOF(F);
 CloseFile(F);
 ExtraTagsMemo.Clear;
 for i:=1 to List.Count do
 ExtraTagsMemo.Lines.Add(List[i-1]);
 PageControl1.ActivePageIndex:=3;
 List.Free;
end;

procedure TMainForm.MenuItem13Click(Sender: TObject);
var
 i:integer;
begin
 Ukazatel_List_tag.Clear;
 OpenDialog1.FilterIndex:=2;
 if OpenDialog1.Execute then
 begin
  for i:=1 to 4 do ReadUkazatelFile2(OpenDialog1.FileName, i, Ukazatel_List_tag);
  ExcelTagsMemo.Lines.Clear;
  ExcelTagsMemo.Lines.AddStrings(Ukazatel_List_tag);
 end;
end;

procedure TMainForm.MenuItem14Click(Sender: TObject);
var
 i:integer;
begin
 Ukazatel_List_tag.Clear;
 OpenDialog1.FilterIndex:=2;
 if OpenDialog1.Execute then
 begin
  for i:=1 to 4 do ReadUkazatelFile3(OpenDialog1.FileName, i, Ukazatel_List_tag);
  ExcelTagsMemo.Lines.Clear;
  ExcelTagsMemo.Lines.AddStrings(Ukazatel_List_tag);
 end;
end;

procedure TMainForm.MenuItem15Click(Sender: TObject);
var
 i:integer;
 List:TStringList;
begin
 List:=TStringList.Create;
 List.AddStrings(ExcelTagsMemo.Lines);
 List.Sort;
 ExtraTagsMemo.Lines.Clear;
 for i:=1 to List.Count-1 do
  begin
   if List[i]=List[i-1] then ExtraTagsMemo.Lines.Add(List[i-1]);
   StatusBar1.Panels[0].Text:='Проверка:  '+IntToStr(i)+'/'+IntTostr(ExcelTagsMemo.Lines.Count);
   Application.ProcessMessages;
  end;
 { for i:=1 to ExcelTagsMemo.Lines.Count-1 do
 begin
  if ExcelTagsMemo.Lines.IndexOf(ExcelTagsMemo.Lines[i-1],i)<>-1 then ExtraTagsMemo.Lines.Add(ExcelTagsMemo.Lines[i-1]);
  StatusBar1.Panels[0].Text:='Проверка:  '+IntToStr(i)+'/'+IntTostr(ExcelTagsMemo.Lines.Count);
  Application.ProcessMessages;
 end;}
 StatusBar1.Panels[0].Text:='Найдено '+IntToStr(ExtraTagsMemo.Lines.Count)+' тегов';
 PageControl1.ActivePageIndex:=3;
 List.Free;
end;

procedure TMainForm.MenuItem16Click(Sender: TObject);
var
 i:integer;
 S1, S2, S_:string;
 Pos1:integer;
 Pos2:integer;
 Pos_:integer;// "_" in then column 2
begin
 ExtraTagsMemo.Lines.Clear;
 for i:=1 to Ukazatel_List_name.Count do
  begin
   S1:=Ukazatel_List_name[i-1];
   S2:=Ukazatel_List_Tag[i-1];
   Pos1:=Pos('\',S1,1);
   Pos2:=Pos('\',S2,1);
   Pos_:=Pos('_',S2,1);
   if (Pos_=0)and(S1<>S2) then ExtraTagsMemo.Lines.Add(Ukazatel_List_Name[i-1]+#9+Ukazatel_List_Tag[i-1]);
{   if (Pos1<>0) then
   begin
    S1:=Copy(S1,Pos1+1,Length(S1));
    S2:=Copy(S2,Pos2+1,Length(S2));
    if S1<>S2 then ExtraTagsMemo.Lines.Add(Ukazatel_List_Name[i-1]+#9+Ukazatel_List_Tag[i-1]);
   end;}
   StatusBar1.Panels[0].Text:='Проверка:  '+IntToStr(i)+'/'+IntTostr(Ukazatel_List_name.Count);
   Application.ProcessMessages;
  end;
 StatusBar1.Panels[0].Text:='Найдено '+IntToStr(ExtraTagsMemo.Lines.Count)+' тегов';
 PageControl1.ActivePageIndex:=3;
end;

procedure TMainForm.MenuItem17Click(Sender: TObject);
var
 i,j:integer;
 S,S1:string;
 i1,i2, i3 :integer; // #{}
 F:textFile;
 List:TstringList;
 label 1,2;
begin
 List:=TstringList.Create;
 List.Sorted:=True;
 AssignFile(F, SaveDialog1.FileName);
 Reset(F);
 i:=0;
 Repeat
   Readln(F,S);
   inc(i);
   1:
   i1:=Pos('#',S);
   i2:=Pos('{',S);
   i3:=Pos('}',S);
   if (i2=0) or (i3=0) then goto 2;
   if ((i2>i1) and (i3>i2))
    then
    begin
     S1:=Copy(S,i1+1,i3-i1);
     if (Pos ('{',S1)>0)and ((Pos ('{nil}',S1)=0)) then List.Add(S1);
    end
    else TextTagsMemo.Lines.Add('$error '+intToStr(i)+' '+S);
   Delete (S,1,i3+1);
   if S<>'' then Goto 1;
   2:
   StatusBar1.Panels[0].Text:='строка '+IntTostr(i)+'/'+IntTostr(Memo1.Lines.Count);
   Application.ProcessMessages;
 Until EOF(F);
 CloseFile(F);
 ExtraTagsMemo.Clear;
 for i:=1 to List.Count do
 ExtraTagsMemo.Lines.Add(List[i-1]);
 PageControl1.ActivePageIndex:=3;
 List.Free;
end;

procedure TMainForm.MenuItem18Click(Sender: TObject);
var
 i,j:integer;
 S:string;
 i2, i3 :integer; // #{}
 F,F2:textFile;
 NewFileName:string;
 label 1,2;
begin
 NewFileName:=ChangeFileExt(SaveDialog1.FileName,'_no_tags.txt');
 AssignFile(F, SaveDialog1.FileName);
 Reset(F);
 AssignFile(F2,NewFileName);
 Rewrite(F2);
 i:=0;
 Repeat
   Readln(F,S);
   inc(i);
   1:
   i2:=Pos('{',S);
   i3:=Pos('}',S);
   if (i2=0) or (i3=0) then goto 2;
   if (i3>i2) then Delete(S,i2,i3-i2+1);
   Goto 1;
   2:
   Writeln (F2,S);
   StatusBar1.Panels[0].Text:='строка '+IntTostr(i)+'/'+IntTostr(Memo1.Lines.Count);
   Application.ProcessMessages;
 Until EOF(F);
 CloseFile(F);
 CloseFile(F2);
end;

procedure TMainForm.MenuItem19Click(Sender: TObject);
 var
  AFileName:string;
begin
  if not OpenDialog1.Execute then exit;;
  AFileName:=OpenDialog1.FileName;;
end;

procedure TMainForm.ExtraTagsMemoChange(Sender: TObject);
begin

end;


procedure TMainForm.FormCreate(Sender: TObject);
begin
 Ukazatel_List_tag:=TStringList.Create;
 Ukazatel_List_Name:=TStringList.Create;
end;

procedure TMainForm.FormDestroy(Sender: TObject);
begin
  Ukazatel_List_tag.Free;
  Ukazatel_List_name.Free;
end;

procedure TMainForm.MenuItem4Click(Sender: TObject);
var
 i,j, ErrCount:integer;
 S:string;
 i1,i2, i3 :byte; // #{}
 F:textFile;
 F2:textFile;
 ErrFileName:string;
begin
 ErrFileName:=ChangeFileExt(SaveDialog1.FileName,'_err.txt');
 AssignFile(F, SaveDialog1.FileName);
 Reset(F);
 AssignFile(F2,ErrFileName);
 Rewrite(F2);
 i:=0; ErrCount:=0;
 Repeat
   Readln(F,S);
   inc(i);
   i1:=0;i2:=0;i3:=0;
   for j:=1 to Length(S) do
   begin
     if S[j]='#' then inc(i1) else
     if S[j]='{' then inc(i2) else
     if S[j]='}' then inc(i3);
   end;
   if (i1<>i2)or(i1<>i3)or (i3<>i2)
//   then Writeln(F2,'@tag_error '+IntToStr(i)+' '+S);
   then begin Writeln(F2,'$'+S); inc(ErrCount) end
   else Writeln(F2,S);
   StatusBar1.Panels[0].Text:='строка '+IntTostr(i)+'/'+IntTostr(Memo1.Lines.Count);
   Application.ProcessMessages;
 Until EOF(F);
 CloseFile(F);
 CloseFile(F2);
 StatusBar1.Panels[0].Text:='Найдено - '+IntToStr(ErrCount)+' ошибок. См. файл *.err';
end;

procedure TMainForm.MenuItem5Click(Sender: TObject);
begin
 Memo1.Lines.SaveToFile(OpenDialog1.FileName);
end;

procedure TMainForm.MenuItem6Click(Sender: TObject);
begin
 if SaveDialog1.Execute then
 begin
  Memo1.Lines.SaveToFile(SaveDialog1.FileName);
  TabSheet1.Caption:=ExtractFileName(SaveDialog1.FileName);
 end;
end;

procedure TMainForm.MenuItem7Click(Sender: TObject);
var
 i,j:integer;
 S:string;
 i1,i2, i3 :integer; // #{}
 F:textFile;
 List:TstringList;
 label 1,2;
begin
 List:=TstringList.Create;
 List.Sorted:=True;
 AssignFile(F, SaveDialog1.FileName);
 Reset(F);
 i:=0;
 Repeat
   Readln(F,S);
   inc(i);
   1:
   i1:=Pos('#',S);
   i2:=Pos('{',S);
   i3:=Pos('}',S);
   if (i2=0) or (i3=0) then goto 2;
   if ((i2>i1) and (i3>i2))
    then List.Add(Copy(S,i2+1,i3-i2-1))
    else TextTagsMemo.Lines.Add('$error '+intToStr(i)+' '+S);
   Delete (S,1,i3+1);
   if S<>'' then Goto 1;
   2:
   StatusBar1.Panels[0].Text:='строка '+IntTostr(i)+'/'+IntTostr(Memo1.Lines.Count);
   Application.ProcessMessages;
 Until EOF(F);
 CloseFile(F);
 TextTagsMemo.Lines.Clear;
 for i:=1 to List.Count do
 TextTagsMemo.Lines.Add(List[i-1]);
 List.Free;
end;


procedure TMainForm.MenuItem9Click(Sender: TObject);
var
 i:integer;

begin
 Ukazatel_List_Tag.Clear;
 OpenDialog1.FilterIndex:=2;
 if OpenDialog1.Execute then
 begin
  for i:=1 to 4 do ReadUkazatelFile(OpenDialog1.FileName, i, Ukazatel_List_Tag);
  ExcelTagsMemo.Lines.Clear;
  ExcelTagsMemo.Lines.AddStrings(Ukazatel_List_Tag);
 end;
end;

end.

