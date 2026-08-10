import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BBSPage from "./pages/BBS";
import "./nostalgic.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename="/guestbook">
      <Routes>
        <Route path="*" element={<BBSPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
