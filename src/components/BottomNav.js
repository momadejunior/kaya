// src/components/BottomNav.jsx
import {
  IoHomeOutline,
  IoNotificationsOutline,
  IoPersonCircleOutline,
  IoReceiptOutline
} from "react-icons/io5";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";

export default function BottomNav() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.log("Erro ao pegar usuário logado:", error);
      } else {
        setUserId(data?.user?.id || "");
      }
    };

    fetchUser();
  }, []);

  // Se ainda não carregou, não mostrar nav
  if (!userId) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md flex justify-around py-2" id="BottomNav">
      <BottomButton icon={<IoHomeOutline size={24} />} text="Início" onClick={() => navigate("/feed")} />

      <BottomButton
        icon={<IoNotificationsOutline size={24} />}
        text="Notificações"
        onClick={() => navigate(`/perfil/${userId}/Notificacoes`)}
      />

      <BottomButton
        icon={<IoReceiptOutline size={24} />}
        text="Reportar"
        onClick={() => navigate(`/reportar`)}
      />

      <BottomButton
        icon={<IoPersonCircleOutline size={24} />}
        text="Perfil"
        onClick={() => navigate(`/perfil/`)}
      />

      
    </div>
  );
}

function BottomButton({ icon, text, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center text-gray-600 hover:text-pink-600 transition-all"
    >
      {icon}
      <span className="text-xs mt-1">{text}</span>
    </button>
  );
}
