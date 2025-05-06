!include "MUI2.nsh"

;--------------------------------
; Interface Configuration

!define MUI_ABORTWARNING

;--------------------------------
; Pages

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_COMPONENTS
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

;--------------------------------
; Languages

!insertmacro MUI_LANGUAGE "English"

;--------------------------------
; Installer Sections

Section "Fit File Viewer" SecMain
  SetOutPath "$INSTDIR"
  ; Copy all files
  File /r "*.*"

  ; Desktop Shortcut
  CreateShortcut "$DESKTOP\\Fit File Viewer.lnk" "$INSTDIR\\Fit File Viewer.exe"

  ; Start Menu Shortcut (no MUI_STARTMENU macros)
  CreateShortcut "$SMPROGRAMS\\Fit File Viewer.lnk" "$INSTDIR\\Fit File Viewer.exe"

  ; File Association for .fit
  WriteRegStr HKCR ".fit" "" "FitFileViewer.fit"
  WriteRegStr HKCR "FitFileViewer.fit" "" "Flexible and Interoperable Data Transfer File"
  WriteRegStr HKCR "FitFileViewer.fit\\DefaultIcon" "" "$INSTDIR\\Fit File Viewer.exe,0"
  WriteRegStr HKCR "FitFileViewer.fit\\shell\\open\\command" "" '"$INSTDIR\\Fit File Viewer.exe" "%1"'
SectionEnd

;--------------------------------
; Uninstaller Section

Section "Uninstall"
  Delete "$DESKTOP\\Fit File Viewer.lnk"
  Delete "$SMPROGRAMS\\Fit File Viewer.lnk"
  RMDir /r "$INSTDIR"
  DeleteRegKey HKCR ".fit"
  DeleteRegKey HKCR "FitFileViewer.fit"
SectionEnd