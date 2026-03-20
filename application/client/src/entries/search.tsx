import { Route, Routes } from "react-router";

import { SearchContainer } from "@web-speed-hackathon-2026/client/src/containers/SearchContainer";

import { mountPage } from "./AppLayout";

mountPage(() => (
  <Routes>
    <Route element={<SearchContainer />} path="/search" />
  </Routes>
));
