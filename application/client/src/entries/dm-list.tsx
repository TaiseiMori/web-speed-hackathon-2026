import { Route, Routes } from "react-router";

import { DirectMessageListContainer } from "@web-speed-hackathon-2026/client/src/containers/DirectMessageListContainer";

import { mountPage } from "./AppLayout";

mountPage(({ activeUser, authModalId }) => (
  <Routes>
    <Route
      element={<DirectMessageListContainer activeUser={activeUser} authModalId={authModalId} />}
      path="/dm"
    />
  </Routes>
));
