"use client";

import { useState } from "react";
import { TOOL_GROUPS, TOOL_PROJECTS } from "@/lib/toolbox";
import { useInView } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

/**
 * The toolbox as a map of where each tool was actually used: a row per tool,
 * a column per project, a dot where they meet. Pointing at a row lights the
 * projects that used it; pointing at a project lights its tools.
 */
export function Toolbox() {
  const [ref, inView] = useInView<HTMLDivElement>("0px 0px -10% 0px", true);
  const [tool, setTool] = useState<string | null>(null);
  const [project, setProject] = useState<string | null>(null);
  const clear = () => { setTool(null); setProject(null); };

  const allTools = TOOL_GROUPS.flatMap((g) => g.tools);
  const names = (ids: string[]) => ids.map((id) => TOOL_PROJECTS.find((p) => p.id === id)!.name).join(", ");
  const status = tool
    ? <><b>{tool}</b>: {names(allTools.find((t) => t.name === tool)!.used)}</>
    : project
      ? <><b>{TOOL_PROJECTS.find((p) => p.id === project)!.name}</b>: {allTools.filter((t) => t.used.includes(project)).map((t) => t.name).join(", ")}</>
      : <>Each dot is a project on this page that shipped with the tool. Point at a row or a project.</>;

  return (
    <div ref={ref} className={cn("tb", inView && "in")} onMouseLeave={clear}>
      <div className="tb-legend" role="list">
        {TOOL_PROJECTS.map((p) => (
          <a key={p.id} href={p.href} role="listitem" className={cn("tb-proj", project === p.id && "on")}
            onMouseEnter={() => { setProject(p.id); setTool(null); }} onFocus={() => { setProject(p.id); setTool(null); }}>
            <span>{p.index}</span>{p.name}
          </a>
        ))}
      </div>
      <p className="tb-status" aria-live="polite">{status}</p>
      <div className="tb-tables">
        {TOOL_GROUPS.map((g) => (
          <table key={g.name} className="tb-table">
            <thead>
              <tr>
                <th scope="col" className="tb-group">{g.name}</th>
                {TOOL_PROJECTS.map((p) => (
                  <th key={p.id} scope="col" className={cn("tb-col", project === p.id && "on")} onMouseEnter={() => { setProject(p.id); setTool(null); }}>
                    <abbr title={p.name}>{p.index}</abbr>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {g.tools.map((t, r) => (
                <tr key={t.name} className={cn(tool === t.name && "on", project && t.used.includes(project) && "lit")}
                  onMouseEnter={() => { setTool(t.name); setProject(null); }}
                  onClick={() => { setTool((x) => (x === t.name ? null : t.name)); setProject(null); }}>
                  <th scope="row">{t.name}</th>
                  {TOOL_PROJECTS.map((p, c) => {
                    const used = t.used.includes(p.id);
                    return <td key={p.id} className={cn(project === p.id && "on")} aria-label={used ? `${t.name} in ${p.name}` : undefined}>
                      {used ? <i className="tb-dot" style={{ "--d": `${(r * 30 + c * 45)}ms` } as React.CSSProperties} /> : <i className="tb-nil" />}
                    </td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>
    </div>
  );
}
