import { Link } from "@mui/material";
import Markdown from "react-markdown";
import { Prism } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

export const MarkdownRenderer = ({
  children,
}: React.PropsWithChildren<unknown>) => {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      children={children as string}
      components={{
        ol: ({ children, ...props }) => (
          <ol className="list-decimal list-inside" {...props}>
            {children}
          </ol>
        ),
        ul: ({ children, ...props }) => (
          <ul className="list-disc list-inside" {...props}>
            {children}
          </ul>
        ),
        a: ({ children, ...props }) => (
          <Link target="_blank" {...props}>
            {children}
          </Link>
        ),
        code(props) {
          const { children, className, ...rest } = props;
          const match = /language-(\w+)/.exec(className || "");
          return match ? (
            <Prism
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...(rest as any)}
              PreTag="div"
              children={String(children).replace(/\n$/, "")}
              language={match[1]}
              style={oneDark}
              customStyle={{ fontSize: "12px" }}
            />
          ) : (
            <code {...rest} className={className}>
              {children}
            </code>
          );
        },
      }}
    />
  );
};
