"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

const ResearchTopicContext = createContext(null);

export function ResearchTopicProvider({ children, initialTopic = null }) {
  const [topic, setTopicState] = useState(initialTopic ?? null);
  const [domainId, setDomainId] = useState(initialTopic?.domainId ?? null);
  const [subfieldId, setSubfieldId] = useState(
    initialTopic?.subfieldId ?? null,
  );
  const [keywords, setKeywords] = useState(
    Array.isArray(initialTopic?.keywords) ? initialTopic.keywords : [],
  );

  const setTopic = useCallback((newTopic) => {
    if (!newTopic) {
      setTopicState(null);
      setDomainId(null);
      setSubfieldId(null);
      setKeywords([]);
      return;
    }

    setTopicState(newTopic);
    setDomainId(newTopic.domainId ?? null);
    setSubfieldId(newTopic.subfieldId ?? null);
    setKeywords(Array.isArray(newTopic.keywords) ? newTopic.keywords : []);
  }, []);

  const updateTopicField = useCallback((field, value) => {
    setTopicState((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  }, []);

  const clearTopic = useCallback(() => {
    setTopicState(null);
    setDomainId(null);
    setSubfieldId(null);
    setKeywords([]);
  }, []);

  const topicName = useMemo(() => {
    if (!topic) return null;
    return topic.topicName ?? topic.topic ?? topic.title ?? topic.name ?? null;
  }, [topic]);

  const value = useMemo(
    () => ({
      topic,
      topicId: topic?.id ?? null,
      topicName,
      domainId,
      subfieldId,
      keywords,
      setTopic,
      updateTopicField,
      clearTopic,
      setDomainId,
      setSubfieldId,
      setKeywords,
      hasTopic: !!topic,
    }),
    [
      topic,
      topicName,
      domainId,
      subfieldId,
      keywords,
      setTopic,
      updateTopicField,
      clearTopic,
    ],
  );

  return (
    <ResearchTopicContext.Provider value={value}>
      {children}
    </ResearchTopicContext.Provider>
  );
}

export function useResearchTopic() {
  const ctx = useContext(ResearchTopicContext);
  if (!ctx) {
    throw new Error(
      "useResearchTopic must be used within a ResearchTopicProvider",
    );
  }
  return ctx;
}

export function useOptionalResearchTopic() {
  return useContext(ResearchTopicContext);
}

export default ResearchTopicContext;