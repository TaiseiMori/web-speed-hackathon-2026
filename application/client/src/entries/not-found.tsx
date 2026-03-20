import { Route, Routes } from "react-router";

import { NotFoundContainer } from "@web-speed-hackathon-2026/client/src/containers/NotFoundContainer";

import { mountPage } from "./AppLayout";

mountPage(() => (
  <Routes>
    <Route element={<NotFoundContainer />} path="*" />
  </Routes>
));
