import { Route, Routes } from "react-router";

import { PostContainer } from "@web-speed-hackathon-2026/client/src/containers/PostContainer";

import { mountPage } from "./AppLayout";

mountPage(() => (
  <Routes>
    <Route element={<PostContainer />} path="/posts/:postId" />
  </Routes>
));
