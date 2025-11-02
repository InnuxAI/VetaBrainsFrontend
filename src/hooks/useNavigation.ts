import { useNavigate } from 'react-router-dom';

export const useNavigation = () => {
  const navigate = useNavigate();

  const goToDomain = (domainName: string) => {
    navigate(`/domains/${domainName}`);
  };

  const goToChat = () => {
    navigate('/chat');
  };

  return {
    goToDomain,
    goToChat,
  };
};
