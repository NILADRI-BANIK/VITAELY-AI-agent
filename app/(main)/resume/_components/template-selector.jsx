"use client";

import { templateList } from "./templates/index";

const TemplateSelector = ({ selectedTemplate, onTemplateChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Resume Template</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {templateList.map((template) => (
          <div
            key={template.id}
            onClick={() => onTemplateChange(template.id)}
            className={`cursor-pointer rounded-lg border-2 p-3 transition-all hover:shadow-md ${
              selectedTemplate === template.id
                ? "border-primary shadow-md scale-105"
                : "border-border hover:border-primary/50"
            }`}
          >
            {/* Template Color Preview */}
            <div
              style={{
                backgroundColor: template.color,
                height: "60px",
                borderRadius: "6px",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Mini resume lines preview */}
              <div
                style={{
                  width: "70%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <div
                  style={{
                    height: "4px",
                    backgroundColor: "rgba(255,255,255,0.9)",
                    borderRadius: "2px",
                    width: "60%",
                    margin: "0 auto",
                  }}
                />
                <div
                  style={{
                    height: "2px",
                    backgroundColor: "rgba(255,255,255,0.5)",
                    borderRadius: "2px",
                    width: "80%",
                    margin: "0 auto",
                  }}
                />
                <div
                  style={{
                    height: "2px",
                    backgroundColor: "rgba(255,255,255,0.5)",
                    borderRadius: "2px",
                    width: "70%",
                    margin: "0 auto",
                  }}
                />
                <div
                  style={{
                    height: "2px",
                    backgroundColor: "rgba(255,255,255,0.3)",
                    borderRadius: "2px",
                    width: "90%",
                    margin: "0 auto",
                  }}
                />
              </div>

              {/* Selected checkmark */}
              {selectedTemplate === template.id && (
                <div
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    backgroundColor: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    color: template.color,
                    fontWeight: "bold",
                  }}
                >
                  ✓
                </div>
              )}
            </div>

            {/* Template Name */}
            <p
              className={`text-xs font-medium text-center truncate ${
                selectedTemplate === template.id
                  ? "text-primary"
                  : "text-foreground"
              }`}
            >
              {template.name}
            </p>

            {/* Template Description */}
            <p className="text-xs text-muted-foreground text-center truncate mt-1">
              {template.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;