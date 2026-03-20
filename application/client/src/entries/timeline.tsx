import { Route, Routes } from "react-router";

import { TimelineContainer } from "@web-speed-hackathon-2026/client/src/containers/TimelineContainer";

import { mountPage } from "./AppLayout";

mountPage(() => (
  <Routes>
    <Route element={<TimelineContainer />} path="/" />
  </Routes>
));
