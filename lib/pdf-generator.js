import jsPDF from "jspdf";

const PW = 210;
const PH = 297;
const MX = 18;
const MT = 20;
const MB = 22;
const CW = PW - MX * 2;
const MAX_Y = PH - MB;

const CLR = {
  primary: [79, 70, 229],
  success: [22, 163, 74],
  warning: [202, 138, 4],
  danger: [220, 38, 38],
  dark: [15, 23, 42],
  body: [51, 65, 85],
  muted: [100, 116, 139],
  light: [241, 245, 249],
  border: [226, 232, 240],
  white: [255, 255, 255],
};

const PRIORITY_CLR = {
  high: CLR.danger,
  medium: CLR.warning,
  low: CLR.success,
};

const PRIORITY_BG = {
  high: [
    [254, 226, 226],
    [252, 165, 165],
  ],
  medium: [
    [254, 249, 195],
    [253, 224, 71],
  ],
  low: [
    [220, 252, 231],
    [134, 239, 172],
  ],
};

function setFill(doc, rgb) {
  doc.setFillColor(rgb[0], rgb[1], rgb[2]);
}
function setDraw(doc, rgb) {
  doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
}
function setTxt(doc, rgb) {
  doc.setTextColor(rgb[0], rgb[1], rgb[2]);
}

function setFont(doc, style, size) {
  doc.setFont("helvetica", style);
  doc.setFontSize(size);
}

function needsPage(doc, y, h = 10) {
  if (y + h > MAX_Y) {
    doc.addPage();
    return MT;
  }
  return y;
}

function wrappedText(doc, text, x, y, maxW, lh = 5) {
  const lines = doc.splitTextToSize(String(text || ""), maxW);
  for (const line of lines) {
    y = needsPage(doc, y, lh);
    doc.text(line, x, y);
    y += lh;
  }
  return y;
}

function sectionTitle(doc, label, y) {
  y = needsPage(doc, y, 16);
  setFont(doc, "bold", 13);
  setTxt(doc, CLR.primary);
  doc.text(label, MX, y);
  y += 2;
  setDraw(doc, CLR.primary);
  doc.setLineWidth(0.5);
  doc.line(MX, y, MX + CW, y);
  return y + 6;
}

function skillPills(doc, items, startX, startY, maxX) {
  let x = startX;
  let y = startY;
  items.forEach((item) => {
    const label = typeof item === "string" ? item : (item.name ?? "");
    if (!label) return;
    setFont(doc, "normal", 8);
    const w = doc.getTextWidth(label) + 6;
    if (x + w > maxX) {
      x = startX;
      y += 8;
    }
    const prevY = y;
    y = needsPage(doc, y, 10);
    if (y !== prevY) x = startX;
    setFill(doc, CLR.light);
    setDraw(doc, CLR.border);
    doc.roundedRect(x, y - 4.5, w, 6.5, 1.5, 1.5, "FD");
    setTxt(doc, CLR.body);
    doc.text(label, x + 3, y);
    x += w + 2;
  });
  return y;
}

function buildCover(doc, data) {
  setFill(doc, CLR.primary);
  doc.rect(0, 0, PW, 52, "F");

  setFont(doc, "bold", 21);
  setTxt(doc, CLR.white);
  doc.text("Skill Gap Analysis Report", PW / 2, 28, { align: "center" });

  setFont(doc, "normal", 10);
  doc.text("AI-Powered Career Development", PW / 2, 40, { align: "center" });

  let y = 68;

  if (data.targetRole || data.role) {
    setFont(doc, "bold", 15);
    setTxt(doc, CLR.dark);
    doc.text("Target Role", MX, y);
    y += 7;
    setFont(doc, "normal", 12);
    setTxt(doc, CLR.body);
    doc.text(String(data.targetRole || data.role), MX, y);
    y += 12;
  }

  const meta = [
    ["Experience", String(data.experience ?? "N/A")],
    ["Match Score", data.matchScore != null ? `${data.matchScore}%` : "N/A"],
    [
      "Generated",
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    ],
  ];

  meta.forEach(([label, value]) => {
    setFont(doc, "bold", 8);
    setTxt(doc, CLR.muted);
    doc.text(label.toUpperCase(), MX, y);
    setFont(doc, "normal", 10);
    setTxt(doc, CLR.dark);
    doc.text(value, MX + 42, y);
    y += 9;
  });

  y += 4;
  setDraw(doc, CLR.border);
  doc.setLineWidth(0.3);
  doc.line(MX, y, MX + CW, y);
  y += 8;

  const skills = Array.isArray(data.currentSkills)
    ? data.currentSkills.slice(0, 16)
    : [];
  if (skills.length > 0) {
    setFont(doc, "bold", 10);
    setTxt(doc, CLR.dark);
    doc.text("Your Current Skills", MX, y);
    y += 7;
    let x = MX;
    for (const skill of skills) {
      const label = typeof skill === "string" ? skill : (skill.name ?? "");
      if (!label) continue;
      setFont(doc, "normal", 8);
      const w = doc.getTextWidth(label) + 6;
      if (x + w > MX + CW) {
        x = MX;
        y += 8;
      }
      if (y > PH - 28) break;
      setFill(doc, CLR.light);
      setDraw(doc, CLR.border);
      doc.roundedRect(x, y - 4.5, w, 6.5, 1.5, 1.5, "FD");
      setTxt(doc, CLR.body);
      doc.text(label, x + 3, y);
      x += w + 2;
    }
  }
}

