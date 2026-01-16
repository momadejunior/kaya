// Detalhes.js
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../utils/supabase";
import {
  IoCalendarOutline,
  IoMaleFemaleOutline,
  IoTimeOutline,
  IoLocationOutline,
  IoDocumentTextOutline,
  IoCallOutline,
  IoHeartOutline,
  IoHeart,
  IoChatbubbleEllipsesOutline,
} from "react-icons/io5";
import CommentsSection from "../components/CommentsSection";
import SharePersonButton from "../components/ShareButton";

export default function Detalhes() {
  const { id } = useParams(); // pega o id da URL
  const scrollRef = useRef(null);

  const [detalhe, setDetalhe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [commentsCount, setCommentsCount] = useState(0);
  const [likesCount, setLikesCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);
  const [liked, setLiked] = useState(false);

  // DEBUG: log do ID
  console.log("ID da pessoa:", id);

  // Busca usuário logado
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", currentUser.id)
        .single();

      if (error) console.error("Erro ao buscar perfil:", error.message);

      setUser({
        id: currentUser.id,
        name: profile?.name || "Anônimo",
      });
    };
    fetchUser();
  }, []);

  // Busca detalhes da pessoa
  useEffect(() => {
    if (!id) return;
    const fetchDetalhe = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("missing_people")
        .select("*")
        .eq("id", Number(id))
        .single();

      if (error) {
        console.error("Erro ao buscar detalhes:", error.message);
        setDetalhe(null);
      } else {
        console.log("Detalhe carregado:", data);
        setDetalhe(data);
      }
      setLoading(false);
    };
    fetchDetalhe();
  }, [id]);

  // Busca contagem de comentários
  useEffect(() => {
    if (!id) return;
    const fetchCommentsCount = async () => {
      const { count, error } = await supabase
        .from("status_comments")
        .select("*", { count: "exact", head: true })
        .eq("missing_person_id", Number(id));

      if (!error) setCommentsCount(count || 0);
      else console.error("Erro ao buscar comentários:", error.message);
    };
    fetchCommentsCount();
  }, [id]);

  // Likes
  useEffect(() => {
    if (!id || !user) return;

    const fetchLikes = async () => {
      const { count, error } = await supabase
        .from("missing_people_likes")
        .select("*", { count: "exact", head: true })
        .eq("missing_person_id", Number(id));

      if (!error) setLikesCount(count || 0);
      else console.error("Erro ao buscar likes:", error.message);

      const { data: existingLike, error: likeError } = await supabase
        .from("missing_people_likes")
        .select("*")
        .eq("missing_person_id", Number(id))
        .eq("user_id", user.id)
        .single();

      if (likeError && likeError.code !== "PGRST116") {
        // PGRST116 = not found (ok se não existir like)
        console.error("Erro ao verificar like:", likeError.message);
      }
      setLiked(!!existingLike);
    };
    fetchLikes();
  }, [id, user]);

  // Shares
  useEffect(() => {
    if (!id) return;
    const fetchShares = async () => {
      const { count, error } = await supabase
        .from("missing_people_shares")
        .select("*", { count: "exact", head: true })
        .eq("missing_person_id", Number(id));

      if (!error) setShareCount(count || 0);
      else console.error("Erro ao buscar shares:", error.message);
    };
    fetchShares();
  }, [id]);

  const toggleLike = async () => {
    if (!user) return;

    if (liked) {
      const { error } = await supabase
        .from("missing_people_likes")
        .delete()
        .eq("missing_person_id", Number(id))
        .eq("user_id", user.id);

      if (!error) {
        setLiked(false);
        setLikesCount((prev) => prev - 1);
      } else console.error("Erro ao remover like:", error.message);
    } else {
      const { error } = await supabase.from("missing_people_likes").insert([
        { missing_person_id: Number(id), user_id: user.id },
      ]);
      if (!error) {
        setLiked(true);
        setLikesCount((prev) => prev + 1);
      } else console.error("Erro ao adicionar like:", error.message);
    }
  };

  if (loading)
    return <div style={{ textAlign: "center", marginTop: 50 }}>Carregando detalhes...</div>;
  if (!detalhe)
    return <div style={{ textAlign: "center", marginTop: 50 }}>Não encontrado.</div>;

  // Fallback de campos caso não existam
  const {
    nome = "Nome não disponível",
    idade = "N/A",
    genero = "N/A",
    data_desaparecimento = "N/A",
    ultima_localizacao = "N/A",
    descricao_detalhada = "Descrição não disponível",
    contacto_do_responsavel = "N/A",
    status = "Desaparecida",
    encerrado_motivo = "",
    photo_url = "/images/render.jpg",
  } = detalhe;

  return (
    <div style={{ padding: 16, maxWidth: 800, margin: "auto" }} ref={scrollRef}>
      <img
        src={photo_url}
        alt={nome}
        style={{ width: "100%", height: 220, borderRadius: 16, objectFit: "cover", marginBottom: 16 }}
      />

      <div style={{ backgroundColor: "#fff", borderRadius: 20, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <h2 style={{ color: "#2b3990", fontWeight: "bold", marginBottom: 12 }}>{nome}</h2>

        <div style={{ gap: 10, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <IoCalendarOutline size={20} color="#2b3990" />
            <span style={{ marginLeft: 8 }}>Idade: {idade}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <IoMaleFemaleOutline size={20} color="#2b3990" />
            <span style={{ marginLeft: 8 }}>Gênero: {genero}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <IoTimeOutline size={20} color="#2b3990" />
            <span style={{ marginLeft: 8 }}>Data do desaparecimento: {data_desaparecimento}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <IoLocationOutline size={20} color="#2b3990" />
            <span style={{ marginLeft: 8 }}>Última localização: {ultima_localizacao}</span>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <IoDocumentTextOutline size={20} color="#2b3990" />
            <span style={{ marginLeft: 8, flex: 1 }}>Descrição detalhada: {descricao_detalhada}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <IoCallOutline size={20} color="#2b3990" />
            <span style={{ marginLeft: 8 }}>Contato responsável: {contacto_do_responsavel}</span>
          </div>

          {(status === "Encontrada" || status === "Caso encerrado") && (
            <div style={{ marginTop: 12, padding: 12, borderRadius: 12, backgroundColor: status === "Encontrada" ? "#e5ffe5" : "#ffe5e5" }}>
              <strong style={{ display: "block", marginBottom: 4 }}>
                {status === "Encontrada" ? "Descrição da pessoa encontrada:" : "Motivo do encerramento:"}
              </strong>
              <span>{encerrado_motivo || descricao_detalhada || "Nenhuma descrição fornecida."}</span>
            </div>
          )}
        </div>

        {/* Ações */}
        <div style={{ display: "flex", justifyContent: "space-around", marginTop: 16, borderTop: "1px solid #ccc", paddingTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <SharePersonButton person={detalhe} />
            <span style={{ marginLeft: 4 }}>{shareCount}</span>
          </div>

          <div
            style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            onClick={() => scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })}
          >
            <IoChatbubbleEllipsesOutline size={24} color="#da1c5c" />
            <span style={{ marginLeft: 6 }}>{commentsCount}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={toggleLike}>
            {liked ? <IoHeart size={26} color="#e0245e" /> : <IoHeartOutline size={26} color="#f7941d" />}
            <span style={{ marginLeft: 6 }}>{likesCount}</span>
          </div>
        </div>
      </div>

      <CommentsSection missingPersonId={Number(id)} />
    </div>
  );
}
