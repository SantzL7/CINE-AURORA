import { useEffect, useState } from 'react';
import { db } from '../firebase/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import Navbar from "../components/Navbar";
import Row from "../components/Row";

export default function MyList() {
  const { currentUser } = useAuth();

  return (
    <>
      <Navbar />
      <main className="content">
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          <Row title="Minha lista" watchlist type={null} />
        </div>
      </main>
    </>
  );
}