function buildMatchScore(doc, data, y) {
  y = sectionTitle(doc, "Skill Match Score", y);

  const score = Math.min(100, Math.max(0, Number(data.matchScore ?? 0)));
  const scoreClr =
    score >= 70 ? CLR.success : score >= 40 ? CLR.warning : CLR.danger;
  const scoreLabel =
    score >= 70
      ? "Strong Match"
      : score >= 40
        ? "Moderate Match"
        : "Needs Improvement";

  setFill(doc, CLR.light);
  setDraw(doc, CLR.border);
  doc.roundedRect(MX, y, CW, 22, 3, 3, "FD");

  setFont(doc, "bold", 26);
  setTxt(doc, scoreClr);
  doc.text(`${score}%`, MX + 10, y + 15);

  setFont(doc, "bold", 11);
  setTxt(doc, CLR.dark);
  doc.text(scoreLabel, MX + 36, y + 9);

  const summary = String(data.summary ?? data.description ?? "");
  if (summary) {
    setFont(doc, "normal", 8);
    setTxt(doc, CLR.muted);
    const lines = doc.splitTextToSize(summary, CW - 42);
    if (lines[0]) doc.text(lines[0], MX + 36, y + 17);
  }

  return y + 30;
}

function buildMissingSkills(doc, missingSkills, y) {
  const list = Array.isArray(missingSkills) ? missingSkills : [];
  if (list.length === 0) return y;

  y = sectionTitle(doc, "Missing Skills", y);

  let x = MX;
  list.forEach((skill) => {
    const label = typeof skill === "string" ? skill : (skill.name ?? "");
    if (!label) return;
    setFont(doc, "normal", 8);
    const w = doc.getTextWidth(label) + 6;
    if (x + w > MX + CW) {
      x = MX;
      y += 8;
    }
    y = needsPage(doc, y, 10);
    setFill(doc, [254, 226, 226]);
    setDraw(doc, [252, 165, 165]);
    doc.roundedRect(x, y - 4.5, w, 6.5, 1.5, 1.5, "FD");
    setTxt(doc, CLR.danger);
    doc.text(label, x + 3, y);
    x += w + 2;
  });

  return y + 12;
}

