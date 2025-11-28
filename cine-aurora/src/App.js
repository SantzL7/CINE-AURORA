import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute, { AdminRoute } from './components/common/ProtectedRoute';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Player = lazy(() => import('./pages/Player'));
const EpisodePlayer = lazy(() => import('./pages/EpisodePlayer'));
const Admin = lazy(() => import('./pages/Admin'));
const SeriesEpisodes = lazy(() => import('./pages/SeriesEpisodes'));
const Details = lazy(() => import('./pages/Details'));
const SeriesDetails = lazy(() => import('./pages/SeriesDetails'));
const MyList = lazy(() => import('./pages/MyList'));
const Search = lazy(() => import('./pages/Search'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense
          fallback={
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: '#141414',
                color: 'white'
              }}
            >
              Carregando...
            </div>
          }
        >
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
