import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Home";
import CounterPage from "./pages/Counter";
import LikePage from "./pages/Like";
import RankingPage from "./pages/Ranking";
import BBSPage from "./pages/BBS";
import AboutPage from "./pages/About";
import "./nostalgic.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/counter" element={<CounterPage />} />
        <Route path="/counter/usage" element={<CounterPage />} />
        <Route path="/like" element={<LikePage />} />
        <Route path="/like/usage" element={<LikePage />} />
        <Route path="/ranking" element={<RankingPage />} />
        <Route path="/ranking/usage" element={<RankingPage />} />
        <Route path="/bbs" element={<BBSPage />} />
        <Route path="/bbs/usage" element={<BBSPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