function buildPrioritySkills(doc, prioritySkills, y) {
  if (!prioritySkills) return y;

  // normalize both shapes: flat array or { high, medium, low } object
  let groups = { high: [], medium: [], low: [] };
  if (Array.isArray(prioritySkills)) {
    if (prioritySkills.length === 0) return y;
    prioritySkills.forEach((skill) => {
      const lvl = String(skill.priority ?? "low").toLowerCase();
      if (groups[lvl] !== undefined) groups[lvl].push(skill);
      else groups.low.push(skill);
    });
  } else if (typeof prioritySkills === "object") {
    groups.high = (prioritySkills.high ?? []).map((s) =>
      typeof s === "string" ? { name: s, priority: "high" } : s,
    );
    groups.medium = (prioritySkills.medium ?? []).map((s) =>
      typeof s === "string" ? { name: s, priority: "medium" } : s,
    );
    groups.low = (prioritySkills.low ?? []).map((s) =>
      typeof s === "string" ? { name: s, priority: "low" } : s,
    );
  }

  const hasAny =
    groups.high.length > 0 || groups.medium.length > 0 || groups.low.length > 0;
  if (!hasAny) return y;

  y = sectionTitle(doc, "Priority Skills", y);

  Object.entries(groups).forEach(([level, items]) => {
    if (items.length === 0) return;
    y = needsPage(doc, y, 14);

    setFont(doc, "bold", 9);
    setTxt(doc, PRIORITY_CLR[level] ?? CLR.muted);
    doc.text(
      `${level.charAt(0).toUpperCase()}${level.slice(1)} Priority`,
      MX,
      y,
    );
    y += 5;

    let x = MX;
    items.forEach((skill) => {
      const label = typeof skill === "string" ? skill : (skill.name ?? "");
      if (!label) return;
      setFont(doc, "normal", 8);
      const w = doc.getTextWidth(label) + 6;
      if (x + w > MX + CW) {
        x = MX;
        y += 8;
      }
      y = needsPage(doc, y, 10);
      const [bg, border] = PRIORITY_BG[level] ?? PRIORITY_BG.low;
      setFill(doc, bg);
      setDraw(doc, border);
      doc.roundedRect(x, y - 4.5, w, 6.5, 1.5, 1.5, "FD");
      setTxt(doc, PRIORITY_CLR[level] ?? CLR.body);
      doc.text(label, x + 3, y);
      x += w + 2;
    });
    y += 10;
  });

  return y;
}

function buildRoadmap(doc, roadmap, y) {
  const list = Array.isArray(roadmap) ? roadmap : [];
  if (list.length === 0) return y;

  y = sectionTitle(doc, "Learning Roadmap", y);

  list.forEach((step, i) => {
    const title = String(
      step.step ?? step.title ?? step.phase ?? `Step ${i + 1}`,
    );
    const desc = String(step.description ?? step.details ?? "");
    const dur = String(step.duration ?? "");

    y = needsPage(doc, y, 18);

    setFill(doc, CLR.primary);
    doc.circle(MX + 4, y - 1, 3.5, "F");
    setFont(doc, "bold", 8);
    setTxt(doc, CLR.white);
    doc.text(String(i + 1), MX + 4, y, { align: "center" });

    setFont(doc, "bold", 10);
    setTxt(doc, CLR.dark);
    doc.text(title, MX + 12, y);

    if (dur) {
      setFont(doc, "normal", 7);
      setTxt(doc, CLR.muted);
      const dw = doc.getTextWidth(dur);
      doc.text(dur, MX + CW - dw, y);
    }

    y += 6;

    if (desc) {
      setFont(doc, "normal", 9);
      setTxt(doc, CLR.body);
      y = wrappedText(doc, desc, MX + 12, y, CW - 14, 5);
    }

    const skills = Array.isArray(step.skills) ? step.skills.slice(0, 5) : [];
    if (skills.length > 0) {
      y += 2;
      y = skillPills(doc, skills, MX + 12, y, MX + CW);
      y += 6;
    }

    y += 4;
  });

  return y;
}

