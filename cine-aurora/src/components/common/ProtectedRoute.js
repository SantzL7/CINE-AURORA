import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
}

export function AdminRoute({ children }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  const allowedEmails = ['matheus0mendes0marinho@gmail.com'];
  if (!currentUser.email || !allowedEmails.includes(currentUser.email)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
