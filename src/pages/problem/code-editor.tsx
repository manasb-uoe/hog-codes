import {
  FileTabs,
  SandpackConsole,
  SandpackStack,
  useActiveCode,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { Editor, OnMount } from "@monaco-editor/react";
import { Typography, useTheme } from "@mui/material";
import { KeyCode, KeyMod } from "monaco-editor";
import { Ref, useCallback, useImperativeHandle, useRef, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

export interface ICodeEditorRef {
  resetAllFiles: () => void;
  getAllFilesContent: () => React.RefObject<Record<string, string>>;
  updateFiles: (
    files: Record<string, string>,
    mergeWithOriginal?: boolean
  ) => void;
}

function prefixPathsWithSlash(files: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(files).map(([key, value]) => {
      if (!key.startsWith("/")) {
        return ["/" + key, value];
      }
      return [key, value];
    })
  );
}

export function CodeEditor({
  ref,
  initialFiles,
}: {
  ref: Ref<ICodeEditorRef>;
  initialFiles: Record<string, string>;
}) {
  const { code, updateCode } = useActiveCode();
  const { sandpack, dispatch } = useSandpack();
  const theme = useTheme();
  const [editorResetCounter, setEditorResetCounter] = useState(0);

  const fileContentMap = useRef<Record<string, string>>(null);

  // optimal workaround since useRef doesn't accept a factory init function
  if (fileContentMap.current === null) {
    fileContentMap.current = prefixPathsWithSlash(initialFiles);
  }

  useImperativeHandle(ref, () => {
    return {
      resetAllFiles: () => {
        sandpack.resetAllFiles();
        fileContentMap.current = prefixPathsWithSlash(initialFiles);
        setEditorResetCounter((prev) => ++prev);
      },
      getAllFilesContent: () => {
        return fileContentMap as React.RefObject<Record<string, string>>;
      },
      updateFiles: (files, mergeWithOriginal = true) => {
        const filesToUpdate = mergeWithOriginal
          ? { ...prefixPathsWithSlash(initialFiles), ...files }
          : files;
        for (const path in filesToUpdate) {
          sandpack.updateFile(path, filesToUpdate[path]);
        }
        setEditorResetCounter((prev) => ++prev);
      },
    };
  });

  const _updateCode = useCallback(
    (code?: string) => {
      const value = code ?? "";
      updateCode(value);

      if (fileContentMap.current) {
        fileContentMap.current[sandpack.activeFile] = value;
      }
    },
    [updateCode, sandpack.activeFile]
  );

  const onEditorMount = useCallback<OnMount>(
    (editor) => {
      editor.addAction({
        id: "runTests",
        label: "Run Tests",
        keybindings: [KeyMod.CtrlCmd | KeyCode.Enter],
        run: () => {
          dispatch({ type: "run-all-tests" });
        },
      });
    },
    [dispatch]
  );

  return (
    <SandpackStack className="m-0 h-full">
      <FileTabs />
      <PanelGroup direction="vertical">
        <Panel defaultSize={80}>
          <Editor
            onMount={onEditorMount}
            width="100%"
            language="javascript"
            theme={theme.palette.mode === "dark" ? "vs-dark" : "vs-light"}
            key={`${sandpack.activeFile}-${editorResetCounter}`}
            defaultValue={code}
            onChange={_updateCode}
          />
        </Panel>
        <PanelResizeHandle
          className="h-[1px]"
          hitAreaMargins={{ coarse: 25, fine: 15 }}
        />
        <Panel className="flex flex-col">
          <div
            className="px-4 py-2 border-b w-full justify-between flex items-center"
            style={{
              borderColor: "var(--sp-colors-surface2)",
              backgroundColor: "var(--sp-colors-surface1)",
            }}
          >
            <Typography
              fontSize={"var(--sp-font-mono)"}
              fontFamily={"var(--sp-font-mono)"}
              color="var(--sp-colors-base)"
              variant="body1"
            >
              Console
            </Typography>
            <Typography color="info" variant="body2">
              Use <strong>Command + Enter</strong> to execute tests when not in
              Watch mode
            </Typography>
          </div>
          <SandpackConsole
            showResetConsoleButton
            showSetupProgress
            resetOnPreviewRestart
            className="grow overflow-y-auto"
          />
        </Panel>
        <PanelResizeHandle
          className="h-[1px]"
          hitAreaMargins={{ coarse: 25, fine: 15 }}
        />
      </PanelGroup>
    </SandpackStack>
  );
}