function buildVisualRoadmap(doc, roadmap, targetRole, y) {
  const list = Array.isArray(roadmap) ? roadmap : [];
  if (list.length === 0) return y;

  y = sectionTitle(doc, "Visual Learning Timeline", y);

  const phaseClrs = [CLR.primary, [139, 92, 246], [20, 184, 166], CLR.success];

  // Header info
  const totalMonths = list.reduce((sum, step) => {
    const m = parseInt(String(step.duration ?? "").match(/\d+/)?.[0] ?? 0);
    return sum + m;
  }, 0);

  if (targetRole) {
    setFont(doc, "normal", 8);
    setTxt(doc, CLR.muted);
    doc.text(`Roadmap for ${targetRole}`, MX, y);
    y += 5;
  }

  // Badge-like stats
  setFont(doc, "bold", 8);
  setTxt(doc, CLR.primary);
  doc.text(`${list.length} milestones`, MX, y);
  if (totalMonths > 0) {
    setTxt(doc, CLR.success);
    doc.text(`${totalMonths} months total`, MX + 40, y);
  }
  y += 8;

  // Month axis labels
  const axisY = y;
  const BAR_X = MX + 55;
  const BAR_W = CW - 55;
  const colW = BAR_W / Math.max(totalMonths, 1);

  setFont(doc, "normal", 7);
  setTxt(doc, CLR.muted);
  const monthNames = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  const startMonth = new Date().getMonth();
  for (let m = 0; m < Math.min(totalMonths, 8); m++) {
    const mx = BAR_X + m * colW;
    doc.text(monthNames[(startMonth + m) % 12], mx, axisY);
    // grid line
    setDraw(doc, CLR.border);
    doc.setLineWidth(0.2);
    doc.line(mx, axisY + 2, mx, axisY + 2 + list.length * 16);
  }
  y += 8;

  // Gantt rows
  let offsetMonths = 0;
  list.forEach((step, i) => {
    const title = String(
      step.step ?? step.title ?? step.phase ?? `Step ${i + 1}`,
    );
    const dur = parseInt(String(step.duration ?? "").match(/\d+/)?.[0] ?? 1);
    const clr = phaseClrs[i % phaseClrs.length];

    y = needsPage(doc, y, 14);

    // Number circle
    setFill(doc, clr);
    doc.circle(MX + 4, y + 3, 4, "F");
    setFont(doc, "bold", 8);
    setTxt(doc, CLR.white);
    doc.text(String(i + 1), MX + 4, y + 4.5, { align: "center" });

    // Row label
    setFont(doc, "bold", 8);
    setTxt(doc, CLR.dark);
    const labelMaxW = 48;
    const labelLines = doc.splitTextToSize(title, labelMaxW);
    doc.text(labelLines[0], MX + 11, y + 4);

    setFont(doc, "normal", 7);
    setTxt(doc, CLR.muted);
    doc.text(`${dur} month${dur !== 1 ? "s" : ""}`, MX + 11, y + 9);

    // Gantt bar
    const barX = BAR_X + offsetMonths * colW;
    const barW = dur * colW - 1;
    const barH = 8;
    const barY = y;

    setFill(doc, clr);
    setDraw(doc, clr);
    doc.roundedRect(barX, barY, barW, barH, 1.5, 1.5, "FD");

    // Play icon dot (▶ substitute)
    setFill(doc, CLR.white);
    doc.circle(barX + 4, barY + 4, 1.5, "F");

    // Bar label
    if (barW > 20) {
      setFont(doc, "bold", 7);
      setTxt(doc, CLR.white);
      doc.text(labelLines[0], barX + 9, barY + 5.5);
    }

    // Flag icon at end
    setFont(doc, "normal", 7);
    setTxt(doc, CLR.white);
    doc.text("⚑", barX + barW - 5, barY + 5.5);

    offsetMonths += dur;
    y += 16;
  });

  // Milestone legend row
  y += 4;
  y = needsPage(doc, y, 10);
  setFont(doc, "bold", 7);
  setTxt(doc, CLR.muted);
  doc.text("MILESTONES", MX, y);
  y += 5;

  list.forEach((step, i) => {
    const title = String(
      step.step ?? step.title ?? step.phase ?? `Step ${i + 1}`,
    );
    const clr = phaseClrs[i % phaseClrs.length];
    const shortTitle = title.length > 14 ? title.slice(0, 13) + "…" : title;
    const dotX = MX + i * 48;
    if (dotX + 40 > MX + CW) return;
    setFill(doc, clr);
    doc.circle(dotX + 2, y - 1.5, 2, "F");
    setFont(doc, "normal", 7);
    setTxt(doc, CLR.body);
    doc.text(shortTitle, dotX + 6, y);
  });
  y += 8;

  // Progress bar
  y = needsPage(doc, y, 14);
  setFont(doc, "normal", 7);
  setTxt(doc, CLR.muted);
  doc.text("Start", MX, y);
  const jobLabel = `Job-Ready in ${list.reduce((s, step) => s + parseInt(String(step.duration ?? "").match(/\d+/)?.[0] ?? 0), 0)} months`;
  const jw = doc.getTextWidth(jobLabel);
  doc.text(jobLabel, MX + CW - jw, y);
  y += 4;

  // Segmented progress bar
  let offsetMonths2 = 0;
  const totalM = list.reduce(
    (s, step) =>
      s + parseInt(String(step.duration ?? "").match(/\d+/)?.[0] ?? 0),
    0,
  );
  list.forEach((step, i) => {
    const dur = parseInt(String(step.duration ?? "").match(/\d+/)?.[0] ?? 1);
    const clr = phaseClrs[i % phaseClrs.length];
    const segX = MX + (offsetMonths2 / Math.max(totalM, 1)) * CW;
    const segW = (dur / Math.max(totalM, 1)) * CW;
    setFill(doc, clr);
    doc.rect(segX, y, segW, 3, "F");
    offsetMonths2 += dur;
  });
  y += 3;

  setFont(doc, "normal", 7);
  setTxt(doc, CLR.muted);
  doc.text("Month 1", MX, y + 4);
  const endLabel = `Month ${totalMonths}`;
  doc.text(endLabel, MX + CW - doc.getTextWidth(endLabel), y + 4);

  return y + 10;
}

