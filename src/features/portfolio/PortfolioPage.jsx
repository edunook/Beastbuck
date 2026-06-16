import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UsersService } from '../../services/firebase/users';
import { LoadingState } from '../../components/ui/UIElements';

export default function PortfolioPage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function resolveAndRedirect() {
      try {
        const uid = await UsersService.getUidForUsername(username);
        if (uid) {
          navigate(`/profile/${uid}`, { replace: true });
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to resolve username:', err);
        setLoading(false);
      }
    }
    resolveAndRedirect();
  }, [username, navigate]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><LoadingState text="Loading profile..." /></div>;
  }

  return <div className="p-20 text-center text-white font-bold text-2xl">Profile Not Found</div>;
}
