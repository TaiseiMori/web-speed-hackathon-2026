import { Route, Routes } from "react-router";

import { DirectMessageContainer } from "@web-speed-hackathon-2026/client/src/containers/DirectMessageContainer";

import { mountPage } from "./AppLayout";

mountPage(({ activeUser, authModalId }) => (
  <Routes>
    <Route
      element={<DirectMessageContainer activeUser={activeUser} authModalId={authModalId} />}
      path="/dm/:conversationId"
    />
  </Routes>
));
