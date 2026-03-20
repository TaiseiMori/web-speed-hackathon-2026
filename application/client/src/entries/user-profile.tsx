import { Route, Routes } from "react-router";

import { UserProfileContainer } from "@web-speed-hackathon-2026/client/src/containers/UserProfileContainer";

import { mountPage } from "./AppLayout";

mountPage(() => (
  <Routes>
    <Route element={<UserProfileContainer />} path="/users/:username" />
  </Routes>
));
