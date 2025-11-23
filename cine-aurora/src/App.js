import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute, { AdminRoute } from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Player from "./pages/Player";
import EpisodePlayer from "./pages/EpisodePlayer";
import Admin from "./pages/Admin";
import SeriesEpisodes from "./pages/SeriesEpisodes";
import Details from "./pages/Details";
import SeriesDetails from "./pages/SeriesDetails";
import MyList from "./pages/MyList";
import Search from "./pages/Search";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/series/:id/episodes"
            element={
              <AdminRoute>
                <SeriesEpisodes />
              </AdminRoute>
            }
          />
          <Route
            path="/watch/movie/:id"
            element={
              <ProtectedRoute>
                <Player type="movie" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/watch/series/:seriesId/season/:seasonNumber/episode/:episodeNumber"
            element={
              <ProtectedRoute>
                <EpisodePlayer />
              </ProtectedRoute>
            }
          />
          {/* Rota de fallback para compatibilidade com links antigos */}
          <Route
            path="/watch/:id"
            element={
              <ProtectedRoute>
                <Player />
              </ProtectedRoute>
            }
          />
          <Route
            path="/title/:id"
            element={
              <ProtectedRoute>
                <Details />
              </ProtectedRoute>
            }
          />
          <Route
            path="/series/:id"
            element={
              <ProtectedRoute>
                <SeriesDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-list"
            element={
              <ProtectedRoute>
                <MyList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
