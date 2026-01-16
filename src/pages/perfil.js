import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { useNavigate } from "react-router-dom";
import {
  IoHomeOutline,
  IoNotificationsOutline,
  IoPersonCircleOutline,
  IoSettingsOutline,
  IoCallOutline,
  IoLocationOutline,
  IoLogOutOutline,
  IoPencilOutline,
  IoDocumentTextOutline,
  IoInformationCircleOutline,
} from "react-icons/io5";
import BottomNav from "../components/BottomNav";

const mainColor = "#da1c5c";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) {
          navigate("/signin");
          return;
        }

        const userId = userData.user.id;
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) console.error("Erro ao buscar perfil:", error);
        else setProfile(data);
      } catch (err) {
        console.error("Erro inesperado:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) alert("Erro ao sair.");
    else navigate("/signin");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600 text-lg animate-pulse">Carregando perfil...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600 text-lg">Perfil não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <div
        className="text-center py-12 px-4 shadow-md"
        style={{
          backgroundColor: mainColor,
          borderBottomLeftRadius: "2rem",
          borderBottomRightRadius: "2rem",
        }}
      >
        <img
          src={profile.avatar_url || "https://via.placeholder.com/120"}
          alt="Avatar"
          className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-white shadow-lg transition-transform duration-300 hover:scale-105"
        />
        <h2 className="text-white text-2xl font-semibold">{profile.name}</h2>
        <p className="text-white/80 text-sm">{profile.email}</p>
      </div>

      {/* Informações */}
      <div className="px-6 mt-6 space-y-3">
        {profile.phone && (
          <InfoCard icon={<IoCallOutline className="text-pink-600" />} text={profile.phone} />
        )}
        {profile.location && (
          <InfoCard icon={<IoLocationOutline className="text-pink-600" />} text={profile.location} />
        )}
      </div>

      {/* Ações */}
      <div className="px-6 mt-8 space-y-3">
        <ActionButton
          icon={<IoNotificationsOutline size={20} />}
          text="Notificações"
          onClick={() => navigate(`/perfil/${profile.id}/Notificacoes`)}
        />
        <ActionButton
          icon={<IoDocumentTextOutline size={20} />}
          text="Publicações"
          onClick={() => navigate(`/publicacoes`)}
        />
        <ActionButton
          icon={<IoPencilOutline size={20} />}
          text="Editar Perfil"
          onClick={() => navigate(`/perfil/${profile.id}/editar`)}
        />
        <ActionButton
          icon={<IoInformationCircleOutline size={20} />}
          text="Sobre"
          onClick={() => navigate(`/sobre`)}
        />

        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-xl border-2 text-pink-600 border-pink-600 font-semibold hover:bg-pink-600 hover:text-white transition-all flex items-center justify-center gap-2"
        >
          <IoLogOutOutline size={20} /> Sair
        </button>
      </div>

      {/* Menu Inferior Fixo */}
      <BottomNav navigate={navigate} />
    </div>
  );
}

/* ================= COMPONENTES ================= */

function InfoCard({ icon, text }) {
  return (
    <div className="flex items-center bg-white shadow-sm p-3 rounded-lg">
      <div className="mr-3 text-xl">{icon}</div>
      <span className="text-gray-700">{text}</span>
    </div>
  );
}

function ActionButton({ icon, text, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white shadow-sm border border-gray-200 hover:border-pink-400 py-3 rounded-xl text-gray-700 font-medium hover:bg-pink-50 transition-all flex items-center justify-center gap-2"
    >
      {icon} {text}
    </button>
  );
}


