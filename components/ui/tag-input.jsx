"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const TagInput = ({
  value = [],
  onChange,
  placeholder = "Type and press Enter...",
  maxTags = 30,
  minTagLength = 1,
  maxTagLength = 50,
  disabled = false,
  className,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const normalizedTags = useMemo(
    () => value.map((v) => v.toLowerCase()),
    [value],
  );

  const addTag = useCallback(
    (raw) => {
      const tag = raw.trim();

      if (!tag) return;

      if (tag.length < minTagLength) {
        setError(`Skill must be at least ${minTagLength} character`);
        return;
      }

      if (tag.length > maxTagLength) {
        setError(`Skill must be under ${maxTagLength} characters`);
        return;
      }

      if (value.length >= maxTags) {
        setError(`Maximum ${maxTags} skills allowed`);
        return;
      }

      if (normalizedTags.includes(tag.toLowerCase())) {
        setError("Skill already added");
        return;
      }

      setError("");
      onChange([...value, tag]);
      setInputValue("");
    },
    [value, normalizedTags, onChange, maxTags, minTagLength, maxTagLength],
  );

  const removeTag = useCallback(
    (index) => {
      if (disabled) return;
      const updated = value.filter((_, i) => i !== index);
      onChange(updated);
      setError("");
    },
    [value, onChange, disabled],
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (["Enter", ",", "Tab"].includes(e.key)) {
        e.preventDefault();
        addTag(inputValue);
        return;
      }

      if (e.key === "Backspace" && !inputValue && value.length > 0) {
        removeTag(value.length - 1);
      }
    },
    [inputValue, value, addTag, removeTag],
  );

  const handlePaste = useCallback(
    (e) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text");
      const tags = pasted
        .split(/[,\n\t]+/)
        .map((t) => t.trim())
        .filter(Boolean);

      const newTags = [];
      for (const tag of tags) {
        if (
          tag.length >= minTagLength &&
          tag.length <= maxTagLength &&
          value.length + newTags.length < maxTags &&
          !normalizedTags.includes(tag.toLowerCase()) &&
          !newTags.map((v) => v.toLowerCase()).includes(tag.toLowerCase())
        ) {
          newTags.push(tag);
        }
      }

      if (newTags.length) {
        onChange([...value, ...newTags]);
        setInputValue("");
        setError("");
      }
    },
    [value, normalizedTags, onChange, maxTags, minTagLength, maxTagLength],
  );

  const handleContainerClick = useCallback(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  return (
    <div className="space-y-1.5">
      <div
        onClick={handleContainerClick}
        className={cn(
          "flex flex-wrap gap-1.5 min-h-[42px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-text",
          "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          disabled && "opacity-50 cursor-not-allowed",
          error && "border-destructive focus-within:ring-destructive",
          className,
        )}
      >
        {value.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-sm font-medium text-secondary-foreground"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(index);
                }}
                className="rounded-sm opacity-60 hover:opacity-100 focus:outline-none focus:ring-1 focus:ring-ring"
                aria-label={`Remove ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          maxLength={maxTagLength}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (error) setError("");
          }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={() => {
            if (inputValue.trim()) addTag(inputValue);
          }}
          disabled={disabled}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
          aria-label="Add skill"
        />
      </div>

      <div className="flex items-center justify-between px-1">
        {error ? (
          <p className="text-xs text-destructive">{error}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Press Enter, Tab, or comma to add
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {value.length}/{maxTags}
        </p>
      </div>
    </div>
  );
};

export default TagInput;
