
import { useNavigate } from "react-router-dom";

export const useSupportActions = () => {
  const navigate = useNavigate();

  const handleOpenWhatsApp = () => {
    const phoneNumber = "+18687865357";
    const message = encodeURIComponent("Hello, I need support with Tavara.care platform.");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  const handleFAQClick = () => {
    navigate("/faq");
  };

  return {
    handleOpenWhatsApp,
    handleFAQClick,
  };
};
