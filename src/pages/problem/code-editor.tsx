import {
  FileTabs,
  SandpackConsole,
  SandpackStack,
  useActiveCode,
  useSandpack,
} from "@codesandbox/sandpack-react";
import Editor from "@monaco-editor/react";
import { Typography, useTheme } from "@mui/material";
import { Ref, useCallback, useImperativeHandle, useRef } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

export interface ICodeEditorRef {
  resetAllFiles: () => void;
  getAllFilesContent: () => React.RefObject<Record<string, string>>;
}

export function CodeEditor({ ref }: { ref: Ref<ICodeEditorRef> }) {
  const { code, updateCode } = useActiveCode();
  const { sandpack } = useSandpack();
  const theme = useTheme();

  const getAllVisibleFilesContent = useCallback(() => {
    return sandpack.visibleFiles.reduce<Record<string, string>>((acc, path) => {
      acc[path] = sandpack.files[path].code;
      return acc;
    }, {});
  }, [sandpack.files, sandpack.visibleFiles]);

  const fileContentMap = useRef<Record<string, string>>(
    getAllVisibleFilesContent()
  );

  useImperativeHandle(ref, () => {
    return {
      resetAllFiles: () => {
        sandpack.resetAllFiles();
        fileContentMap.current = getAllVisibleFilesContent();
      },
      getAllFilesContent: () => {
        return fileContentMap;
      },
    };
  });

  const _updateCode = useCallback(
    (code?: string) => {
      const value = code ?? "";
      updateCode(value);
      fileContentMap.current[sandpack.activeFile] = value;
    },
    [updateCode, sandpack.activeFile]
  );

  return (
    <SandpackStack className="m-0 h-full">
      <FileTabs />
      <PanelGroup direction="vertical">
        <Panel defaultSize={80}>
          <Editor
            width="100%"
            language="javascript"
            theme={theme.palette.mode === "dark" ? "vs-dark" : "vs-light"}
            key={sandpack.activeFile}
            defaultValue={code}
            onChange={_updateCode}
          />
        </Panel>
        <PanelResizeHandle
          className="h-[1px]"
          hitAreaMargins={{ coarse: 25, fine: 15 }}
        />
        <Panel>
          <div className="flex flex-col h-full">
            <div
              className="px-4 py-2 border-b w-full"
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
            </div>
            <SandpackConsole showResetConsoleButton className="h-full" />
          </div>
        </Panel>
        <PanelResizeHandle
          className="h-[1px]"
          hitAreaMargins={{ coarse: 25, fine: 15 }}
        />
      </PanelGroup>
    </SandpackStack>
  );
}
