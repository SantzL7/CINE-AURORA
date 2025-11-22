import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function Player() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const { currentUser } = useAuth();
  const videoRef = useRef(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const ref = doc(db, "movies", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setMovie({ id: snap.id, ...snap.data() });
      } else {
        navigate("/app", { replace: true });
      }
    }
    load();
  }, [id, navigate]);

  useEffect(() => {
    if (!currentUser || !movie) return;
    const video = videoRef.current;
    if (!video) return;

    let lastSent = 0;

    async function saveProgress() {
      if (!currentUser || !movie || !video.duration) return;
      const now = Date.now();
      if (now - lastSent < 5000) return; // a cada ~5s
      lastSent = now;
      const ref = doc(db, "users", currentUser.uid, "progress", movie.id);
      await setDoc(ref, {
        currentTime: video.currentTime,
        duration: video.duration,
        updatedAt: new Date(),
      });
    }

    video.addEventListener("timeupdate", saveProgress);
    return () => {
      video.removeEventListener("timeupdate", saveProgress);
    };
  }, [currentUser, movie]);

  if (!movie) return <div className="player__loading">Carregando...</div>;

  return (
    <>
      <Navbar />
      <main className="player-page-main">
        <div className="player">
          <button className="btn ghost" onClick={() => navigate(-1)}>
            Voltar
          </button>
          <h2 className="player__title">{movie.title}</h2>
          <video
            ref={videoRef}
            className="player__video"
            src={movie.videoUrl}
            controls
            autoPlay
          />
          <p className="player__desc">{movie.description}</p>
        </div>
      </main>
    </>
  );
}
