import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import AnalyticsPage from "./pages/AnalyticsPage";

function App() {
  return (
    <>
      <Toaster richColors />

      <BrowserRouter>

        <Routes>
          <Route
            path="/"
            element={<HomePage />}
          />
          <Route
            path="/analytics"
            element={<AnalyticsPage />}
          />

          <Route
            path="*"
            element={<NotFound />}
          />

        </Routes>


      </BrowserRouter>
    </>
  );
}

export default App;
