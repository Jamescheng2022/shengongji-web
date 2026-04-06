"use client";

import React, { useState, useEffect, useRef } from "react";

export default function BGMPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shouldResumeRef = useRef(false);

  useEffect(() => {
    // 检测 bgm.mp3 是否存在
    const audio = new Audio("/audio/bgm.mp3");
    audioRef.current = audio;
    audio.loop = true;
    audio.volume = 0.3;

    const tryResume = () => {
      if (!shouldResumeRef.current || !audioRef.current) return;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // 浏览器仍可能阻止播放，忽略即可
      });
      shouldResumeRef.current = false;
      document.removeEventListener("click", tryResume);
      document.removeEventListener("touchstart", tryResume);
      document.removeEventListener("keydown", tryResume);
    };

    audio.addEventListener("canplaythrough", () => {
      setHasAudio(true);
    });
    audio.addEventListener("error", () => {
      // 音频文件不存在，隐藏按钮
      setHasAudio(false);
    });

    // 恢复用户偏好
    const saved = localStorage.getItem("bgm_enabled");
    if (saved === "true") {
      shouldResumeRef.current = true;
      document.addEventListener("click", tryResume, { once: true });
      document.addEventListener("touchstart", tryResume, { once: true });
      document.addEventListener("keydown", tryResume, { once: true });
    }

    return () => {
      document.removeEventListener("click", tryResume);
      document.removeEventListener("touchstart", tryResume);
      document.removeEventListener("keydown", tryResume);
      audio.pause();
      audio.src = "";
    };
  }, []);

  const toggleBGM = () => {
    if (!audioRef.current || !hasAudio) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      localStorage.setItem("bgm_enabled", "false");
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        localStorage.setItem("bgm_enabled", "true");
      }).catch(() => {
        // 浏览器阻止了自动播放
      });
    }
  };

  // 没有音频文件时不渲染按钮
  if (!hasAudio) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={toggleBGM}
        className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg"
        style={{
          background: isPlaying ? "var(--palace-gold)" : "rgba(0,0,0,0.6)",
          color: isPlaying ? "var(--ink-black)" : "var(--palace-gold)",
          border: isPlaying ? "none" : "1px solid rgba(212,175,55,0.4)",
        }}
        title={isPlaying ? "暂停背景音乐" : "播放背景音乐"}
      >
        <span className="text-xl">{isPlaying ? "♫" : "♪"}</span>
      </button>
    </div>
  );
}
