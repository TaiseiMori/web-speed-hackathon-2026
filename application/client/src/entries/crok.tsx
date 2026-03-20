import { Route, Routes } from "react-router";

import { CrokContainer } from "@web-speed-hackathon-2026/client/src/containers/CrokContainer";

import { mountPage } from "./AppLayout";

mountPage(({ activeUser, authModalId }) => (
  <Routes>
    <Route
      element={<CrokContainer activeUser={activeUser} authModalId={authModalId} />}
      path="/crok"
    />
  </Routes>
));
