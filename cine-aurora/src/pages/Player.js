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
    <div style={{
      backgroundColor: '#0f0f0f',
      minHeight: '100vh',
      color: '#fff'
    }}>
      <Navbar />
      <main style={{
        padding: '20px 5%',
        maxWidth: '1400px',
        margin: '0 auto',
        paddingTop: '80px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <button 
              onClick={() => navigate(-1)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              ← Voltar
            </button>
          </div>
          
          <div style={{
            width: '100%',
            aspectRatio: '16/9',
            backgroundColor: '#000',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '20px'
          }}>
            <video
              ref={videoRef}
              src={movie.videoUrl}
              controls
              autoPlay
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                outline: 'none'
              }}
            />
          </div>

          <div style={{
            padding: '0 20px',
            maxWidth: '1000px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <h1 style={{
              fontSize: '2.2rem',
              margin: '0 0 20px 0',
              fontWeight: '700',
              color: '#fff'
            }}>
              {movie.title}
            </h1>
            
            {movie.description && (
              <p style={{
                fontSize: '1.1rem',
                lineHeight: '1.7',
                color: 'rgba(255, 255, 255, 0.85)',
                margin: '0 auto',
                maxWidth: '800px'
              }}>
                {movie.description}
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
