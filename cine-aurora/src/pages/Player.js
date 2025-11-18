import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Player() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const ref = doc(db, "movies", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setMovie({ id: snap.id, ...snap.data() });
      } else {
        navigate("/", { replace: true });
      }
    }
    load();
  }, [id, navigate]);

  if (!movie) return <div className="player__loading">Carregando...</div>;

  return (
    <div className="player">
      <button className="btn ghost" onClick={() => navigate("/")}>Voltar</button>
      <h2 className="player__title">{movie.title}</h2>
      <video className="player__video" src={movie.videoUrl} controls autoPlay />
      <p className="player__desc">{movie.description}</p>
    </div>
  );
}
