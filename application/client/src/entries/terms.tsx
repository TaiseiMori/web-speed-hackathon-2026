import { Route, Routes } from "react-router";

import { TermContainer } from "@web-speed-hackathon-2026/client/src/containers/TermContainer";

import { mountPage } from "./AppLayout";

mountPage(() => (
  <Routes>
    <Route element={<TermContainer />} path="/terms" />
  </Routes>
));
