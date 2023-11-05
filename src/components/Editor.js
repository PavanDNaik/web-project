import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MonacoEditor from "@monaco-editor/react";
import SplitPane, { Pane } from "split-pane-react";
import "split-pane-react/esm/themes/default.css";
async function getProblemInfo({ problemId }) {
  const problemInfoString = await fetch(
    `http://localhost:5000/problems/${problemId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const problemInfoObject = await problemInfoString
    .json()
    .catch((err) => console.log(err));
  return { ...problemInfoObject.problemInfo };
}
function Editor() {
  const [code, setCode] = useState("");
  const [lang, setLang] = useState("python");
  const [theme, setTheme] = useState("vs-dark");
  const [testResult, setTestResult] = useState("");
  const [problemInfo, setProblemInfo] = useState({});

  //split-pane
  const [bodySizes, setBodySizes] = useState([100, "10%", "auto"]);
  const [editorSizes, setEditorSizes] = useState([100, "10%", "auto"]);
  const problemId = useParams();

  useEffect(() => {
    getProblemInfo(problemId).then((data) => {
      setProblemInfo({ ...data });
    });
  }, [problemId]);

  async function handleRun(e) {
    e.target.disable = true;
    const result = await fetch("http://localhost:5000/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: code,
        lang: lang,
      }),
    }).catch((err) => {
      console.log(err);
    });
    if (!result) return;
    const output = await result.json();
    setTestResult(output);
    e.target.disable = false;
  }

  return (
    <div className="coding-interface">
      <SplitPane split="vertical" sizes={bodySizes} onChange={setBodySizes}>
        <Pane minSize={50} maxSize="70%">
          <div className="split-pane-layoutCSS  problem-info">
            <h3 className="problem-title">{problemInfo.title}</h3>
            <pre className="problem-discrption">{problemInfo.discription}</pre>
            <div className="problem-examples"></div>
          </div>
        </Pane>

        <Pane>
          <SplitPane
            split="horizontal"
            sizes={editorSizes}
            onChange={setEditorSizes}
          >
            <Pane
              minSize={50}
              maxSize="70%"
              className="monaco-editor-container"
            >
              <div className="editor-config-selects">
                <select
                  onChange={(e) => {
                    setLang(e.target.value);
                  }}
                >
                  <option value="python">python</option>
                  <option value="java">java</option>
                  <option value="c">C</option>
                  <option value="cpp">C++</option>
                </select>
                <select
                  onChange={(e) => {
                    setTheme(e.target.value);
                  }}
                >
                  <option value="vs-dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>
              <div className="codeEditor">
                <MonacoEditor
                  language={lang}
                  theme={theme}
                  onChange={(value) => setCode(value)}
                />
              </div>
            </Pane>

            <div className="split-pane-layoutCSS ">
              <div className="output-section-container">
                <button onClick={async (e) => await handleRun(e)}>run</button>
                <button>submit</button>
                <pre className="editor-testresult">{testResult}</pre>
              </div>
            </div>
          </SplitPane>
        </Pane>
      </SplitPane>
    </div>
  );
}

export default Editor;