function buildCourses(doc, courses, y) {
  const list = Array.isArray(courses) ? courses.slice(0, 8) : [];
  if (list.length === 0) return y;

  y = sectionTitle(doc, "Recommended Courses", y);

  list.forEach((course) => {
    const title = String(course.title ?? "Untitled Course");
    const provider = String(course.provider ?? "Online Platform");
    const diff = String(course.difficulty ?? "");
    const dur = String(course.duration ?? "");
    const cardH = 20;

    y = needsPage(doc, y, cardH + 4);

    setFill(doc, CLR.light);
    setDraw(doc, CLR.border);
    doc.roundedRect(MX, y, CW, cardH, 2, 2, "FD");

    setFont(doc, "bold", 10);
    setTxt(doc, CLR.dark);
    doc.text(title, MX + 4, y + 7);

    setFont(doc, "normal", 8);
    setTxt(doc, CLR.muted);
    doc.text(provider, MX + 4, y + 14);

    if (dur) {
      setFont(doc, "normal", 7);
      setTxt(doc, CLR.muted);
      const dw = doc.getTextWidth(dur);
      doc.text(dur, MX + CW - dw - 3, y + 7);
    }

    if (diff) {
      const dl = diff.toLowerCase();
      const diffBg =
        dl === "beginner"
          ? [220, 252, 231]
          : dl === "advanced"
            ? [254, 226, 226]
            : [254, 249, 195];
      const diffTxt =
        dl === "beginner"
          ? CLR.success
          : dl === "advanced"
            ? CLR.danger
            : CLR.warning;
      setFont(doc, "normal", 7);
      const dw = doc.getTextWidth(diff) + 4;
      setFill(doc, diffBg);
      setDraw(doc, diffBg);
      doc.roundedRect(MX + CW - dw - 3, y + 9, dw, 5, 1, 1, "F");
      setTxt(doc, diffTxt);
      doc.text(diff, MX + CW - dw - 1, y + 13);
    }

    y += cardH + 4;
    if (course.description) {
      setFont(doc, "normal", 8);
      setTxt(doc, CLR.body);
      const descLines = doc
        .splitTextToSize(String(course.description), CW)
        .slice(0, 2);
      descLines.forEach((line) => {
        y = needsPage(doc, y, 5);
        doc.text(line, MX, y);
        y += 5;
      });
      y += 2;
    }
  });

  return y;
}

function buildTimeline(doc, timeline, y) {
  if (!timeline) return y;

  if (
    typeof timeline === "string" ||
    (typeof timeline === "object" && !Array.isArray(timeline))
  ) {
    y = sectionTitle(doc, "Learning Timeline", y);
    const text =
      typeof timeline === "string"
        ? timeline
        : timeline?.estimate
          ? `Estimated: ${timeline.estimate}${timeline.breakdown ? "\n" + timeline.breakdown : ""}`
          : JSON.stringify(timeline, null, 2);
    setFont(doc, "normal", 10);
    setTxt(doc, CLR.body);
    y = wrappedText(doc, text, MX, y, CW, 6);
    return y + 6;
  }

  const list = Array.isArray(timeline) ? timeline : [];
  if (list.length === 0) return y;

  y = sectionTitle(doc, "Learning Timeline", y);

  const phaseClrs = [CLR.primary, [139, 92, 246], [249, 115, 22], CLR.success];

  list.forEach((phase, i) => {
    const name = String(phase.phase ?? phase.name ?? `Phase ${i + 1}`);
    const dur = String(phase.duration ?? "");
    const desc = String(phase.description ?? "");
    const clr = phaseClrs[i % phaseClrs.length];

    y = needsPage(doc, y, 16);

    setFill(doc, clr);
    doc.rect(MX, y, 3, 12, "F");

    setFont(doc, "bold", 10);
    setTxt(doc, CLR.dark);
    doc.text(name, MX + 7, y + 5);

    if (dur) {
      setFont(doc, "normal", 8);
      setTxt(doc, CLR.muted);
      doc.text(dur, MX + 7, y + 12);
    }

    y += 16;

    if (desc) {
      setFont(doc, "normal", 9);
      setTxt(doc, CLR.body);
      y = wrappedText(doc, desc, MX + 7, y, CW - 9, 5);
    }

    const milestones = Array.isArray(phase.milestones)
      ? phase.milestones.slice(0, 3)
      : [];
    milestones.forEach((m) => {
      y = needsPage(doc, y, 7);
      setFill(doc, clr);
      doc.circle(MX + 10, y - 1.5, 1.5, "F");
      setFont(doc, "normal", 8);
      setTxt(doc, CLR.body);
      doc.text(String(m), MX + 14, y);
      y += 6;
    });

    y += 5;
  });

  return y;
}

function buildProjects(doc, projects, y) {
  const list = Array.isArray(projects) ? projects.slice(0, 6) : [];
  if (list.length === 0) return y;

  y = sectionTitle(doc, "Project Recommendations", y);

  list.forEach((project) => {
    const name = String(project.name ?? project.title ?? "Untitled Project");
    const desc = String(project.description ?? "");
    const lang = String(project.language ?? "");
    const skillsList = Array.isArray(project.skills)
      ? project.skills.join(", ")
      : String(project.skills ?? "");
    const diff = String(project.difficulty ?? "");
    const cardH = 18;

    y = needsPage(doc, y, cardH + 4);

    setFill(doc, CLR.light);
    setDraw(doc, CLR.border);
    doc.roundedRect(MX, y, CW, cardH, 2, 2, "FD");

    setFont(doc, "bold", 10);
    setTxt(doc, CLR.dark);
    doc.text(name, MX + 4, y + 7);

    if (lang || skillsList) {
      setFont(doc, "normal", 7);
      setTxt(doc, CLR.muted);
      doc.text(lang || skillsList, MX + 4, y + 13);
    }

    if (diff) {
      setFont(doc, "normal", 7);
      setTxt(doc, CLR.muted);
      const dw = doc.getTextWidth(diff);
      doc.text(diff, MX + CW - dw - 3, y + 7);
    }

    y += cardH + 4;

    if (desc) {
      setFont(doc, "normal", 8);
      setTxt(doc, CLR.body);
      const lines = doc.splitTextToSize(desc, CW).slice(0, 2);
      lines.forEach((line) => {
        y = needsPage(doc, y, 5);
        doc.text(line, MX, y);
        y += 5;
      });
      y += 2;
    }
  });

  return y;
}

function addFooters(doc) {
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    setDraw(doc, CLR.border);
    doc.setLineWidth(0.3);
    doc.line(MX, PH - 14, MX + CW, PH - 14);
    setFont(doc, "normal", 7);
    setTxt(doc, CLR.muted);
    doc.text("Generated by SensAI • Skill Gap Analysis", MX, PH - 8);
    doc.text(`Page ${i} of ${total}`, MX + CW, PH - 8, { align: "right" });
  }
}

function buildDocument(analysisData) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  buildCover(doc, analysisData);
  doc.addPage();

  let y = MT;
  y = buildMatchScore(doc, analysisData, y);
  y += 6;
  y = buildMissingSkills(doc, analysisData.missingSkills ?? [], y);
  y += 4;
  y = buildPrioritySkills(doc, analysisData.prioritySkills ?? [], y);
  y += 4;
  y = buildRoadmap(
    doc,
    analysisData.learningRoadmap ?? analysisData.roadmap ?? [],
    y,
  );
  y += 4;
 doc.addPage();
  y = MT;
  y = buildVisualRoadmap(
    doc,
    analysisData.learningRoadmap ?? analysisData.roadmap ?? [],
    analysisData.targetRole ?? analysisData.role ?? "",
    y,
  );
  y += 4;
  y = buildCourses(
    doc,
    analysisData.recommendedCourses ?? analysisData.courses ?? [],
    y,
  );
  y += 4;
  y = buildTimeline(
    doc,
    analysisData.learningTimeline ?? analysisData.timeline ?? [],
    y,
  );
  y += 4;
  y = buildProjects(
    doc,
    analysisData.projectRecommendations ?? analysisData.projects ?? [],
    y,
  );

  addFooters(doc);
  return doc;
}

export function generateSkillGapReport(analysisData = {}) {
  const doc = buildDocument(analysisData);
  const role = String(analysisData.targetRole ?? "report")
    .replace(/\s+/g, "-")
    .toLowerCase();
  const filename = `skill-gap-${role}-${Date.now()}.pdf`;
  doc.save(filename);
}

export async function getReportBlob(analysisData = {}) {
  return buildDocument(analysisData).output("blob");
}
